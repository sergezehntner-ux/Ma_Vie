const $=s=>document.querySelector(s);
const dlg=$('#dialog');
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
document.querySelector('.version').textContent='v0.1.018 · Agenda intelligent';
document.querySelector('.demo-panel summary').textContent='Démo v0.1.018';
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');

function wmo(c){c=+c;if(c===0)return'sun';if([1,2,3].includes(c))return'cloud';if([45,48].includes(c))return'fog';if([71,73,75,77,85,86].includes(c))return'snow';if([95,96,99].includes(c))return'storm';if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(c))return'rain';return'cloud'}
function mins(iso){let m=String(iso||'').match(/T(\d{2}):(\d{2})/);return m?(+m[1]*60+ +m[2]):null}
function solarPeriod(nowIso,sunriseIso,sunsetIso,isDay){let n=mins(nowIso),sr=mins(sunriseIso),ss=mins(sunsetIso);if(n===null||sr===null||ss===null)return +isDay===1?period(+String(nowIso||'').slice(11,13)):'night';if(n<sr||n>ss+35)return'night';if(n<sr+75)return'dawn';if(n>=ss-75)return'evening';return'day'}
function applyWeather(x){document.body.dataset.weather=x.weather;document.body.dataset.period=x.period;$('#temperatureLabel').textContent=x.temperature+'°';if(x.place)$('#weatherPlace').textContent=x.place;if($('#demoWeather'))$('#demoWeather').value=x.weather;if($('#demoPeriod'))$('#demoPeriod').value=x.period}
async function place(lat,lon){try{let r=await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=fr`,{cache:'no-store'});let d=await r.json();return d.locality||d.city||d.principalSubdivision||''}catch{return''}}
async function weather(){if(!navigator.geolocation)return;navigator.geolocation.getCurrentPosition(async p=>{try{let lat=p.coords.latitude,lon=p.coords.longitude,[r,pl]=await Promise.all([fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&daily=sunrise,sunset&timezone=auto&forecast_days=1`,{cache:'no-store'}),place(lat,lon)]),d=await r.json(),c=d.current,sr=d.daily?.sunrise?.[0],ss=d.daily?.sunset?.[0],x={weather:wmo(c.weather_code),period:solarPeriod(c.time,sr,ss,c.is_day),temperature:Math.round(c.temperature_2m),place:pl};applyWeather(x);localStorage.setItem('maVieWeather',JSON.stringify(x))}catch{let x=JSON.parse(localStorage.getItem('maVieWeather')||'null');if(x)applyWeather(x)}},()=>{let x=JSON.parse(localStorage.getItem('maVieWeather')||'null');if(x)applyWeather(x)},{timeout:10000,maximumAge:900000})}
window.addEventListener('load',weather);setInterval(weather,900000);

// v0.1.018 — agenda Android intelligent + météo solaire réelle
const sod=d=>{let x=new Date(d);x.setHours(0,0,0,0);return x};
const hm=d=>d.toLocaleTimeString('fr-CH',{hour:'2-digit',minute:'2-digit',hour12:false});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const localKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
// Android stocke les événements ALL_DAY à minuit UTC. Leur date civile doit donc
// être lue en UTC, sinon le décalage horaire suisse peut les faire déborder au lendemain.
const allDayKey=d=>`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
const eventDayKey=e=>e.allDay?allDayKey(e.start):localKey(e.start);
function state(ev,now=new Date()){
 let today=localKey(now),tomDate=sod(now);tomDate.setDate(tomDate.getDate()+1);let tomorrow=localKey(tomDate);
 return{
  today:ev.filter(e=>e.allDay?eventDayKey(e)===today:(e.end>now&&eventDayKey(e)===today)).sort((a,b)=>(a.allDay?-1:0)-(b.allDay?-1:0)||a.start-b.start),
  tomorrow:ev.filter(e=>eventDayKey(e)===tomorrow).sort((a,b)=>(a.allDay?1:0)-(b.allDay?1:0)||a.start-b.start)
 };
}
function androidEvents(){if(!window.MaVieAndroid||typeof window.MaVieAndroid.getEvents!=='function')return null;try{return JSON.parse(window.MaVieAndroid.getEvents()||'[]').map(e=>({title:e.title||'(Sans titre)',place:e.place||'',start:new Date(+e.start),end:new Date(+e.end),calendar:e.calendar||'',allDay:!!e.allDay})).filter(e=>!isNaN(e.start)&&!isNaN(e.end)&&!/week numbers/i.test(e.calendar))}catch(e){console.warn(e);return[]}}
function demo(){let now=new Date(),at=(o,h,m,t,p)=>{let d=new Date(now);d.setDate(d.getDate()+o);d.setHours(h,m,0,0);return{title:t,place:p,start:d,end:new Date(d.getTime()+3600000),allDay:false}};return[at(0,20,0,'Atelier de patois','Fribourg'),at(1,9,30,'Romont',''),at(1,14,0,'Épalinges','')]}
function kind(e){let t=(e.title+' '+e.calendar).toLowerCase();if(/mariage|wedding/.test(t))return'💍';if(/anniversaire|birthday|geburtstag/.test(t)||/\b\d{1,3}\s*$/.test(e.title))return'🎂';if(/jour férié|ferie|holiday|jeûne fédéral|jeune federal/.test(t))return'🇨🇭';return'•'}
function cleanTitle(e){let t=e.title.trim();if(kind(e)==='🎂')t=t.replace(/\s+[-–—]?\s*anniversaire\s*$/i,'').replace(/\s+\d{1,3}\s*$/,'');return t}
function allDayHtml(e,forTomorrow=false){return `<div class="appointment all-day"><time>${kind(e)}</time><div><strong>${esc(cleanTitle(e))}</strong>${e.place?`<small>${esc(e.place)}</small>`:''}</div></div>`}
function timedTodayHtml(e){return `<div class="appointment"><time>${hm(e.start)}</time><div><strong>${esc(e.title)}</strong>${e.place?`<small>${esc(e.place)}</small>`:''}</div></div>`}
function tomorrowHtml(e){if(e.allDay)return `<div class="appointment all-day"><time>${kind(e)}</time><div><strong>${esc(cleanTitle(e))}</strong>${e.place?`<small>${esc(e.place)}</small>`:''}</div></div>`;let extra=[`jusqu’à ${hm(e.end)}`,e.place].filter(Boolean).join(' · ');return `<div class="appointment"><time>${hm(e.start)}</time><div><strong>${esc(e.title)}</strong>${extra?`<small>${esc(extra)}</small>`:''}</div></div>`}
function renderAgenda(ev,real){
 let s=state(ev),ta=$('#todayAppointments'),te=$('#todayEmpty'),tl=$('#tomorrowAppointments'),tme=$('#tomorrowEmpty');
 if(s.today.length){ta.innerHTML=s.today.map(e=>e.allDay?allDayHtml(e):timedTodayHtml(e)).join('');ta.classList.remove('hidden');te.classList.add('hidden')}else{ta.innerHTML='';ta.classList.add('hidden');te.classList.remove('hidden')}
 if(s.tomorrow.length){tl.innerHTML=s.tomorrow.map(tomorrowHtml).join('');tl.classList.remove('hidden');tme.classList.add('hidden')}else{tl.innerHTML='';tl.classList.add('hidden');tme.classList.remove('hidden')}
 document.documentElement.dataset.agendaSource=real?'android':'demo';
}
function refreshAgenda(){let a=androidEvents();renderAgenda(a===null?demo():a,a!==null)}
window.addEventListener('load',refreshAgenda);setInterval(refreshAgenda,60000);
