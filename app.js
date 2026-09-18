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

// v0.1.009 — météo réelle
function wmoWeather(c){c=Number(c);if(c===0)return"sun";if([1,2,3].includes(c))return"cloud";if([45,48].includes(c))return"fog";if([71,73,75,77,85,86].includes(c))return"snow";if([95,96,99].includes(c))return"storm";if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(c))return"rain";return"cloud"}
function realMoment(t,d){if(Number(d)!==1)return"night";const h=Number(String(t||"").slice(11,13));return h<10?"morning":h>=18?"evening":"day"}
function applyRealWeather(x){document.body.dataset.weather=x.weather;document.body.dataset.moment=x.moment;const t=document.getElementById("weatherTemp");if(t)t.textContent=`${x.temperature}°`;const a=document.getElementById("weatherSelect"),b=document.getElementById("momentSelect");if(a)a.value=x.weather;if(b)b.value=x.moment}
async function loadRealWeather(){if(!navigator.geolocation)return;navigator.geolocation.getCurrentPosition(async p=>{try{const u=`https://api.open-meteo.com/v1/forecast?latitude=${p.coords.latitude}&longitude=${p.coords.longitude}&current=temperature_2m,weather_code,is_day&timezone=auto&forecast_days=1`;const r=await fetch(u,{cache:"no-store"});if(!r.ok)throw 0;const d=await r.json(),c=d.current,x={weather:wmoWeather(c.weather_code),moment:realMoment(c.time,c.is_day),temperature:Math.round(c.temperature_2m)};applyRealWeather(x);localStorage.setItem("maVieWeather",JSON.stringify(x))}catch(e){const x=JSON.parse(localStorage.getItem("maVieWeather")||"null");if(x)applyRealWeather(x)}},()=>{const x=JSON.parse(localStorage.getItem("maVieWeather")||"null");if(x)applyRealWeather(x)},{enableHighAccuracy:false,timeout:10000,maximumAge:900000})}
window.addEventListener("load",loadRealWeather);setInterval(loadRealWeather,15*60*1000);
