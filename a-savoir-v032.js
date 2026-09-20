/* Ma Vie v0.3.2 — 2e situation + boutons de découverte réellement actifs */
(() => {
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const hm=d=>d.toLocaleTimeString('fr-CH',{hour:'2-digit',minute:'2-digit',hour12:false});
 const parts=p=>String(p||'').split(' - ').map(x=>x.trim()).filter(Boolean);
 const last=e=>{const p=parts(e.place);return p.length?p[p.length-1]:''};
 const key=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const duration=n=>n>=60?`${Math.floor(n/60)}h${n%60?String(n%60).padStart(2,'0'):''}`:`${n} min`;
 function events(){
  if(!window.MaVieAndroid||typeof window.MaVieAndroid.getEvents!=='function')return[];
  try{return JSON.parse(window.MaVieAndroid.getEvents()||'[]').map(e=>({title:e.title||'',place:e.place||'',start:new Date(+e.start),end:new Date(+e.end),allDay:!!e.allDay})).filter(e=>!isNaN(e.start)&&!isNaN(e.end))}
  catch{return[]}
 }
 function temporal(d,now){
  const today=key(now),k=key(d),tomorrow=new Date(now);tomorrow.setDate(tomorrow.getDate()+1);
  if(k===today){const delta=(d-now)/60000;return {day:(delta<=15&&delta>=-30?'MAINTENANT':"AUJOURD’HUI"),time:hm(d)}}
  if(k===key(tomorrow))return {day:'DEMAIN',time:hm(d)};
  return {day:new Intl.DateTimeFormat('fr-CH',{weekday:'short',day:'numeric',month:'short'}).format(d).toUpperCase(),time:hm(d)};
 }
 function openUrl(u){
  if(window.MaVieAndroid&&typeof window.MaVieAndroid.openCompanion==='function'){try{window.MaVieAndroid.openCompanion(u);return}catch{}}
  window.open(u,'_blank');
 }
 function openDjinn(){openUrl('https://sergezehntner-ux.github.io/Djinn/')}
 function discover(row){
  /* Recherche volontaire: rien ne s'ouvre sans pression sur le bouton. */
  const date=new Intl.DateTimeFormat('fr-CH',{weekday:'long',day:'numeric',month:'long'}).format(row.at);
  const q=row.type==='between'
   ? `marché exposition musée événement ${row.from} ${row.to} ${date} ${hm(row.at)}`
   : `marché exposition musée événement à ${row.from} ${date} après ${hm(row.at)}`;
  openUrl('https://www.google.com/search?q='+encodeURIComponent(q));
 }
 function rowHtml(r){
  const w=temporal(r.at,r.now);
  return `<div class="mv-know">
   <div class="mv-know-when"><span>${esc(w.day)}</span><time>${esc(w.time)}</time></div>
   <div class="mv-know-body"><strong>${r.main}</strong><small>${r.sub}</small></div>
   <div class="mv-actions">${r.djinn?'<button data-djinn>🧞 Djinn</button>':''}<button data-discover>${r.type==='between'?'🔎 Sur le trajet':'🔎 Autour de moi'}</button></div>
  </div>`;
 }
 function render(){
  const card=document.querySelector('.guide-card'),box=document.querySelector('#guideItems');
  if(!card||!box)return;
  const now=new Date(),tomorrow=new Date(now);tomorrow.setDate(tomorrow.getDate()+1);
  const allowed=new Set([key(now),key(tomorrow)]);
  const e=events().filter(x=>!x.allDay&&allowed.has(key(x.start))).sort((a,b)=>a.start-b.start);
  const rows=[];
  for(let i=0;i<e.length-1;i++){
   const a=e[i],b=e[i+1];
   if(key(a.start)!==key(b.start))continue;
   const from=last(a),to=last(b),gap=Math.round((b.start-a.end)/60000);
   if(!from||!to||gap<20)continue;
   rows.push({type:'between',a,b,from,to,at:a.end,now,djinn:true,
    main:`${parts(a.place).length>1?'Après ton trajet':'Après ton rendez-vous'}, tu devrais être libre à ${esc(from)}.`,
    sub:`Tu as ${duration(gap)} avant ${esc(to)} à ${hm(b.start)}.`});
  }
  /* Après le dernier rendez-vous de chaque journée: nouvelle situation. */
  for(const day of allowed){
   const d=e.filter(x=>key(x.start)===day);
   if(!d.length)continue;
   const a=d[d.length-1],from=last(a);
   if(!from)continue;
   rows.push({type:'after',a,from,to:'',at:a.end,now,djinn:false,
    main:`Après ton rendez-vous, tu seras libre à ${esc(from)}.`,
    sub:`Envie de profiter d’être sur place ?`});
  }
  rows.sort((a,b)=>a.at-b.at);
  if(!rows.length){box.innerHTML='';card.classList.add('hidden');window.dispatchEvent(new Event('mavie-content-change'));return}
  box.innerHTML=rows.map(rowHtml).join('');card.classList.remove('hidden');
  let di=0;
  box.querySelectorAll('.mv-know').forEach((el,i)=>{
   const r=rows[i];
   const d=el.querySelector('[data-djinn]');if(d)d.onclick=openDjinn;
   const s=el.querySelector('[data-discover]');if(s)s.onclick=()=>discover(r);
  });
  window.dispatchEvent(new Event('mavie-content-change'));
 }
 const st=document.createElement('style');
 st.textContent=`
 .mv-know{display:grid;grid-template-columns:82px minmax(0,1fr) auto;gap:9px;align-items:center;padding:5px 0}
 .mv-know+.mv-know{border-top:1px solid rgba(255,255,255,.52)}
 .mv-know-when{border-right:1px solid rgba(7,60,74,.58);padding-right:8px;font-size:.70rem;line-height:1.12;font-weight:800}
 .mv-know-when span,.mv-know-when time{display:block}.mv-know-when time{margin-top:3px}
 .mv-know-body strong{display:block;font-size:.74rem!important;line-height:1.18!important}
 .mv-know-body small{display:block;font-size:.70rem!important;line-height:1.15!important;margin-top:1px;opacity:.86}
 .mv-actions{display:flex;gap:5px;flex-wrap:nowrap;justify-content:flex-end}
 .mv-actions button{border:0;border-radius:999px;padding:4px 8px;font:inherit;font-size:.68rem;font-weight:750;cursor:pointer;white-space:nowrap}
 body.mv-density-compact .mv-know,body.mv-density-tight .mv-know{padding:3px 0} body.mv-density-tight .mv-know{gap:6px}
 @media(max-width:699px){.mv-know{grid-template-columns:76px minmax(0,1fr);gap:6px;padding:4px 0}.mv-actions{grid-column:2;justify-content:flex-start;margin-top:-1px}.mv-know-when{font-size:.66rem}.mv-know-body strong{font-size:.70rem!important}.mv-know-body small{font-size:.66rem!important}.mv-actions button{font-size:.63rem;padding:3px 6px}}`;
 document.head.appendChild(st);
 window.addEventListener('load',()=>setTimeout(render,300));
 setInterval(render,60000);
})();
