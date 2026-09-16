// Click or Enter/Space toggles a flip-card between its photo (front)
// and its blurb (back). No dependencies.
document.querySelectorAll('.flip-card').forEach((card) => {
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
