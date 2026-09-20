/* Ma Vie v0.3.0 — À SAVOIR : repères temporels + typographie agenda */
(() => {
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const hm=d=>d.toLocaleTimeString('fr-CH',{hour:'2-digit',minute:'2-digit',hour12:false});
 const parts=p=>String(p||'').split(' - ').map(x=>x.trim()).filter(Boolean);
 const last=e=>{const p=parts(e.place);return p.length?p[p.length-1]:''};
 const key=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 function duration(n){return n>=60?`${Math.floor(n/60)}h${n%60?String(n%60).padStart(2,'0'):''}`:`${n} min`}
 function events(){
  if(!window.MaVieAndroid||typeof window.MaVieAndroid.getEvents!=='function')return[];
  try{return JSON.parse(window.MaVieAndroid.getEvents()||'[]').map(e=>({title:e.title||'',place:e.place||'',start:new Date(+e.start),end:new Date(+e.end),allDay:!!e.allDay})).filter(e=>!isNaN(e.start)&&!isNaN(e.end))}
  catch{return[]}
 }
 function temporalLabel(a,now){
  const today=key(now), k=key(a.end);
  const tomorrow=new Date(now); tomorrow.setDate(tomorrow.getDate()+1);
  if(k===today){
   const delta=(a.end-now)/60000;
   if(delta<=15 && delta>=-30)return `MAINTENANT · ${hm(a.end)}`;
   return `AUJOURD’HUI · ${hm(a.end)}`;
  }
  if(k===key(tomorrow))return `DEMAIN · ${hm(a.end)}`;
  return `${new Intl.DateTimeFormat('fr-CH',{weekday:'short',day:'numeric',month:'short'}).format(a.end).toUpperCase()} · ${hm(a.end)}`;
 }
 function openDjinn(){
  const u='https://sergezehntner-ux.github.io/Djinn/';
  if(window.MaVieAndroid&&typeof window.MaVieAndroid.openCompanion==='function'){try{window.MaVieAndroid.openCompanion(u);return}catch{}}
  window.open(u,'_blank');
 }
 function info(from,to,a,b){
  const dlg=document.querySelector('#dialog'),t=document.querySelector('#dialogTitle'),x=document.querySelector('#dialogText');
  if(!dlg||!t||!x)return;
  t.textContent='Découvrir sur le trajet';
  x.textContent=`Entre ${from} et ${to}, de ${hm(a)} à ${hm(b)}, Ma Vie pourra rechercher marchés, expositions et autres occasions compatibles avec ton trajet.`;
  dlg.showModal();
 }
 function render(){
  const card=document.querySelector('.guide-card'),box=document.querySelector('#guideItems');
  if(!card||!box)return;
  const now=new Date(), tomorrow=new Date(now); tomorrow.setDate(tomorrow.getDate()+1);
  const allowed=new Set([key(now),key(tomorrow)]);
  const e=events().filter(x=>!x.allDay&&allowed.has(key(x.start))).sort((a,b)=>a.start-b.start);
  const rows=[];
  for(let i=0;i<e.length-1;i++){
   const a=e[i],b=e[i+1];
   if(key(a.start)!==key(b.start))continue;
   const from=last(a),to=last(b),gap=Math.round((b.start-a.end)/60000);
   if(!from||!to||gap<20)continue;
   rows.push({a,b,from,to,html:`<div class="mv-know">
    <div class="mv-know-when">${temporalLabel(a,now)}</div>
    <div class="mv-know-body"><strong>${parts(a.place).length>1?'Après ton trajet':'Après ton rendez-vous'}, tu devrais être libre à ${esc(from)}.</strong><small>Tu as ${duration(gap)} avant ${esc(to)} à ${hm(b.start)}.</small></div>
    <div class="mv-actions"><button data-djinn>🧞 Djinn</button><button data-discover>🔎 Sur le trajet</button></div>
   </div>`});
  }
  if(!rows.length){box.innerHTML='';card.classList.add('hidden');return}
  box.innerHTML=rows.map(r=>r.html).join('');card.classList.remove('hidden');
  box.querySelectorAll('[data-djinn]').forEach(b=>b.onclick=openDjinn);
  box.querySelectorAll('[data-discover]').forEach((b,i)=>b.onclick=()=>info(rows[i].from,rows[i].to,rows[i].a.end,rows[i].b.start));
 }
 const st=document.createElement('style');
 st.textContent=`
 .mv-know{display:grid;grid-template-columns:76px minmax(0,1fr) auto;gap:8px;align-items:start;padding:2px 0}
 .mv-know-when{font-size:.70rem;line-height:1.22;font-weight:800;white-space:nowrap}
 .mv-know-body strong{display:block;font-size:.74rem!important;line-height:1.22!important}
 .mv-know-body small{display:block;font-size:.70rem!important;line-height:1.18!important;margin-top:2px;opacity:.86}
 .mv-actions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
 .mv-actions button{border:0;border-radius:999px;padding:5px 9px;font:inherit;font-size:.68rem;font-weight:750;cursor:pointer}
 @media(max-width:699px){
  .mv-know{grid-template-columns:70px minmax(0,1fr)}
  .mv-actions{grid-column:2;justify-content:flex-start}
  .mv-know-when{font-size:.66rem}
  .mv-know-body strong{font-size:.70rem!important}
  .mv-know-body small{font-size:.66rem!important}
 }`;
 document.head.appendChild(st);
 window.addEventListener('load',()=>setTimeout(render,300));
 setInterval(render,60000);
})();
