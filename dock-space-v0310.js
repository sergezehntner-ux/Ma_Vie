/* Ma Vie v0.3.10 — réserve dynamique pour le dock inférieur */
(()=>{
  const root=document.documentElement;
  const dock=document.querySelector('.permanent-dock');
  if(!dock)return;
  const sync=()=>{
    const r=dock.getBoundingClientRect();
    const bottom=Math.max(0,window.innerHeight-r.bottom);
    root.style.setProperty('--mv-dock-space',`${Math.ceil(r.height+bottom)}px`);
  };
  sync();
  requestAnimationFrame(sync);
  window.addEventListener('resize',sync,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(sync,120),{passive:true});
  if('ResizeObserver' in window)new ResizeObserver(sync).observe(dock);
  else setInterval(sync,1500);
})();
