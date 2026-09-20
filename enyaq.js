// Ma Vie v0.2.3 — Enyaq / MyŠkoda Public API
(() => {
  const findTile = () => [...document.querySelectorAll('.metric')].find(b =>
    (b.querySelector('small')?.textContent || '').trim().toLowerCase() === 'enyaq'
  );

  function bridge() {
    return window.MaVieEnyaq || null;
  }

  function setTile(text, state) {
    const tile = findTile();
    if (!tile) return;
    const strong = tile.querySelector('strong');
    if (strong) strong.textContent = text;
    tile.dataset.enyaqState = state;
    tile.title = state === 'error'
      ? 'Données indisponibles — toucher pour ouvrir MyŠkoda'
      : state === 'setup'
      ? 'Toucher pour configurer Enyaq'
      : '';
  }

  function configure() {
    const b = bridge();
    if (!b || typeof b.saveConfig !== 'function') return;
    const vin = prompt('Enyaq — VIN :', '');
    if (vin === null) return;
    const key = prompt('Enyaq — clé API MyŠkoda :', '');
    if (key === null) return;
    if (!vin.trim() || !key.trim()) return;
    try {
      if (b.saveConfig(vin.trim(), key.trim())) load(true);
    } catch (_) {
      setTile('Données indisponibles', 'error');
    }
  }

  function load(afterSetup=false) {
    const b = bridge();
    if (!b || typeof b.getData !== 'function') {
      setTile('Données indisponibles', 'error');
      return;
    }
    try {
      const d = JSON.parse(b.getData() || '{}');
      if (d.setupRequired) {
        setTile('Configurer', 'setup');
        if (afterSetup) configure();
        return;
      }
      if (d.ok && Number.isFinite(+d.percent) && Number.isFinite(+d.km)) {
        setTile(`${Math.round(+d.percent)} % · ${Math.round(+d.km)} km`, 'ok');
      } else {
        // Règle Ma Vie : jamais afficher une ancienne valeur si la lecture échoue.
        setTile('Données indisponibles', 'error');
      }
    } catch (_) {
      setTile('Données indisponibles', 'error');
    }
  }

  function install() {
    const tile = findTile();
    if (!tile) return;
    tile.addEventListener('click', e => {
      const state = tile.dataset.enyaqState;
      if (state === 'setup') {
        e.preventDefault(); e.stopPropagation();
        configure();
      } else if (state === 'error') {
        e.preventDefault(); e.stopPropagation();
        try { bridge()?.openMySkoda?.(); } catch (_) {}
      }
      // state=ok : purement informatif, aucun clic.
    }, true);
    load(); // une seule lecture MyŠkoda à l'ouverture de Ma Vie
  }

  window.addEventListener('load', install, {once:true});
})();
