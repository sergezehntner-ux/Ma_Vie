// Ma Vie v0.2.4 — finition Connexions
(() => {
  function finish(){
    const v=document.querySelector('.version');
    if(v)v.textContent='v0.2.4 · Connexions';

    // La démo de développement n'a plus à apparaître dans l'interface.
    document.querySelector('.demo-panel')?.remove();

    // Supprimer l'ancien avertissement fictif "Voiture 25 %".
    document.querySelector('.tomorrow-card .warning')?.remove();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',finish);
  else finish();
})();
