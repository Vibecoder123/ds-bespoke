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
