/* Annual set (home component): pick a price range and the families you love → one row per use
   (daily, occasions, summer, winter, + optional all-year) with matching scents as a slider.
   One pick per row, or none; the total and "add the set" sit underneath. */
(() => {
  const { L, tx, $, $$, esc, money, ph, minPrice, sizesOf, addToCart, label, fam, icon, observe } = AM.ui;
  if (!$('#af-rows')) return;
  const ar = L === 'ar';
  const P = AM.PRODUCTS.filter(p => p.inStock);
  const prices = P.map(minPrice);
  const lo = Math.min(...prices), hi = Math.max(...prices);

  const USES = [
    { id: 'daily',   t: ar ? 'يومي' : 'Daily',       d: ar ? 'للدوام والنهار' : 'Work and daytime',         test: p => p.occasion.includes('daily') || p.time.includes('morning') },
    { id: 'events',  t: ar ? 'مناسبات' : 'Occasions', d: ar ? 'للسهرات والأعياد' : 'Nights out and celebrations', test: p => p.occasion.includes('events') },
    { id: 'summer',  t: ar ? 'صيفي' : 'Summer',       d: ar ? 'للطقس الحار' : 'For hot weather',             test: p => p.season.includes('summer') || p.weather.includes('hot') },
    { id: 'winter',  t: ar ? 'شتوي' : 'Winter',       d: ar ? 'للطقس البارد' : 'For cold weather',           test: p => p.season.includes('winter') || p.weather.includes('cold') },
    { id: 'allyear', t: ar ? 'طوال السنة' : 'All year', d: ar ? 'اختياري — معتدل يرافقك في كل المواسم' : 'Optional — a mild one for every season', test: p => p.weather.includes('moderate'), optional: true }
  ];
  const T = ar ? {
    pickFam: 'اختر عائلة واحدة على الأقل لتظهر الاقتراحات.', none: 'لا توجد عطور ضمن السعر والعائلات المختارة — وسّع النطاق أو أضف عائلة.',
    chosen: 'اخترت', notYet: 'لم تختر بعد', skip: 'تخطَّ', set: 'باقتك', scents: n => ({ 0: 'لا عطور', 1: 'عطر واحد', 2: 'عطران' }[n] || `${n} عطور`),
    add: 'أضف الباقة إلى السلة', empty: 'اختر عطرًا واحدًا على الأقل من الصفوف.', prev: 'السابق', next: 'التالي'
  } : {
    pickFam: 'Pick at least one family to see suggestions.', none: 'No scents in this price range and these families — widen the range or add a family.',
    chosen: 'Picked', notYet: 'Not picked yet', skip: 'Skip', set: 'Your set', scents: n => `${n} scent${n === 1 ? '' : 's'}`,
    add: 'Add the set to bag', empty: 'Pick at least one scent from the rows.', prev: 'Previous', next: 'Next'
  };

  const state = { min: lo, max: hi, fams: new Set(), pick: {} };
  $('#af-min').value = lo; $('#af-max').value = hi;
  $('#af-min').placeholder = lo; $('#af-max').placeholder = hi;

  // only families that have scents in the store
  $('#af-fams').innerHTML = AM.FAMILIES.filter(f => P.some(p => p.family === f.id)).map(f =>
    `<button class="chip" type="button" data-fam="${f.id}" aria-pressed="false"><span class="dot" style="--fam:${f.hue}"></span>${esc(tx(f).replace(/ \(.*\)/, ''))}</button>`).join('');

  const candidates = use => P.filter(p => state.fams.has(p.family) && use.test(p) && minPrice(p) >= state.min && minPrice(p) <= state.max)
    .sort((a, b) => b.sold - a.sold);

  function renderRows() {
    const rows = $('#af-rows');
    if (!state.fams.size) { rows.innerHTML = `<p class="af__hint">${T.pickFam}</p>`; renderSum(); return; }
    rows.innerHTML = USES.map(use => {
      const list = candidates(use);
      if (state.pick[use.id] && !list.some(p => p.id === state.pick[use.id])) delete state.pick[use.id];
      const picked = list.find(p => p.id === state.pick[use.id]);
      return `<div class="af-row" data-use="${use.id}">
        <div class="af-row__head">
          <div><h3>${use.t}</h3><p class="muted">${use.d}</p></div>
          <p class="af-row__picked">${picked ? `${T.chosen}: <b>${esc(tx(picked.name))}</b> <button class="remove" type="button" data-skip="${use.id}">${T.skip}</button>` : `<span class="muted">${T.notYet}</span>`}</p>
          ${list.length > 3 ? `<div class="shelf-nav"><button class="circle-btn" type="button" data-row-prev aria-label="${T.prev}">${icon('arrow', 'ico rev')}</button><button class="circle-btn" type="button" data-row-next aria-label="${T.next}">${icon('arrow', 'ico flip')}</button></div>` : ''}
        </div>
        ${list.length ? `<div class="af-row__track">${list.map(p => `
          <button class="af-pick" type="button" data-use="${use.id}" data-id="${p.id}" aria-pressed="${p.id === state.pick[use.id]}" style="--fam:${fam(p.family).hue}">
            <span class="af-pick__img">${ph(p)}</span>
            <span class="af-pick__txt"><small>${esc(tx(AM.BRANDS.find(b => b.id === p.brand)) || '')}</small><b>${esc(tx(p.name))}</b>
              <span class="muted">${esc(tx(fam(p.family)))} · ${esc(label('conc', p.conc))}</span><span class="lat">${money(minPrice(p))}</span></span>
          </button>`).join('')}</div>` : `<p class="af__hint">${T.none}</p>`}
      </div>`;
    }).join('');
    observe(rows);
    renderSum();
  }

  function renderSum() {
    const chosen = [...new Set(Object.values(state.pick))].map(id => AM.PRODUCTS.find(p => p.id === id)).filter(Boolean);
    const total = chosen.reduce((n, p) => n + minPrice(p), 0);
    $('#set-sum').innerHTML = `
      <div><p class="muted" style="font-size:.9rem">${T.set} · ${T.scents(chosen.length)}</p><span class="num">${money(total)}</span></div>
      <button class="btn btn--gold" type="button" id="add-set" ${chosen.length ? '' : 'disabled'}>${T.add}</button>`;
    $('#add-set').onclick = () => chosen.forEach((p, i) => addToCart(p.id, sizesOf(p)[0], 1, i < chosen.length - 1));
  }

  // events
  $('#af-fams').addEventListener('click', e => {
    const b = e.target.closest('[data-fam]'); if (!b) return;
    state.fams.has(b.dataset.fam) ? state.fams.delete(b.dataset.fam) : state.fams.add(b.dataset.fam);
    b.setAttribute('aria-pressed', state.fams.has(b.dataset.fam));
    renderRows();
  });
  let t;
  const onPrice = () => {
    clearTimeout(t);
    t = setTimeout(() => {
      const a = parseFloat($('#af-min').value), b = parseFloat($('#af-max').value);
      state.min = isNaN(a) ? lo : a; state.max = isNaN(b) ? hi : b;
      if (state.min > state.max) [state.min, state.max] = [state.max, state.min];
      renderRows();
    }, 250);
  };
  $('#af-min').addEventListener('input', onPrice);
  $('#af-max').addEventListener('input', onPrice);

  const rtl = document.documentElement.dir === 'rtl';
  $('#af-rows').addEventListener('click', e => {
    const pick = e.target.closest('.af-pick');
    if (pick) {
      const { use, id } = pick.dataset;
      state.pick[use] === id ? delete state.pick[use] : (state.pick[use] = id); // a second click un-picks
      const keep = pick.closest('.af-row__track').scrollLeft;
      renderRows();
      $(`.af-row[data-use="${use}"] .af-row__track`).scrollLeft = keep;
      return;
    }
    const skip = e.target.closest('[data-skip]');
    if (skip) { delete state.pick[skip.dataset.skip]; renderRows(); return; }
    const nav = e.target.closest('[data-row-prev], [data-row-next]');
    if (nav) {
      const track = $('.af-row__track', nav.closest('.af-row'));
      const step = track.firstElementChild.getBoundingClientRect().width + 12;
      track.scrollBy({ left: (nav.matches('[data-row-next]') ? 1 : -1) * (rtl ? -1 : 1) * step, behavior: 'smooth' });
    }
  });

  renderRows();
})();
