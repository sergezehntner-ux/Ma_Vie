/* Ma Vie v0.3.4 — À SAVOIR minimaliste : demander avant de proposer */
(()=>{
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const key=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const parts=p=>String(p||'').split(' - ').map(x=>x.trim()).filter(Boolean);
 const first=e=>parts(e.place)[0]||'';
 const last=e=>{const p=parts(e.place);return p[p.length-1]||''};
 function events(){
  if(!window.MaVieAndroid||typeof window.MaVieAndroid.getEvents!=='function')return[];
  try{return JSON.parse(window.MaVieAndroid.getEvents()||'[]').map(e=>({title:e.title||'',place:e.place||'',start:new Date(+e.start),end:new Date(+e.end),allDay:!!e.allDay})).filter(e=>!isNaN(e.start)&&!isNaN(e.end))}
  catch{return[]}
 }
 function openUrl(u){
  if(window.MaVieAndroid&&typeof window.MaVieAndroid.openCompanion==='function'){try{window.MaVieAndroid.openCompanion(u);return}catch{}}
  window.open(u,'_blank');
 }
 function weatherWord(){
  const w=document.body.dataset.weather||'';
  if(w==='rain'||w==='storm')return 'pluie';
  if(w==='snow')return 'neige';
  if(w==='fog')return 'brouillard';
  if(w==='cloud')return 'nuageux';
  return 'beau temps';
 }
 function interestsFor(date,isToday){
  if(!isToday)return 'idée sortie marché exposition musée découverte café restaurant';
  const h=date.getHours(),bad=['rain','storm','snow','fog'].includes(document.body.dataset.weather||'');
  if(h>=11&&h<14)return bad?'restaurant café musée exposition':'restaurant terrasse marché découverte';
  if(h>=18&&h<21)return bad?'restaurant exposition spectacle':'restaurant terrasse événement promenade';
  if(h>=14&&h<18)return bad?'café musée exposition lieu couvert':'café terrasse exposition marché découverte';
  if(h>=8&&h<11)return bad?'café musée exposition lieu couvert':'café marché promenade découverte';
  return bad?'lieu couvert exposition événement':'découverte promenade événement';
 }
 function context(day){
  const now=new Date(),isToday=key(day)===key(now),all=events().filter(e=>!e.allDay&&key(e.start)===key(day)).sort((a,b)=>a.start-b.start);
  let from=(document.querySelector('#weatherPlace')?.textContent||'').trim(),to='';
  if(isToday){
   const next=all.find(e=>e.start>now);
   if(next)to=first(next);
   const ended=[...all].reverse().find(e=>e.end<=now);
   if(!from&&ended)from=last(ended);
  }else if(all.length){to=first(all[0])}
  return {now,isToday,from,to};
 }
 function propose(day){
  const c=context(day),date=new Intl.DateTimeFormat('fr-CH',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(day);
  const where=c.from&&c.to&&c.from!==c.to?`${c.from} ${c.to} sur le trajet`:c.from||c.to||'';
  const wx=c.isToday?weatherWord():'';
  const q=[interestsFor(c.now,c.isToday),where,date,wx].filter(Boolean).join(' ');
  openUrl('https://www.google.com/search?q='+encodeURIComponent(q));
 }
 function row(day,label){
  return `<div class="mv-know mv-proposal"><div class="mv-know-when"><span>${esc(label)}</span></div><div class="mv-know-body"><button class="mv-proposal-button" type="button">Envie d’une proposition&nbsp;?</button></div></div>`;
 }
 function render(){
  const card=document.querySelector('.guide-card'),box=document.querySelector('#guideItems');if(!card||!box)return;
  const today=new Date(),tomorrow=new Date(today);tomorrow.setDate(tomorrow.getDate()+1);
  box.innerHTML=row(today,"AUJOURD’HUI")+row(tomorrow,'DEMAIN');
  [...box.querySelectorAll('.mv-proposal-button')].forEach((b,i)=>b.onclick=()=>propose(i?tomorrow:today));
  card.classList.remove('hidden');window.dispatchEvent(new Event('mavie-content-change'));
 }
 const st=document.createElement('style');st.textContent=`
 .mv-know{display:grid;grid-template-columns:82px minmax(0,1fr);gap:9px;align-items:center;padding:5px 0}
 .mv-know+.mv-know{border-top:1px solid rgba(255,255,255,.52)}
 .mv-know-when{border-right:1px solid rgba(7,60,74,.58);padding-right:8px;font-size:.70rem;line-height:1.12;font-weight:800}
 .mv-know-when span{display:block}
 .mv-proposal-button{appearance:none;border:0;background:transparent;color:inherit;padding:0;margin:0;font:inherit;font-size:.74rem;font-weight:800;line-height:1.18;cursor:pointer;text-align:left}
 .mv-proposal-button:active{transform:translateY(1px);opacity:.75}
 body.mv-density-compact .mv-know,body.mv-density-tight .mv-know{padding:3px 0}
 @media(max-width:699px){.mv-know{grid-template-columns:76px minmax(0,1fr);gap:6px;padding:4px 0}.mv-know-when{font-size:.66rem}.mv-proposal-button{font-size:.70rem}}
 `;document.head.appendChild(st);
 window.addEventListener('load',()=>setTimeout(render,300));setInterval(render,60000);
})();
