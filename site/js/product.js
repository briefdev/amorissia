/* Product page: details, sizes & sample, scent pyramid inside the "A", performance, usage, related. */
(() => {
  const { L, tx, $, $$, esc, money, label, byId, fam, sizesOf, priceOf, notesOf, isFav, icon, drop, ph, card, addToCart, toast, observe, store, sizeRadio } = AM.ui;
  const ar = L === 'ar';
  const root = $('#pdp-root');
  const id = new URLSearchParams(location.search).get('id') || AM.PRODUCTS[0].id;
  const p = byId(id);

  const T = ar ? {
    home: 'الرئيسية', shop: 'العطور', size: 'الحجم والعينات', qty: 'الكمية', add: 'أضف إلى السلة', notify: 'أعلمني عند التوفر',
    notifyOk: 'سنُعلمك عند التوفر (نموذج مؤقت)', compare: 'قارن هذا العطر', compose: 'ركّب معه عطرًا', pyramid: 'الهرم العطري',
    pyrLead: 'كيف يتطور العطر على بشرتك، من أول رشّة حتى آخر أثر.',
    top: 'الافتتاحية', heart: 'القلب', base: 'القاعدة', topD: 'أول ما يُشمّ من العطر', heartD: 'طابع العطر الأساسي', baseD: 'ما يبقى على البشرة أطول مدة',
    perf: 'الأداء', longevity: 'الثبات', sillage: 'الفوحان', weak: 'عادي أو ضعيف', mid: 'متوسط', strong: 'قوي',
    usage: 'أوقات الاستخدام', season: 'الموسم', weather: 'الطقس', time: 'الوقت', occasion: 'المناسبة', place: 'المكان',
    like: 'قد يعجبك', similar: 'عطور مماثلة', pair: 'ركّب عطرًا', pairLead: 'عطور تنسجم مع هذا العطر عند وضعها معًا — الأخف فوق الأثقل.',
    layer: 'ركّبهما', notFound: 'لم نجد هذا العطر.', back: 'العودة إلى العطور', ship: 'شحن داخل الإمارات · تغليف الدار مع كل طلب',
    sampleNote: 'العينة 2 مل لتجربة العطر قبل الحجم الكامل.'
  } : {
    home: 'Home', shop: 'Fragrances', size: 'Sizes & samples', qty: 'Quantity', add: 'Add to bag', notify: 'Notify me',
    notifyOk: "We'll let you know (placeholder)", compare: 'Compare this scent', compose: 'Layer it with…', pyramid: 'The scent pyramid',
    pyrLead: 'How the scent unfolds on skin, from the first spray to the last trace.',
    top: 'Top', heart: 'Heart', base: 'Base', topD: 'What you smell first', heartD: 'The core character', baseD: 'What stays on skin longest',
    perf: 'Performance', longevity: 'Longevity', sillage: 'Sillage', weak: 'Soft', mid: 'Moderate', strong: 'Strong',
    usage: 'When to wear', season: 'Season', weather: 'Weather', time: 'Time', occasion: 'Occasion', place: 'Setting',
    like: 'You may also like', similar: 'Similar scents', pair: 'Layer a scent', pairLead: 'Scents that work with this one when worn together — lighter over deeper.',
    layer: 'Layer them', notFound: "We couldn't find this fragrance.", back: 'Back to fragrances', ship: 'UAE delivery · house wrapping with every order',
    sampleNote: 'The 2ml sample lets you try the scent before the full size.'
  };

  if (!p) { root.innerHTML = `<div class="empty">${drop('drop drop--line')}<p>${T.notFound}</p><a class="btn btn--line" href="shop.html">${T.back}</a></div>`; return; }

  const f = fam(p.family);
  const n = notesOf(p);
  const brand = tx(AM.BRANDS.find(b => b.id === p.brand));
  document.title = `${tx(p.name)} — ${label('conc', p.conc)} | AMORISSEA`;
  $('meta[name="description"]')?.setAttribute('content', tx(p.desc));

  const famI = x => AM.FAMILIES.findIndex(q => q.id === x.family);
  const others = AM.PRODUCTS.filter(x => x.id !== p.id);
  const similar = others.filter(x => x.family === p.family || x.facets.some(v => p.facets.includes(v))).slice(0, 4);
  const like = others.filter(x => !similar.includes(x) && x.occasion.some(o => p.occasion.includes(o))).slice(0, 4);
  const fromPairs = AM.PAIRINGS.filter(q => q.a === p.id || q.b === p.id).map(q => byId(q.a === p.id ? q.b : q.a));
  const pairs = [...new Set([...fromPairs, ...others.filter(x => Math.abs(famI(x) - famI(p)) >= 3)])].slice(0, 3);

  const lvl = v => [T.weak, T.mid, T.strong][v - 1];
  const meter = (name, v) => `<div class="meter"><div class="meter__head"><span>${name}</span><b>${lvl(v)}</b></div>
    <div class="meter__bar" role="img" aria-label="${name}: ${lvl(v)}">${[1, 2, 3].map(i => `<i class="${i <= v ? 'on' : ''}"></i>`).join('')}</div>
    <div class="meter__scale"><span>${T.weak}</span><span>${T.mid}</span><span>${T.strong}</span></div></div>`;
  const tags = (k, arr) => arr.map(v => `<span class="tag">${esc(label(k, v))}</span>`).join('');
  const sz = sizesOf(p);
  const defSize = sz.includes(50) ? 50 : sz[0];

  // pyramid drawn in the logo's arch: three tiers clipped to the "A"
  const pyramid = `<svg class="pyr__svg" viewBox="0 0 300 262" role="img" aria-label="${T.pyramid}">
    <defs><clipPath id="aclip"><path d="M150 4C190 60 280 170 296 258H4C20 170 110 60 150 4z"/></clipPath></defs>
    <g clip-path="url(#aclip)">
      <rect class="tier" x="0" y="0" width="300" height="98" fill="#E6C98F"/>
      <rect class="tier" x="0" y="102" width="300" height="76" fill="#B08A4E"/>
      <rect class="tier tier--base" x="0" y="182" width="300" height="80"/>
    </g>
    <path d="M150 4C190 60 280 170 296 258H4C20 170 110 60 150 4z" fill="none" stroke="var(--gold-400)" stroke-width="1" opacity=".6"/>
    <text x="150" y="80" fill="#141C33">${T.top}</text>
    <text x="150" y="146" fill="#fff">${T.heart}</text>
    <text x="150" y="226" fill="#F2EADB">${T.base}</text>
  </svg>`;

  root.innerHTML = `
    <nav class="crumbs" aria-label="${ar ? 'مسار التنقل' : 'Breadcrumb'}" style="padding-top:var(--s-5);margin:0">
      <a href="index.html">${T.home}</a><span aria-hidden="true">/</span><a href="shop.html">${T.shop}</a><span aria-hidden="true">/</span>
      <a href="shop.html?family=${f.id}">${esc(tx(f))}</a><span aria-hidden="true">/</span><span aria-current="page">${esc(tx(p.name))}</span></nav>

    <section class="pdp">
      <div class="pdp__media">${ph(p)}${p.badges.length ? `<div class="pcard__tags"><div class="tags"></div><div class="tags tags--end">${p.badges.map(b => `<span class="tag tag--soft">${esc(label('badges', b))}</span>`).join('')}</div></div>` : ''}</div>
      <div class="pdp__info">
        <span class="${ar ? 'eyebrow' : 'caps'}">${esc(brand)}</span>
        <div class="pdp__title"><h1>${esc(tx(p.name))}</h1>
          <button class="fav-btn" type="button" data-fav="${p.id}" aria-pressed="${isFav(p.id)}" aria-label="${ar ? 'المفضلة' : 'Favourite'}">${icon('heart')}</button></div>
        <p class="pdp__conc"><span>${esc(label('conc', p.conc))}</span>${ar ? `<span class="lat">${AM.LABELS.conc[p.conc].en}</span>` : ''}
          <span>· ${esc(label('gender', p.gender))}</span><span>· <span style="color:${f.hue}">●</span> ${esc(tx(f))}</span></p>
        <p class="pdp__desc">${esc(tx(p.desc))}</p>
        <div><p class="opt-label">${T.size}</p>
          <div class="sizes" id="sizes">${sz.map(s => sizeRadio(p, s, s === defSize, 'pdp')).join('')}${sizeRadio(p, 'sample', false, 'pdp')}</div>
          <p class="filter-note" style="margin-top:var(--s-2)">${T.sampleNote}</p></div>
        <p class="pdp__price" id="price" aria-live="polite"></p>
        <div class="buy-row">
          <div class="qty qty--lg"><button type="button" id="qm" aria-label="-">${icon('minus')}</button><input id="qty" type="number" min="1" max="10" value="1" aria-label="${T.qty}"><button type="button" id="qp" aria-label="+">${icon('plus')}</button></div>
          ${p.inStock ? `<button class="btn btn--gold" type="button" id="add">${T.add}</button>` : `<button class="btn btn--line" type="button" id="notify" style="flex:1">${T.notify}</button>`}
        </div>
        <div class="pdp__links">
          <a href="compare.html?a=${p.id}">${icon('compare')} ${T.compare}</a>
          <a href="index.html?a=${p.id}#compose">${drop('drop drop--line')} ${T.compose}</a>
        </div>
        <p class="muted" style="font-size:.88rem;border-top:1px solid var(--line);padding-top:var(--s-4)">${T.ship}</p>
      </div>
    </section>

    <section class="notes-sec" aria-labelledby="pyr-h">
      <div class="t-head" style="margin:0"><span class="t-num">01</span><h2 class="t-title" id="pyr-h">${T.pyramid}</h2></div>
      <div class="pyr">
        <div class="reveal">${pyramid}</div>
        <div class="pyr__list">
          ${['top', 'heart', 'base'].map((k, i) => `<div class="pyr__item"><span class="k">${i + 1}</span><h3>${T[k]}</h3><p>${T[k + 'D']}</p><p class="notes">${n[k].map(esc).join(' · ')}</p></div>`).join('')}
        </div>
      </div>
    </section>

    <section class="notes-sec split">
      <div><h2 class="box-title">${drop()} ${T.perf}</h2><div class="perf">${meter(T.longevity, p.longevity)}${meter(T.sillage, p.sillage)}</div></div>
      <div><h2 class="box-title">${drop()} ${T.usage}</h2>
        <dl class="usage">
          <div><dt>${T.season}</dt><dd>${tags('season', p.season)}</dd></div>
          <div><dt>${T.weather}</dt><dd>${tags('weather', p.weather)}</dd></div>
          <div><dt>${T.time}</dt><dd>${tags('time', p.time)}</dd></div>
          <div><dt>${T.occasion}</dt><dd>${tags('occasion', p.occasion)}</dd></div>
          <div><dt>${T.place}</dt><dd>${tags('place', p.place)}</dd></div>
        </dl></div>
    </section>

    <section class="accord" style="margin-bottom:var(--s-9)">
      <details open><summary>${T.like}</summary><div class="body"><div class="rail">${like.map(card).join('')}</div></div></details>
      <details><summary>${T.similar}</summary><div class="body"><div class="rail">${similar.map(card).join('')}</div></div></details>
      <details><summary>${T.pair}</summary><div class="body"><p class="lead" style="margin-bottom:var(--s-5)">${T.pairLead}</p>
        <div class="examples">${pairs.map(x => `<div class="example">
          <span>${esc(tx(p.name))}</span><span class="op">+</span><a href="product.html?id=${x.id}">${esc(tx(x.name))}</a><span class="op op--eq">=</span>
          <a class="link-drop" href="index.html?a=${p.id}&b=${x.id}#compose">${T.layer} ${drop()}</a></div>`).join('')}</div></div></details>
    </section>`;

  // price follows the selected size
  const sel = () => { const v = $('input[name="pdp-size"]:checked').value; return v === 'sample' ? 'sample' : Number(v); };
  const updatePrice = () => {
    const s = sel(); const was = s !== 'sample' && p.was?.[s];
    $('#price').innerHTML = `${was ? `<s>${money(was)}</s>` : ''}${money(priceOf(p, s))}`;
  };
  $('#sizes').addEventListener('change', updatePrice); updatePrice();

  const q = $('#qty');
  const clamp = v => Math.min(10, Math.max(1, v || 1));
  $('#qm').onclick = () => { q.value = clamp(+q.value - 1); };
  $('#qp').onclick = () => { q.value = clamp(+q.value + 1); };
  q.onchange = () => { q.value = clamp(+q.value); };
  $('#add')?.addEventListener('click', () => addToCart(p.id, sel(), clamp(+q.value)));
  $('#notify')?.addEventListener('click', () => toast(T.notifyOk));

  // remember last viewed for compare preselect
  store.set('am_last', p.id);
  observe(root);
})();
