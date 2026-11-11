/* Shop: filters (multi-select within a group, AND across groups), search, sort, URL sync. */
(() => {
  const { L, tx, $, $$, esc, card, observe, label, sizesOf, minPrice, discount, notesOf, isFav, icon } = AM.ui;
  const ar = L === 'ar';
  const P = AM.PRODUCTS;
  const LB = AM.LABELS;

  const catsOf = p => [...p.cats, ...(p.badges.includes('gift') ? ['collections'] : [])];
  const allNotes = p => { const n = notesOf(p); return [...n.top, ...n.heart, ...n.base]; };
  const famIndex = p => AM.FAMILIES.findIndex(f => f.id === p.family);
  const uniq = a => [...new Set(a)];

  /* ---------- filter model ---------- */
  const KEYS = ['cat', 'offer', 'badge', 'brand', 'gender', 'conc', 'family', 'note', 'season', 'weather', 'time', 'occasion', 'place', 'use', 'stock', 'size'];
  const state = Object.fromEntries(KEYS.map(k => [k, new Set()]));
  state.min = ''; state.max = ''; state.q = ''; state.fav = false; state.sort = 'featured';

  const has = (arr, set) => !set.size || arr.some(v => set.has(String(v)));
  const tests = {
    cat: p => catsOf(p), offer: p => p.offers, badge: p => p.badges, brand: p => [p.brand], gender: p => [p.gender],
    conc: p => [p.conc], family: p => [p.family, ...p.facets], note: allNotes,
    season: p => p.season.includes('all') ? Object.keys(LB.season) : p.season,
    weather: p => p.weather, time: p => p.time.length > 1 ? ['morning', 'evening', 'all'] : p.time,
    occasion: p => p.occasion, place: p => p.place,
    use: p => [p.occasion.includes('daily') && 'daily', p.time.includes('evening') && 'evening', p.occasion.includes('events') && 'events'].filter(Boolean), stock: p => [p.inStock ? 'in' : 'out'], size: p => sizesOf(p)
  };
  function match(p, skip) {
    for (const k of KEYS) if (k !== skip && !has(tests[k](p), state[k])) return false;
    if (state.fav && !isFav(p.id)) return false;
    const prices = Object.values(p.sizes);
    if (state.min !== '' && !prices.some(v => v >= +state.min)) return false;
    if (state.max !== '' && !prices.some(v => v <= +state.max)) return false;
    if (state.q) {
      const hay = [p.name.ar, p.name.en, ...p.notes.top, ...p.notes.heart, ...p.notes.base, ...p.notesEn.top, ...p.notesEn.heart, ...p.notesEn.base, tx(AM.ui.fam(p.family))].join(' ').toLowerCase();
      if (!hay.includes(state.q.toLowerCase())) return false;
    }
    return true;
  }

  /* ---------- filter UI ---------- */
  const T = {
    filters: ar ? 'الفلاتر' : 'Filters', clear: ar ? 'مسح الكل' : 'Clear all', close: ar ? 'إغلاق' : 'Close',
    g: ar
      ? ['الأقسام', 'الماركات', 'التركيز', 'الجنس', 'العائلة العطرية', 'النوتات', 'الاستخدام', 'الوفرة', 'الحجم', 'السعر']
      : ['Sections', 'Brands', 'Concentration', 'Gender', 'Fragrance family', 'Notes', 'Use', 'Availability', 'Size', 'Price'],
    offers: ar ? 'العروض' : 'Offers', tags: ar ? 'الوسوم' : 'Tags',
    top: ar ? 'الافتتاحية' : 'Top', heart: ar ? 'القلب' : 'Heart', base: ar ? 'القاعدة' : 'Base',
    season: ar ? 'الموسم' : 'Season', useT: ar ? 'الوقت والمناسبة' : 'Time & occasion', weather: ar ? 'الطقس' : 'Weather', time: ar ? 'وقت الاستخدام' : 'Time of day',
    occasion: ar ? 'المناسبة أو النشاط' : 'Occasion', place: ar ? 'مكان الاستخدام' : 'Setting',
    inStock: ar ? 'متوفر' : 'In stock', outStock: ar ? 'غير متوفر' : 'Out of stock',
    brandSearch: ar ? 'ابحث عن ماركة' : 'Search brands', brandNote: ar ? 'تظهر الماركات المرتبطة بمنتجات المتجر فقط.' : 'Only brands carried by the store are shown.',
    sizeNote: ar ? 'تظهر الأحجام المتاحة فعليًا فقط.' : 'Only sizes actually available are shown.',
    from: ar ? 'من' : 'From', to: ar ? 'إلى' : 'To', aed: ar ? 'درهم' : 'AED', ml: ar ? 'مل' : 'ml',
    fav: ar ? 'المفضلة' : 'Favourites', all: tx(LB.cat.all),
    none: ar ? 'لا توجد عطور مطابقة لهذه الفلاتر.' : 'No fragrances match these filters.',
    count: n => ar ? ({ 0: 'لا عطور', 1: 'عطر واحد', 2: 'عطران' }[n] || (n <= 10 ? `${n} عطور` : `${n} عطرًا`)) : `${n} fragrance${n === 1 ? '' : 's'}`
  };

  // only offer values that exist in the data
  const present = k => uniq(P.flatMap(tests[k]).map(String));
  const chip = (k, v, text, extra = '') => `<button class="chip" type="button" data-k="${k}" data-v="${esc(v)}" aria-pressed="false"${extra}>${text}</button>`;
  const chipsFor = (k, values, lab) => `<div class="chips">${values.map(v => chip(k, v, esc(lab(v)))).join('')}</div>`;
  const group = (i, title, body, open) => `<details class="fgroup"${open ? ' open' : ''}><summary><span class="n">${String(i + 1).padStart(2, '0')}</span>${title}</summary><div class="fgroup__body">${body}</div></details>`;

  function buildFilters() {
    const noteGroups = ['top', 'heart', 'base'].map(layer => {
      const notes = uniq(P.flatMap(p => notesOf(p)[layer]));
      return `<p class="fgroup__sub">${T[layer]}</p>${chipsFor('note', notes, v => v)}`;
    }).join('');
    // use: seasons (all / summer / winter / spring) + daily / evening / occasions
    const seasons = ['all', 'summer', 'winter', 'spring'].filter(v => present('season').includes(v));
    const usage = `<p class="fgroup__sub">${T.season}</p>${chipsFor('season', seasons, v => label('season', v))}
      <p class="fgroup__sub">${T.useT}</p>${chipsFor('use', ['daily', 'evening', 'events'].filter(v => present('use').includes(v)), v => label('use', v))}`;
    const famVals = [...AM.FAMILIES, ...AM.FACETS].filter(f => present('family').includes(f.id));
    const concPresent = present('conc');
    const sizes = [30, 50, 100].filter(v => present('size').includes(String(v)));
    const prices = P.flatMap(p => Object.values(p.sizes));

    $('#filters').innerHTML = `
      <div class="filters__head"><h2>${T.filters}</h2>
        <span><button class="remove" type="button" id="clear-all">${T.clear}</button>
        <button class="icon-btn close-filters" type="button" id="close-filters" aria-label="${T.close}">${icon('close')}</button></span></div>
      ${group(0, T.g[0], chipsFor('cat', Object.keys(LB.cat).filter(c => c !== 'all' && present('cat').includes(c)), v => label('cat', v)), true)}
      ${group(1, T.g[1], `<input class="brand-search" id="brand-q" type="search" placeholder="${T.brandSearch}" aria-label="${T.brandSearch}">
        <div class="chips" id="brand-chips">${AM.BRANDS.filter(b => present('brand').includes(b.id)).map(b => chip('brand', b.id, esc(tx(b)), ` data-name="${esc(b.ar + ' ' + b.en)}"`)).join('')}</div>
        <p class="filter-note">${T.brandNote}</p>`)}
      ${group(2, T.g[2], `<div class="conc-list">${Object.keys(LB.conc).filter(c => concPresent.includes(c)).map(c =>
        `<label><input type="checkbox" data-k="conc" data-v="${c}"><span>${esc(label('conc', c))}</span><span>${LB.conc[c].abbr}</span></label>`).join('')}</div>`)}
      ${group(3, T.g[3], chipsFor('gender', ['men', 'women', 'unisex'].filter(v => present('gender').includes(v)), v => label('gender', v)))}
      ${group(4, T.g[4], `<div class="chips">${famVals.map(f => chip('family', f.id, `${f.hue ? `<span class="dot" style="--fam:${f.hue}"></span>` : ''}${esc(tx(f))}`)).join('')}</div>`)}
      ${group(5, T.g[5], noteGroups)}
      ${group(6, T.g[6], usage)}
      ${group(7, T.g[7], `<div class="chips">${chip('stock', 'in', T.inStock)}${chip('stock', 'out', T.outStock)}</div>`)}
      ${group(8, T.g[8], chipsFor('size', sizes, v => `${v} ${T.ml}`))}
      ${group(9, T.g[9], `<div class="price-fields">
          <label class="sr-only" for="pmin">${T.from}</label><span>${T.from}</span><input id="pmin" type="number" inputmode="numeric" min="0" placeholder="${Math.min(...prices)}">
          <label class="sr-only" for="pmax">${T.to}</label><span>${T.to}</span><input id="pmax" type="number" inputmode="numeric" min="0" placeholder="${Math.max(...prices)}"><span>${T.aed}</span></div>`)}`;

    $('#cat-tabs').innerHTML = [`<button class="chip" type="button" data-tab="" aria-pressed="false">${esc(T.all)}</button>`,
      ...Object.keys(LB.cat).filter(c => c !== 'all').map(c => `<button class="chip" type="button" data-tab="${c}" aria-pressed="false">${esc(label('cat', c))}</button>`),
      `<button class="chip" type="button" data-tab="fav" aria-pressed="false">${AM.ui.icon('heart')} ${T.fav}</button>`].join('');
  }

  /* ---------- render ---------- */
  const sorters = {
    featured: () => 0,
    light: (a, b) => famIndex(a) - famIndex(b),
    heavy: (a, b) => famIndex(b) - famIndex(a),
    'price-asc': (a, b) => minPrice(a) - minPrice(b),
    'price-desc': (a, b) => minPrice(b) - minPrice(a),
    // discounted products first, ordered by their sale price; the rest keep their order after them
    'sale-asc': (a, b) => (!discount(a) - !discount(b)) || (discount(a) && minPrice(a) - minPrice(b)),
    'sale-desc': (a, b) => (!discount(a) - !discount(b)) || (discount(a) && minPrice(b) - minPrice(a))
  };
  function render() {
    const list = P.filter(p => match(p)).sort(sorters[state.sort]);
    AM.ui.gridVars($('#grid'));
    $('#grid').innerHTML = list.length ? list.map(p => card(p)).join('')
      : `<div class="empty" style="grid-column:1/-1">${AM.ui.drop('drop drop--line')}<p>${T.none}</p><button class="btn btn--line" type="button" data-clear>${T.clear}</button></div>`;
    $('#count').textContent = T.count(list.length);
    observe($('#grid'));

    // reflect state on controls
    $$('[data-k]').forEach(el => {
      const on = state[el.dataset.k].has(el.dataset.v);
      el.type === 'checkbox' ? (el.checked = on) : el.setAttribute('aria-pressed', on);
    });
    const onlyCat = state.cat.size === 1 ? [...state.cat][0] : '';
    $$('#cat-tabs .chip').forEach(b => b.setAttribute('aria-pressed', b.dataset.tab === 'fav' ? state.fav : (!state.fav && b.dataset.tab === onlyCat && (onlyCat || !state.cat.size))));
    const onlyFam = state.family.size === 1 && !state.cat.size ? [...state.family][0] : '';
    const title = state.fav ? T.fav : onlyCat ? label('cat', onlyCat) : onlyFam ? tx(AM.ui.fam(onlyFam)) : T.all;
    $('#shop-title').textContent = title; $('#crumb-cur').textContent = title;

    // active filter pills
    const pills = [];
    KEYS.forEach(k => state[k].forEach(v => pills.push(`<button class="chip is-on" type="button" data-rmk="${k}" data-v="${esc(v)}">${esc(valueLabel(k, v))} ×</button>`)));
    if (state.min !== '' || state.max !== '') pills.push(`<button class="chip is-on" type="button" data-rmk="price">${state.min || 0}–${state.max || '∞'} ${T.aed} ×</button>`);
    if (state.q) pills.push(`<button class="chip is-on" type="button" data-rmk="q">“${esc(state.q)}” ×</button>`);
    if (pills.length > 1) pills.push(`<button class="remove" type="button" data-clear>${T.clear}</button>`);
    $('#active').innerHTML = pills.join('');
    syncURL();
  }
  function valueLabel(k, v) {
    const map = { use: 'use', cat: 'cat', offer: 'offers', badge: 'badges', gender: 'gender', conc: 'conc', season: 'season', weather: 'weather', time: 'time', occasion: 'occasion', place: 'place' };
    if (map[k]) return label(map[k], v);
    if (k === 'brand') return tx(AM.BRANDS.find(b => b.id === v));
    if (k === 'family') return tx(AM.ui.fam(v));
    if (k === 'stock') return v === 'in' ? T.inStock : T.outStock;
    if (k === 'size') return `${v} ${T.ml}`;
    return v;
  }

  /* ---------- URL ---------- */
  function syncURL() {
    const u = new URLSearchParams();
    KEYS.forEach(k => state[k].size && u.set(k, [...state[k]].join(',')));
    if (state.min !== '') u.set('min', state.min);
    if (state.max !== '') u.set('max', state.max);
    if (state.q) u.set('q', state.q);
    if (state.fav) u.set('fav', '1');
    if (state.sort !== 'featured') u.set('sort', state.sort);
    history.replaceState(null, '', u.toString() ? `?${u}` : location.pathname);
  }
  function readURL() {
    const u = new URLSearchParams(location.search);
    KEYS.forEach(k => (u.get(k) || '').split(',').filter(Boolean).forEach(v => state[k].add(v)));
    state.min = u.get('min') || ''; state.max = u.get('max') || ''; state.q = u.get('q') || '';
    state.fav = u.get('fav') === '1'; state.sort = u.get('sort') || 'featured';
    $('#q').value = state.q; $('#sort').value = state.sort;
    if (u.get('focus') === 'search') setTimeout(() => $('#q').focus(), 100);
  }
  function clearAll() { KEYS.forEach(k => state[k].clear()); state.min = state.max = state.q = ''; state.fav = false; $('#q').value = ''; $('#pmin').value = ''; $('#pmax').value = ''; render(); }

  /* ---------- events ---------- */
  buildFilters(); readURL();
  $('#pmin').value = state.min; $('#pmax').value = state.max;

  document.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.k && b.type !== 'checkbox') { const s = state[b.dataset.k]; s.has(b.dataset.v) ? s.delete(b.dataset.v) : s.add(b.dataset.v); render(); }
    else if (b.dataset.tab !== undefined) {
      state.cat.clear();
      if (b.dataset.tab === 'fav') state.fav = !state.fav; else { state.fav = false; if (b.dataset.tab) state.cat.add(b.dataset.tab); }
      render();
    }
    else if (b.dataset.rmk) {
      const k = b.dataset.rmk;
      if (k === 'price') { state.min = state.max = ''; $('#pmin').value = $('#pmax').value = ''; }
      else if (k === 'q') { state.q = ''; $('#q').value = ''; }
      else state[k].delete(b.dataset.v);
      render();
    }
    else if (b.matches('[data-clear], #clear-all')) clearAll();
    else if (b.id === 'open-filters') toggleFilters(true);
    else if (b.id === 'close-filters') toggleFilters(false);
  });
  $('#filters').addEventListener('change', e => {
    const el = e.target; if (el.dataset.k) { el.checked ? state[el.dataset.k].add(el.dataset.v) : state[el.dataset.k].delete(el.dataset.v); render(); }
  });
  let t;
  const debounced = fn => { clearTimeout(t); t = setTimeout(fn, 220); };
  $('#q').addEventListener('input', e => debounced(() => { state.q = e.target.value.trim(); render(); }));
  $('#pmin').addEventListener('input', e => debounced(() => { state.min = e.target.value; render(); }));
  $('#pmax').addEventListener('input', e => debounced(() => { state.max = e.target.value; render(); }));
  $('#sort').addEventListener('change', e => { state.sort = e.target.value; render(); });
  $('#brand-q').addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    $$('#brand-chips .chip').forEach(c => { c.hidden = q && !c.dataset.name.toLowerCase().includes(q); });
  });
  document.addEventListener('am:fav', () => state.fav && render());
  document.addEventListener('am:display', () => render());

  // mobile off-canvas filters
  let scrim;
  function toggleFilters(open) {
    $('#filters').classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { scrim = document.createElement('div'); scrim.className = 'filters-scrim'; scrim.onclick = () => toggleFilters(false); document.body.append(scrim); $('#close-filters').focus(); }
    else { scrim?.remove(); $('#open-filters').focus(); }
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#filters').classList.contains('is-open')) toggleFilters(false); });

  render();
})();
