// Ma Vie v0.2.6 — LibreLinkUp (lecture seule)
(() => {
  const tile=()=>[...document.querySelectorAll('.metric')].find(b=>
    (b.querySelector('small')?.textContent||'').trim().toLowerCase()==='glycémie');

  function show(text,state){
    const b=tile(); if(!b)return;
    const s=b.querySelector('strong'); if(s)s.textContent=text;
    b.dataset.libreState=state;
  }
  function read(){
    const a=window.MaVieLibre;
    if(!a||typeof a.getData!=='function'){show('Données indisponibles','error');return}
    try{
      const d=JSON.parse(a.getData()||'{}');
      if(d.setupRequired){show('Configurer','setup');return}
      if(d.ok&&Number.isFinite(+d.mmol)&&d.arrow)
        show(`${(+d.mmol).toFixed(1).replace('.',',')} mmol/L ${d.arrow}`,'ok');
      else show('Données indisponibles','error');
    }catch(_){show('Données indisponibles','error')}
  }
  function install(){
    const b=tile(); if(!b)return;
    b.addEventListener('click',e=>{
      if(b.dataset.libreState!=='setup')return;
      e.preventDefault();e.stopPropagation();
      try{window.MaVieLibre?.configure?.()}catch(_){}
    },true);
    read();
    window.maVieRefreshLibre=read;
  }
  window.addEventListener('load',install,{once:true});
})();