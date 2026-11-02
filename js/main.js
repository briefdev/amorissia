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
      size: 'الحجم', close: 'إغلاق', compareAdded: 'أُضيف للمقارنة', themeEvening: 'مسائي', themeMorning: 'صباحي',
      off: n => `خصم ${n}٪`, cur: 'د.إ'
    },
    en: {
      photo: 'Product photo', from: 'from', sample: 'Sample', ml: 'ml', addToCart: 'Add to bag', added: 'Added to your bag',
      quick: 'Quick view', fav: 'Favourite', favAdded: 'Saved to favourites', favRemoved: 'Removed from favourites',
      details: 'Full details', outOfStock: 'Currently unavailable', notify: 'Notify me', cart: 'Bag',
      empty: 'Your bag is empty. The first scent is always the hardest.', browse: 'Browse fragrances', subtotal: 'Subtotal',
      shipping: 'Shipping', freeShip: 'Free', calcLater: 'Calculated at checkout', total: 'Total',
      checkout: 'Checkout', checkoutNote: 'Placeholder — connects to payment once moved to a platform',
      shipLeft: n => `Add ${n} for free shipping`, shipDone: 'You have free shipping', remove: 'Remove',
      size: 'Size', close: 'Close', compareAdded: 'Added to compare', themeEvening: 'Evening', themeMorning: 'Morning',
      off: n => `${n}% off`, cur: 'AED'
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

  /* ---------- placeholder image ---------- */
  const ph = (p, arch = true) => {
    const f = fam(p.family);
    return `<div class="ph${arch ? ' ph--arch' : ''}" style="--fam:${f.hue}" role="img" aria-label="${esc(STR.photo)}: ${esc(tx(p.name))}">
      <span class="ph-label"><b>${esc(tx(f))}</b>${STR.photo}</span></div>`;
  };

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

  /* ---------- product card ---------- */
  function card(p) {
    const f = fam(p.family);
    const off = discount(p);
    const start = []; // the discount badge lives next to the price
    start.push(`<span class="tag">${esc(notesOf(p).heart[0])}</span>`);
    start.push(`<span class="tag">${esc(label('time', p.time.length > 1 ? 'all' : p.time[0]))}</span>`);
    const end = p.badges.slice(0, 3).map(b => `<span class="tag tag--soft">${esc(label('badges', b))}</span>`);
    const sz = sizesOf(p);
    return `<article class="pcard fade" data-id="${p.id}">
      <div class="pcard__media">
        ${ph(p)}
        ${p.inStock ? '' : `<span class="oos">${STR.outOfStock}</span>`}
        <div class="pcard__tags"><div class="tags">${start.join('')}</div><div class="tags tags--end">${end.join('')}</div></div>
        <div class="pcard__actions">
          <button class="pill-btn" type="button" data-fav="${p.id}" aria-pressed="${isFav(p.id)}" aria-label="${STR.fav}: ${esc(tx(p.name))}">${icon('heart')}<span>${STR.fav}</span></button>
          <button class="pill-btn" type="button" data-qv="${p.id}" aria-label="${STR.quick}: ${esc(tx(p.name))}">${icon('eye')}<span>${STR.quick}</span></button>
          <span class="pcard__mark"><img src="${ASSETS}assets/img/logo-mark.webp" alt="" width="20" height="16" loading="lazy"></span>
        </div>
      </div>
      <div class="pcard__strip">
        <span class="pcard__brand">${esc(tx(AM.BRANDS.find(b => b.id === p.brand)))} · <span style="color:${f.hue}">●</span> ${esc(tx(f))}</span>
        <h3 class="pcard__name"><a href="product.html?id=${p.id}">${esc(tx(p.name))}</a></h3>
        <div class="pcard__meta">
          <span class="pcard__conc">${esc(label('conc', p.conc))} · <span style="white-space:nowrap"><span dir="ltr">${sz[0]}–${sz.at(-1)}</span> ${STR.ml}</span></span>
          <span class="pcard__price">${off ? `<s>${money(p.was[sz[0]] || p.was[sz.at(-1)])}</s>` : ''}<span class="now"><b>${money(minPrice(p))}</b>${off ? `<span class="off">${STR.off(off)}</span>` : ''}</span></span>
        </div>
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
    if (!silent) { toast(STR.added); openDrawer(); }
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
    const lbl = s === 'sample' ? `${STR.sample}<small>2 ${STR.ml}</small>` : `${s} ${STR.ml}<small>${money(p.sizes[s])}</small>`;
    const price = s === 'sample' ? `<small>${money(p.sample)}</small>` : '';
    return `<label class="size"><input type="radio" name="${name}-size" value="${s}" ${checked ? 'checked' : ''}><span>${lbl}${price}</span></label>`;
  }

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
      b.innerHTML = `${icon(evening ? 'moon' : 'sun')}<span>${evening ? STR.themeEvening : STR.themeMorning}</span>`;
      b.setAttribute('aria-pressed', String(!evening));
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
    else if (t.dataset.add) { addToCart(t.dataset.add, t.dataset.size ? (t.dataset.size === 'sample' ? 'sample' : Number(t.dataset.size)) : undefined); }
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
  AM.ui = { L, STR, tx, money, esc, $, $$, store, byId, fam, sizesOf, minPrice, priceOf, discount, notesOf, label, icon, drop, ph, card, isFav, toggleFav, addToCart, openQV, sizeRadio, toast, observe, cartCount };
})();
