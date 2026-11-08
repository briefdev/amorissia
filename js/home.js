/* Home: product shelf (grid that follows the display settings) and weather counts. */
(() => {
  const { L, $, $$, card, observe, display, gridVars } = AM.ui;

  // 01 — shelf: columns and product count per device come from the display settings
  const shelf = $('#shelf');
  const wide = matchMedia('(min-width: 900px)');
  let tab = 'new';
  const showTab = () => {
    const d = display();
    const count = (wide.matches ? d.desktop : d.mobile).count;
    gridVars(shelf);
    shelf.innerHTML = AM.PRODUCTS.filter(p => p.cats.includes(tab)).slice(0, count).map(p => card(p)).join('');
    observe(shelf);
  };
  $$('#rail-tabs .chip').forEach(b => b.addEventListener('click', () => {
    $$('#rail-tabs .chip').forEach(x => x.setAttribute('aria-pressed', x === b));
    tab = b.dataset.tab; showTab();
  }));
  wide.addEventListener('change', showTab);
  document.addEventListener('am:display', showTab);
  showTab();

  // 04 — weather counts
  $$('[data-wcount]').forEach(el => {
    const c = AM.PRODUCTS.filter(p => p.weather.includes(el.dataset.wcount)).length;
    el.textContent = L === 'ar' ? `${c} عطور ←` : `${c} scents →`;
  });
})();
