/* Ma Vie v0.3.1 — répartit dynamiquement la hauteur sans scroll */
(() => {
 const modes=['comfort','normal','compact','tight'];
 function setMode(m){
  modes.forEach(x=>document.body.classList.remove('mv-density-'+x));
  document.body.classList.add('mv-density-'+m);
 }
 function fits(){
  const dock=document.querySelector('.permanent-dock');
  const grid=document.querySelector('.grid');
  if(!dock||!grid)return true;
  const limit=dock.getBoundingClientRect().top-4;
  return grid.getBoundingClientRect().bottom<=limit && document.documentElement.scrollHeight<=window.innerHeight+2;
 }
 function apply(){
  setMode('comfort');
  for(const m of modes){
   setMode(m);
   void document.body.offsetHeight;
   if(fits())break;
  }
 }
 let timer;
 const schedule=()=>{clearTimeout(timer);timer=setTimeout(apply,60)};
 window.addEventListener('load',()=>setTimeout(apply,450));
 window.addEventListener('resize',schedule);
 window.addEventListener('mavie-content-change',schedule);
 const observer=new MutationObserver(schedule);
 window.addEventListener('load',()=>{
  const grid=document.querySelector('.grid');
  if(grid)observer.observe(grid,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']});
 });
})();
