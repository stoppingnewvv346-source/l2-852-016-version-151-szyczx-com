(function () {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var topButton = document.querySelector('.back-top');

  if (topButton) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 320) {
        topButton.classList.add('show');
      } else {
        topButton.classList.remove('show');
      }
    });

    topButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var heroIndex = 0;

  function setHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === heroIndex);
    });

    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === heroIndex);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      setHero(i);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      setHero(heroIndex + 1);
    }, 5200);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));

  function normalize(text) {
    return String(text || '').trim().toLowerCase();
  }

  function applySearch(input) {
    var scopeSelector = input.getAttribute('data-search-input');
    var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
    var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll('[data-search]')) : [];
    var value = normalize(input.value);
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      var match = !value || text.indexOf(value) !== -1;
      card.style.display = match ? '' : 'none';
      if (match) {
        visible += 1;
      }
    });

    var empty = document.querySelector('[data-empty-for="' + scopeSelector + '"]');
    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      applySearch(input);
    });
  });

  var chipGroups = Array.prototype.slice.call(document.querySelectorAll('[data-filter-group]'));

  chipGroups.forEach(function (group) {
    var targetSelector = group.getAttribute('data-filter-group');
    var target = document.querySelector(targetSelector);
    var chips = Array.prototype.slice.call(group.querySelectorAll('[data-filter]'));

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var value = chip.getAttribute('data-filter');
        var cards = target ? Array.prototype.slice.call(target.querySelectorAll('[data-genre]')) : [];

        chips.forEach(function (item) {
          item.classList.toggle('active', item === chip);
        });

        cards.forEach(function (card) {
          var genre = normalize(card.getAttribute('data-genre'));
          var match = value === 'all' || genre.indexOf(normalize(value)) !== -1;
          card.style.display = match ? '' : 'none';
        });
      });
    });
  });
})();
