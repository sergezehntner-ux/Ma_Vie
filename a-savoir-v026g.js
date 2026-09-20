/* Ma Vie v0.2.6g — premier cerveau réel « À SAVOIR » */
(() => {
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const hm=d=>d.toLocaleTimeString('fr-CH',{hour:'2-digit',minute:'2-digit',hour12:false});
 const parts=p=>String(p||'').split(' - ').map(x=>x.trim()).filter(Boolean);
 const last=e=>{const p=parts(e.place);return p.length?p[p.length-1]:''};
 const daykey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 function duration(n){return n>=60?`${Math.floor(n/60)}h${n%60?String(n%60).padStart(2,'0'):''}`:`${n} min`}
 function events(){
  if(!window.MaVieAndroid||typeof window.MaVieAndroid.getEvents!=='function')return[];
  try{return JSON.parse(window.MaVieAndroid.getEvents()||'[]').map(e=>({title:e.title||'',place:e.place||'',start:new Date(+e.start),end:new Date(+e.end),allDay:!!e.allDay})).filter(e=>!isNaN(e.start)&&!isNaN(e.end))}
  catch{return[]}
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
  const d=new Date();d.setDate(d.getDate()+1);const k=daykey(d);
  const e=events().filter(x=>!x.allDay&&daykey(x.start)===k).sort((a,b)=>a.start-b.start);
  const rows=[];
  for(let i=0;i<e.length-1;i++){
   const a=e[i],b=e[i+1],from=last(a),to=last(b),gap=Math.round((b.start-a.end)/60000);
   if(!from||!to||gap<20)continue;
   rows.push({a,b,from,to,html:`<div class="mv-know"><div><strong>${parts(a.place).length>1?'Après ton trajet':'Après ton rendez-vous'}, tu devrais être libre vers ${hm(a.end)} à ${esc(from)}.</strong><small>Tu as ${duration(gap)} avant ${esc(to)} à ${hm(b.start)}.</small></div><div class="mv-actions"><button data-djinn>🧞 Djinn</button><button data-discover>🔎 Sur le trajet</button></div></div>`});
  }
  if(!rows.length){box.innerHTML='';card.classList.add('hidden');return}
  box.innerHTML=rows.map(r=>r.html).join('');card.classList.remove('hidden');
  box.querySelectorAll('[data-djinn]').forEach(b=>b.onclick=openDjinn);
  box.querySelectorAll('[data-discover]').forEach((b,i)=>b.onclick=()=>info(rows[i].from,rows[i].to,rows[i].a.end,rows[i].b.start));
 }
 const st=document.createElement('style');
 st.textContent='.mv-know{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center}.mv-know strong,.mv-know small{display:block}.mv-know small{margin-top:3px;opacity:.82}.mv-actions{display:flex;gap:6px;flex-wrap:wrap}.mv-actions button{border:0;border-radius:999px;padding:7px 10px;font:inherit;font-size:.72rem;font-weight:750}@media(max-width:699px){.mv-know{grid-template-columns:1fr}}';
 document.head.appendChild(st);
 window.addEventListener('load',()=>setTimeout(render,300));
 setInterval(render,60000);
})();
