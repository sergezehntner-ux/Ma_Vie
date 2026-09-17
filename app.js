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
const weatherNames={sun:'☀️ 18°',cloud:'☁️ 17°',rain:'🌧️ 14°',storm:'⛈️ 13°',snow:'❄️ 1°',fog:'🌫️ 12°'};
function periodForHour(h){return h<8?'dawn':h<17?'day':h<21?'evening':'night'}
function setAmbience(weather,period){document.body.dataset.weather=weather;document.body.dataset.period=period;$('#weatherLabel').textContent=weatherNames[weather]||weatherNames.sun;$('#demoWeather').value=weather;$('#demoPeriod').value=period}
$('#demoWeather').onchange=e=>setAmbience(e.target.value,$('#demoPeriod').value);$('#demoPeriod').onchange=e=>setAmbience($('#demoWeather').value,e.target.value);$('#autoAmbience').onclick=()=>setAmbience($('#demoWeather').value,periodForHour(new Date().getHours()));
const now=new Date();const label=new Intl.DateTimeFormat('fr-CH',{weekday:'short',day:'numeric',month:'short'}).format(now);$('#todayLabel').textContent=label.charAt(0).toUpperCase()+label.slice(1);setAmbience('sun',periodForHour(now.getHours()));
if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');render();
