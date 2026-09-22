/* Ma Vie v0.3.8 — À savoir : événements + bureau de tourisme à la demande */
(()=>{
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const key=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const hm=d=>d.toLocaleTimeString('fr-CH',{hour:'2-digit',minute:'2-digit',hour12:false});
 function events(){
  if(!window.MaVieAndroid||typeof window.MaVieAndroid.getEvents!=='function')return[];
  try{return JSON.parse(window.MaVieAndroid.getEvents()||'[]').map(e=>({title:e.title||'',place:e.place||'',calendar:e.calendar||'',start:new Date(+e.start),end:new Date(+e.end),allDay:!!e.allDay})).filter(e=>!isNaN(e.start)&&!isNaN(e.end))}catch{return[]}
 }
 function openUrl(u){
  if(window.MaVieAndroid&&typeof window.MaVieAndroid.openCompanion==='function'){try{window.MaVieAndroid.openCompanion(u);return}catch{}}
  window.open(u,'_blank');
 }
 function enyaqKm(){const tile=[...document.querySelectorAll('.metric')].find(x=>(x.querySelector('small')?.textContent||'').trim().toLowerCase()==='enyaq');const m=(tile?.querySelector('strong')?.textContent||'').match(/(\d+)\s*km/i);return m?+m[1]:null}
 function weather(){const w=document.body.dataset.weather||'sun';return {w,bad:['rain','storm','snow','fog'].includes(w),label:{rain:'pluie',storm:'orage',snow:'neige',fog:'brouillard',cloud:'nuageux',sun:'beau temps'}[w]||''}}
 function nextTimed(day){const now=new Date();return events().filter(e=>!e.allDay&&key(e.start)===key(day)&&(key(day)!==key(now)||e.start>now)).sort((a,b)=>a.start-b.start)[0]||null}
 function suggestedMinutes(day){const now=new Date(),isToday=key(day)===key(now),n=nextTimed(day);if(!isToday)return n?Math.max(30,Math.min(180,Math.floor((n.start-new Date(day.getFullYear(),day.getMonth(),day.getDate(),9))/60000))):120;if(!n)return 120;return Math.max(15,Math.min(180,Math.floor((n.start-now)/60000)-30))}
 function classify(e){const t=(e.title+' '+e.calendar).toLowerCase();if(/anniversaire|birthday|geburtstag/.test(t)||/\b\d{1,3}\s*$/.test(e.title))return {icon:'🎂',kind:'anniversaire',activity:'Indifférent'};if(/jour férié|ferie|holiday|jeûne fédéral|jeune federal/.test(t))return {icon:'🇨🇭',kind:'jour férié',activity:'Indifférent'};if(/mariage|wedding/.test(t))return {icon:'💍',kind:'événement',activity:'Indifférent'};return {icon:'•',kind:'événement',activity:'Indifférent'}}
 function ensureDialog(){
  if(document.querySelector('#proposalDialog'))return;
  const d=document.createElement('dialog');d.id='proposalDialog';d.className='proposal-dialog';
  d.innerHTML=`<form method="dialog" class="proposal-sheet"><div class="proposal-head"><strong>UNE PROPOSITION</strong><button value="cancel" class="proposal-close" aria-label="Fermer">×</button></div><div id="proposalContext" class="proposal-context hidden"></div>
   <div class="proposal-pair"><label>Lieu<select id="proposalPlace"><option>Près de moi</option><option>10 km</option><option>20 km</option><option>50 km</option><option>Autre…</option></select></label><label>Région<select id="proposalRegion"><option>Indifférent</option><option>Glâne</option><option>Gruyère</option><option>Broye</option><option>Sarine</option><option>Veveyse</option><option>La Côte</option><option>Jura</option><option>Autre…</option></select></label></div>
   <div class="proposal-pair"><label>Temps<select id="proposalTime"><option value="30">30 min</option><option value="60">1 h</option><option value="90">1 h 30</option><option value="120">2 h</option><option value="180">3 h</option></select></label><label>Activité<select id="proposalActivity"><option>Indifférent</option><option>Découverte / balade / terrasse</option><option>Café / terrasse</option><option>Restaurant / terrasse</option><option>Restaurant / intérieur</option><option>Marché / producteurs</option><option>Musée / exposition / intérieur</option><option>Nature / balade</option><option>Surprends-moi</option><option>Autre…</option></select></label></div>
   <div id="proposalHint" class="proposal-hint"></div><button id="proposalSearch" type="button" class="proposal-search">Chercher une proposition</button></form>`;
  document.body.appendChild(d);
 }
 function openProposal(day,context=null){
  ensureDialog();const d=document.querySelector('#proposalDialog'),n=nextTimed(day),wx=weather(),mins=suggestedMinutes(day);
  d.dataset.day=day.toISOString();d.dataset.context=context?JSON.stringify(context):'';
  document.querySelector('#proposalPlace').value='Près de moi';document.querySelector('#proposalRegion').value='Indifférent';
  const t=document.querySelector('#proposalTime');t.value=[30,60,90,120,180].reduce((a,b)=>Math.abs(b-mins)<Math.abs(a-mins)?b:a,30);
  document.querySelector('#proposalActivity').value='Indifférent';
  const ctx=document.querySelector('#proposalContext');if(context){ctx.textContent=`${context.icon} ${context.title}`;ctx.classList.remove('hidden')}else{ctx.textContent='';ctx.classList.add('hidden')}
  const hints=[];if(n)hints.push(`Prochain rendez-vous à ${hm(n.start)}`);const km=enyaqKm();if(km)hints.push(`Enyaq ${km} km — retour pris en compte`);if(wx.label)hints.push(wx.label);
  document.querySelector('#proposalHint').textContent=hints.join(' · ');document.querySelector('#proposalSearch').onclick=()=>search(day,context);d.showModal();
 }
 function search(day,context){
  const place=document.querySelector('#proposalPlace').value,region=document.querySelector('#proposalRegion').value,mins=document.querySelector('#proposalTime').value,act=document.querySelector('#proposalActivity').value,wx=weather();
  const date=new Intl.DateTimeFormat('fr-CH',{weekday:'long',day:'numeric',month:'long'}).format(day);let geo='';
  if(window.MaVieAndroid&&typeof window.MaVieAndroid.getLocation==='function'){try{const p=JSON.parse(window.MaVieAndroid.getLocation()||'null');if(p&&Number.isFinite(+p.latitude)&&Number.isFinite(+p.longitude))geo=`${(+p.latitude).toFixed(5)},${(+p.longitude).toFixed(5)}`}catch{}}
  const radius=place==='Près de moi'?'':place;const where=[region==='Indifférent'?'':region,geo?`autour de ${geo}`:'près de moi',radius&&radius!=='Autre…'?`dans un rayon de ${radius}`:''].filter(Boolean).join(' ');
  let activity=act==='Indifférent'?'idée sortie activité':act==='Autre…'?'activité':act;
  if(context){if(context.kind==='anniversaire')activity=`${context.title} idée cadeau fleurs carte ${activity}`;else if(context.kind==='jour férié')activity=`${context.title} sortie repas spécial événement ${activity}`;else activity=`${context.title} activité liée thème lieu ${activity}`}
  const q=[activity,where,date,`${mins} minutes`,wx.label].filter(Boolean).join(' ');document.querySelector('#proposalDialog')?.close();openUrl('https://www.google.com/search?q='+encodeURIComponent(q));
 }
 function dayEvents(day){return events().filter(e=>e.allDay&&key(e.start)===key(day))}
 function eventHtml(e,day){const c=classify(e);return `<div class="mv-info"><span class="mv-info-icon">${c.icon}</span><div class="mv-info-text"><strong>${esc(e.title)}</strong>${e.place?`<small>${esc(e.place)}</small>`:''}</div><button class="mv-idea" type="button">Une idée&nbsp;?</button></div>`}
 function renderAgendaMessages(){
  const now=new Date(),tom=new Date(now);tom.setDate(tom.getDate()+1);
  [['#todayAppointments',now,true],['#tomorrowAppointments',tom,false]].forEach(([sel,day,isToday])=>{const box=document.querySelector(sel);if(!box)return;box.querySelectorAll('.appointment.all-day').forEach(x=>x.remove());box.querySelectorAll('.agenda-empty-message').forEach(x=>x.remove());const timed=box.querySelectorAll('.appointment:not(.all-day)').length;if(!timed){const m=document.createElement('div');m.className='appointment compact-row agenda-empty-message';m.innerHTML=`<time></time><div><strong>${isToday?'Plus de rendez-vous prévu aujourd’hui.':'Aucun rendez-vous prévu pour ce jour.'}</strong></div>`;box.appendChild(m);box.classList.remove('hidden')}})
 }
 function render(){
  const card=document.querySelector('.guide-card'),box=document.querySelector('#guideItems');if(!card||!box)return;const today=new Date(),tomorrow=new Date(today);tomorrow.setDate(tomorrow.getDate()+1);
  const groups=[{day:today,label:'AUJOURD’HUI',ev:dayEvents(today)},{day:tomorrow,label:'DEMAIN',ev:dayEvents(tomorrow)}];let html='';
  groups.forEach(g=>{if(g.ev.length)html+=`<div class="mv-day-info"><div class="mv-day-label">${g.label}</div>${g.ev.map(e=>eventHtml(e,g.day)).join('')}</div>`});
  html+=`<div class="mv-tourism"><button id="proposalToday" type="button">Aujourd’hui</button><span>Envie d’une proposition&nbsp;?</span><button id="proposalTomorrow" type="button">Demain</button></div>`;box.innerHTML=html;
  let idx=0;groups.forEach(g=>g.ev.forEach(e=>{const b=box.querySelectorAll('.mv-idea')[idx++];const c=classify(e);if(b)b.onclick=()=>openProposal(g.day,{title:e.title,place:e.place,icon:c.icon,kind:c.kind})}));
  box.querySelector('#proposalToday')?.addEventListener('click',()=>openProposal(today));box.querySelector('#proposalTomorrow')?.addEventListener('click',()=>openProposal(tomorrow));
  renderAgendaMessages();card.classList.remove('hidden');window.dispatchEvent(new Event('mavie-content-change'));
 }
 const st=document.createElement('style');st.textContent=`
 .mv-day-info{padding:3px 0}.mv-day-info+.mv-day-info{border-top:1px solid rgba(255,255,255,.52)}.mv-day-label{font-size:.66rem;font-weight:800;opacity:.82;margin:0 0 3px}
 .mv-info{display:grid;grid-template-columns:48px minmax(0,1fr) auto;column-gap:2px;align-items:start;padding:3px 0}.mv-info-icon{font-size:.74rem;line-height:1.22}.mv-info-text{min-width:0}.mv-info-text strong{display:block;font-size:.74rem;line-height:1.22}.mv-info-text small{display:block;font-size:.66rem;line-height:1.2;opacity:.8}.mv-idea{appearance:none;border:0;background:transparent;color:inherit;padding:0 0 0 10px;font:inherit;font-size:.68rem;font-weight:800;line-height:1.22;cursor:pointer;text-decoration:underline;text-underline-offset:2px;white-space:nowrap}
 .mv-tourism{border-top:1px solid rgba(255,255,255,.52);margin-top:3px;padding:6px 0 1px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:10px}.mv-tourism span{text-align:center;font-size:.74rem;font-weight:800}.mv-tourism button{appearance:none;border:1px solid rgba(7,60,74,.32);border-radius:999px;background:rgba(255,255,255,.22);color:inherit;padding:4px 10px;font:inherit;font-size:.70rem;font-weight:800;cursor:pointer}.mv-tourism button:active{transform:scale(.97)}
 .proposal-dialog{width:min(440px,calc(100vw - 24px));border:1px solid rgba(255,255,255,.72);border-radius:16px;padding:0;background:rgba(245,252,250,.96);color:#073c4a;box-shadow:0 12px 38px #062d3b55}.proposal-dialog::backdrop{background:#052c3855;backdrop-filter:blur(2px)}.proposal-sheet{padding:13px;display:grid;gap:10px}.proposal-head{display:flex;align-items:center;justify-content:space-between;font-size:.78rem}.proposal-close{border:0;background:transparent;font-size:1.35rem;line-height:1;cursor:pointer;color:inherit}.proposal-context{font-size:.72rem;font-weight:800;padding:5px 7px;border-radius:8px;background:rgba(11,119,133,.08)}.proposal-context.hidden{display:none}
 .proposal-sheet label{display:grid;gap:3px;font-size:.68rem;font-weight:800}.proposal-sheet select{width:100%;box-sizing:border-box;border:1px solid #0a657566;border-radius:9px;background:#fff;color:#073c4a;padding:7px 8px;font:inherit;font-size:.74rem}.proposal-pair{display:grid;grid-template-columns:1fr 1fr;gap:8px}.proposal-hint{font-size:.65rem;line-height:1.25;opacity:.78}.proposal-search{border:0;border-radius:999px;padding:8px 12px;font:inherit;font-size:.72rem;font-weight:800;cursor:pointer;background:#0b7785;color:white}
 .agenda-empty-message{margin:0!important;padding:4px 0 8px!important;display:grid!important;grid-template-columns:48px minmax(0,1fr)!important;column-gap:2px!important;align-items:start!important}.agenda-empty-message time{width:48px!important}.agenda-empty-message strong{font-size:.74rem!important;line-height:1.22!important;font-weight:700!important}
 body.mv-density-compact .mv-day-info,body.mv-density-tight .mv-day-info{padding:1px 0}body.mv-density-compact .mv-tourism,body.mv-density-tight .mv-tourism{padding-top:4px}
 @media(max-width:699px){.mv-tourism{gap:6px}.mv-tourism button{padding:4px 8px;font-size:.67rem}.mv-tourism span{font-size:.70rem}.mv-info-text strong{font-size:.70rem}.mv-day-label{font-size:.63rem}}
 `;document.head.appendChild(st);
 window.addEventListener('load',()=>setTimeout(render,350));setInterval(render,60000);setTimeout(()=>{const target=document.querySelector('#todayAppointments')?.parentElement?.parentElement||document.body;new MutationObserver(()=>setTimeout(renderAgendaMessages,0)).observe(target,{childList:true,subtree:true})},600);
})();
