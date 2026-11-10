/* Compose (home component): pick the first scent or note from a select → matching scents appear as slides →
   pick a slide to see the layered blend and wear order. */
(() => {
  const { L, tx, $, $$, esc, card, observe, byId, fam, notesOf, money, minPrice, sizesOf, addToCart, label } = AM.ui;
  if (!$('#mix-result')) return;
  const ar = L === 'ar';
  const F = AM.FAMILIES;
  const famIdx = id => F.findIndex(f => f.id === id);
  const allNotes = p => { const n = notesOf(p); return [...n.top, ...n.heart, ...n.base]; };

  // notes index: note → family of the first scent that carries it
  const NOTES = [];
  AM.PRODUCTS.forEach(p => allNotes(p).forEach(t => { if (!NOTES.some(x => x.t === t)) NOTES.push({ t, family: p.family }); }));

  const T = ar ? {
    scents: 'العطور', notes: 'النوتات', order: 'طريقة الوضع', addBoth: 'أضف الاثنين للسلة', suggest: 'عطور تحمل هذه النوتة',
    wear: 'متى تلبسها', light: 'خفيفة ونهارية', mid: 'متوازنة للمساء والدوام', deep: 'عميقة للمناسبات والطقس البارد',
    pickSlide: 'اختر شريحة من «يتناغم معه» لترى التركيبة.', base: 'يوضع أولًا كقاعدة', top: 'يوضع فوقه كلمسة', same: 'يكثّف نفس الطابع',
    pick: 'اختر', picked: 'مختار', note: 'نوتة', both: 'الحجمان الأصغر معًا', blend: 'التركيبة الناتجة'
  } : {
    scents: 'Scents', notes: 'Notes', order: 'How to wear it', addBoth: 'Add both to bag', suggest: 'Scents carrying this note',
    wear: 'When to wear it', light: 'light and daytime', mid: 'balanced for evenings and work', deep: 'deep, for occasions and cold weather',
    pickSlide: 'Pick a slide under “Pairs well with” to see the blend.', base: 'Goes on first, as the base', top: 'Goes on top, as a lift', same: 'Deepens the same character',
    pick: 'Choose', picked: 'Selected', note: 'Note', both: 'Both smallest sizes', blend: 'Your blend'
  };

  let first = null;   // { kind: 'scent'|'note', v }
  let second = null;  // product id
  const familyOf = s => s.kind === 'scent' ? byId(s.v).family : NOTES.find(n => n.t === s.v).family;
  const nameOf = s => s.kind === 'scent' ? tx(byId(s.v).name) : s.v;

  // ---- step 1: the select (scents + notes) ----
  const sel = $('#mix-first');
  sel.innerHTML = `<optgroup label="${T.scents}">${AM.PRODUCTS.map(p => `<option value="scent:${p.id}">${esc(tx(p.name))} — ${esc(tx(fam(p.family)))}</option>`).join('')}</optgroup>
    <optgroup label="${T.notes}">${NOTES.map(n => `<option value="note:${esc(n.t)}">${esc(n.t)}</option>`).join('')}</optgroup>`;
  const readSel = () => { const [kind, ...v] = sel.value.split(':'); return { kind, v: v.join(':') }; };

  // ---- step 2: scents that pair well, best first ----
  function matches() {
    const fi = famIdx(familyOf(first));
    return AM.PRODUCTS
      .filter(p => !(first.kind === 'scent' && p.id === first.v))
      .map(p => {
        const d = Math.abs(famIdx(p.family) - fi);
        let score = d >= 2 && d <= 5 ? 6 - Math.abs(d - 3) : d === 0 ? 2 : 1; // a clear contrast in weight layers best
        if (first.kind === 'scent') {
          const a = byId(first.v);
          if (AM.PAIRINGS.some(x => (x.a === a.id && x.b === p.id) || (x.b === a.id && x.a === p.id))) score += 5;
          score += p.facets.filter(f => a.facets.includes(f)).length;
        } else if (allNotes(p).includes(first.v)) score += 2;
        return { p, score, rel: d === 0 ? T.same : famIdx(p.family) > fi ? T.base : T.top };
      })
      .sort((x, y) => y.score - x.score)
      .slice(0, 8);
  }

  function renderFirst() {
    const f = fam(familyOf(first));
    const p = first.kind === 'scent' ? byId(first.v) : null;
    $('#mix-first-info').innerHTML = `<span class="dot" style="--fam:${f.hue}"></span>
      <span><b>${esc(nameOf(first))}</b> · ${esc(tx(f))}${p ? ` · ${esc(label('conc', p.conc))}` : ` · ${T.note}`}</span>
      <span class="muted">${esc(p ? allNotes(p).slice(0, 4).join(ar ? '، ' : ', ') : tx(f.notes))}</span>`;
  }

  function renderSlides() {
    const list = matches();
    // a scent picked from a link (product page) stays in the slides even if it is not in the top matches
    if (second && second !== first.v && !list.some(m => m.p.id === second)) {
      const p = byId(second), fi = famIdx(familyOf(first)), pi = famIdx(p.family);
      list.unshift({ p, rel: pi === fi ? T.same : pi > fi ? T.base : T.top });
    }
    if (!second || !list.some(m => m.p.id === second)) second = list[0]?.p.id || null;
    $('#mix-slides').innerHTML = list.map(({ p, rel }) => {
      const f = fam(p.family);
      return `<button class="mix-slide" type="button" data-b="${p.id}" aria-pressed="${p.id === second}" style="--fam:${f.hue}">
        <span class="mix-slide__img"><span class="ph ph--dome"></span></span>
        <span class="mix-slide__body"><b>${esc(tx(p.name))}</b>
          <span class="mix-slide__fam"><span class="dot"></span>${esc(tx(f))}</span>
          <span class="mix-slide__rel">${rel}</span>
          <span class="mix-slide__cta">${p.id === second ? T.picked : T.pick}</span></span>
      </button>`;
    }).join('');
    $('#mix-slides').scrollLeft = 0;
    syncNav();
  }

  // ---- result ----
  function renderResult() {
    const res = $('#mix-result');
    if (!second) { res.innerHTML = `<p class="muted">${T.pickSlide}</p>`; return; }
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
      <h3 style="font-size:clamp(1.8rem,4vw,2.8rem)">${esc(title)}</h3>
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

  const pressExample = () => $$('#mix-examples .chip').forEach(c => {
    const ex = AM.PAIRINGS[+c.dataset.ex];
    c.setAttribute('aria-pressed', first?.kind === 'scent' && first.v === ex.a && second === ex.b);
  });
  const update = () => { renderFirst(); renderSlides(); renderResult(); pressExample(); };
  const choose = (a, b) => { sel.value = `scent:${a}`; first = readSel(); second = b; update(); };

  // ---- slides arrows ----
  const track = $('#mix-slides');
  const rtl = document.documentElement.dir === 'rtl';
  function syncNav() {
    const pos = Math.abs(track.scrollLeft), max = track.scrollWidth - track.clientWidth;
    $('#mix-prev').disabled = pos <= 2;
    $('#mix-next').disabled = pos >= max - 2;
  }
  const step = () => { const c = track.firstElementChild; return c ? c.getBoundingClientRect().width + 16 : track.clientWidth; };
  const go = dir => track.scrollBy({ left: dir * (rtl ? -1 : 1) * step(), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  $('#mix-prev').addEventListener('click', () => go(-1));
  $('#mix-next').addEventListener('click', () => go(1));
  track.addEventListener('scroll', () => requestAnimationFrame(syncNav), { passive: true });
  addEventListener('resize', syncNav);

  // ---- events ----
  sel.addEventListener('change', () => { first = readSel(); second = null; update(); });
  track.addEventListener('click', e => {
    const s = e.target.closest('.mix-slide'); if (!s) return;
    second = s.dataset.b;
    $$('.mix-slide', track).forEach(x => {
      const on = x === s; x.setAttribute('aria-pressed', on);
      x.querySelector('.mix-slide__cta').textContent = on ? T.picked : T.pick;
    });
    renderResult(); pressExample();
  });
  $('#mix-examples').innerHTML = AM.PAIRINGS.map((x, i) =>
    `<button class="chip" type="button" data-ex="${i}" aria-pressed="false"><b>${esc(tx(byId(x.a).name))} + ${esc(tx(byId(x.b).name))}</b> · ${esc(tx(x))}</button>`).join('');
  $('#mix-examples').addEventListener('click', e => { const b = e.target.closest('[data-ex]'); if (b) {
    const ex = AM.PAIRINGS[+b.dataset.ex]; choose(ex.a, ex.b);
    // bring the chosen slide into view inside the slider
    const i = $$('.mix-slide', track).findIndex(s => s.dataset.b === ex.b);
    if (i > 0) track.scrollBy({ left: i * (rtl ? -1 : 1) * step() });
  } });

  // preselect from the URL (product page links) or show the first example
  const u = new URLSearchParams(location.search);
  if (byId(u.get('a'))) choose(u.get('a'), byId(u.get('b')) ? u.get('b') : null);
  else choose(AM.PAIRINGS[0].a, AM.PAIRINGS[0].b);
  // content above is rendered by JS, so re-anchor after it settles
  if (location.hash === '#compose') requestAnimationFrame(() => $('#compose').scrollIntoView());
})();
