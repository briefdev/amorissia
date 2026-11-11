/* «Your style» (home component): pick a style → its description and the 3 best-selling in-stock
   scents of its families, plus a link to shop the whole style. Styles live in AM.STYLES. */
(() => {
  const { L, tx, $, $$, esc, ph, money, minPrice, label, observe } = AM.ui;
  const chips = $('#style-chips'); if (!chips) return;
  const ar = L === 'ar';
  const brandOf = p => tx(AM.BRANDS.find(b => b.id === p.brand)) || '';
  const fits = (s, p) => p.inStock && s.families.includes(p.family)
    && (s.strength === 'soft' ? p.sillage <= 2 : s.strength === 'strong' ? p.sillage >= 3 : true);

  chips.innerHTML = AM.STYLES.map(s => `<button class="chip" type="button" data-style="${s.id}" aria-pressed="false">${esc(tx(s))}</button>`).join('');

  function show(id) {
    const s = AM.STYLES.find(x => x.id === id);
    $$('.chip', chips).forEach(c => c.setAttribute('aria-pressed', c.dataset.style === id));
    const list = AM.PRODUCTS.filter(p => fits(s, p)).sort((a, b) => b.sold - a.sold).slice(0, 3);
    $('#style-out').innerHTML = `
      <div class="fams__info">
        <p class="eyebrow">${ar ? 'استايلك' : 'Your style'}</p>
        <h3>${esc(tx(s))}</h3>
        <p class="lead">${esc(tx(s.desc))}</p>
        <p class="muted">${s.families.map(f => esc(tx(AM.FAMILIES.find(x => x.id === f)))).join(ar ? '، ' : ', ')}</p>
        <a class="btn btn--gold" href="shop.html?family=${s.families.join(',')}">${ar ? 'تسوّق هذا الاستايل' : 'Shop this style'}</a>
      </div>
      <div class="fams__list">${list.map(p => `
        <a class="fam-item" href="product.html?id=${p.id}">
          <span class="fam-item__img">${ph(p)}</span>
          <span class="fam-item__txt"><small>${esc(brandOf(p))}</small><b>${esc(tx(p.name))}</b>
            <span class="muted">${esc(label('conc', p.conc))}</span><span class="lat">${money(minPrice(p))}</span></span>
        </a>`).join('') || `<p class="muted">${ar ? 'لا توجد عطور متوفرة لهذا الاستايل حاليًا.' : 'No scents in stock for this style right now.'}</p>`}</div>`;
    observe($('#style-out'));
  }
  chips.addEventListener('click', e => { const b = e.target.closest('[data-style]'); if (b) show(b.dataset.style); });
  show(AM.STYLES[0].id);
})();
