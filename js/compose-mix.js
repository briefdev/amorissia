/* Compose (home component): two searchable dropdowns — the first scent (or a note) and the second scent,
   whose list starts with the best matches — then the layered blend and how to wear it. */
(() => {
  const { L, tx, $, $$, esc, card, observe, byId, fam, notesOf, money, minPrice, sizesOf, addToCart, label, icon } = AM.ui;
  if (!$('#mix-result')) return;
  const ar = L === 'ar';
  const F = AM.FAMILIES;
  const famIdx = id => F.findIndex(f => f.id === id);
  const allNotes = p => { const n = notesOf(p); return [...n.top, ...n.heart, ...n.base]; };
  const brandOf = p => tx(AM.BRANDS.find(b => b.id === p.brand)) || '';
  const sep = ar ? '، ' : ', ';

  // notes index: note → family of the first scent that carries it
  const NOTES = [];
  AM.PRODUCTS.forEach(p => allNotes(p).forEach(t => { if (!NOTES.some(x => x.t === t)) NOTES.push({ t, family: p.family }); }));

  const T = ar ? {
    scents: 'العطور', notes: 'النوتات', suggested: 'مقترح لك', all: 'كل العطور', search: 'ابحث بالاسم أو الماركة أو النوتة…',
    pickA: 'اختر عطرًا أو نوتة', pickB: 'اختر العطر الثاني', none: 'لا نتائج', note: 'نوتة',
    order: 'طريقة الوضع', addBoth: 'أضف الاثنين للسلة', suggest: 'عطور تحمل هذه النوتة', wear: 'متى تلبسها',
    light: 'خفيفة ونهارية', mid: 'متوازنة للمساء والدوام', deep: 'عميقة للمناسبات والطقس البارد',
    base: 'يوضع أولًا كقاعدة', top: 'يوضع فوقه كلمسة', same: 'يكثّف نفس الطابع', both: 'الحجمان الأصغر معًا', blend: 'التركيبة الناتجة'
  } : {
    scents: 'Scents', notes: 'Notes', suggested: 'Suggested for you', all: 'All scents', search: 'Search by name, brand or note…',
    pickA: 'Pick a scent or a note', pickB: 'Pick the second scent', none: 'No results', note: 'Note',
    order: 'How to wear it', addBoth: 'Add both to bag', suggest: 'Scents carrying this note', wear: 'When to wear it',
    light: 'light and daytime', mid: 'balanced for evenings and work', deep: 'deep, for occasions and cold weather',
    base: 'Goes on first, as the base', top: 'Goes on top, as a lift', same: 'Deepens the same character', both: 'Both smallest sizes', blend: 'Your blend'
  };

  let first = null;   // { kind: 'scent'|'note', v }
  let second = null;  // product id
  const familyOf = s => s.kind === 'scent' ? byId(s.v).family : NOTES.find(n => n.t === s.v).family;
  const nameOf = s => s.kind === 'scent' ? tx(byId(s.v).name) : s.v;

  /* ---------- searchable dropdown ---------- */
  function combo(el, { labelId, placeholder, groups, onPick }) {
    const id = el.id;
    el.innerHTML = `
      <button class="combo__btn" type="button" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="${labelId} ${id}-val">
        <span class="combo__val" id="${id}-val">${placeholder}</span>${icon('arrow', 'ico combo__chev')}</button>
      <div class="combo__pop" hidden>
        <label class="combo__search">${icon('search')}<input type="search" placeholder="${T.search}" aria-label="${T.search}" autocomplete="off"></label>
        <ul class="combo__list" role="listbox" aria-labelledby="${labelId}"></ul>
      </div>`;
    const btn = $('.combo__btn', el), pop = $('.combo__pop', el), input = $('input', el), list = $('.combo__list', el);
    let items = [], active = -1;
    const match = (it, q) => !q || (it.search || it.text).toLowerCase().includes(q);
    function render() {
      const q = input.value.trim().toLowerCase();
      items = [];
      list.innerHTML = groups().map(g => {
        const its = g.items.filter(it => match(it, q));
        if (!its.length) return '';
        return `<li class="combo__group" role="presentation">${g.label}</li>` + its.map(it => {
          items.push(it);
          return `<li class="combo__opt" role="option" id="${id}-o${items.length - 1}" data-i="${items.length - 1}" aria-selected="${!!it.selected}" style="--fam:${it.hue}">
            ${it.img ? `<img src="${(document.documentElement.dataset.root || '')}${it.img}" alt="" loading="lazy">` : '<span class="dot"></span>'}
            <span><b>${esc(it.text)}</b>${it.sub ? `<small>${esc(it.sub)}</small>` : ''}</span></li>`;
        }).join('');
      }).join('') || `<li class="combo__empty">${T.none}</li>`;
      setActive(items.findIndex(it => it.selected));
    }
    function setActive(i) {
      active = i;
      $$('.combo__opt', list).forEach(o => o.classList.toggle('is-active', +o.dataset.i === i));
      const o = $(`[data-i="${i}"]`, list);
      input.setAttribute('aria-activedescendant', o ? o.id : '');
      o?.scrollIntoView({ block: 'nearest' });
    }
    const open = () => { pop.hidden = false; btn.setAttribute('aria-expanded', 'true'); input.value = ''; render(); input.focus(); };
    const close = (focus = true) => { pop.hidden = true; btn.setAttribute('aria-expanded', 'false'); if (focus) btn.focus(); };
    const pick = i => { const it = items[i]; if (!it) return; close(); onPick(it.value); };
    btn.addEventListener('click', () => (pop.hidden ? open() : close()));
    input.addEventListener('input', render);
    input.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { setActive(Math.min(items.length - 1, active + 1)); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { setActive(Math.max(0, active - 1)); e.preventDefault(); }
      else if (e.key === 'Enter') { pick(active >= 0 ? active : 0); e.preventDefault(); }
      else if (e.key === 'Escape') close();
    });
    list.addEventListener('click', e => { const o = e.target.closest('.combo__opt'); if (o) pick(+o.dataset.i); });
    document.addEventListener('click', e => { if (!pop.hidden && !el.contains(e.target)) close(false); });
    return { setLabel: t => { $('.combo__val', el).textContent = t; } };
  }

  /* ---------- matching: a clear contrast in weight layers best ---------- */
  function ranked() {
    const fi = famIdx(familyOf(first));
    return AM.PRODUCTS
      .filter(p => p.inStock && !(first.kind === 'scent' && p.id === first.v))
      .map(p => {
        const d = Math.abs(famIdx(p.family) - fi);
        let score = d >= 2 && d <= 5 ? 6 - Math.abs(d - 3) : d === 0 ? 2 : 1;
        if (first.kind === 'scent') {
          const a = byId(first.v);
          if (AM.PAIRINGS.some(x => (x.a === a.id && x.b === p.id) || (x.b === a.id && x.a === p.id))) score += 5;
          score += p.facets.filter(f => a.facets.includes(f)).length;
        } else if (allNotes(p).includes(first.v)) score += 2;
        return { p, score, rel: d === 0 ? T.same : famIdx(p.family) > fi ? T.base : T.top };
      })
      .sort((x, y) => y.score - x.score || y.p.sold - x.p.sold);
  }
  const scentItem = (p, selected, sub) => ({ value: p.id, text: tx(p.name), sub: sub || `${brandOf(p)} · ${tx(fam(p.family))}`,
    search: `${tx(p.name)} ${brandOf(p)} ${allNotes(p).join(' ')}`, hue: fam(p.family).hue, img: p.img, selected });

  const comboA = combo($('#combo-a'), {
    labelId: 'mix-a-label', placeholder: T.pickA,
    groups: () => [
      { label: T.scents, items: AM.PRODUCTS.map(p => scentItem(p, first?.kind === 'scent' && first.v === p.id)) },
      { label: T.notes, items: NOTES.map(n => ({ value: `note:${n.t}`, text: n.t, sub: tx(fam(n.family)), hue: fam(n.family).hue, selected: first?.kind === 'note' && first.v === n.t })) }
    ],
    onPick: v => { first = String(v).startsWith('note:') ? { kind: 'note', v: v.slice(5) } : { kind: 'scent', v }; second = ranked()[0]?.p.id || null; update(); }
  });
  const comboB = combo($('#combo-b'), {
    labelId: 'mix-b-label', placeholder: T.pickB,
    groups: () => {
      const r = ranked();
      return [
        { label: T.suggested, items: r.slice(0, 6).map(m => scentItem(m.p, m.p.id === second, `${tx(fam(m.p.family))} · ${m.rel}`)) },
        { label: T.all, items: r.slice(6).map(m => scentItem(m.p, m.p.id === second)) }
      ];
    },
    onPick: v => { second = v; update(); }
  });

  /* ---------- info boxes + result ---------- */
  function info(s) {
    const f = fam(familyOf(s)), p = s.kind === 'scent' ? byId(s.v) : null;
    return `${p?.img ? `<span class="mixer__thumb">${AM.ui.ph(p)}</span>` : `<span class="dot" style="--fam:${f.hue}"></span>`}
      <span><b>${esc(nameOf(s))}</b> · ${esc(tx(f))}${p ? ` · ${esc(label('conc', p.conc))}` : ` · ${T.note}`}
      <small class="muted">${esc(p ? allNotes(p).slice(0, 4).join(sep) : tx(f.notes))}</small></span>`;
  }
  function renderResult() {
    const res = $('#mix-result');
    if (!first || !second) { res.innerHTML = ''; return; }
    const b = { kind: 'scent', v: second };
    const fa = fam(familyOf(first)), fb = fam(familyOf(b));
    const [deep, light] = famIdx(fa.id) >= famIdx(fb.id) ? [first, b] : [b, first]; // deeper goes first on skin
    const avg = (famIdx(fa.id) + famIdx(fb.id)) / 2;
    const char = avg < 3 ? T.light : avg < 6 ? T.mid : T.deep;
    const title = fa.id === fb.id ? `${tx(fa)} ${ar ? 'مكثّف' : 'intensified'}` : `${tx(fam(familyOf(light)))} ${ar ? 'على' : 'over'} ${tx(fam(familyOf(deep)))}`;
    const bothScents = first.kind === 'scent';
    const total = bothScents ? minPrice(byId(first.v)) + minPrice(byId(second)) : 0;
    const carriers = bothScents ? [] : AM.PRODUCTS.filter(p => allNotes(p).includes(first.v)).slice(0, 4);
    res.innerHTML = `
      <div class="mix-visual" aria-hidden="true">
        <svg viewBox="0 0 24 32"><use href="#i-drop" fill="${fa.hue}"/></svg><span class="plus" style="font-size:1.6rem">+</span>
        <svg viewBox="0 0 24 32"><use href="#i-drop" fill="${fb.hue}"/></svg><span class="plus" style="font-size:1.6rem">=</span>
        <svg viewBox="0 0 24 32"><defs><linearGradient id="mixg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${fam(familyOf(light)).hue}"/><stop offset="1" stop-color="${fam(familyOf(deep)).hue}"/></linearGradient></defs><use href="#i-drop" fill="url(#mixg)"/></svg>
      </div>
      <p class="eyebrow">${T.blend}</p>
      <h3 style="font-size:clamp(1.6rem,3.4vw,2.4rem)">${esc(title)}</h3>
      <div class="split" style="gap:var(--s-5)">
        <div><h4 style="font-size:1.1rem;margin-bottom:var(--s-2)">${T.order}</h4>
          <p>${ar ? `ضع <b>${esc(nameOf(deep))}</b> أولًا على نقاط النبض، وانتظر دقيقة، ثم رشّة من <b>${esc(nameOf(light))}</b> فوقه.`
                  : `Apply <b>${esc(nameOf(deep))}</b> first on pulse points, wait a minute, then one spray of <b>${esc(nameOf(light))}</b> on top.`}</p></div>
        <div><h4 style="font-size:1.1rem;margin-bottom:var(--s-2)">${T.wear}</h4><p>${ar ? 'تركيبة' : 'A blend that is'} ${char}.</p></div>
      </div>
      ${bothScents
        ? `<div class="set-sum" style="margin:0"><span>${T.both} <span class="num">${money(total)}</span></span>
            <button class="btn btn--gold" type="button" id="mix-add">${T.addBoth}</button></div>`
        : `<h4 style="font-size:1.1rem">${T.suggest}</h4><div class="grid">${carriers.map(p => card(p)).join('')}</div>`}`;
    if (!bothScents) AM.ui.gridVars($('.grid', res), { desktop: 4, mobile: 2 });
    observe(res);
    $('#mix-add')?.addEventListener('click', () => { addToCart(first.v, sizesOf(byId(first.v))[0], 1, true); addToCart(second, sizesOf(byId(second))[0]); });
  }
  function update() {
    comboA.setLabel(nameOf(first));
    comboB.setLabel(second ? tx(byId(second).name) : T.pickB);
    $('#mix-a-info').innerHTML = info(first);
    $('#mix-b-info').innerHTML = second ? info({ kind: 'scent', v: second }) : '';
    renderResult();
    $$('#mix-examples .chip').forEach(c => { const ex = AM.PAIRINGS[+c.dataset.ex]; c.setAttribute('aria-pressed', first.kind === 'scent' && first.v === ex.a && second === ex.b); });
  }
  const choose = (a, b) => { first = { kind: 'scent', v: a }; second = b || ranked()[0]?.p.id || null; update(); };

  $('#mix-examples').innerHTML = AM.PAIRINGS.map((x, i) =>
    `<button class="chip" type="button" data-ex="${i}" aria-pressed="false"><b>${esc(tx(byId(x.a).name))} + ${esc(tx(byId(x.b).name))}</b> · ${esc(tx(x))}</button>`).join('');
  $('#mix-examples').addEventListener('click', e => { const b = e.target.closest('[data-ex]'); if (b) { const ex = AM.PAIRINGS[+b.dataset.ex]; choose(ex.a, ex.b); } });

  // preselect from the URL (product page links) or show the first example
  const u = new URLSearchParams(location.search);
  if (byId(u.get('a'))) choose(u.get('a'), byId(u.get('b')) ? u.get('b') : null);
  else if (AM.PAIRINGS[0]) choose(AM.PAIRINGS[0].a, AM.PAIRINGS[0].b);
  else choose(AM.PRODUCTS[0].id);
  // content above is rendered by JS, so re-anchor after it settles
  if (location.hash === '#compose') requestAnimationFrame(() => $('#compose').scrollIntoView());
})();
