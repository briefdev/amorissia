/* Home: product shelves (one category each, repeatable) and weather counts. */
(() => {
  const { L, $$, card, observe, display, gridVars } = AM.ui;

  // shelf source "key:value" → products (in Salla: the category picked in the block settings)
  const pick = {
    cat: (p, v) => p.cats.includes(v) || (v === 'collections' && p.badges.includes('gift')),
    gender: (p, v) => p.gender === v,
    family: (p, v) => p.family === v
  };
  const wide = matchMedia('(min-width: 900px)');
  const renderShelves = () => {
    const d = display();
    const count = (wide.matches ? d.desktop : d.mobile).count;
    $$('[data-shelf]').forEach(el => {
      const [key, val] = el.dataset.shelf.split(':');
      gridVars(el);
      // sample data is small: repeat the category's products until the shelf is full
      const list = AM.PRODUCTS.filter(p => pick[key]?.(p, val));
      const fill = list.length ? Array.from({ length: count }, (_, i) => list[i % list.length]) : [];
      el.innerHTML = fill.map(p => card(p)).join('');
      observe(el);
    });
  };
  wide.addEventListener('change', renderShelves);
  document.addEventListener('am:display', renderShelves);
  renderShelves();

  // weather counts
  $$('[data-wcount]').forEach(el => {
    const c = AM.PRODUCTS.filter(p => p.weather.includes(el.dataset.wcount)).length;
    el.textContent = L === 'ar' ? `${c} عطور ←` : `${c} scents →`;
  });
})();
