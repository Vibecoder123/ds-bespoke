// Build deck on the Process page (step 3). Three photos sit stacked, the
// current one in front and the next two stepped down and right behind it.
// Clicking the deck or the arrow button advances it: the front photo drops
// down and slots in at the back of the line, and the next photo swings up
// and to the left, turning anti-clockwise, into the front slot.
// Resting positions live in styles.css (data-slot 0, 1, 2); this script only
// runs the move between them, then hands back to the CSS. No dependencies.
// Reduced-motion visitors get the same order change with no movement.
(() => {
  const deck = document.querySelector('[data-build-deck]');
  if (!deck) return;

  const stage = deck.querySelector('.deck-stage');
  const cards = Array.from(deck.querySelectorAll('.deck-card'));
  const controls = deck.querySelector('.deck-controls');
  const nextBtn = deck.querySelector('.deck-next');
  const countShown = deck.querySelector('.deck-count [aria-hidden]');
  const countSpoken = deck.querySelector('.deck-count .sr-only');
  const total = cards.length;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const DURATION = 950;
  const EASE = 'cubic-bezier(0.45, 0.05, 0.25, 1)';
  const SHADE = [0, 0.4, 0.6];

  let current = 0; // index (in DOM order) of the photo in front
  let busy = false;

  controls.hidden = false;

  const pad = (n) => String(n).padStart(2, '0');

  const slotOf = (card) => Number(card.dataset.slot);

  // The step between cards in px, as CSS resolved it (margin is 2 steps).
  const step = () => parseFloat(getComputedStyle(stage).marginRight) / 2;

  const setSlots = () => {
    cards.forEach((card, i) => {
      const slot = (i - current + total) % total;
      card.dataset.slot = String(slot);
      if (slot === 0) card.removeAttribute('aria-hidden');
      else card.setAttribute('aria-hidden', 'true');
    });
    countShown.textContent = `${pad(current + 1)} / ${pad(total)}`;
    countSpoken.textContent = `Photo ${current + 1} of ${total}`;
  };

  const advance = () => {
    if (busy) return;

    const front = cards.find((c) => slotOf(c) === 0);
    const rising = cards.find((c) => slotOf(c) === 1);
    const others = cards.filter((c) => slotOf(c) > 1);

    current = (current + 1) % total;

    if (reduceMotion.matches) {
      setSlots();
      return;
    }

    busy = true;
    const d = step();
    const w = stage.offsetWidth;
    const h = stage.offsetHeight;
    const back = (total - 1) * d;
    const opts = { duration: DURATION, easing: EASE, fill: 'forwards' };
    const runs = [];

    // Front photo: drops down and right, clear of the stack, tucks behind
    // it at the halfway point, then settles into the last slot.
    runs.push(front.animate([
      { transform: 'translate(0px, 0px) scale(1)' },
      { transform: `translate(${back + w * 0.05}px, ${back + h * 0.2}px) scale(0.94)`, offset: 0.45 },
      { transform: `translate(${back}px, ${back}px) scale(1)` }
    ], opts));
    runs.push(front.querySelector('.deck-shade').animate(
      [{ opacity: SHADE[0] }, { opacity: SHADE[total - 1] }], opts));

    // Next photo: swings up and to the left on an anti-clockwise arc,
    // tilting anti-clockwise as it rises, and lands square in the front slot.
    // It stays under the front photo until that one has dropped clear.
    runs.push(rising.animate([
      { transform: `translate(${d}px, ${d}px) rotate(0deg)` },
      { transform: `translate(${d + w * 0.035}px, ${d - h * 0.05}px) rotate(-3deg)`, offset: 0.3 },
      { transform: `translate(${w * 0.01}px, ${-h * 0.04}px) rotate(-5deg)`, offset: 0.62 },
      { transform: 'translate(0px, 0px) rotate(0deg)' }
    ], opts));

    // Stacking swaps in one step at the halfway point, once the front photo
    // has dropped clear: it goes to the back, the rising one to the front.
    const half = (from, to) => [{ zIndex: from }, { zIndex: from, offset: 0.45 }, { zIndex: to, offset: 0.45 }, { zIndex: to }];
    runs.push(front.animate(half(3, 0), { duration: DURATION, fill: 'forwards' }));
    runs.push(rising.animate(half(2, 4), { duration: DURATION, fill: 'forwards' }));
    runs.push(rising.querySelector('.deck-shade').animate(
      [{ opacity: SHADE[1] }, { opacity: 0, offset: 0.62 }, { opacity: 0 }], opts));

    // The rest move up one place in the line.
    others.forEach((card) => {
      const from = slotOf(card);
      runs.push(card.animate([
        { transform: `translate(${from * d}px, ${from * d}px)` },
        { transform: `translate(${(from - 1) * d}px, ${(from - 1) * d}px)` }
      ], opts));
      runs.push(card.querySelector('.deck-shade').animate(
        [{ opacity: SHADE[from] }, { opacity: SHADE[from - 1] }], opts));
    });

    Promise.all(runs.map((a) => a.finished)).then(() => {
      setSlots();
      runs.forEach((a) => a.cancel());
      busy = false;
    });
  };

  stage.addEventListener('click', advance);
  nextBtn.addEventListener('click', advance);
})();
