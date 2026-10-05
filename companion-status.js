(() => {
  'use strict';

  // Ma Vie ne compte rien : chaque compagnon fournit seulement un état oui/non.
  const buttons = [...document.querySelectorAll('.quickbar [data-companion]')];
  const byName = name => buttons.find(b => (b.dataset.companion || '').includes(name));

  function setAlert(button, active) {
    if (!button) return;
    const label = button.querySelector('span');
    if (!label) return;
    let mark = label.querySelector('.companion-alert');
    if (active && !mark) {
      mark = document.createElement('b');
      mark.className = 'companion-alert';
      mark.textContent = ' ❗';
      mark.setAttribute('aria-label', 'Attention requise');
      label.appendChild(mark);
    } else if (!active && mark) {
      mark.remove();
    }
  }

  function openDb(name) {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(name);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      req.onupgradeneeded = () => {
        // La base n'existe pas encore sur cet appareil : ne rien inventer.
        try { req.transaction.abort(); } catch (_) {}
        reject(new Error('Base absente'));
      };
    });
  }

  function readIdbValue(dbName, storeName, key) {
    return openDb(dbName).then(db => new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(storeName)) { db.close(); resolve(null); return; }
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).get(key);
      req.onsuccess = () => { const value = req.result ?? null; db.close(); resolve(value); };
      req.onerror = () => { db.close(); reject(req.error); };
    }));
  }

  async function herbierPending() {
    try {
      const raw = await readIdbValue('HerbierGourmandData', 'kv', 'hg-shopping-v271');
      if (!raw) return false;
      const shopping = JSON.parse(raw);
      return Array.isArray(shopping) && shopping.some(item => item && !Boolean(item.checked ?? item.coche));
    } catch (_) { return false; }
  }

  function isoDay(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  function hhmm(d = new Date()) {
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }
  function appliesTreatment(t, day) {
    if (!t || (t.start && day < t.start) || (t.end && day > t.end)) return false;
    const date = new Date(day + 'T12:00:00');
    const weekday = date.getDay();
    const monthDay = date.getDate();
    const mode = t.periodicity || 'daily';
    if (mode === 'weekly') return (t.weekdays || []).map(Number).includes(weekday);
    if (mode === 'monthly') return (t.monthDays || []).map(Number).includes(monthDay);
    if (mode === 'interval') {
      const every = Math.max(1, Number(t.intervalEvery || 1));
      const start = new Date((t.start || day) + 'T12:00:00');
      const diff = Math.floor((date - start) / 86400000);
      return diff >= 0 && diff % every === 0;
    }
    return true;
  }

  async function santePending() {
    try {
      const raw = await readIdbValue('ma-sante-storage', 'state', 'ma-sante-v02001');
      if (!raw) return false;
      const db = JSON.parse(raw);
      const day = isoDay(), now = hhmm();
      return (db.treatments || []).some(t => appliesTreatment(t, day) && (t.schedule || []).some(s => {
        if (!s || !/^\d{2}:\d{2}$/.test(s.time || '') || s.time > now) return false;
        return !(db.takes || {})[`${day}|${t.id}|${s.time}`];
      }));
    } catch (_) { return false; }
  }

  function djinnPending() {
    try {
      const raw = localStorage.getItem('djinn-v0100-state');
      if (!raw) return false;
      const state = JSON.parse(raw);
      const p = state.todayProgram;
      return !!(p && p.date === isoDay() && Array.isArray(p.entries) && p.entries.some(e => e && e.status === 'active'));
    } catch (_) { return false; }
  }

  async function refreshCompanions() {
    const [herbier, sante] = await Promise.all([herbierPending(), santePending()]);
    setAlert(byName('Herbier_gourmand'), herbier);
    setAlert(byName('ma_sante'), sante);
    setAlert(byName('Djinn'), djinnPending());
  }

  refreshCompanions();
  window.addEventListener('focus', refreshCompanions);
  window.addEventListener('storage', refreshCompanions);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshCompanions(); });
  setInterval(refreshCompanions, 30000);
})();
