/* Family wheel (home component): pick a family → its scents + link to the category. */
(() => {
  const { L, tx, $, $$, esc, icon, drop, label } = AM.ui;
  const svg = $('#wheel'); if (!svg) return;
  const ar = L === 'ar';
  const F = AM.FAMILIES;
  const C = 200, R1 = 190, R0 = 92, n = F.length, gap = 0.012;
  const pt = (r, a) => [C + r * Math.cos(a), C + r * Math.sin(a)];
  const short = f => tx(f).replace(/ \(.*\)/, '');

  svg.innerHTML = F.map((f, i) => {
    const a0 = -Math.PI / 2 + (i / n) * 2 * Math.PI + gap, a1 = -Math.PI / 2 + ((i + 1) / n) * 2 * Math.PI - gap;
    const [x0, y0] = pt(R1, a0), [x1, y1] = pt(R1, a1), [x2, y2] = pt(R0, a1), [x3, y3] = pt(R0, a0);
    const [lx, ly] = pt((R0 + R1) / 2, (a0 + a1) / 2);
    return `<path d="M${x0} ${y0}A${R1} ${R1} 0 0 1 ${x1} ${y1}L${x2} ${y2}A${R0} ${R0} 0 0 0 ${x3} ${y3}Z" fill="${f.hue}" data-f="${f.id}" tabindex="0" role="button" aria-label="${esc(tx(f))}"/>
      <text x="${lx}" y="${ly + 4}">${esc(short(f))}</text>`;
  }).join('') + `<text class="center-t" x="${C}" y="${C}" id="wheel-t"></text><text class="center-s" x="${C}" y="${C + 22}">${ar ? 'اختر عائلة' : 'Pick a family'}</text>`;

  function show(id) {
    const f = F.find(x => x.id === id);
    const i = F.indexOf(f);
    $$('path', svg).forEach(p => p.classList.toggle('is-on', p.dataset.f === id));
    $('#wheel-t').textContent = short(f);
    const list = AM.PRODUCTS.filter(p => p.family === id);
    $('#wheel-side').innerHTML = `
      <p class="eyebrow">${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')} · ${ar ? 'من الأخف إلى الأثقل' : 'lightest to deepest'}</p>
      <div class="scale__weight" aria-hidden="true" style="--fam:${f.hue};width:160px"><i style="--w:${Math.round((i + 1) / n * 100)}%"></i></div>
      <h3 style="font-size:2.4rem">${esc(tx(f))}</h3>
      <p class="lead">${esc(tx(f.notes))} — ${esc(tx(f.use))}</p>
      ${list.length ? `<div class="examples">${list.map(p => `<a class="example example--link" href="product.html?id=${p.id}"><span class="dot" style="background:${f.hue}"></span><span>${esc(tx(p.name))} <span class="muted">· ${esc(label('conc', p.conc))}</span></span>${icon('arrow', 'ico flip')}</a>`).join('')}</div>`
        : `<p class="muted">${ar ? 'لا توجد عطور من هذه العائلة حاليًا — قريبًا.' : 'No scents in this family yet — coming soon.'}</p>`}
      <a class="link-drop" href="shop.html?family=${id}" style="justify-self:start">${ar ? 'تسوّق هذه العائلة' : 'Shop this family'} ${drop()}</a>`;
  }
  svg.addEventListener('click', e => { const p = e.target.closest('path'); if (p) show(p.dataset.f); });
  svg.addEventListener('keydown', e => { const p = e.target.closest('path'); if (p && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); show(p.dataset.f); } });
  show('floral');
})();
