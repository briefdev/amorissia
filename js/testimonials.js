/* Customer reviews (home component): the store's written reviews as a slider, with the overall rating. */
(() => {
  const { L, $, starsOf, reviewCard, ratingOf } = AM.ui;
  const track = $('#rv-track'); if (!track) return;
  const ar = L === 'ar';
  const all = AM.REVIEWS || [];
  const written = all.filter(r => r.text);
  if (!written.length) { $('#reviews').hidden = true; return; }

  const avg = ratingOf(all);
  $('#rv-sum').innerHTML = `<b class="num">${avg.toFixed(1)}</b>${starsOf(avg, 'stars--lg')}
    <span class="muted">${ar ? `من ${all.length} تقييمات` : `from ${all.length} reviews`}</span>`;
  track.innerHTML = written.map(r => reviewCard(r)).join('');

  // slider arrows: one card per click, stop at the ends
  const rtl = document.documentElement.dir === 'rtl';
  const prev = $('#rv-prev'), next = $('#rv-next');
  const step = () => track.firstElementChild.getBoundingClientRect().width + 16;
  const sync = () => {
    const pos = Math.abs(track.scrollLeft), max = track.scrollWidth - track.clientWidth;
    prev.disabled = pos <= 2; next.disabled = pos >= max - 2;
    prev.parentElement.hidden = max <= 2;
  };
  const go = dir => track.scrollBy({ left: dir * (rtl ? -1 : 1) * step(), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  track.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
  addEventListener('resize', sync);
  sync();
})();
