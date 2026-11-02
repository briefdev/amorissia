/* Annual set (home component): 4 uses × 3 tiers. Pick a tier or swap any cell, then add the set. Plus "your style". */
(() => {
  const { L, tx, $, $$, esc, money, byId, label, sizesOf, priceOf, addToCart, card, observe } = AM.ui;
  if (!$('#matrix')) return;
  const ar = L === 'ar';
  const A = AM.ANNUAL;
  const ml = ar ? 'مل' : 'ml';
  const sizeFor = p => sizesOf(p).includes(50) ? 50 : sizesOf(p)[0];
  const pick = Object.fromEntries(A.uses.map(u => [u.id, 'mid'])); // use → chosen tier

  $('#tiers').innerHTML = A.tiers.map(t => `<button class="chip" type="button" data-tier="${t.id}" aria-pressed="false">${esc(tx(t))}</button>`).join('');

  function render() {
    const tiers = new Set(Object.values(pick));
    const one = tiers.size === 1 ? [...tiers][0] : null;
    $$('#tiers .chip').forEach(b => b.setAttribute('aria-pressed', b.dataset.tier === one));
    $('#matrix').innerHTML = `
      <caption class="sr-only">${ar ? 'اختر عطرًا لكل استخدام' : 'Choose one scent per use'}</caption>
      <thead><tr><th scope="col">${ar ? 'الاستخدام' : 'Use'}</th>${A.tiers.map(t => `<th scope="col" class="${t.id === one ? 'is-col' : ''}">${esc(tx(t))}</th>`).join('')}</tr></thead>
      <tbody>${A.uses.map(u => `<tr><th scope="row">${esc(tx(u))}</th>${A.tiers.map(t => {
        const p = byId(A.grid[u.id][t.id]); const s = sizeFor(p); const on = pick[u.id] === t.id;
        return `<td class="${t.id === one ? 'is-col' : ''}"><button class="cell" type="button" data-use="${u.id}" data-t="${t.id}" aria-pressed="${on}">
          <b>${esc(tx(p.name))}</b><span class="muted">${esc(label('conc', p.conc))} · ${s} ${ml}</span><span class="lat">${money(priceOf(p, s))}</span></button></td>`;
      }).join('')}</tr>`).join('')}</tbody>`;

    const set = A.uses.map(u => byId(A.grid[u.id][pick[u.id]]));
    const uniq = [...new Set(set)];
    const total = uniq.reduce((n, p) => n + priceOf(p, sizeFor(p)), 0);
    $('#set-sum').innerHTML = `
      <div><p class="muted" style="font-size:.9rem">${ar ? 'باقتك' : 'Your set'} · ${one ? esc(tx(A.tiers.find(t => t.id === one))) : (ar ? 'مخصّصة' : 'custom')}</p>
        <span class="num">${money(total)}</span>
        ${uniq.length < set.length ? `<p class="filter-note">${ar ? 'عطر واحد يغطي استخدامين — يُضاف مرة واحدة.' : 'One scent covers two uses — added once.'}</p>` : ''}</div>
      <button class="btn btn--gold" type="button" id="add-set">${ar ? 'أضف الباقة إلى السلة' : 'Add the set to bag'}</button>`;
    $('#add-set').onclick = () => uniq.forEach((p, i) => addToCart(p.id, sizeFor(p), 1, i < uniq.length - 1));
  }

  $('#tiers').addEventListener('click', e => { const b = e.target.closest('[data-tier]'); if (b) { A.uses.forEach(u => { pick[u.id] = b.dataset.tier; }); render(); } });
  $('#matrix').addEventListener('click', e => { const b = e.target.closest('.cell'); if (b) { pick[b.dataset.use] = b.dataset.t; render(); } });

  // your style → one suggestion
  $('#styles').innerHTML = AM.STYLES.map(s => `<button class="chip" type="button" data-style="${s.id}" aria-pressed="false">${esc(tx(s))}</button>`).join('');
  $('#styles').addEventListener('click', e => {
    const b = e.target.closest('[data-style]'); if (!b) return;
    $$('#styles .chip').forEach(x => x.setAttribute('aria-pressed', x === b));
    const s = AM.STYLES.find(x => x.id === b.dataset.style); const p = byId(s.pick);
    $('#style-out').innerHTML = `<div class="style-out"><div style="max-width:260px">${card(p)}</div>
      <div class="stack"><p class="eyebrow">${ar ? 'اقتراحنا لاستايل' : 'Our pick for'} «${esc(tx(s))}»</p>
        <h3 style="font-size:2rem">${esc(tx(p.name))}</h3><p class="lead">${esc(tx(p.desc))}</p></div></div>`;
    observe($('#style-out'));
  });

  render();
})();
