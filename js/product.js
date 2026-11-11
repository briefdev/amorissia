/* Product page: details, sizes & sample, scent pyramid inside the "A", performance, usage, related. */
(() => {
  const { starsOf, reviewCard, L, tx, $, $$, esc, money, label, byId, fam, sizesOf, priceOf, notesOf, isFav, icon, drop, ph, card, addToCart, toast, observe, store, sizeRadio } = AM.ui;
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
    sampleNote: 'العينة 2 مل لتجربة العطر قبل الحجم الكامل.',
    sizes: 'الأحجام', sample: 'العينة', buy: 'اشترِ الآن', sku: 'الرقم التسلسلي',
    share: 'مشاركة', whatsapp: 'مشاركة عبر واتساب', copy: 'نسخ الرابط', copied: 'نُسخ الرابط',
    tabby: n => `قسّمها على 4 دفعات بقيمة <b>${n}</b> بدون فوائد`, tamara: n => `ادفع على 3 دفعات بقيمة <b>${n}</b> بدون رسوم`,
    delivery: 'طرق التوصيل', deliveryList: ['توصيل داخل الإمارات خلال 1–3 أيام عمل', 'توصيل سريع في دبي خلال 24 ساعة', 'استلام من المتجر'],
    compareWith: 'قارن مع', compareOther: 'قارن مع عطر آخر'
  } : {
    home: 'Home', shop: 'Fragrances', size: 'Sizes & samples', qty: 'Quantity', add: 'Add to bag', notify: 'Notify me',
    notifyOk: "We'll let you know (placeholder)", compare: 'Compare this scent', compose: 'Layer it with…', pyramid: 'The scent pyramid',
    pyrLead: 'How the scent unfolds on skin, from the first spray to the last trace.',
    top: 'Top', heart: 'Heart', base: 'Base', topD: 'What you smell first', heartD: 'The core character', baseD: 'What stays on skin longest',
    perf: 'Performance', longevity: 'Longevity', sillage: 'Sillage', weak: 'Soft', mid: 'Moderate', strong: 'Strong',
    usage: 'When to wear', season: 'Season', weather: 'Weather', time: 'Time', occasion: 'Occasion', place: 'Setting',
    like: 'You may also like', similar: 'Similar scents', pair: 'Layer a scent', pairLead: 'Scents that work with this one when worn together — lighter over deeper.',
    layer: 'Layer them', notFound: "We couldn't find this fragrance.", back: 'Back to fragrances', ship: 'UAE delivery · house wrapping with every order',
    sampleNote: 'The 2ml sample lets you try the scent before the full size.',
    sizes: 'Sizes', sample: 'Sample', buy: 'Buy now', sku: 'SKU',
    share: 'Share', whatsapp: 'Share on WhatsApp', copy: 'Copy link', copied: 'Link copied',
    tabby: n => `Split into 4 payments of <b>${n}</b>, interest-free`, tamara: n => `Pay in 3 instalments of <b>${n}</b>, no fees`,
    delivery: 'Delivery options', deliveryList: ['UAE delivery in 1–3 working days', 'Express in Dubai within 24 hours', 'Store pickup'],
    compareWith: 'Compare with', compareOther: 'Compare with another scent'
  };

  if (!p) { root.innerHTML = `<div class="empty">${drop('drop drop--line')}<p>${T.notFound}</p><a class="btn btn--line" href="shop.html">${T.back}</a></div>`; return; }

  const f = fam(p.family);
  const n = notesOf(p);
  const reviews = (AM.REVIEWS || []).filter(r => r.product === p.id && (r.text || r.stars));
  const rating = AM.ui.ratingOf(reviews);
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


  // payment marks are drawn once in the footer; reuse them here
  const mark = name => document.querySelector(`.pay-mark[aria-label="${name}"]`)?.outerHTML || `<b>${name}</b>`;
  const off = AM.ui.discount(p);
  const url = location.href;
  const relGrid = list => `<div class="grid rel-grid">${list.map(x => card(x, { type: 'normal' })).join('')}</div>`;

  root.innerHTML = `
    <nav class="crumbs" aria-label="${ar ? 'مسار التنقل' : 'Breadcrumb'}" style="padding-top:var(--s-5);margin:0">
      <a href="index.html">${T.home}</a><span aria-hidden="true">/</span><a href="shop.html">${T.shop}</a><span aria-hidden="true">/</span>
      <a href="shop.html?family=${f.id}">${esc(tx(f))}</a><span aria-hidden="true">/</span><span aria-current="page">${esc(tx(p.name))}</span></nav>

    <section class="pdp">
      <div class="pdp__media">${ph(p)}${(tx(p.promo) || p.badges.length) ? `<div class="pdp__promo">${[...(tx(p.promo) ? [esc(tx(p.promo))] : []), ...p.badges.map(b => esc(label('badges', b)))].map(t => `<span class="tag tag--soft">${t}</span>`).join('')}</div>` : ''}</div>

      <div class="pdp__info">
        <span class="${ar ? 'eyebrow' : 'caps'}">${esc(brand)}</span>
        <h1 class="pdp__name">${esc(tx(p.name))}</h1>
        <a class="pdp__rating" href="#pdp-reviews">${reviews.length ? `${starsOf(rating)}<b class="lat">${rating.toFixed(1)}</b><span>(${reviews.length})</span>` : `${starsOf(0)}<span>${ar ? 'لا توجد تقييمات بعد' : 'No reviews yet'}</span>`}</a>
        <p class="pdp__conc"><span>${esc(label('conc', p.conc))}</span><span class="lat">${AM.LABELS.conc[p.conc].abbr}</span>
          <span>· ${esc(label('gender', p.gender))}</span><span>· <span style="color:${f.hue}">●</span> ${esc(tx(f))}</span></p>
        <p class="pdp__desc">${esc(tx(p.desc))}</p>
        <div class="pdp__icons">
          <button class="circle-btn" type="button" id="share" aria-label="${T.share}">${icon('share')}</button>
          <button class="circle-btn" type="button" data-fav="${p.id}" aria-pressed="${isFav(p.id)}" aria-label="${ar ? 'المفضلة' : 'Favourite'}">${icon('heart')}</button>
          <a class="circle-btn" href="https://wa.me/?text=${encodeURIComponent(tx(p.name) + ' — ' + url)}" target="_blank" rel="noopener" aria-label="${T.whatsapp}">${icon('whatsapp')}</a>
          <button class="circle-btn" type="button" id="copy" aria-label="${T.copy}">${icon('link')}</button>
        </div>
        <p class="pdp__sku"><span>${T.sku}</span> <b class="lat" dir="ltr">${p.sku}</b></p>

        <div class="pbox pbox--pay">${mark('Tabby')}<p id="tabby-txt"></p></div>
        <div class="pbox pbox--pay">${mark('Tamara')}<p id="tamara-txt"></p></div>
        <div class="pbox"><p class="pbox__title">${icon('truck')} ${T.delivery}</p><ul class="pbox__list">${T.deliveryList.map(x => `<li>${x}</li>`).join('')}</ul></div>

        <div class="pbox"><p class="pbox__title">${T.sizes}</p><div class="sizes" id="sizes">${sz.map(s => sizeRadio(p, s, s === defSize, 'pdp')).join('')}</div></div>
        ${p.sample ? `<div class="pbox"><p class="pbox__title">${T.sample}</p><div class="sizes" id="sample">${sizeRadio(p, 'sample', false, 'pdp')}</div>
          <p class="filter-note">${T.sampleNote}</p></div>` : ''}

        <div class="pbox pbox--buy">
          <div class="pbox__row">
            <p class="pdp__price" id="price" aria-live="polite"></p>
            <div class="qty qty--lg"><button type="button" id="qp" aria-label="+">${icon('plus')}</button><input id="qty" type="number" min="1" max="10" value="1" aria-label="${T.qty}"><button type="button" id="qm" aria-label="-">${icon('minus')}</button></div>
          </div>
          ${p.inStock
            ? `<div class="pbox__btns"><button class="btn btn--line" type="button" id="add">${T.add}</button><button class="btn btn--gold" type="button" id="buy">${T.buy}</button></div>`
            : `<button class="btn btn--line btn--block" type="button" id="notify">${T.notify}</button>`}
        </div>
      </div>

      <div class="pdp__acc accord">
        <details open><summary>${T.pyramid}</summary><div class="body">
          <div class="pyr__list">
            ${['top', 'heart', 'base'].filter(k => n[k].length).map((k, i) => `<div class="pyr__item"><span class="k">${i + 1}</span><h3>${T[k]}</h3><p>${T[k + 'D']}</p><p class="notes">${n[k].map(esc).join(' · ')}</p></div>`).join('')}
          </div></div></details>
        <details><summary>${ar ? 'الاستخدام' : 'Use'}</summary><div class="body">
          <dl class="usage">
            <div><dt>${T.season}</dt><dd>${tags('season', p.season)}</dd></div>
            <div><dt>${T.weather}</dt><dd>${tags('weather', p.weather)}</dd></div>
            <div><dt>${T.time}</dt><dd>${tags('time', p.time)}</dd></div>
            <div><dt>${T.occasion}</dt><dd>${tags('occasion', p.occasion)}</dd></div>
            <div><dt>${T.place}</dt><dd>${tags('place', p.place)}</dd></div>
          </dl></div></details>
        <details><summary>${T.perf}</summary><div class="body"><div class="perf">${meter(T.longevity, p.longevity)}${meter(T.sillage, p.sillage)}</div></div></details>
        <details><summary>${ar ? 'ركّب عطرك' : 'Layer your scent'}</summary><div class="body"><p class="lead" style="margin-bottom:var(--s-4)">${T.pairLead}</p>
          <div class="examples">${pairs.map(x => `<div class="example example--pair">
            <a href="product.html?id=${x.id}">${esc(tx(p.name))} + ${esc(tx(x.name))}</a>
            <a class="link-drop" href="index.html?a=${p.id}&b=${x.id}#compose">${T.layer} ${drop()}</a></div>`).join('')}</div></div></details>
        <details><summary>${T.like}</summary><div class="body">${relGrid(like)}</div></details>
        <details><summary>${T.similar}</summary><div class="body">${relGrid(similar)}</div></details>
        <details><summary>${ar ? 'قارن' : 'Compare'}</summary><div class="body">
          <div class="examples">${[...similar, ...like].slice(0, 4).map(x => `<a class="example example--link" href="compare.html?a=${p.id}&b=${x.id}">
            <span class="dot" style="background:${fam(x.family).hue}"></span><span>${T.compareWith} ${esc(tx(x.name))}</span>${icon('arrow', 'ico flip')}</a>`).join('')}</div>
          <a class="link-drop" href="compare.html?a=${p.id}" style="margin-top:var(--s-4)">${T.compareOther} ${drop()}</a></div></details>
        <details id="pdp-reviews"><summary>${ar ? 'التقييمات' : 'Reviews'} <span class="muted">(${reviews.length})</span></summary><div class="body">
          ${reviews.length ? `<div class="reviews-sum"><b class="num">${rating.toFixed(1)}</b>${starsOf(rating, 'stars--lg')}<span class="muted">${ar ? 'من' : 'from'} ${AM.ui.reviewsCount(reviews.length)}</span></div>
            <div class="reviews-list">${reviews.map(r => reviewCard(r, false)).join('')}</div>`
          : `<p class="muted">${ar ? 'لا توجد تقييمات لهذا العطر بعد. كن أول من يقيّمه بعد الشراء.' : 'No reviews for this scent yet. Be the first to review it after your purchase.'}</p>`}
        </div></details>
      </div>
    </section>`;

  $$('.rel-grid', root).forEach(g => AM.ui.gridVars(g, { desktop: 2, mobile: 2 }));

  // price + instalments follow the selected size or the sample
  const sel = () => { const v = $('input[name="pdp-size"]:checked').value; return v === 'sample' ? 'sample' : Number(v); };
  const updatePrice = () => {
    const s = sel(); const was = s !== 'sample' && p.was?.[s];
    const price = priceOf(p, s);
    $('#price').innerHTML = `${was && off ? `<span class="off">${AM.ui.STR.off(off)}</span>` : ''}<b>${money(price)}</b>${was ? `<s>${money(was)}</s>` : ''}`;
    $('#tabby-txt').innerHTML = T.tabby(money(Math.ceil(price / 4)));
    $('#tamara-txt').innerHTML = T.tamara(money(Math.ceil(price / 3)));
  };
  root.addEventListener('change', e => { if (e.target.name === 'pdp-size') updatePrice(); });
  updatePrice();

  const q = $('#qty');
  const clamp = v => Math.min(10, Math.max(1, v || 1));
  $('#qm').onclick = () => { q.value = clamp(+q.value - 1); };
  $('#qp').onclick = () => { q.value = clamp(+q.value + 1); };
  q.onchange = () => { q.value = clamp(+q.value); };
  $('#add')?.addEventListener('click', () => addToCart(p.id, sel(), clamp(+q.value), 'soft'));
  $('#buy')?.addEventListener('click', () => addToCart(p.id, sel(), clamp(+q.value)));
  $('#notify')?.addEventListener('click', () => toast(T.notifyOk));
  $('.pdp__rating').addEventListener('click', () => { $('#pdp-reviews').open = true; });
  $('#copy').addEventListener('click', async () => { try { await navigator.clipboard.writeText(url); toast(T.copied); } catch { toast(url); } });
  $('#share').addEventListener('click', async () => {
    if (navigator.share) { try { await navigator.share({ title: tx(p.name), url }); } catch { /* cancelled */ } }
    else { try { await navigator.clipboard.writeText(url); toast(T.copied); } catch { toast(url); } }
  });

  // remember last viewed for compare preselect
  store.set('am_last', p.id);
  observe(root);
})();
