const $=s=>document.querySelector(s);let todayHas=true,tomorrowHas=true;
function render(){
 $('#todayAppointments').classList.toggle('hidden',!todayHas);$('.tasks').classList.toggle('hidden',!todayHas);$('#todayEmpty').classList.toggle('hidden',todayHas);
 $('#tomorrowAppointments').classList.toggle('hidden',!tomorrowHas);$('.warning').classList.toggle('hidden',!tomorrowHas);$('#tomorrowEmpty').classList.toggle('hidden',tomorrowHas);
 $('#toggleToday').textContent=todayHas?'Basculer : plus de RDV aujourd’hui':'Basculer : afficher le RDV';
 $('#toggleTomorrow').textContent=tomorrowHas?'Basculer : aucun RDV demain':'Basculer : afficher les RDV demain';
}
$('#toggleToday').onclick=()=>{todayHas=!todayHas;render()};$('#toggleTomorrow').onclick=()=>{tomorrowHas=!tomorrowHas;render()};
const dlg=$('#dialog');document.querySelectorAll('.guide-item button,[data-suggestion]').forEach(b=>b.onclick=()=>{const type=b.dataset.suggestion;$('#dialogTitle').textContent=type==='djinn'?'Djinn':type==='discovery'?'Découverte':'Ma Vie';$('#dialogText').textContent=type==='djinn'?'Djinn pourra proposer quelques éléments qui attendent votre attention.':type==='discovery'?'Le futur guide pourra chercher marchés, producteurs, événements, balades et autres idées pertinentes.':'Cette action sera reliée à sa vraie source dans une prochaine version.';dlg.showModal()});
$('#personalize').onclick=()=>{$('#dialogTitle').textContent='Pour moi';$('#dialogText').textContent='Cette zone sera personnalisable : glycémie, voiture, météo, maison et autres informations choisies par l’utilisateur.';dlg.showModal()};
const weatherTemps={sun:'18°',cloud:'17°',rain:'14°',storm:'13°',snow:'1°',fog:'12°'};
function periodForHour(h){return h<8?'dawn':h<17?'day':h<21?'evening':'night'}
function setAmbience(weather,period){document.body.dataset.weather=weather;document.body.dataset.period=period;$('#temperatureLabel').textContent=weatherTemps[weather]||weatherTemps.sun;$('#demoWeather').value=weather;$('#demoPeriod').value=period}
$('#demoWeather').onchange=e=>setAmbience(e.target.value,$('#demoPeriod').value);$('#demoPeriod').onchange=e=>setAmbience($('#demoWeather').value,e.target.value);$('#autoAmbience').onclick=()=>setAmbience($('#demoWeather').value,periodForHour(new Date().getHours()));
const now=new Date();const label=new Intl.DateTimeFormat('fr-CH',{weekday:'short',day:'numeric',month:'short'}).format(now);$('#todayLabel').textContent=label.charAt(0).toUpperCase()+label.slice(1);setAmbience('sun',periodForHour(now.getHours()));
if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');render();


// v0.1.011 — météo réelle + lieu
function wmoWeather(c){c=Number(c);if(c===0)return"sun";if([1,2,3].includes(c))return"cloud";if([45,48].includes(c))return"fog";if([71,73,75,77,85,86].includes(c))return"snow";if([95,96,99].includes(c))return"storm";if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(c))return"rain";return"cloud"}
function realPeriod(t,d){if(Number(d)!==1)return"night";const h=Number(String(t||"").slice(11,13));return h<8?"dawn":h<17?"day":h<21?"evening":"night"}
function applyRealWeather(x){document.body.dataset.weather=x.weather;document.body.dataset.period=x.period;const t=document.getElementById("temperatureLabel");if(t)t.textContent=`${x.temperature}°`;const l=document.getElementById("weatherPlace");if(l&&x.place)l.textContent=x.place;const a=document.getElementById("demoWeather"),b=document.getElementById("demoPeriod");if(a)a.value=x.weather;if(b)b.value=x.period}
async function localizedPlace(lat,lon){try{const r=await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=fr`,{cache:"no-store"});if(!r.ok)throw 0;const d=await r.json();return d.locality||d.city||d.principalSubdivision||""}catch(e){return""}}
async function loadRealWeather(){if(!navigator.geolocation)return;navigator.geolocation.getCurrentPosition(async p=>{try{const lat=p.coords.latitude,lon=p.coords.longitude;const [r,place]=await Promise.all([fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&timezone=auto&forecast_days=1`,{cache:"no-store"}),localizedPlace(lat,lon)]);if(!r.ok)throw 0;const d=await r.json(),c=d.current,x={weather:wmoWeather(c.weather_code),period:realPeriod(c.time,c.is_day),temperature:Math.round(c.temperature_2m),place};applyRealWeather(x);localStorage.setItem("maVieWeather",JSON.stringify(x))}catch(e){const x=JSON.parse(localStorage.getItem("maVieWeather")||"null");if(x)applyRealWeather(x)}},()=>{const x=JSON.parse(localStorage.getItem("maVieWeather")||"null");if(x)applyRealWeather(x)},{enableHighAccuracy:false,timeout:10000,maximumAge:900000})}
window.addEventListener("load",loadRealWeather);setInterval(loadRealWeather,15*60*1000);


