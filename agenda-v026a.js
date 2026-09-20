// Ma Vie v0.2.6a — correctif compatibilité agenda
// app.js historique attendait les anciens IDs todayAppointments/todayEmpty/tomorrowEmpty.
// La page v0.2.6 utilise nowAppointments et n'a plus les deux blocs "empty".
(() => {
  function alias(id, targetId) {
    if (document.getElementById(id)) return;
    const target=document.getElementById(targetId);
    if (!target) return;
    if (id==='todayAppointments') {
      target.id=id;
      return;
    }
  }
  alias('todayAppointments','nowAppointments');

  function empty(id, afterId, text) {
    if (document.getElementById(id)) return;
    const after=document.getElementById(afterId);
    if (!after) return;
    const el=document.createElement('div');
    el.id=id; el.className='agenda-empty hidden'; el.textContent=text;
    after.insertAdjacentElement('afterend',el);
  }
  empty('todayEmpty','todayAppointments',"Plus de rendez-vous prévu aujourd'hui.");
  empty('tomorrowEmpty','tomorrowAppointments',"Demain, aucun rendez-vous n'est prévu.");

  // app.js installe refreshAgenda au load. Comme ce correctif est chargé après app.js
  // mais avant l'événement load, les IDs sont prêts à temps.
})();