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
    scents: 'العطور', notes: 'النوتات', sameFam: 'من نفس العائلة — الأكثر مبيعًا', sameNote: 'يشاركه نوتة — الأكثر مبيعًا', others: 'باقي العطور', perf: 'الأداء', longevity: 'ثبات', sillage: 'فوحان',
    pickA: 'اختر عطرًا أو نوتة', pickB: 'اختر العطر الثاني', note: 'نوتة',
    order: 'طريقة الوضع', addBoth: 'أضف الاثنين للسلة', suggest: 'عطور تحمل هذه النوتة', wear: 'متى تلبسها',
    light: 'خفيفة ونهارية', mid: 'متوازنة للمساء والدوام', deep: 'عميقة للمناسبات والطقس البارد',
    base: 'يوضع أولًا كقاعدة', top: 'يوضع فوقه كلمسة', same: 'يكثّف نفس الطابع', both: 'الحجمان الأصغر معًا', blend: 'التركيبة الناتجة'
  } : {
    scents: 'Scents', notes: 'Notes', sameFam: 'Same family — best sellers', sameNote: 'Shares a note — best sellers', others: 'Other scents', perf: 'Performance', longevity: 'longevity', sillage: 'sillage',
    pickA: 'Pick a scent or a note', pickB: 'Pick the second scent', note: 'Note',
    order: 'How to wear it', addBoth: 'Add both to bag', suggest: 'Scents carrying this note', wear: 'When to wear it',
    light: 'light and daytime', mid: 'balanced for evenings and work', deep: 'deep, for occasions and cold weather',
    base: 'Goes on first, as the base', top: 'Goes on top, as a lift', same: 'Deepens the same character', both: 'Both smallest sizes', blend: 'Your blend'
  };

  let first = null;   // { kind: 'scent'|'note', v }
  let second = null;  // product id
  const familyOf = s => s.kind === 'scent' ? byId(s.v).family : NOTES.find(n => n.t === s.v).family;
  const nameOf = s => s.kind === 'scent' ? tx(byId(s.v).name) : s.v;


  /* ---------- matching: best sellers of the same family first, then best sellers sharing a note, then the rest ---------- */
  function ranked() {
    const fi = famIdx(familyOf(first));
    const notes = first.kind === 'scent' ? allNotes(byId(first.v)) : [first.v];
    return AM.PRODUCTS
      .filter(p => p.inStock && !(first.kind === 'scent' && p.id === first.v))
      .map(p => {
        const tier = p.family === familyOf(first) ? 0 : allNotes(p).some(n => notes.includes(n)) ? 1 : 2;
        const pi = famIdx(p.family);
        return { p, tier, rel: pi === fi ? T.same : pi > fi ? T.base : T.top };
      })
      .sort((x, y) => x.tier - y.tier || y.p.sold - x.p.sold);
  }
  const scentItem = (p, selected, sub) => ({ value: p.id, text: tx(p.name), sub: sub || `${brandOf(p)} · ${tx(fam(p.family))}`,
    search: `${tx(p.name)} ${brandOf(p)} ${allNotes(p).join(' ')}`, hue: fam(p.family).hue, img: p.img, selected });

  const comboA = AM.ui.combo($('#combo-a'), {
    labelId: 'mix-a-label', placeholder: T.pickA,
    groups: () => [
      { label: T.scents, items: AM.PRODUCTS.map(p => scentItem(p, first?.kind === 'scent' && first.v === p.id)) },
      { label: T.notes, items: NOTES.map(n => ({ value: `note:${n.t}`, text: n.t, sub: tx(fam(n.family)), hue: fam(n.family).hue, selected: first?.kind === 'note' && first.v === n.t })) }
    ],
    onPick: v => { first = String(v).startsWith('note:') ? { kind: 'note', v: v.slice(5) } : { kind: 'scent', v }; second = ranked()[0]?.p.id || null; update(); }
  });
  const comboB = AM.ui.combo($('#combo-b'), {
    labelId: 'mix-b-label', placeholder: T.pickB,
    groups: () => {
      const r = ranked(), pick = t => r.filter(m => m.tier === t);
      const item = m => scentItem(m.p, m.p.id === second, `${tx(fam(m.p.family))} · ${m.rel}`);
      return [
        { label: T.sameFam, items: pick(0).map(item) },
        { label: T.sameNote, items: pick(1).map(item) },
        { label: T.others, items: pick(2).map(m => scentItem(m.p, m.p.id === second)) }
      ];
    },
    onPick: v => { second = v; update(); }
  });

  /* ---------- info boxes + result ---------- */
  function info(s) {
    const f = fam(familyOf(s)), p = s.kind === 'scent' ? byId(s.v) : null;
    return `${p?.img ? `<span class="mixer__thumb">${AM.ui.ph(p)}</span>` : `<span class="dot" style="--fam:${f.hue}"></span>`}
      <span><b>${esc(nameOf(s))}</b> · ${esc(tx(f))}${p ? ` · ${esc(label('conc', p.conc))}` : ` · ${T.note}`}
      <small class="muted">${esc(p ? allNotes(p).slice(0, 4).join(sep) : tx(f.notes))}</small>
      ${p ? `<small class="mixer__perf">${T.perf}: ${T.longevity} <b>${esc(label('level', p.longevity))}</b> · ${T.sillage} <b>${esc(label('level', p.sillage))}</b></small>` : ''}</span>`;
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
