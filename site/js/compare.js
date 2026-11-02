/* Compare: two scents side by side. */
(() => {
  const { L, tx, $, esc, money, byId, fam, label, sizesOf, minPrice, notesOf, ph, store } = AM.ui;
  const ar = L === 'ar';
  const u = new URLSearchParams(location.search);
  const P = AM.PRODUCTS;
  let a = byId(u.get('a'))?.id || byId(store.get('am_last', ''))?.id || P[0].id;
  let b = byId(u.get('b'))?.id || P.find(p => p.id !== a && p.family !== byId(a).family).id;

  const lv = v => label('level', v);
  const sep = ar ? '، ' : ', ';
  const select = (side, val) => `<label><span class="sr-only">${ar ? (side === 'a' ? 'العطر الأول' : 'العطر الثاني') : (side === 'a' ? 'First scent' : 'Second scent')}</span>
    <select class="select" style="width:100%" data-side="${side}">${P.map(p => `<option value="${p.id}"${p.id === val ? ' selected' : ''}>${esc(tx(p.name))}</option>`).join('')}</select></label>`;
  const col = (side, id) => {
    const p = byId(id);
    return `<div class="vs__col">${select(side, id)}<div class="pcard__media">${ph(p)}</div>
      <h2 style="font-size:1.8rem"><a href="product.html?id=${p.id}">${esc(tx(p.name))}</a></h2>
      <button class="btn btn--gold" type="button" data-add="${p.id}" ${p.inStock ? '' : 'disabled'}>${p.inStock ? (ar ? 'أضف إلى السلة' : 'Add to bag') : (ar ? 'غير متوفر' : 'Unavailable')}</button></div>`;
  };

  function render() {
    $('#vs').innerHTML = `${col('a', a)}<span class="vs__word">${ar ? 'مقابل' : 'vs'}</span>${col('b', b)}`;
    const pa = byId(a), pb = byId(b);
    const win = (x, y, hi) => x === y ? ['', ''] : (hi ? x > y : x < y) ? ['win', ''] : ['', 'win'];
    const notes = p => { const n = notesOf(p); return `${n.top.join(sep)}<br>${n.heart.join(sep)}<br>${n.base.join(sep)}`; };
    const rows = [
      [ar ? 'السعر يبدأ من' : 'Price from', money(minPrice(pa)), money(minPrice(pb)), win(minPrice(pa), minPrice(pb), false)],
      [ar ? 'الأحجام' : 'Sizes', `<span dir="ltr">${sizesOf(pa).join(' / ')}</span>` + (ar ? ' مل' : ' ml'), `<span dir="ltr">${sizesOf(pb).join(' / ')}</span>` + (ar ? ' مل' : ' ml')],
      [ar ? 'التركيز' : 'Concentration', label('conc', pa.conc), label('conc', pb.conc)],
      [ar ? 'العائلة' : 'Family', tx(fam(pa.family)), tx(fam(pb.family))],
      [ar ? 'الجنس' : 'Gender', label('gender', pa.gender), label('gender', pb.gender)],
      [ar ? 'النوتات (افتتاحية / قلب / قاعدة)' : 'Notes (top / heart / base)', notes(pa), notes(pb)],
      [ar ? 'الثبات' : 'Longevity', lv(pa.longevity), lv(pb.longevity), win(pa.longevity, pb.longevity, true)],
      [ar ? 'الفوحان' : 'Sillage', lv(pa.sillage), lv(pb.sillage), win(pa.sillage, pb.sillage, true)],
      [ar ? 'الموسم' : 'Season', pa.season.map(s => label('season', s)).join(sep), pb.season.map(s => label('season', s)).join(sep)],
      [ar ? 'الوقت' : 'Time', pa.time.map(s => label('time', s)).join(sep), pb.time.map(s => label('time', s)).join(sep)],
      [ar ? 'المناسبة' : 'Occasion', pa.occasion.map(s => label('occasion', s)).join(sep), pb.occasion.map(s => label('occasion', s)).join(sep)]
    ];
    $('#cmp').innerHTML = `<caption class="sr-only">${ar ? 'مقارنة' : 'Comparison'}</caption>
      <thead><tr><td></td><th scope="col" style="color:var(--text)">${esc(tx(pa.name))}</th><th scope="col" style="color:var(--text)">${esc(tx(pb.name))}</th></tr></thead>
      <tbody>${rows.map(([k, x, y, w = ['', '']]) => `<tr><th scope="row">${k}</th><td class="${w[0]}">${x}</td><td class="${w[1]}">${y}</td></tr>`).join('')}</tbody>`;
    history.replaceState(null, '', `?a=${a}&b=${b}`);
  }
  $('#vs').addEventListener('change', e => { const s = e.target.closest('select'); if (!s) return; s.dataset.side === 'a' ? (a = s.value) : (b = s.value); render(); });
  render();
})();
