(() => {
  'use strict';
  const buttons=[...document.querySelectorAll('.quickbar [data-companion]')];
  const find=part=>buttons.find(b=>(b.dataset.companion||'').includes(part));
  const keys={herbier:'mv-companion-herbier-pending',sante:'mv-companion-sante-pending',djinn:'mv-companion-djinn-pending'};
  function mark(button,on){
    if(!button)return; const label=button.querySelector('span'); if(!label)return;
    let el=label.querySelector('.companion-alert');
    if(on&&!el){el=document.createElement('b');el.className='companion-alert';el.textContent=' ❗';el.setAttribute('aria-label','Attention requise');label.appendChild(el)}
    if(!on&&el)el.remove();
  }
  function flag(k){try{return localStorage.getItem(k)==='1'}catch(_){return false}}
function nativeFlag(name,key){try{if(window.MaVieAndroid&&typeof window.MaVieAndroid.getCompanionPending==='function')return !!window.MaVieAndroid.getCompanionPending(name)}catch(_){}return flag(key)}
function refresh(){mark(find('Herbier_gourmand'),nativeFlag('herbier',keys.herbier));mark(find('ma_sante'),nativeFlag('sante',keys.sante));mark(find('Djinn'),nativeFlag('djinn',keys.djinn))}
  refresh(); window.addEventListener('focus',refresh); window.addEventListener('storage',refresh);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()}); setInterval(refresh,15000);
})();
