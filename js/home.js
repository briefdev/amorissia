/* Home: featured scent in the hero, product shelves (one category each, repeatable) and weather counts. */
(() => {
  const { L, $, $$, card, observe, display, gridVars, byId, tx, esc, money, minPrice, discount, label, STR } = AM.ui;

  // hero: the featured scent (an offer or a signature) — set in AM.DISPLAY.hero
  const hp = byId(AM.DISPLAY.hero) || AM.PRODUCTS.find(p => p.inStock && p.img);
  if (hp && $('#hero-product')) {
    const link = $('#hero-product'), img = $('.hero__img', link);
    link.href = `product.html?id=${hp.id}`;
    link.setAttribute('aria-label', tx(hp.name));
    if (hp.img) { img.src = (document.documentElement.dataset.root || '') + hp.img; img.alt = tx(hp.name); }
    const off = discount(hp), sz = Object.keys(hp.sizes).map(Number).sort((a, b) => a - b);
    $('#hero-tag').innerHTML = `
      <span class="hero__tag-brand">${esc(tx(AM.BRANDS.find(b => b.id === hp.brand)) || '')}</span>
      <a class="hero__tag-name" href="product.html?id=${hp.id}">${esc(tx(hp.name))}</a>
      <span class="hero__tag-meta">${esc(label('conc', hp.conc))}</span>
      <span class="hero__tag-price">${off ? `<span class="off">${STR.off(off)}</span>` : ''}<b>${money(minPrice(hp))}</b>${off ? `<s>${money(hp.was[sz[0]] || Object.values(hp.was)[0])}</s>` : ''}</span>`;
  }

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

  // shelf slider: N cards per view (the column setting), arrows move one card, stops at the ends
  const rtl = document.documentElement.dir === 'rtl';
  $$('[data-shelf]').forEach(track => {
    const sec = track.closest('section');
    const prev = sec.querySelector('[data-shelf-prev]'), next = sec.querySelector('[data-shelf-next]');
    const step = () => { const c = track.firstElementChild; return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 0) : track.clientWidth; };
    const sync = () => {
      const pos = Math.abs(track.scrollLeft), max = track.scrollWidth - track.clientWidth;
      prev.disabled = pos <= 2;
      next.disabled = pos >= max - 2;
      sec.querySelector('.shelf-nav').hidden = max <= 2; // everything fits: no arrows
    };
    const go = dir => track.scrollBy({ left: dir * (rtl ? -1 : 1) * step(), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));
    track.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
    addEventListener('resize', sync);
    document.addEventListener('am:display', () => { track.scrollLeft = 0; requestAnimationFrame(sync); });
    sync();
  });

  // weather counts
  $$('[data-wcount]').forEach(el => {
    const c = AM.PRODUCTS.filter(p => p.weather.includes(el.dataset.wcount)).length;
    el.textContent = L === 'ar' ? `${c} عطور ←` : `${c} scents →`;
  });
})();
