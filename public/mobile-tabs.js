/* Pixel Farm beta.1 mobile tabs — UI only; game state remains server-authoritative. */
(() => {
  'use strict';
  const nav = document.querySelector('.mobile-jump');
  const selector = document.getElementById('seedSelection');
  const farm = document.querySelector('.content > .farm-panel');
  const guide = document.querySelector('.content > .side-panel');
  const economy = document.querySelector('.economy');
  const store = document.getElementById('storeHeading')?.closest('.farm-panel');
  const inventory = document.getElementById('inventoryHeading')?.closest('.farm-panel');
  const ledger = document.querySelector('.farm-panel.ledger');
  if (!nav || !selector || !farm || !guide || !economy || !store || !inventory || !ledger) return;
  const panels = { farm: [selector, farm, guide], store: [economy, store], bag: [economy, inventory], history: [ledger] };
  const targets = new Map([
    ['#farmHeading', 'farm'], ['#storeHeading', 'store'],
    ['#inventoryHeading', 'bag'], ['#ledgerHeading', 'history']
  ]);
  const links = Array.from(nav.querySelectorAll('a[href]')).filter(a => targets.has(a.getAttribute('href')));
  if (links.length !== 4) return;
  const mobile = window.matchMedia('(max-width: 720px)');
  let active = 'farm';
  const all = [selector, farm, guide, economy, store, inventory, ledger];
  // Page anchors are intentionally preserved for no-JavaScript fallback.
  function apply() {
    const isMobile = mobile.matches;
    for (const el of all) el.hidden = false;
    if (isMobile) {
      const visible = new Set(panels[active]);
      for (const el of all) if (!visible.has(el)) el.hidden = true;
    }
    nav.setAttribute('aria-label', isMobile ? '手機主要遊戲分頁' : '快速前往遊戲區塊');
    for (const link of links) {
      const selected = isMobile && targets.get(link.getAttribute('href')) === active;
      link.classList.toggle('is-active', selected);
      if (selected) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
  }
  for (const link of links) {
    link.addEventListener('click', (event) => {
      if (!mobile.matches) return;
      event.preventDefault();
      active = targets.get(link.getAttribute('href'));
      apply();
      const top = active === 'farm' ? selector : active === 'store' ? store : active === 'bag' ? inventory : ledger;
      // A fixed navigation bar cannot cover the newly selected panel.
      top.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
  }
  if (typeof mobile.addEventListener === 'function') mobile.addEventListener('change', apply);
  else if (typeof mobile.addListener === 'function') mobile.addListener(apply);
  apply();
})();
