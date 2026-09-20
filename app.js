const $=s=>document.querySelector(s);
const dlg=$('#dialog');

document.querySelectorAll('[data-companion]').forEach(b=>{
 b.addEventListener('click',()=>{
  const url=b.dataset.companion;
  if(window.MaVieAndroid&&typeof window.MaVieAndroid.openUrl==='function'){
   try{window.MaVieAndroid.openUrl(url);return}catch(e){console.warn(e)}
  }
  window.location.href=url;
 });
});

document.querySelectorAll('.guide-item button,[data-suggestion]').forEach(b=>b.onclick=()=>{const t=b.dataset.suggestion;$('#dialogTitle').textContent=t==='djinn'?'Djinn':t==='discovery'?'Découverte':'Ma Vie';$('#dialogText').textContent=t==='djinn'?'Djinn pourra proposer quelques éléments qui attendent votre attention.':t==='discovery'?'Le futur guide pourra chercher marchés, producteurs, événements, balades et autres idées pertinentes.':'Cette action sera reliée à sa vraie source dans une prochaine version.';dlg.showModal()});
$('#personalize').onclick=()=>{$('#dialogTitle').textContent='Pour moi';$('#dialogText').textContent='Cette zone sera personnalisable : glycémie, voiture, météo, maison et autres informations choisies par l’utilisateur.';dlg.showModal()};

const wt={sun:'18°',cloud:'17°',rain:'14°',storm:'13°',snow:'1°',fog:'12°'};
const period=h=>h<8?'dawn':h<17?'day':h<21?'evening':'night';
function ambience(w,p){document.body.dataset.weather=w;document.body.dataset.period=p;$('#temperatureLabel').textContent=wt[w]||wt.sun;if($('#demoWeather'))$('#demoWeather').value=w;if($('#demoPeriod'))$('#demoPeriod').value=p}
$('#demoWeather').onchange=e=>ambience(e.target.value,$('#demoPeriod').value);
$('#demoPeriod').onchange=e=>ambience($('#demoWeather').value,e.target.value);
$('#autoAmbience').onclick=()=>ambience($('#demoWeather').value,period(new Date().getHours()));
const n=new Date(),lab=new Intl.DateTimeFormat('fr-CH',{weekday:'short',day:'numeric',month:'short'}).format(n);
$('#todayLabel').textContent=lab.charAt(0).toUpperCase()+lab.slice(1);ambience('sun',period(n.getHours()));
document.querySelector('.version').textContent='v0.2.1 · Connexions';
document.querySelector('.demo-panel summary').textContent='Démo v0.2.1';
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');

function wmo(c){c=+c;if(c===0)return'sun';if([1,2,3].includes(c))return'cloud';if([45,48].includes(c))return'fog';if([71,73,75,77,85,86].includes(c))return'snow';if([95,96,99].includes(c))return'storm';if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(c))return'rain';return'cloud'}
function mins(iso){let m=String(iso||'').match(/T(\d{2}):(\d{2})/);return m?(+m[1]*60+ +m[2]):null}
function solarPeriod(nowIso,sunriseIso,sunsetIso,isDay){let n=mins(nowIso),sr=mins(sunriseIso),ss=mins(sunsetIso);if(n===null||sr===null||ss===null)return +isDay===1?period(+String(nowIso||'').slice(11,13)):'night';if(n<sr||n>ss+35)return'night';if(n<sr+75)return'dawn';if(n>=ss-75)return'evening';return'day'}
function applyWeather(x){document.body.dataset.weather=x.weather;document.body.dataset.period=x.period;$('#temperatureLabel').textContent=x.temperature+'°';if(x.place)$('#weatherPlace').textContent=x.place;if($('#demoWeather'))$('#demoWeather').value=x.weather;if($('#demoPeriod'))$('#demoPeriod').value=x.period}
async function place(lat,lon){try{let r=await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=fr`,{cache:'no-store'});let d=await r.json();return d.locality||d.city||d.principalSubdivision||''}catch{return''}}
async function weatherAt(lat,lon){try{let [r,pl]=await Promise.all([fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&daily=sunrise,sunset&timezone=auto&forecast_days=1`,{cache:'no-store'}),place(lat,lon)]),d=await r.json(),c=d.current,sr=d.daily?.sunrise?.[0],ss=d.daily?.sunset?.[0],x={weather:wmo(c.weather_code),period:solarPeriod(c.time,sr,ss,c.is_day),temperature:Math.round(c.temperature_2m),place:pl};applyWeather(x);localStorage.setItem('maVieWeather',JSON.stringify(x));return true}catch{return false}}
function cachedWeather(){try{let x=JSON.parse(localStorage.getItem('maVieWeather')||'null');if(x)applyWeather(x)}catch{}}
async function weather(){
  if(window.MaVieAndroid&&typeof window.MaVieAndroid.getLocation==='function'){
    try{let p=JSON.parse(window.MaVieAndroid.getLocation()||'null');if(p&&Number.isFinite(+p.latitude)&&Number.isFinite(+p.longitude)){if(await weatherAt(+p.latitude,+p.longitude))return}}catch{}
  }
  if(!navigator.geolocation){cachedWeather();return}
  navigator.geolocation.getCurrentPosition(async p=>{if(!await weatherAt(p.coords.latitude,p.coords.longitude))cachedWeather()},cachedWeather,{timeout:10000,maximumAge:900000,enableHighAccuracy:false})
}
window.addEventListener('load',weather);setInterval(weather,900000);