// v0.1.012 — moteur Agenda (données de démonstration aujourd'hui/demain)
function mvStartOfDay(d){const x=new Date(d);x.setHours(0,0,0,0);return x}
function mvSameDay(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()}
function mvHHMM(d){return d.toLocaleTimeString("fr-CH",{hour:"2-digit",minute:"2-digit",hour12:false})}
function mvDemoEvents(now){
  const at=(dayOffset,h,m,title,place,duration=60)=>{
    const d=new Date(now);d.setDate(d.getDate()+dayOffset);d.setHours(h,m,0,0);
    return {title,place,start:d,end:new Date(d.getTime()+duration*60000)}
  };
  return [
    at(0,9,0,"Rendez-vous passé","Fribourg",45),
    at(0,20,0,"Atelier de patois","Fribourg",90),
    at(1,9,30,"Romont","",60),
    at(1,14,0,"Épalinges","",60)
  ];
}
function mvAgendaState(events,now=new Date()){
  const today=mvStartOfDay(now), tomorrow=new Date(today);tomorrow.setDate(tomorrow.getDate()+1);
  const afterTomorrow=new Date(tomorrow);afterTomorrow.setDate(afterTomorrow.getDate()+1);
  const todayRelevant=events.filter(e=>e.end>now && e.start<tomorrow).sort((a,b)=>a.start-b.start);
  const tomorrowEvents=events.filter(e=>e.start>=tomorrow && e.start<afterTomorrow).sort((a,b)=>a.start-b.start);
  return {todayRelevant,tomorrowEvents};
}
function mvRenderAgenda(){
  const now=new Date(), state=mvAgendaState(mvDemoEvents(now),now);
  const cards=[...document.querySelectorAll(".card")];
  const nowCard=cards.find(c=>c.textContent.includes("MAINTENANT"));
  const tomorrowCard=cards.find(c=>c.textContent.includes("DEMAIN"));
  if(nowCard){
    const main=nowCard.querySelector(".appointment");
    if(state.todayRelevant.length){
      const e=state.todayRelevant[0];
      if(main){
        const time=main.querySelector(".time"),title=main.querySelector(".appt-title"),place=main.querySelector(".place");
        if(time)time.textContent=mvHHMM(e.start);
        if(title)title.textContent=e.title;
        if(place)place.textContent=e.place||"";
      }
    }else if(main){
      main.innerHTML='<div class="empty-agenda">Plus de rendez-vous prévu aujourd’hui.</div>';
    }
  }
  if(tomorrowCard){
    const list=tomorrowCard.querySelector(".tomorrow-list");
    if(list){
      if(state.tomorrowEvents.length){
        list.innerHTML=state.tomorrowEvents.map(e=>`<div><strong>${mvHHMM(e.start)}</strong><span>${e.title}</span></div>`).join("");
      }else{
        list.innerHTML='<div class="empty-agenda">Demain, aucun rendez-vous n’est prévu.<br><span>Envie d’une découverte ?</span></div>';
      }
    }
  }
}
window.addEventListener("load",mvRenderAgenda);
setInterval(mvRenderAgenda,60000);
