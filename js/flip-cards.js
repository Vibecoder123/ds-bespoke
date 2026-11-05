// Click or Enter/Space toggles a flip-card between its photo (front)
// and its blurb (back). No dependencies.
// [data-scroll-driven] cards (the homepage commissions journey) are
// flipped by scroll position and focus instead — see index.html's own
// script. Excluded here so the two mechanisms don't fight each other.
document.querySelectorAll('.flip-card:not([data-scroll-driven])').forEach((card) => {
  const toggle = () => {
    const flipped = card.classList.toggle('is-flipped');
    card.setAttribute('aria-pressed', flipped ? 'true' : 'false');
  };

  card.addEventListener('click', toggle);

  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle();
    }
  });
});

// Blurb fitting, for every flip card (Work and Home).
// A card's back has a fixed shape, so on a narrow column, a short screen or
// heavy zoom the blurb can need more height than the card has. When that
// happens: first tighten the padding, then shrink the text in small steps
// until it fits, no smaller than MIN_SCALE of its normal size. Cards that
// already fit are left exactly as styled. If even the smallest size doesn't
// fit, the back becomes scrollable from the top, so no words are lost.
(() => {
  const MIN_SCALE = 0.7;
  const STEP = 0.05;
  const TIGHT_PADDING = '10px 12px';

  const overflows = (back) => back.scrollHeight > back.clientHeight + 1;

  const fit = (back) => {
    const texts = [...back.querySelectorAll('p')];
    if (!texts.length) return;

    back.classList.remove('blurb-overflow');
    back.style.padding = '';
    texts.forEach((p) => { p.style.fontSize = ''; });
    if (!overflows(back)) return;

    back.style.padding = TIGHT_PADDING;
    const base = texts.map((p) => parseFloat(getComputedStyle(p).fontSize));
    for (let scale = 1; overflows(back) && scale - STEP >= MIN_SCALE - 0.001; ) {
      scale -= STEP;
      texts.forEach((p, i) => { p.style.fontSize = (base[i] * scale).toFixed(2) + 'px'; });
    }
    if (overflows(back)) back.classList.add('blurb-overflow');
  };

  const backs = [...document.querySelectorAll('.flip-card-back')];
  if (!backs.length) return;

  const fitAll = () => backs.forEach(fit);
  fitAll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);

  if ('ResizeObserver' in window) {
    let queued = false;
    const observer = new ResizeObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; fitAll(); });
    });
    backs.forEach((back) => observer.observe(back.closest('.flip-card') || back));
  } else {
    window.addEventListener('resize', fitAll);
  }
})();