// v0.1.024 — alignement agenda, demain sur deux lignes, contraste nuit
const sod=d=>{let x=new Date(d);x.setHours(0,0,0,0);return x};
const hm=d=>d.toLocaleTimeString('fr-CH',{hour:'2-digit',minute:'2-digit',hour12:false});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const localKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const allDayKey=d=>`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
const eventDayKey=e=>e.allDay?allDayKey(e.start):localKey(e.start);

function state(ev,now=new Date()){
 let today=localKey(now),tomDate=sod(now);tomDate.setDate(tomDate.getDate()+1);let tomorrow=localKey(tomDate);
 return{
  today:ev.filter(e=>e.allDay?eventDayKey(e)===today:(e.end>now&&eventDayKey(e)===today)).sort((a,b)=>(a.allDay?-1:0)-(b.allDay?-1:0)||a.start-b.start),
  tomorrow:ev.filter(e=>eventDayKey(e)===tomorrow).sort((a,b)=>(a.allDay?1:0)-(b.allDay?1:0)||a.start-b.start)
 };
}
function androidEvents(){if(!window.MaVieAndroid||typeof window.MaVieAndroid.getEvents!=='function')return null;try{return JSON.parse(window.MaVieAndroid.getEvents()||'[]').map(e=>({title:e.title||'(Sans titre)',place:e.place||'',start:new Date(+e.start),end:new Date(+e.end),calendar:e.calendar||'',allDay:!!e.allDay})).filter(e=>{if(isNaN(e.start)||isNaN(e.end))return false;let x=(e.title+' '+e.calendar).toLowerCase();return !/week\s*numbers?|num[ée]ros?\s+de\s+semaine|semaine\s+\d{1,2}/i.test(x)})}catch(e){console.warn(e);return[]}}
function demo(){let now=new Date(),at=(o,h,m,t,p)=>{let d=new Date(now);d.setDate(d.getDate()+o);d.setHours(h,m,0,0);return{title:t,place:p,start:d,end:new Date(d.getTime()+3600000),allDay:false}};return[at(0,20,0,'Atelier de patois','Fribourg'),at(1,9,30,'Romont',''),at(1,14,0,'Épalinges','')]}
function kind(e){let t=(e.title+' '+e.calendar).toLowerCase();if(/mariage|wedding/.test(t))return'💍';if(/anniversaire|birthday|geburtstag/.test(t)||/\b\d{1,3}\s*$/.test(e.title))return'🎂';if(/jour férié|ferie|holiday|jeûne fédéral|jeune federal/.test(t))return'🇨🇭';return'•'}
function displayAgendaTitle(e){
 // Règle v0.1.036 : l'Agenda Android est la source.
 // Aucun calcul d'âge, aucune réécriture : afficher le titre reçu tel quel.
 return (e.title||'').trim();
}
function allDayHtml(e){
 return `<div class="appointment all-day compact-row"><time>${kind(e)}</time><div><strong>${esc(displayAgendaTitle(e))}</strong>${e.place?`<small>${esc(e.place)}</small>`:''}</div></div>`
}
function timedTodayHtml(e){return `<div class="appointment compact-row"><time>${hm(e.start)}</time><div><strong>${esc(e.title)}</strong>${e.place?`<small>${esc(e.place)}</small>`:''}</div></div>`}
function tomorrowHtml(e){
 if(e.allDay)return allDayHtml(e);
 let extra=[e.place,`jusqu’à ${hm(e.end)}`].filter(Boolean).join(' · ');
 return `<div class="appointment timed-tomorrow compact-row"><time>${hm(e.start)}</time><div class="appointment-main"><strong>${esc(e.title)}</strong>${extra?`<small>${esc(extra)}</small>`:''}</div>${e.place?'<span class="appointment-pin" aria-hidden="true">📍</span>':''}</div>`
}
function renderAgenda(ev,real){
 let s=state(ev),ta=$('#todayAppointments'),te=$('#todayEmpty'),tl=$('#tomorrowAppointments'),tme=$('#tomorrowEmpty');
 if(s.today.length){ta.innerHTML=s.today.map(e=>e.allDay?allDayHtml(e):timedTodayHtml(e)).join('');ta.classList.remove('hidden');te.classList.add('hidden')}else{ta.innerHTML='';ta.classList.add('hidden');te.classList.remove('hidden')}
 if(s.tomorrow.length){tl.innerHTML=s.tomorrow.map(tomorrowHtml).join('');tl.classList.remove('hidden');tme.classList.add('hidden')}else{tl.innerHTML='';tl.classList.add('hidden');tme.classList.remove('hidden')}
 document.documentElement.dataset.agendaSource=real?'android':'demo';
 // Tant que les propositions intelligentes ne sont pas calculées à partir de vrais lieux,
 // ne jamais afficher les exemples géographiques de la maquette avec un agenda Android réel.
 const guide=document.querySelector('.guide-card');
 if(guide)guide.classList.toggle('hidden',real);
}
function refreshAgenda(){let a=androidEvents();renderAgenda(a===null?demo():a,a!==null)}

function openCalendarDay(offset){
 const d=sod(new Date()); d.setDate(d.getDate()+offset);
 if(window.MaVieAndroid&&typeof window.MaVieAndroid.openCalendarDay==='function'){
  try{window.MaVieAndroid.openCalendarDay(d.getTime())}catch(e){console.warn(e)}
 }
}
function installAgendaCardLinks(){
 [[document.querySelector('.now-card'),0],[document.querySelector('.tomorrow-card'),1]].forEach(([card,offset])=>{
  if(!card)return;
  card.classList.add('agenda-open-card'); card.setAttribute('role','button'); card.setAttribute('tabindex','0');
  card.setAttribute('aria-label',offset===0?"Ouvrir l'agenda d'aujourd'hui":"Ouvrir l'agenda de demain");
  const go=()=>openCalendarDay(offset);
  card.addEventListener('click',go);
  card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}});
 });
}


function installV022Layout(){
 document.querySelector('.tasks')?.remove();
 document.querySelector('#v021-layout')?.remove();
 const st=document.createElement('style');
 st.id='v022-layout';
 st.textContent=`
   .version{font-weight:800!important;opacity:1!important}
   .agenda-open-card{cursor:pointer}
   .agenda-open-card:focus-visible{outline:2px solid currentColor;outline-offset:2px}
   body[data-period="night"] .version{color:#d8f3ff!important;text-shadow:0 1px 5px #001b2d}
   .now-card,.tomorrow-card{min-height:0}

   /* Même gabarit à gauche : gâteau ou heure = 48 px, puis seulement 2 px d'écart. */
   .appointment.compact-row{grid-template-columns:48px minmax(0,1fr);column-gap:2px;align-items:start;padding:4px 0 8px}
   .appointment.compact-row time{display:block;width:48px;margin:0;padding:0;white-space:nowrap;line-height:1.22}
   .appointment.compact-row>div{min-width:0;margin:0;padding:0}
   .appointment.compact-row strong{display:block;margin:0;padding:0;line-height:1.22}
   .appointment.all-day.compact-row time{text-align:left}

   /* Aujourd'hui et demain : strictement la même taille et la même hauteur de ligne. */
   .appointment.all-day.compact-row strong,
   .now-card .appointment.compact-row time,
   .now-card .appointment.compact-row strong,
   .tomorrow-card .timed-tomorrow time,
   .tomorrow-card .timed-tomorrow strong{font-size:.74rem!important;line-height:1.22!important}
   .birthday-age{font-weight:500;margin-left:.25em}

   /* Demain : chaque événement de journée entière reste sur UNE ligne horizontale. */
   .tomorrow-card .appointment.all-day.compact-row{
     display:grid!important;
     grid-template-columns:48px minmax(0,1fr)!important;
     column-gap:2px!important;
     align-items:start!important;
     width:100%!important;
   }
   .tomorrow-card .appointment.all-day.compact-row>div{
     display:block!important;
     width:auto!important;
     min-width:0!important;
     max-width:none!important;
     margin:0!important;
     padding:0!important;
   }
   .tomorrow-card .appointment.all-day.compact-row strong{
     display:block!important;
     width:auto!important;
     max-width:none!important;
     margin:0!important;
     padding:0!important;
     white-space:nowrap!important;
     overflow:visible!important;
     text-overflow:clip!important;
   }

   /* Demain : rendez-vous complet sur la 1re ligne, lieu + fin sur la 2e. */
   .tomorrow-card .appointment.timed-tomorrow{grid-template-columns:48px minmax(0,1fr) 20px;column-gap:2px;align-items:start}
   .tomorrow-card .timed-tomorrow .appointment-main{display:flex!important;flex-direction:column!important;align-items:stretch!important;min-width:0!important;position:static!important}
   .tomorrow-card .timed-tomorrow .appointment-main strong{display:block!important;position:static!important;float:none!important;width:auto!important;max-width:none!important;margin:0!important;padding:0!important;white-space:nowrap!important;overflow:visible!important;text-overflow:clip!important}
   .tomorrow-card .timed-tomorrow .appointment-main small{display:block!important;position:static!important;float:none!important;clear:both!important;transform:none!important;inset:auto!important;width:auto!important;max-width:none!important;margin:2px 0 0 0!important;padding:0!important;white-space:nowrap!important;font-size:.70rem;line-height:1.18}
   .now-card .appointment.compact-row small{display:block;font-size:.70rem!important;line-height:1.18!important;margin:1px 0 0 0!important}

   /* Les informations secondaires restent lisibles sur le fond nuit. */
   body[data-period="night"] .appointment small,
   body[data-period="night"] .now-card .appointment small,
   body[data-period="night"] .tomorrow-card .appointment small{color:rgba(225,239,247,.86)!important;opacity:1!important;text-shadow:0 1px 2px rgba(0,20,35,.35)}

   /* v0.1.027 — DEMAIN : lignes plus serrées verticalement. */
   .tomorrow-card .agenda-list{gap:4px!important}
   .tomorrow-card .appointment{margin-top:0!important;margin-bottom:0!important}
   .tomorrow-card .appointment.all-day.compact-row{padding-top:2px!important;padding-bottom:2px!important}

   @media(max-width:699px){
     .appointment.compact-row{grid-template-columns:44px minmax(0,1fr);column-gap:2px}
     .tomorrow-card .appointment.all-day.compact-row{grid-template-columns:44px minmax(0,1fr)!important}
     .appointment.compact-row time{width:44px}
     .tomorrow-card .appointment.timed-tomorrow{grid-template-columns:44px minmax(0,1fr) 18px;column-gap:2px}
     .appointment.all-day.compact-row strong,
     .now-card .appointment.compact-row time,
     .now-card .appointment.compact-row strong,
     .tomorrow-card .timed-tomorrow time,
     .tomorrow-card .timed-tomorrow strong{font-size:.70rem!important}
     .tomorrow-card .timed-tomorrow small{font-size:.66rem}
     .now-card .appointment.compact-row small{font-size:.66rem!important}
   }`;
 document.head.appendChild(st);
}
installV022Layout();
installAgendaCardLinks();
window.addEventListener('load',refreshAgenda);setInterval(refreshAgenda,60000);
