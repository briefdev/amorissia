/* Compare: two scents side by side — each on its own side with its photo, the property names
   down the middle, and every value under its scent. */
(() => {
  const { L, tx, $, esc, money, byId, fam, label, sizesOf, minPrice, notesOf, ph, store, discount } = AM.ui;
  const ar = L === 'ar';
  const u = new URLSearchParams(location.search);
  const P = AM.PRODUCTS;
  let a = byId(u.get('a'))?.id || byId(store.get('am_last', ''))?.id || P[0].id;
  let b = byId(u.get('b'))?.id || P.find(p => p.id !== a && p.family !== byId(a).family).id;

  const sep = ar ? '، ' : ', ';
  const ml = ar ? 'مل' : 'ml';
  const brandOf = p => tx(AM.BRANDS.find(x => x.id === p.brand)) || '';
  const list = (k, arr) => arr.map(v => label(k, v)).join(sep);

  const side = (key, id) => {
    const p = byId(id);
    return `<div class="cmp2__item">
      <div class="combo" id="cmp-combo-${key}"></div>
      <a class="cmp2__img" href="product.html?id=${p.id}" aria-label="${esc(tx(p.name))}">${ph(p)}</a>
      <p class="cmp2__brand">${esc(brandOf(p))}</p>
      <h2 class="cmp2__name"><a href="product.html?id=${p.id}">${esc(tx(p.name))}</a></h2>
      <button class="btn btn--gold" type="button" data-add="${p.id}" ${p.inStock ? '' : 'disabled'}>${p.inStock ? (ar ? 'أضف إلى السلة' : 'Add to bag') : (ar ? 'غير متوفر' : 'Unavailable')}</button>
    </div>`;
  };

  function render() {
    const pa = byId(a), pb = byId(b);
    // [label, value A, value B, which side is better: 'a' | 'b' | '']
    const better = (x, y, higher) => x === y ? '' : (higher ? x > y : x < y) ? 'a' : 'b';
    const price = p => `${money(minPrice(p))}${discount(p) ? ` <span class="off">${AM.ui.STR.off(discount(p))}</span>` : ''}`;
    const notes = (p, k) => notesOf(p)[k].join(sep) || '—';
    const rows = [
      [ar ? 'السعر' : 'Price', price(pa), price(pb), better(minPrice(pa), minPrice(pb), false)],
      [ar ? 'الأحجام' : 'Sizes', `<span dir="ltr">${sizesOf(pa).join(' / ')}</span> ${ml}`, `<span dir="ltr">${sizesOf(pb).join(' / ')}</span> ${ml}`],
      [ar ? 'التركيز' : 'Concentration', label('conc', pa.conc), label('conc', pb.conc)],
      [ar ? 'العائلة' : 'Family', tx(fam(pa.family)), tx(fam(pb.family))],
      [ar ? 'الجنس' : 'Gender', label('gender', pa.gender), label('gender', pb.gender)],
      [ar ? 'الثبات' : 'Longevity', label('level', pa.longevity), label('level', pb.longevity), better(pa.longevity, pb.longevity, true)],
      [ar ? 'الفوحان' : 'Sillage', label('level', pa.sillage), label('level', pb.sillage), better(pa.sillage, pb.sillage, true)],
      [ar ? 'الافتتاحية' : 'Top notes', notes(pa, 'top'), notes(pb, 'top')],
      [ar ? 'القلب' : 'Heart notes', notes(pa, 'heart'), notes(pb, 'heart')],
      [ar ? 'القاعدة' : 'Base notes', notes(pa, 'base'), notes(pb, 'base')],
      [ar ? 'الموسم' : 'Season', list('season', pa.season), list('season', pb.season)],
      [ar ? 'الوقت' : 'Time', list('time', pa.time), list('time', pb.time)],
      [ar ? 'المناسبة' : 'Occasion', list('occasion', pa.occasion), list('occasion', pb.occasion)],
      [ar ? 'التوفر' : 'Availability', pa.inStock ? (ar ? 'متوفر' : 'In stock') : (ar ? 'غير متوفر' : 'Out of stock'), pb.inStock ? (ar ? 'متوفر' : 'In stock') : (ar ? 'غير متوفر' : 'Out of stock')]
    ];
    $('#cmp2').innerHTML = `
      <div class="cmp2__head">${side('a', a)}<span class="cmp2__vs">${ar ? 'مقابل' : 'vs'}</span>${side('b', b)}</div>
      <dl class="cmp2__rows">${rows.map(([k, x, y, win = '']) => `
        <div class="cmp2__row">
          <dd class="cmp2__v cmp2__v--a${win === 'a' ? ' win' : ''}">${x}</dd>
          <dt class="cmp2__k">${k}</dt>
          <dd class="cmp2__v cmp2__v--b${win === 'b' ? ' win' : ''}">${y}</dd>
        </div>`).join('')}</dl>`;
    ['a', 'b'].forEach(key => {
      const cur = key === 'a' ? a : b;
      AM.ui.combo($(`#cmp-combo-${key}`), {
        label: ar ? (key === 'a' ? 'العطر الأول' : 'العطر الثاني') : (key === 'a' ? 'First scent' : 'Second scent'),
        placeholder: tx(byId(cur).name),
        groups: () => [{ label: '', items: P.map(x => ({ value: x.id, text: tx(x.name), sub: `${brandOf(x)} · ${tx(fam(x.family))}`,
          search: `${tx(x.name)} ${brandOf(x)} ${tx(fam(x.family))}`, hue: fam(x.family).hue, img: x.img, selected: x.id === cur })) }],
        onPick: v => { key === 'a' ? (a = v) : (b = v); render(); }
      });
    });
    history.replaceState(null, '', `?a=${a}&b=${b}`);
  }
  render();
})();
