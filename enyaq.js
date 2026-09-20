// Ma Vie v0.2.4 — Enyaq
(() => {
  const tile=()=>[...document.querySelectorAll('.metric')].find(b=>
    (b.querySelector('small')?.textContent||'').trim().toLowerCase()==='enyaq');

  function show(text,state){
    const b=tile(); if(!b)return;
    const s=b.querySelector('strong'); if(s)s.textContent=text;
    b.dataset.enyaqState=state;
  }
  function read(){
    const a=window.MaVieEnyaq;
    if(!a||typeof a.getData!=='function'){show('Données indisponibles','error');return}
    try{
      const d=JSON.parse(a.getData()||'{}');
      if(d.setupRequired){show('Configurer','setup');return}
      if(d.ok&&Number.isFinite(+d.percent)&&Number.isFinite(+d.km))
        show(`${Math.round(+d.percent)} % · ${Math.round(+d.km)} km`,'ok');
      else show('Données indisponibles','error');
    }catch(_){show('Données indisponibles','error')}
  }
  function install(){
    const b=tile(); if(!b)return;
    b.addEventListener('click',e=>{
      const a=window.MaVieEnyaq, st=b.dataset.enyaqState;
      if(st==='setup'){
        e.preventDefault();e.stopPropagation();
        try{a?.configure?.()}catch(_){}
      }else if(st==='error'){
        e.preventDefault();e.stopPropagation();
        try{a?.openMySkoda?.()}catch(_){}
      }
    },true);
    read();
    window.maVieRefreshEnyaq=read;
  }
  window.addEventListener('load',install,{once:true});
})();
