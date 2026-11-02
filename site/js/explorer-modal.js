/* Scent explorer (home component): 3 questions in a modal → redirect to the family's category. */
(() => {
  const { L, tx, $, $$, esc, icon } = AM.ui;
  const dlg = $('#explorer'); if (!dlg) return;
  const ar = L === 'ar';
  const F = AM.FAMILIES;

  const Q = [
    { id: 'when', h: ar ? 'متى تتعطّر غالبًا؟' : 'When do you usually wear scent?', sub: ar ? 'اختر الأقرب لروتينك.' : 'Pick what fits your routine.',
      opts: [
        { v: 'day', ico: 'sun', t: ar ? 'نهار ودوام' : 'Daytime & work', s: ar ? 'خفيف، نظيف، لا يزعج من حولك' : 'Light, clean, office-friendly' },
        { v: 'evening', ico: 'moon', t: ar ? 'مساء وطلعات' : 'Evenings out', s: ar ? 'دافئ وحاضر' : 'Warm and present' },
        { v: 'events', ico: 'star', t: ar ? 'سهرات ومناسبات' : 'Occasions', s: ar ? 'عميق ويدوم طويلًا' : 'Deep and long-lasting' }
      ] },
    { id: 'season', h: ar ? 'لأي فصل تبحث عن عطر؟' : 'Which season is it for?', sub: ar ? 'الطقس يغيّر طريقة فوحان العطر.' : 'Weather changes how a scent projects.',
      opts: [
        { v: 'summer', ico: 'sun', t: ar ? 'الصيف' : 'Summer', s: ar ? '30° فأكثر' : '30°+' },
        { v: 'spring', ico: 'leaf', t: ar ? 'الربيع' : 'Spring', s: '20–29°' },
        { v: 'autumn', ico: 'wind', t: ar ? 'الخريف' : 'Autumn', s: '20–29°' },
        { v: 'winter', ico: 'snow', t: ar ? 'الشتاء' : 'Winter', s: ar ? '19° وأقل' : '19° and below' }
      ] },
    { id: 'family', h: ar ? 'أي طابع أقرب لذوقك؟' : 'Which character feels like you?', sub: ar ? 'الأقرب لاختياراتك مُعلَّم أولًا — والقرار لك.' : 'Closest to your answers is marked — your call.' }
  ];
  // families that fit each answer (to mark "closest to your choices")
  const FIT = {
    day: ['green', 'citrus', 'aquatic', 'fruity', 'aromatic'], evening: ['floral', 'aromatic', 'woody', 'gourmand'], events: ['oriental', 'woody', 'gourmand', 'floral'],
    summer: ['citrus', 'aquatic', 'green'], spring: ['floral', 'fruity', 'green'], autumn: ['aromatic', 'woody', 'floral'], winter: ['gourmand', 'oriental', 'woody']
  };

  let ans = {}, step = 0;
  const body = $('#explorer-body');

  const recFamilies = () => {
    const score = f => (FIT[ans.when] || []).includes(f.id) + (FIT[ans.season] || []).includes(f.id);
    const max = Math.max(...F.map(score));
    return max ? F.filter(f => score(f) === max).map(f => f.id) : [];
  };
  const dots = n => { $('#explorer-dots').innerHTML = Q.map((_, i) => `<svg class="drop ${i <= n ? 'on' : ''}" viewBox="0 0 24 32" aria-hidden="true"><use href="#i-drop"/></svg>`).join('')
    + `<span class="sr-only">${ar ? `السؤال ${n + 1} من 3` : `Question ${n + 1} of 3`}</span>`; };

  function render() {
    const q = Q[step];
    const rec = step === 2 ? recFamilies() : [];
    const opts = step === 2
      ? F.map(f => ({ v: f.id, t: tx(f), s: tx(f.notes), fam: f.hue, rec: rec.includes(f.id) })).sort((a, b) => b.rec - a.rec)
      : q.opts;
    dots(step);
    body.innerHTML = `
      <h2 class="explorer__q">${q.h}</h2><p class="muted">${q.sub}</p>
      <div class="opts">${opts.map(o => `<button class="opt" type="button" data-v="${o.v}" aria-pressed="${ans[q.id] === o.v}"${o.fam ? ` style="--fam:${o.fam}"` : ''}>
        ${o.rec ? `<span class="rec">${ar ? 'الأقرب لاختياراتك' : 'Closest match'}</span>` : ''}
        ${o.fam ? '<span class="dot"></span>' : icon(o.ico)}<b>${esc(o.t)}</b><small>${esc(o.s)}</small></button>`).join('')}</div>
      <div class="q-nav">${step ? `<button class="btn btn--line" type="button" id="ex-back">${icon('arrow', 'ico rev')} ${ar ? 'السابق' : 'Back'}</button>` : '<span></span>'}</div>`;
    $$('.opt', body).forEach(b => b.addEventListener('click', () => {
      ans[q.id] = b.dataset.v;
      step < 2 ? (step++, render(), body.scrollTop = 0) : finish(b.dataset.v);
    }));
    $('#ex-back')?.addEventListener('click', () => { step--; render(); });
    body.querySelector('.opt')?.focus();
  }

  // last answer → go to the family's category (in Salla: the family sub-category page)
  function finish(id) {
    const f = F.find(x => x.id === id);
    dots(3);
    body.innerHTML = `<div class="explorer__done" style="--fam:${f.hue}">
      <p class="eyebrow">${ar ? 'توقيعك العطري' : 'Your scent signature'}</p>
      <h2 class="explorer__q">${ar ? 'توقيعك' : 'You are'} <span style="color:var(--accent-text)">${esc(tx(f))}</span></h2>
      <p class="muted">${ar ? 'ننقلك إلى عطور هذه العائلة…' : 'Taking you to this family…'}</p></div>`;
    setTimeout(() => { location.href = `shop.html?family=${f.id}`; }, 700);
  }

  function open(when) {
    ans = {}; step = 0;
    if (Q[0].opts.some(o => o.v === when)) { ans.when = when; step = 1; }
    render();
    if (!dlg.open) dlg.showModal();
  }
  dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('[data-close-explorer]')) dlg.close(); });
  dlg.addEventListener('close', () => { if (location.hash === '#explorer') history.replaceState(null, '', location.pathname); });

  AM.openExplorer = open;
  if (location.hash === '#explorer') open();
})();
