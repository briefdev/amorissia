/* Home: product rail tabs and weather counts. (Explorer, wheel and annual set are their own components.) */
(() => {
  const { L, $, $$, card, observe } = AM.ui;

  // 01 — rail
  const rail = $('#rail');
  const showTab = tab => {
    rail.innerHTML = AM.PRODUCTS.filter(p => p.cats.includes(tab)).map(card).join('');
    observe(rail);
  };
  $$('#rail-tabs .chip').forEach(b => b.addEventListener('click', () => {
    $$('#rail-tabs .chip').forEach(x => x.setAttribute('aria-pressed', x === b));
    showTab(b.dataset.tab);
  }));
  showTab('new');

  // 04 — weather counts
  $$('[data-wcount]').forEach(el => {
    const c = AM.PRODUCTS.filter(p => p.weather.includes(el.dataset.wcount)).length;
    el.textContent = L === 'ar' ? `${c} عطور ←` : `${c} scents →`;
  });
})();
