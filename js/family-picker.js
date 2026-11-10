/* Family picker (home component): 9 families on a light → deep scale; the chosen one shows
   up to 3 scents with their photos and a link to the family's category. */
(() => {
  const { L, tx, $, $$, esc, ph, money, minPrice, label } = AM.ui;
  const scale = $('#fam-scale'); if (!scale) return;
  const ar = L === 'ar';
  const F = AM.FAMILIES;
  const inFam = id => AM.PRODUCTS.filter(p => p.family === id);
  const plural = n => ar ? ({ 0: 'قريبًا', 1: 'عطر واحد', 2: 'عطران' }[n] || (n <= 10 ? `${n} عطور` : `${n} عطرًا`)) : (n ? `${n} scent${n > 1 ? 's' : ''}` : 'Soon');

  scale.innerHTML = F.map((f, i) => {
    const n = inFam(f.id).length;
    return `<button class="fam-tab" type="button" role="tab" data-f="${f.id}" aria-selected="false" style="--fam:${f.hue};--w:${Math.round((i + 1) / F.length * 100)}%" ${n ? '' : 'disabled'}>
      <span class="fam-tab__swatch" aria-hidden="true"></span>
      <b>${esc(tx(f).replace(/ \(.*\)/, ''))}</b><small>${plural(n)}</small></button>`;
  }).join('');

  function show(id) {
    const f = F.find(x => x.id === id), i = F.indexOf(f);
    $$('.fam-tab', scale).forEach(b => b.setAttribute('aria-selected', b.dataset.f === id));
    // the 3 most sold scents of the family that are in stock first
    const list = inFam(id).sort((a, b) => (b.inStock - a.inStock) || (b.sold - a.sold)).slice(0, 3);
    const brand = p => tx(AM.BRANDS.find(b => b.id === p.brand)) || '';
    $('#fam-panel').innerHTML = `
      <div class="fams__info">
        <p class="eyebrow">${ar ? `الدرجة ${i + 1} من ${F.length} · من الأخف إلى الأثقل` : `Level ${i + 1} of ${F.length} · lightest to deepest`}</p>
        <h3>${esc(tx(f))}</h3>
        <p class="lead">${esc(tx(f.notes))}</p>
        <p class="muted">${esc(tx(f.use))} · ${plural(inFam(id).length)}</p>
        <a class="btn btn--gold" href="shop.html?family=${id}">${ar ? 'تسوّق هذه العائلة' : 'Shop this family'}</a>
      </div>
      <div class="fams__list">${list.map(p => `
        <a class="fam-item" href="product.html?id=${p.id}">
          <span class="fam-item__img">${ph(p)}</span>
          <span class="fam-item__txt"><small>${esc(brand(p))}</small><b>${esc(tx(p.name))}</b>
            <span class="muted">${esc(label('conc', p.conc))}</span><span class="lat">${money(minPrice(p))}</span></span>
        </a>`).join('')}</div>`;
  }
  scale.addEventListener('click', e => { const b = e.target.closest('.fam-tab'); if (b && !b.disabled) show(b.dataset.f); });
  // arrow keys move along the scale
  scale.addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const tabs = $$('.fam-tab:not([disabled])', scale), cur = tabs.indexOf(document.activeElement);
    const fwd = (e.key === 'ArrowLeft') === (document.documentElement.dir === 'rtl');
    const next = tabs[(cur + (fwd ? 1 : -1) + tabs.length) % tabs.length];
    next.focus(); show(next.dataset.f); e.preventDefault();
  });
  // start on the family with the most scents
  show([...F].sort((a, b) => inFam(b.id).length - inFam(a.id).length)[0].id);
})();
