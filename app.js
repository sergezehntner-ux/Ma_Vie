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
if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');render();
