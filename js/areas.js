// Turns <span data-area="hampshire">Hampshire</span> into an underlined
// button that reveals a short list of places. Mouse devices: hover.
// Touch and keyboard: tap or Enter/Space to open, Escape or an outside
// tap to close. Town lists live in AREAS below, so a change from Dan
// is one edit here rather than one per page.
(function () {
  var AREAS = {
    hampshire: {
      label: 'In Hampshire',
      places: ['Cliddesden', 'Dummer', 'Farleigh Wallop', 'The Wallops', 'Kingsclere', 'Ecchinswell', 'Overton', 'Steventon', 'Odiham', 'Hartley Wintney', 'Stockbridge', 'Winchester', 'Chilbolton', 'Wherwell', 'Itchen Abbas']
    },
    surrey: {
      label: 'In Surrey',
      places: ['Farnham', 'Rowledge', 'Wentworth']
    },
    berkshire: {
      label: 'In Berkshire',
      places: ['Ascot', 'Sunningdale']
    }
  };

  var CLOSE_DELAY = 140;
  var uid = 0;

  function setOpen(area, open) {
    var btn = area.querySelector('.area-trigger');
    var pop = area.querySelector('.area-pop');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    pop.hidden = !open;
    pop.style.left = '';
    pop.style.right = '';
    if (open) {
      var rect = pop.firstElementChild.getBoundingClientRect();
      if (rect.right > window.innerWidth - 12) {
        pop.style.left = 'auto';
        pop.style.right = '0';
      }
    } else {
      area.dataset.viaHover = '0';
    }
  }

  function closeAll(except) {
    document.querySelectorAll('.area').forEach(function (other) {
      if (other !== except) setOpen(other, false);
    });
  }

  document.querySelectorAll('[data-area]').forEach(function (el) {
    var data = AREAS[el.getAttribute('data-area')];
    if (!data) return;

    var id = 'area-pop-' + (++uid);
    var area = document.createElement('span');
    area.className = 'area';
    area.dataset.viaHover = '0';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'area-trigger';
    btn.textContent = el.textContent;
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', id);

    var pop = document.createElement('span');
    pop.className = 'area-pop';
    pop.id = id;
    pop.hidden = true;

    var card = document.createElement('span');
    card.className = 'area-pop-card';
    var label = document.createElement('span');
    label.className = 'area-pop-label';
    label.textContent = data.label;
    var list = document.createElement('span');
    list.className = 'area-pop-list';
    list.textContent = data.places.join(', ');
    card.appendChild(label);
    card.appendChild(list);
    pop.appendChild(card);

    area.appendChild(btn);
    area.appendChild(pop);
    el.replaceWith(area);

    var timer;

    area.addEventListener('pointerenter', function (event) {
      if (event.pointerType !== 'mouse') return;
      clearTimeout(timer);
      closeAll(area);
      if (btn.getAttribute('aria-expanded') !== 'true') {
        setOpen(area, true);
        area.dataset.viaHover = '1';
      }
    });

    area.addEventListener('pointerleave', function (event) {
      if (event.pointerType !== 'mouse') return;
      if (area.dataset.viaHover !== '1') return;
      timer = setTimeout(function () { setOpen(area, false); }, CLOSE_DELAY);
    });

    btn.addEventListener('click', function () {
      if (area.dataset.viaHover === '1') {
        area.dataset.viaHover = '0';
        return;
      }
      var willOpen = btn.getAttribute('aria-expanded') !== 'true';
      closeAll(area);
      setOpen(area, willOpen);
    });

    area.addEventListener('focusout', function (event) {
      if (area.dataset.viaHover === '1') return;
      if (!area.contains(event.relatedTarget)) setOpen(area, false);
    });
  });

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.area')) closeAll();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    var openBtn = document.querySelector('.area-trigger[aria-expanded="true"]');
    closeAll();
    if (openBtn) openBtn.focus();
  });
})();
