/* Display settings preview: lets the merchant try columns, product count, card type and card parts.
   In Salla these become theme settings; here they are saved in localStorage and applied live. */
(() => {
  const { L, $, $$, store, display, icon } = AM.ui;
  const ar = L === 'ar';
  const T = ar ? {
    open: 'إعدادات العرض', title: 'إعدادات عرض المنتجات', note: 'معاينة لإعدادات التاجر — تُحفظ في هذا المتصفح فقط.',
    desktop: 'الكمبيوتر', mobile: 'الهاتف', cols: 'عدد الأعمدة', count: 'عدد المنتجات', type: 'نوع البطاقة',
    normal: 'عادي', wide: 'عرض عرضي', parts: 'مكونات البطاقة', reset: 'استعادة الافتراضي', close: 'إغلاق',
    f: { brand: 'البراند', conc: 'التركيز', tags: 'الوسوم', usage: 'الاستخدام', performance: 'الأداء', price: 'السعر', buttons: 'الأزرار' }
  } : {
    open: 'Display settings', title: 'Product display settings', note: 'Preview of the merchant settings — saved in this browser only.',
    desktop: 'Desktop', mobile: 'Mobile', cols: 'Columns', count: 'Products', type: 'Card type',
    normal: 'Standard', wide: 'Wide', parts: 'Card parts', reset: 'Reset to default', close: 'Close',
    f: { brand: 'Brand', conc: 'Concentration', tags: 'Tags', usage: 'Use', performance: 'Performance', price: 'Price', buttons: 'Buttons' }
  };

  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'settings-fab'; btn.innerHTML = `${icon('filter')}<span>${T.open}</span>`;
  const dlg = document.createElement('dialog');
  dlg.className = 'qv settings'; dlg.setAttribute('aria-label', T.title);
  document.body.append(btn, dlg);

  const num = (id, val, min, max) => `<label class="set-field"><span>${id.endsWith('cols') ? T.cols : T.count}</span>
    <input type="number" id="${id}" value="${val}" min="${min}" max="${max}" inputmode="numeric"></label>`;

  function render() {
    const d = display();
    dlg.innerHTML = `
      <div class="settings__head"><h2>${T.title}</h2><button class="icon-btn" type="button" data-set-close aria-label="${T.close}">${icon('close')}</button></div>
      <div class="settings__body">
        <p class="filter-note">${T.note}</p>
        <fieldset><legend>${T.desktop}</legend><div class="set-row">${num('d-cols', d.desktop.cols, 2, 6)}${num('d-count', d.desktop.count, 2, 24)}</div></fieldset>
        <fieldset><legend>${T.mobile}</legend><div class="set-row">${num('m-cols', d.mobile.cols, 1, 3)}${num('m-count', d.mobile.count, 1, 24)}</div></fieldset>
        <fieldset><legend>${T.type}</legend><div class="chips">
          ${['normal', 'wide'].map(t => `<button class="chip" type="button" data-card="${t}" aria-pressed="${d.card === t}">${T[t]}</button>`).join('')}</div></fieldset>
        <fieldset><legend>${T.parts}</legend><div class="set-parts">
          ${Object.keys(T.f).map(k => `<label><input type="checkbox" data-part="${k}" ${d.fields[k] ? 'checked' : ''}> ${T.f[k]}</label>`).join('')}</div></fieldset>
        <button class="remove" type="button" data-set-reset>${T.reset}</button>
      </div>`;
  }
  function save() {
    const d = display();
    const v = (id, fb) => Math.max(1, parseInt($(`#${id}`, dlg).value, 10) || fb);
    const fields = { ...d.fields };
    $$('[data-part]', dlg).forEach(c => { fields[c.dataset.part] = c.checked; });
    store.set('am_display', {
      desktop: { cols: v('d-cols', d.desktop.cols), count: v('d-count', d.desktop.count) },
      mobile: { cols: v('m-cols', d.mobile.cols), count: v('m-count', d.mobile.count) },
      card: $('[data-card][aria-pressed="true"]', dlg)?.dataset.card || d.card, fields
    });
    document.dispatchEvent(new CustomEvent('am:display'));
  }

  btn.addEventListener('click', () => { render(); dlg.showModal(); });
  dlg.addEventListener('change', save);
  dlg.addEventListener('click', e => {
    if (e.target === dlg || e.target.closest('[data-set-close]')) dlg.close();
    const c = e.target.closest('[data-card]');
    if (c) { $$('[data-card]', dlg).forEach(x => x.setAttribute('aria-pressed', x === c)); save(); }
    if (e.target.closest('[data-set-reset]')) { store.set('am_display', {}); render(); document.dispatchEvent(new CustomEvent('am:display')); }
  });
})();
