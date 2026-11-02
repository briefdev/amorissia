/* Compose (home component): pick two scents or two notes → layered blend with wear order. */
(() => {
  const { L, tx, $, $$, esc, card, observe, byId, fam, notesOf, money, minPrice, sizesOf, addToCart } = AM.ui;
  if (!$('#mix-result')) return;
  const ar = L === 'ar';
  const F = AM.FAMILIES;
  const famIdx = id => F.findIndex(f => f.id === id);

  // notes index: note → family of the first scent that carries it
  const NOTES = [];
  AM.PRODUCTS.forEach(p => { const n = notesOf(p); [...n.top, ...n.heart, ...n.base].forEach(t => { if (!NOTES.some(x => x.t === t)) NOTES.push({ t, family: p.family }); }); });

  const sel = { a: null, b: null }; // { kind: 'scent'|'note', v }
  const mode = { a: 'scent', b: 'scent' };
  const T = ar
    ? { scent: 'عطر', note: 'نوتة', first: 'الأول', second: 'الثاني', choose: 'اختر', order: 'طريقة الوضع', addBoth: 'أضف الاثنين للسلة', suggest: 'عطور تحمل هذه النوتات', wear: 'متى تلبسها', light: 'خفيفة ونهارية', mid: 'متوازنة للمساء والدوام', deep: 'عميقة للمناسبات والطقس البارد', pickBoth: 'اختر الأول والثاني لترى التركيبة.' }
    : { scent: 'Scent', note: 'Note', first: 'first', second: 'second', choose: 'Choose', order: 'How to wear it', addBoth: 'Add both to bag', suggest: 'Scents carrying these notes', wear: 'When to wear it', light: 'light and daytime', mid: 'balanced for evenings and work', deep: 'deep, for occasions and cold weather', pickBoth: 'Pick a first and a second to see the blend.' };

  const familyOf = s => s.kind === 'scent' ? byId(s.v).family : NOTES.find(n => n.t === s.v).family;
  const nameOf = s => s.kind === 'scent' ? tx(byId(s.v).name) : s.v;

  function picker(side) {
    const items = mode[side] === 'scent'
      ? AM.PRODUCTS.map(p => ({ v: p.id, t: tx(p.name), hue: fam(p.family).hue }))
      : NOTES.map(n => ({ v: n.t, t: n.t, hue: fam(n.family).hue }));
    $(`#mix-${side}`).innerHTML = `
      <h3 style="font-size:1.4rem">${T.choose} ${side === 'a' ? T.first : T.second}</h3>
      <div class="picker__tabs" role="group">${['scent', 'note'].map(m => `<button class="chip" type="button" data-mode="${m}" data-side="${side}" aria-pressed="${mode[side] === m}">${T[m]}</button>`).join('')}</div>
      <div class="picker__list picker__list--compact">${items.map(i => `<button class="pick" type="button" data-side="${side}" data-v="${esc(i.v)}" style="--fam:${i.hue}"
        aria-pressed="${sel[side]?.kind === mode[side] && sel[side]?.v === i.v}"><span class="dot"></span>${esc(i.t)}</button>`).join('')}</div>`;
  }

  function render() {
    picker('a'); picker('b');
    const res = $('#mix-result');
    if (!(sel.a && sel.b)) { res.innerHTML = `<p class="muted">${T.pickBoth}</p>`; return; }

    const fa = fam(familyOf(sel.a)), fb = fam(familyOf(sel.b));
    // deeper goes first on skin
    const [deep, light] = famIdx(fa.id) >= famIdx(fb.id) ? [sel.a, sel.b] : [sel.b, sel.a];
    const avg = (famIdx(fa.id) + famIdx(fb.id)) / 2;
    const char = avg < 3 ? T.light : avg < 6 ? T.mid : T.deep;
    const title = fa.id === fb.id ? `${tx(fa)} ${ar ? 'مكثّف' : 'intensified'}` : `${tx(fam(familyOf(light)))} ${ar ? 'على' : 'over'} ${tx(fam(familyOf(deep)))}`;

    const bothScents = sel.a.kind === 'scent' && sel.b.kind === 'scent';
    const suggestions = bothScents ? [] : AM.PRODUCTS.filter(p => { const n = notesOf(p); const all = [...n.top, ...n.heart, ...n.base]; return [sel.a, sel.b].some(s => s.kind === 'note' ? all.includes(s.v) : p.id === s.v); }).slice(0, 4);
    const total = bothScents ? minPrice(byId(sel.a.v)) + minPrice(byId(sel.b.v)) : 0;

    res.innerHTML = `
      <div class="mix-visual" aria-hidden="true">
        <svg viewBox="0 0 24 32"><use href="#i-drop" fill="${fa.hue}"/></svg><span class="plus" style="font-size:1.6rem">+</span>
        <svg viewBox="0 0 24 32"><use href="#i-drop" fill="${fb.hue}"/></svg><span class="plus" style="font-size:1.6rem">=</span>
        <svg viewBox="0 0 24 32"><defs><linearGradient id="mixg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${fam(familyOf(light)).hue}"/><stop offset="1" stop-color="${fam(familyOf(deep)).hue}"/></linearGradient></defs><use href="#i-drop" fill="url(#mixg)"/></svg>
      </div>
      <p class="eyebrow">${ar ? 'التركيبة الناتجة' : 'Your blend'}</p>
      <h3 style="font-size:clamp(1.8rem,4vw,2.8rem)">${esc(title)}</h3>
      <div class="split" style="gap:var(--s-5)">
        <div><h4 style="font-size:1.1rem;margin-bottom:var(--s-2)">${T.order}</h4>
          <p>${ar ? `ضع <b>${esc(nameOf(deep))}</b> أولًا على نقاط النبض، وانتظر دقيقة، ثم رشّة من <b>${esc(nameOf(light))}</b> فوقه.`
                  : `Apply <b>${esc(nameOf(deep))}</b> first on pulse points, wait a minute, then one spray of <b>${esc(nameOf(light))}</b> on top.`}</p></div>
        <div><h4 style="font-size:1.1rem;margin-bottom:var(--s-2)">${T.wear}</h4><p>${ar ? 'تركيبة' : 'A blend that is'} ${char}.</p></div>
      </div>
      ${bothScents ? `<div class="set-sum" style="margin:0"><span>${ar ? 'الحجمان الأصغر معًا' : 'Both smallest sizes'} <span class="num">${money(total)}</span></span>
        <button class="btn btn--gold" type="button" id="mix-add">${T.addBoth}</button></div>`
        : `<h4 style="font-size:1.1rem">${T.suggest}</h4><div class="grid">${suggestions.map(card).join('')}</div>`}`;
    observe(res);
    $('#mix-add')?.addEventListener('click', () => { addToCart(sel.a.v, sizesOf(byId(sel.a.v))[0], 1, true); addToCart(sel.b.v, sizesOf(byId(sel.b.v))[0]); });
  }

  const pressExample = () => $$('#mix-examples .chip').forEach(c => {
    const ex = AM.PAIRINGS[+c.dataset.ex];
    c.setAttribute('aria-pressed', sel.a?.v === ex.a && sel.b?.v === ex.b);
  });
  const usePair = (a, b) => { mode.a = mode.b = 'scent'; sel.a = { kind: 'scent', v: a }; sel.b = { kind: 'scent', v: b }; };

  $('#compose').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.mode) { mode[b.dataset.side] = b.dataset.mode; picker(b.dataset.side); }
    else if (b.classList.contains('pick')) { sel[b.dataset.side] = { kind: mode[b.dataset.side], v: b.dataset.v }; render(); pressExample(); }
    else if (b.dataset.ex) { const ex = AM.PAIRINGS[+b.dataset.ex]; usePair(ex.a, ex.b); render(); pressExample(); }
  });

  $('#mix-examples').innerHTML = AM.PAIRINGS.map((x, i) =>
    `<button class="chip" type="button" data-ex="${i}" aria-pressed="false"><b>${esc(tx(byId(x.a).name))} + ${esc(tx(byId(x.b).name))}</b> · ${esc(tx(x))}</button>`).join('');

  // preselect from the URL (product page links) or show the first example
  const u = new URLSearchParams(location.search);
  if (byId(u.get('a'))) { sel.a = { kind: 'scent', v: u.get('a') }; if (byId(u.get('b'))) sel.b = { kind: 'scent', v: u.get('b') }; }
  else usePair(AM.PAIRINGS[0].a, AM.PAIRINGS[0].b);
  render(); pressExample();
  // content above is rendered by JS, so re-anchor after it settles
  if (location.hash === '#compose') requestAnimationFrame(() => $('#compose').scrollIntoView());
})();
