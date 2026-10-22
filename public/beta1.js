/* beta.1: presentation-only guide behavior; Express/SQLite remain authoritative. */
(() => {
  'use strict';
  const guide = document.getElementById('farmGuide');
  if (!guide) return;
  const narrow = window.matchMedia('(max-width: 720px)');
  let userChanged = false;
  const applyDefault = () => { if (!userChanged) guide.open = !narrow.matches; };
  applyDefault();
  guide.addEventListener('toggle', (event) => {
    if (event.isTrusted) userChanged = true;
  });
  if (typeof narrow.addEventListener === 'function') narrow.addEventListener('change', applyDefault);
  else if (typeof narrow.addListener === 'function') narrow.addListener(applyDefault);
})();
