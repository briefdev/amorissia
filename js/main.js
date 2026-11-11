/* AMORISSEA — shared UI: i18n, theme, cart, favourites, product card, quick view, trail. */
(() => {
  const AM = window.AM;
  const L = document.documentElement.lang === 'en' ? 'en' : 'ar';
  const ASSETS = document.documentElement.dataset.root || '';

  /* ---------- i18n ---------- */
  const STR = {
    ar: {
      photo: 'صورة العطر', from: 'من', sample: 'عينة', ml: 'مل', addToCart: 'أضف إلى السلة', added: 'أُضيف إلى السلة',
      quick: 'عرض سريع', fav: 'المفضلة', favAdded: 'أُضيف إلى المفضلة', favRemoved: 'أُزيل من المفضلة',
      details: 'التفاصيل الكاملة', outOfStock: 'غير متوفر حاليًا', notify: 'أعلمني عند التوفر', cart: 'السلة',
      empty: 'سلتك فارغة. العطر الأول دائمًا هو الأصعب.', browse: 'تصفّح العطور', subtotal: 'المجموع الفرعي',
      shipping: 'الشحن', freeShip: 'مجاني', calcLater: 'يُحسب عند الدفع', total: 'الإجمالي',
      checkout: 'إتمام الطلب', checkoutNote: 'زر مؤقت — يُربط ببوابة الدفع عند النقل للمنصة',
      shipLeft: n => `أضف ${n} لتحصل على شحن مجاني`, shipDone: 'وصلت للشحن المجاني', remove: 'إزالة',
      size: 'الحجم', close: 'إغلاق', compareAdded: 'أُضيف للمقارنة', themeToggle: 'الوضع الصباحي',
      off: n => `خصم ${n}٪`, cur: 'د.إ',
      search: 'ابحث بالاسم أو الماركة أو النوتة…', noResults: 'لا نتائج',
      add: 'أضف للسلة', buy: 'اشترِ الآن', use: 'الاستخدام', perf: 'الأداء', longevity: 'ثبات', sillage: 'فوحان'
    },
    en: {
      photo: 'Product photo', from: 'from', sample: 'Sample', ml: 'ml', addToCart: 'Add to bag', added: 'Added to your bag',
      quick: 'Quick view', fav: 'Favourite', favAdded: 'Saved to favourites', favRemoved: 'Removed from favourites',
      details: 'Full details', outOfStock: 'Currently unavailable', notify: 'Notify me', cart: 'Bag',
      empty: 'Your bag is empty. The first scent is always the hardest.', browse: 'Browse fragrances', subtotal: 'Subtotal',
      shipping: 'Shipping', freeShip: 'Free', calcLater: 'Calculated at checkout', total: 'Total',
      checkout: 'Checkout', checkoutNote: 'Placeholder — connects to payment once moved to a platform',
      shipLeft: n => `Add ${n} for free shipping`, shipDone: 'You have free shipping', remove: 'Remove',
      size: 'Size', close: 'Close', compareAdded: 'Added to compare', themeToggle: 'Morning mode',
      off: n => `${n}% off`, cur: 'AED',
      search: 'Search by name, brand or note…', noResults: 'No results',
      add: 'Add to bag', buy: 'Buy now', use: 'Use', perf: 'Performance', longevity: 'Longevity', sillage: 'Sillage'
    }
  }[L];

  const tx = o => (o && (o[L] ?? o.ar)) || '';
  const money = n => L === 'ar' ? `${n.toLocaleString('en-US')} ${STR.cur}` : `${STR.cur} ${n.toLocaleString('en-US')}`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- storage (guarded) ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } }
  };

  /* ---------- data helpers ---------- */
  const byId = id => AM.PRODUCTS.find(p => p.id === id);
  const fam = id => AM.FAMILIES.find(f => f.id === id) || AM.FACETS.find(f => f.id === id);
  const sizesOf = p => Object.keys(p.sizes).map(Number).sort((a, b) => a - b);
  const minPrice = p => Math.min(...Object.values(p.sizes));
  const priceOf = (p, size) => size === 'sample' ? p.sample : p.sizes[size];
  const discount = p => {
    if (!p.was) return 0;
    const s = sizesOf(p).find(z => p.was[z]);
    return s ? Math.round((1 - p.sizes[s] / p.was[s]) * 100) : 0;
  };
  const notesOf = p => L === 'en' ? p.notesEn : p.notes;
  const label = (group, key) => tx(AM.LABELS[group]?.[key]);

  /* ---------- icons ---------- */
  const icon = (name, cls = 'ico') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const drop = (cls = 'drop') => `<svg class="${cls}" viewBox="0 0 24 32" aria-hidden="true"><use href="#i-drop"/></svg>`;

  /* ---------- product image inside the shape (falls back to a labelled placeholder) ---------- */
  const ph = (p, shape = 'arch') => {
    const f = fam(p.family);
    const cls = shape === 'arch' || shape === true ? ' ph--arch' : shape === 'dome' ? ' ph--dome' : '';
    const inner = p.img
      ? `<img class="ph-img" src="${ASSETS}${p.img}" alt="${esc(tx(p.name))}" loading="lazy" decoding="async">`
      : `<span class="ph-label"><b>${esc(tx(f))}</b>${STR.photo}</span>`;
    return `<div class="ph${cls}" style="--fam:${f.hue}"${p.img ? '' : ` role="img" aria-label="${esc(STR.photo)}: ${esc(tx(p.name))}"`}>${inner}</div>`;
  };
  const keyNote = p => { const n = notesOf(p); return n.heart[0] || n.top[0] || n.base[0] || ''; };

  /* ---------- favourites ---------- */
  let favs = new Set(store.get('am_fav', []));
  const isFav = id => favs.has(id);
  function toggleFav(id) {
    favs.has(id) ? favs.delete(id) : favs.add(id);
    store.set('am_fav', [...favs]);
    syncCounts();
    $$(`[data-fav="${id}"]`).forEach(b => b.setAttribute('aria-pressed', isFav(id)));
    toast(isFav(id) ? STR.favAdded : STR.favRemoved);
    document.dispatchEvent(new CustomEvent('am:fav'));
  }

  /* ---------- display settings (merchant-adjustable; preview overrides in localStorage) ---------- */
  const display = () => {
    const saved = store.get('am_display', {});
    const d = AM.DISPLAY;
    return {
      desktop: { ...d.desktop, ...saved.desktop }, mobile: { ...d.mobile, ...saved.mobile },
      card: saved.card || d.card, fields: { ...d.fields, ...saved.fields }
    };
  };
  // grid columns follow the settings; pass cols to override (e.g. narrow columns)
  const gridVars = (el, cols) => {
    const d = display();
    el.style.setProperty('--cols-d', cols?.desktop || d.desktop.cols);
    el.style.setProperty('--cols-m', cols?.mobile || d.mobile.cols);
    el.classList.add('grid--set');
  };

  /* ---------- product card: 'normal' (tall arch) or 'wide' (dome, info table) ---------- */
  function card(p, opts = {}) {
    const d = display();
    const type = opts.type || d.card;
    const F = d.fields;
    const off = discount(p);
    const sz = sizesOf(p);
    const name = esc(tx(p.name));
    const brand = F.brand ? `<span class="pcard__brand">${esc(tx(AM.BRANDS.find(b => b.id === p.brand)))}</span>` : '';
    const conc = F.conc ? `<p class="pcard__conc">${esc(label('conc', p.conc))}</p>` : '';
    const was = off ? `<s>${money(p.was[sz[0]] || p.was[sz.at(-1)])}</s>` : '';
    const offTag = off ? `<span class="off">${STR.off(off)}</span>` : '';
    const now = `<b>${money(minPrice(p))}</b>`;
    const icons = `<div class="pcard__icons">
        <button class="circle-btn" type="button" data-fav="${p.id}" aria-pressed="${isFav(p.id)}" aria-label="${STR.fav}: ${name}">${icon('heart')}</button>
        <button class="circle-btn" type="button" data-qv="${p.id}" aria-label="${STR.quick}: ${name}">${icon('eye')}</button></div>`;
    const btns = F.buttons ? `<div class="pcard__btns">
        <button class="btn btn--line" type="button" data-add="${p.id}" data-soft="1" ${p.inStock ? '' : 'disabled'}>${STR.add}</button>
        <button class="btn btn--gold" type="button" data-buy="${p.id}" ${p.inStock ? '' : 'disabled'}>${STR.buy}</button></div>` : '';
    const oos = p.inStock ? '' : `<span class="oos">${STR.outOfStock}</span>`;

    if (type === 'wide') {
      const use = [...p.season.slice(0, 2).map(v => label('season', v)), label('time', p.time.length > 1 ? 'all' : p.time[0])].join(' · ');
      const perf = `${STR.longevity} ${label('level', p.longevity)} · ${STR.sillage} ${label('level', p.sillage)}`;
      return `<article class="pcard pcard--wide fade" data-id="${p.id}">
        <div class="pcard__media">${ph(p, 'dome')}${oos}${icons}</div>
        <div class="pcard__table">
          <div class="cell">${brand}<h3 class="pcard__name"><a href="product.html?id=${p.id}">${name}</a></h3>${conc}</div>
          <div class="cell cell--info">${F.usage ? `<p><span>${STR.use}</span>${esc(use)}</p>` : ''}${F.performance ? `<p><span>${STR.perf}</span>${esc(perf)}</p>` : ''}</div>
          ${F.price ? (off ? `<div class="cell cell--off">${offTag}</div><div class="cell pcard__price">${now}${was}</div>` : `<div class="cell cell--full pcard__price">${now}</div>`) : ''}
        </div>
        ${btns}
      </article>`;
    }

    const start = [esc(keyNote(p)), esc(label('season', p.season[0])), esc(label('time', p.time.length > 1 ? 'all' : p.time[0]))]
      .filter(Boolean).map(t => `<span class="tag">${t}</span>`);
    // the store's promotion title first, then the house badges
    const end = [...(tx(p.promo) ? [esc(tx(p.promo))] : []), ...p.badges.map(b => esc(label('badges', b)))].slice(0, 3)
      .map(t => `<span class="tag tag--soft">${t}</span>`);
    return `<article class="pcard pcard--normal fade" data-id="${p.id}">
      <div class="pcard__media">
        ${ph(p)}${oos}
        ${F.tags ? `<div class="pcard__tags"><div class="tags">${start.join('')}</div><div class="tags tags--end">${end.join('')}</div></div>` : ''}
      </div>
      <div class="pcard__body">
        <div class="pcard__head"><div class="pcard__title">${brand}<h3 class="pcard__name"><a href="product.html?id=${p.id}">${name}</a></h3>${conc}</div>${icons}</div>
        ${F.price ? `<div class="pcard__price">${offTag}${now}${was}</div>` : ''}
        ${btns}
      </div>
    </article>`;
  }

  /* ---------- cart ---------- */
  let cart = store.get('am_cart', []);
  const FREE_SHIP = 300; // placeholder threshold (AED)
  const cartCount = () => cart.reduce((n, l) => n + l.qty, 0);
  const cartTotal = () => cart.reduce((n, l) => { const p = byId(l.id); return p ? n + priceOf(p, l.size) * l.qty : n; }, 0);
  function saveCart() { store.set('am_cart', cart); syncCounts(); renderCart(); }
  function addToCart(id, size, qty = 1, silent) {
    const p = byId(id); if (!p) return;
    size = size || sizesOf(p)[0];
    const line = cart.find(l => l.id === id && String(l.size) === String(size));
    line ? (line.qty += qty) : cart.push({ id, size, qty });
    saveCart();
    if (silent === 'soft') toast(STR.added);
    else if (!silent) { toast(STR.added); openDrawer(); }
  }
  function renderCart() {
    const body = $('#cart-body'); if (!body) return;
    if (!cart.length) {
      body.innerHTML = `<div class="empty">${drop('drop drop--line')}<p>${STR.empty}</p><a class="btn btn--line" href="shop.html">${STR.browse}</a></div>`;
      $('#cart-foot').hidden = true; return;
    }
    body.innerHTML = cart.map((l, i) => {
      const p = byId(l.id); if (!p) return '';
      const sizeTxt = l.size === 'sample' ? `${STR.sample} 2 ${STR.ml}` : `${l.size} ${STR.ml}`;
      return `<div class="cart-line">
        <span class="ph-mini" style="--fam:${fam(p.family).hue}"></span>
        <div><h3><a href="product.html?id=${p.id}">${esc(tx(p.name))}</a></h3>
          <p class="muted">${esc(label('conc', p.conc))} · ${sizeTxt}</p>
          <div class="qty" style="margin-top:8px"><button type="button" data-q="${i}" data-d="-1" aria-label="-">${icon('minus')}</button><output>${l.qty}</output><button type="button" data-q="${i}" data-d="1" aria-label="+">${icon('plus')}</button></div></div>
        <div class="end"><span class="price" style="color:var(--text)">${money(priceOf(p, l.size) * l.qty)}</span><button class="remove" type="button" data-rm="${i}">${STR.remove}</button></div>
      </div>`;
    }).join('');
    const sub = cartTotal();
    const left = Math.max(0, FREE_SHIP - sub);
    $('#cart-foot').hidden = false;
    $('#cart-sub').textContent = money(sub);
    $('#cart-ship').textContent = left ? STR.calcLater : STR.freeShip;
    $('#cart-total').textContent = money(sub);
    $('#ship-note').textContent = left ? STR.shipLeft(money(left)) : STR.shipDone;
    $('#ship-bar').style.setProperty('--w', `${Math.min(100, sub / FREE_SHIP * 100)}%`);
  }

  /* ---------- drawer / menu ---------- */
  let lastFocus = null;
  function openLayer(el) {
    if (!el) return;
    lastFocus = document.activeElement;
    el.classList.add('is-open'); el.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => el.querySelector('[data-close], button, a')?.focus(), 50);
  }
  function closeLayer(el) {
    if (!el) return;
    el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lastFocus?.focus?.();
  }
  const openDrawer = () => { renderCart(); openLayer($('#cart')); };

  /* ---------- quick view ---------- */
  function openQV(id) {
    const p = byId(id); const dlg = $('#qv'); if (!p || !dlg) return;
    const sz = sizesOf(p);
    $('#qv-media').innerHTML = ph(p, false);
    $('#qv-body').innerHTML = `
      <span class="${L === 'ar' ? 'eyebrow' : 'caps'}">${esc(tx(AM.BRANDS.find(b => b.id === p.brand)))}</span>
      <h2 style="font-size:2.2rem">${esc(tx(p.name))}</h2>
      <p class="muted">${esc(label('conc', p.conc))} · ${esc(tx(fam(p.family)))} · ${esc(label('gender', p.gender))}</p>
      <p>${esc(tx(p.desc))}</p>
      <div><p class="opt-label">${STR.size}</p><div class="sizes">${sz.map((s, i) => sizeRadio(p, s, i === 0, 'qv')).join('')}${sizeRadio(p, 'sample', false, 'qv')}</div></div>
      <button class="btn btn--gold" type="button" id="qv-add" ${p.inStock ? '' : 'disabled'}>${p.inStock ? STR.addToCart : STR.outOfStock}</button>
      <a class="link-drop" href="product.html?id=${p.id}">${STR.details} ${drop()}</a>`;
    $('#qv-add').onclick = () => {
      const s = dlg.querySelector('input[name="qv-size"]:checked')?.value;
      dlg.close(); addToCart(p.id, s === 'sample' ? 'sample' : Number(s));
    };
    dlg.showModal();
  }
  function sizeRadio(p, s, checked, name) {
    if (s === 'sample' && !p.sample) return ''; // the store sells no sample of this scent
    const lbl = s === 'sample' ? `${STR.sample}<small>2 ${STR.ml}</small>` : `${s} ${STR.ml}<small>${money(p.sizes[s])}</small>`;
    const price = s === 'sample' ? `<small>${money(p.sample)}</small>` : '';
    return `<label class="size"><input type="radio" name="${name}-size" value="${s}" ${checked ? 'checked' : ''}><span>${lbl}${price}</span></label>`;
  }

  /* ---------- searchable dropdown (layering, compare) ---------- */
  function combo(el, { labelId, label: aria, placeholder, groups, onPick }) {
    const id = el.id;
    el.innerHTML = `
      <button class="combo__btn" type="button" aria-haspopup="listbox" aria-expanded="false" ${labelId ? `aria-labelledby="${labelId} ${id}-val"` : `aria-label="${esc(aria || placeholder)}"`}>
        <span class="combo__val" id="${id}-val">${placeholder}</span>${icon('arrow', 'ico combo__chev')}</button>
      <div class="combo__pop" hidden>
        <label class="combo__search">${icon('search')}<input type="search" placeholder="${STR.search}" aria-label="${STR.search}" autocomplete="off"></label>
        <ul class="combo__list" role="listbox" ${labelId ? `aria-labelledby="${labelId}"` : `aria-label="${esc(aria || placeholder)}"`}></ul>
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
        return (g.label ? `<li class="combo__group" role="presentation">${g.label}</li>` : '') + its.map(it => {
          items.push(it);
          return `<li class="combo__opt" role="option" id="${id}-o${items.length - 1}" data-i="${items.length - 1}" aria-selected="${!!it.selected}" style="--fam:${it.hue}">
            ${it.img ? `<img src="${ASSETS}${it.img}" alt="" loading="lazy">` : '<span class="dot"></span>'}
            <span><b>${esc(it.text)}</b>${it.sub ? `<small>${esc(it.sub)}</small>` : ''}</span></li>`;
        }).join('');
      }).join('') || `<li class="combo__empty">${STR.noResults}</li>`;
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
    const outside = e => {
      if (!el.isConnected) return document.removeEventListener('click', outside); // the page re-rendered this dropdown
      if (!pop.hidden && !el.contains(e.target)) close(false);
    };
    document.addEventListener('click', outside);
    return { setLabel: t => { $('.combo__val', el).textContent = t; } };
  }

  /* ---------- reviews (shared: home testimonials, product page) ---------- */
  const starsOf = (n, cls = '') => `<span class="stars ${cls}" role="img" aria-label="${L === 'ar' ? `${n} من 5` : `${n} out of 5`}">${
    [1, 2, 3, 4, 5].map(i => `<svg viewBox="0 0 24 24" aria-hidden="true" class="${i <= Math.round(n) ? 'on' : ''}"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>`).join('')}</span>`;
  const fmtDate = d => { try { return new Date(d).toLocaleDateString(L === 'ar' ? 'ar-AE' : 'en-AE', { year: 'numeric', month: 'long', day: 'numeric', numberingSystem: 'latn' }); } catch { return d; } };
  function reviewCard(r, withProduct = true) {
    const p = withProduct && r.product ? byId(r.product) : null;
    return `<figure class="review">
      ${starsOf(r.stars)}
      <blockquote class="review__text">${esc(r.text)}</blockquote>
      <figcaption class="review__by"><span class="review__avatar" aria-hidden="true">${esc((r.name || '?').trim().charAt(0))}</span>
        <span><b>${esc(r.name)}</b><small>${esc(r.city)}${r.city ? ' · ' : ''}${fmtDate(r.date)}</small></span></figcaption>
      ${p ? `<a class="review__product" href="product.html?id=${p.id}"><span class="review__thumb">${ph(p)}</span><span>${esc(tx(p.name))}<small>${L === 'ar' ? 'عن هذا العطر' : 'About this scent'}</small></span></a>` : ''}
    </figure>`;
  }
  const ratingOf = list => list.length ? list.reduce((n, r) => n + r.stars, 0) / list.length : 0;

  /* ---------- toast ---------- */
  let toastT;
  function toast(msg) {
    let el = $('#toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; el.setAttribute('role', 'status'); document.body.append(el); }
    el.innerHTML = `${drop()}<span>${esc(msg)}</span>`;
    el.classList.add('is-on'); clearTimeout(toastT);
    toastT = setTimeout(() => el.classList.remove('is-on'), 2200);
  }

  /* ---------- header counts / theme ---------- */
  function syncCounts() {
    $$('[data-count="cart"]').forEach(e => { e.textContent = cartCount() || ''; e.dataset.n = cartCount(); });
    $$('[data-count="fav"]').forEach(e => { e.textContent = favs.size || ''; e.dataset.n = favs.size; });
  }
  function syncTheme() {
    const evening = document.documentElement.dataset.theme !== 'morning';
    $$('.theme-btn').forEach(b => {
      // a switch: on = morning (light), off = evening (dark); no visible words
      if (!b.querySelector('.theme-btn__track')) {
        b.innerHTML = `<span class="theme-btn__track">${icon('sun', 'ico theme-btn__sun')}${icon('moon', 'ico theme-btn__moon')}<span class="theme-btn__knob"></span></span>`;
        b.setAttribute('role', 'switch');
        b.setAttribute('aria-label', STR.themeToggle);
        b.removeAttribute('aria-pressed');
      }
      b.setAttribute('aria-checked', String(!evening));
    });
  }

  /* ---------- reveal ---------- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' }) : null;
  function observe(root = document) { $$('.reveal:not(.is-in), .fade:not(.is-in)', root).forEach(el => io ? io.observe(el) : el.classList.add('is-in')); }

  /* ---------- trail: fill the gold line with scroll, light the drop at each section ---------- */
  function initTrail() {
    const trail = $('.trail'); if (!trail) return;
    const secs = $$('.t-sec', trail);
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = trail.getBoundingClientRect(); const mid = innerHeight * .55;
      const p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
      trail.style.setProperty('--p', p.toFixed(4));
      secs.forEach(s => { const sr = s.getBoundingClientRect(); s.classList.toggle('is-lit', sr.top + 90 < mid); });
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update); update();
  }

  /* ---------- global events ---------- */
  document.addEventListener('click', e => {
    const t = e.target.closest('button, a'); if (!t) return;
    // explorer: open the home modal, or go to the home page and open it there
    if (t.matches('[data-explore], a[href$="#explorer"]')) {
      e.preventDefault();
      if (AM.openExplorer) { closeLayer($('#menu.is-open')); AM.openExplorer(t.dataset.explore); }
      else location.href = 'index.html#explorer';
      return;
    }
    if (t.dataset.fav) { e.preventDefault(); toggleFav(t.dataset.fav); }
    else if (t.dataset.qv) { e.preventDefault(); openQV(t.dataset.qv); }
    else if (t.dataset.add) { addToCart(t.dataset.add, t.dataset.size ? (t.dataset.size === 'sample' ? 'sample' : Number(t.dataset.size)) : undefined, 1, t.dataset.soft ? 'soft' : false); }
    else if (t.dataset.buy) { addToCart(t.dataset.buy, undefined, 1, true); openDrawer(); }
    else if (t.matches('[data-open="cart"]')) { e.preventDefault(); openDrawer(); }
    else if (t.matches('[data-open="menu"]')) { openLayer($('#menu')); }
    else if (t.matches('[data-close]')) { closeLayer(t.closest('.drawer, .menu')); }
    else if (t.matches('.theme-btn')) {
      const next = document.documentElement.dataset.theme === 'morning' ? 'evening' : 'morning';
      document.documentElement.dataset.theme = next; store.set('am_theme', next); syncTheme();
    }
    else if (t.dataset.q) { const l = cart[+t.dataset.q]; l.qty += +t.dataset.d; if (l.qty < 1) cart.splice(+t.dataset.q, 1); saveCart(); }
    else if (t.dataset.rm) { cart.splice(+t.dataset.rm, 1); saveCart(); }
    else if (t.id === 'checkout') { toast(STR.checkoutNote); }
  });
  $$('.drawer__scrim, .menu__scrim').forEach(s => s.addEventListener('click', () => closeLayer(s.parentElement)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $$('.drawer.is-open, .menu.is-open').forEach(closeLayer); });
  $('#qv')?.addEventListener('click', e => { if (e.target.id === 'qv' || e.target.closest('[data-close-qv]')) $('#qv').close(); });

  // keep the query (e.g. product id) when switching language
  $$('.lang-link').forEach(a => { a.href += location.search; });

  syncCounts(); syncTheme(); renderCart(); initTrail(); observe();

  /* public API for page scripts */
  AM.ui = { starsOf, reviewCard, ratingOf, combo, keyNote, display, gridVars, L, STR, tx, money, esc, $, $$, store, byId, fam, sizesOf, minPrice, priceOf, discount, notesOf, label, icon, drop, ph, card, isFav, toggleFav, addToCart, openQV, sizeRadio, toast, observe, cartCount };
})();
