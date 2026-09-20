// Ma Vie v0.2.6b — compatibilité avec app.js historique
(() => {
  // IDs attendus par app.js
  const now=document.getElementById('nowAppointments');
  if(now) now.id='todayAppointments';

  const temp=document.getElementById('weatherTemp');
  if(temp) temp.id='temperatureLabel';

  function addAfter(id, afterId, text){
    if(document.getElementById(id)) return;
    const after=document.getElementById(afterId); if(!after)return;
    const el=document.createElement('div');
    el.id=id; el.className='agenda-empty hidden'; el.textContent=text;
    after.insertAdjacentElement('afterend',el);
  }
  addAfter('todayEmpty','todayAppointments',"Plus de rendez-vous prévu aujourd'hui.");
  addAfter('tomorrowEmpty','tomorrowAppointments',"Demain, aucun rendez-vous n'est prévu.");

  // Éléments de compatibilité invisibles encore référencés par app.js.
  const box=document.createElement('div');
  box.hidden=true;
  box.innerHTML='<button id="personalize"></button><dialog id="dialog"><h2 id="dialogTitle"></h2><p id="dialogText"></p></dialog>';
  document.body.appendChild(box);
})();