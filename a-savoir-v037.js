/* Ma Vie v0.3.7 — Proposition : alignements, géolocalisation, activité neutre */
(()=>{
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const key=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const hm=d=>d.toLocaleTimeString('fr-CH',{hour:'2-digit',minute:'2-digit',hour12:false});
 function events(){
  if(!window.MaVieAndroid||typeof window.MaVieAndroid.getEvents!=='function')return[];
  try{return JSON.parse(window.MaVieAndroid.getEvents()||'[]').map(e=>({title:e.title||'',place:e.place||'',start:new Date(+e.start),end:new Date(+e.end),allDay:!!e.allDay})).filter(e=>!isNaN(e.start)&&!isNaN(e.end))}catch{return[]}
 }
 function openUrl(u){
  if(window.MaVieAndroid&&typeof window.MaVieAndroid.openCompanion==='function'){try{window.MaVieAndroid.openCompanion(u);return}catch{}}
  window.open(u,'_blank');
 }
 function enyaqKm(){
  const tile=[...document.querySelectorAll('.metric')].find(x=>(x.querySelector('small')?.textContent||'').trim().toLowerCase()==='enyaq');
  const m=(tile?.querySelector('strong')?.textContent||'').match(/(\d+)\s*km/i); return m?+m[1]:null;
 }
 function weather(){
  const w=document.body.dataset.weather||'sun';
  return {w,bad:['rain','storm','snow','fog'].includes(w),label:{rain:'pluie',storm:'orage',snow:'neige',fog:'brouillard',cloud:'nuageux',sun:'beau temps'}[w]||''};
 }
 function nextTimed(day){
  const now=new Date(); return events().filter(e=>!e.allDay&&key(e.start)===key(day)&&(key(day)!==key(now)||e.start>now)).sort((a,b)=>a.start-b.start)[0]||null;
 }
 function suggestedMinutes(day){
  const now=new Date(),isToday=key(day)===key(now),n=nextTimed(day);
  if(!isToday)return n?Math.max(30,Math.min(180,Math.floor((n.start-new Date(day.getFullYear(),day.getMonth(),day.getDate(),9))/60000))):120;
  if(!n)return 120;
  /* Valeur volontairement prudente : garde 30 min avant le prochain rendez-vous. */
  return Math.max(15,Math.min(180,Math.floor((n.start-now)/60000)-30));
 }
 function suggestedRadius(){
  const km=enyaqKm(); if(!km)return 15;
  /* Aller-retour + 20 % de réserve : 2*r <= 80 % de l'autonomie affichée. */
  return Math.max(5,Math.min(80,Math.floor(km*.4/5)*5));
 }
 function suggestedActivity(day){
  const now=new Date(),h=key(day)===key(now)?now.getHours():12,bad=weather().bad;
  if(h>=11&&h<14)return bad?'Restaurant / intérieur':'Restaurant / terrasse';
  if(h>=18&&h<21)return bad?'Restaurant / intérieur':'Restaurant / terrasse';
  if(bad)return 'Musée / exposition / intérieur';
  return 'Découverte / balade / terrasse';
 }
 function placeDefault(day){ return 'Près de moi'; }
 function ensureDialog(){
  if(document.querySelector('#proposalDialog'))return;
  const d=document.createElement('dialog');d.id='proposalDialog';d.className='proposal-dialog';
  d.innerHTML=`<form method="dialog" class="proposal-sheet"><div class="proposal-head"><strong>UNE PROPOSITION</strong><button value="cancel" class="proposal-close" aria-label="Fermer">×</button></div>
   <div class="proposal-pair"><label>Lieu<select id="proposalPlace"><option>Près de moi</option><option>10 km</option><option>20 km</option><option>50 km</option><option>Autre…</option></select></label><label>Région<select id="proposalRegion"><option>Indifférent</option><option>Glâne</option><option>Gruyère</option><option>Broye</option><option>Sarine</option><option>Veveyse</option><option>La Côte</option><option>Jura</option><option>Autre…</option></select></label></div>
   <div class="proposal-pair"><label>Temps<select id="proposalTime"><option value="30">30 min</option><option value="60">1 h</option><option value="90">1 h 30</option><option value="120">2 h</option><option value="180">3 h</option></select></label><label>Activité<select id="proposalActivity"><option>Indifférent</option><option>Découverte / balade / terrasse</option><option>Café / terrasse</option><option>Restaurant / terrasse</option><option>Restaurant / intérieur</option><option>Marché / producteurs</option><option>Musée / exposition / intérieur</option><option>Nature / balade</option><option>Surprends-moi</option><option>Autre…</option></select></label></div>
   <div id="proposalHint" class="proposal-hint"></div><button id="proposalSearch" type="button" class="proposal-search">Chercher une proposition</button></form>`;
  document.body.appendChild(d);
 }
 function openProposal(day){
  ensureDialog(); const d=document.querySelector('#proposalDialog'),n=nextTimed(day),wx=weather(),mins=suggestedMinutes(day);
  d.dataset.day=day.toISOString(); document.querySelector('#proposalPlace').value=placeDefault(day); document.querySelector('#proposalRegion').value='Indifférent';
  const t=document.querySelector('#proposalTime');t.value=[30,60,90,120,180].reduce((a,b)=>Math.abs(b-mins)<Math.abs(a-mins)?b:a,30);
  document.querySelector('#proposalActivity').value='Indifférent';
  const hints=[];if(n)hints.push(`Prochain rendez-vous à ${hm(n.start)}`);const km=enyaqKm();if(km)hints.push(`Enyaq ${km} km — retour pris en compte`);if(wx.label)hints.push(wx.label);
  document.querySelector('#proposalHint').textContent=hints.join(' · ');document.querySelector('#proposalSearch').onclick=()=>search(day);d.showModal();
 }
 function search(day){
  const place=document.querySelector('#proposalPlace').value,region=document.querySelector('#proposalRegion').value,mins=document.querySelector('#proposalTime').value,act=document.querySelector('#proposalActivity').value,wx=weather();
  const date=new Intl.DateTimeFormat('fr-CH',{weekday:'long',day:'numeric',month:'long'}).format(day);
  let geo='';
  if(window.MaVieAndroid&&typeof window.MaVieAndroid.getLocation==='function'){
   try{const p=JSON.parse(window.MaVieAndroid.getLocation()||'null');if(p&&Number.isFinite(+p.latitude)&&Number.isFinite(+p.longitude))geo=`${(+p.latitude).toFixed(5)},${(+p.longitude).toFixed(5)}`}catch{}
  }
  const radius=place==='Près de moi'?'':place;
  const where=[region==='Indifférent'?'':region,geo?`autour de ${geo}`:'près de moi',radius&&radius!=='Autre…'?`dans un rayon de ${radius}`:''].filter(Boolean).join(' ');
  const activity=act==='Indifférent'?'idée sortie activité':act==='Autre…'?'activité':act;
  const q=[activity,where,date,`${mins} minutes`,wx.label].filter(Boolean).join(' ');document.querySelector('#proposalDialog')?.close();openUrl('https://www.google.com/search?q='+encodeURIComponent(q));
 }
 function row(day,label){return `<div class="mv-know mv-proposal"><div class="mv-know-when"><span>${esc(label)}</span></div><div class="mv-know-body"><button class="mv-proposal-button" type="button">Envie d’une proposition&nbsp;?</button></div></div>`}
 function render(){
  const card=document.querySelector('.guide-card'),box=document.querySelector('#guideItems');if(!card||!box)return;
  const today=new Date(),tomorrow=new Date(today);tomorrow.setDate(tomorrow.getDate()+1);
  box.innerHTML=row(today,"AUJOURD’HUI")+row(tomorrow,'DEMAIN');
  [...box.querySelectorAll('.mv-proposal-button')].forEach((b,i)=>b.onclick=()=>openProposal(i?tomorrow:today));
  card.classList.remove('hidden');window.dispatchEvent(new Event('mavie-content-change'));
 }
 const st=document.createElement('style');st.textContent=`
 .mv-know{display:grid;grid-template-columns:136px minmax(0,1fr);column-gap:0;align-items:center;padding:5px 0}
 .mv-know+.mv-know{border-top:1px solid rgba(255,255,255,.52)}
 .mv-know-when{border-right:1px solid rgba(7,60,74,.58);padding-right:14px;font-size:.70rem;line-height:1.18;font-weight:800;align-self:stretch;display:flex;align-items:center}
 .mv-know-when span{display:block}.mv-know-body{padding-left:18px;display:flex;align-items:center;min-height:1.18em}
 .mv-proposal-button{appearance:none;border:0;background:transparent;color:inherit;padding:0;margin:0;font:inherit;font-size:.74rem;font-weight:800;line-height:1.18;cursor:pointer;text-align:left}
 .proposal-dialog{width:min(440px,calc(100vw - 24px));border:1px solid rgba(255,255,255,.72);border-radius:16px;padding:0;background:rgba(245,252,250,.96);color:#073c4a;box-shadow:0 12px 38px #062d3b55}
 .proposal-dialog::backdrop{background:#052c3855;backdrop-filter:blur(2px)}.proposal-sheet{padding:13px;display:grid;gap:10px}.proposal-head{display:flex;align-items:center;justify-content:space-between;font-size:.78rem}.proposal-close{border:0;background:transparent;font-size:1.35rem;line-height:1;cursor:pointer;color:inherit}
 .proposal-sheet label{display:grid;gap:3px;font-size:.68rem;font-weight:800}.proposal-sheet select{width:100%;box-sizing:border-box;border:1px solid #0a657566;border-radius:9px;background:#fff;color:#073c4a;padding:7px 8px;font:inherit;font-size:.74rem}.proposal-pair{display:grid;grid-template-columns:1fr 1fr;gap:8px}.proposal-pair label:last-child{position:relative}.proposal-pair label:last-child select{padding-right:32px}.proposal-pair .unit{position:absolute;right:25px;bottom:8px;font-size:.68rem;font-weight:700;pointer-events:none}.proposal-hint{font-size:.65rem;line-height:1.25;opacity:.78}.proposal-search{border:0;border-radius:999px;padding:8px 12px;font:inherit;font-size:.72rem;font-weight:800;cursor:pointer;background:#0b7785;color:white}
 .agenda-empty-message{margin-left:50px!important;padding-left:0!important;font:inherit!important;font-size:.78rem!important;font-weight:700!important;line-height:1.2!important}
 body.mv-density-compact .mv-know,body.mv-density-tight .mv-know{padding:3px 0}
 @media(max-width:699px){.mv-know{grid-template-columns:126px minmax(0,1fr);column-gap:0;padding:4px 0}.mv-know-when{font-size:.66rem;padding-right:12px}.mv-know-body{padding-left:14px}.mv-proposal-button{font-size:.70rem}}
 `;document.head.appendChild(st);
 window.addEventListener('load',()=>setTimeout(render,300));setInterval(render,60000);
})();
