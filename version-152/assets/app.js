(function () {
  var menuButton = document.querySelector('[data-nav-toggle]');
  var menu = document.querySelector('[data-nav-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  document.querySelectorAll('img[data-cover]').forEach(function (img) {
    var hideImage = function () {
      img.classList.add('is-hidden');
    };

    img.addEventListener('error', hideImage);

    if (img.complete && img.naturalWidth === 0) {
      hideImage();
    }
  });

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.carousel-dot'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    var show = function (nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    };

    var start = function () {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };

    var restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    start();
  }

  var searchResults = document.getElementById('searchResults');

  if (searchResults && window.SEARCH_INDEX) {
    var input = document.getElementById('searchInput');
    var region = document.getElementById('regionFilter');
    var type = document.getElementById('typeFilter');
    var year = document.getElementById('yearFilter');
    var count = document.getElementById('searchCount');
    var reset = document.getElementById('searchReset');

    var safe = function (value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    var imagePath = function (id) {
      var number = Number(id) || 1;
      return ((number - 1) % 150) + 1 + '.jpg';
    };

    var card = function (item) {
      return [
        '<a class="movie-card" href="' + item.url + '">',
        '  <div class="poster poster-tall">',
        '    <div class="poster-bg"><span>' + safe(item.title) + '</span></div>',
        '    <img class="cover-img" src="' + imagePath(item.id) + '" alt="' + safe(item.title) + '" loading="lazy" data-cover>',
        '  </div>',
        '  <div class="movie-card-body">',
        '    <div class="card-meta"><span>' + safe(item.region) + '</span><span>' + safe(item.year) + '</span></div>',
        '    <h3>' + safe(item.title) + '</h3>',
        '    <p>' + safe(item.oneLine) + '</p>',
        '    <div class="card-tags"><span>' + safe(item.type) + '</span><span>' + safe(item.genre) + '</span></div>',
        '  </div>',
        '</a>'
      ].join('');
    };

    var render = function () {
      var keyword = (input.value || '').trim().toLowerCase();
      var regionValue = region.value;
      var typeValue = type.value;
      var yearValue = year.value;

      var filtered = window.SEARCH_INDEX.filter(function (item) {
        var haystack = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(' ').toLowerCase();
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okRegion = !regionValue || item.regionGroup === regionValue;
        var okType = !typeValue || item.typeGroup === typeValue;
        var okYear = !yearValue || item.year === yearValue;
        return okKeyword && okRegion && okType && okYear;
      }).slice(0, 120);

      count.textContent = '找到 ' + filtered.length + ' 条相关影片';

      if (!filtered.length) {
        searchResults.innerHTML = '<div class="empty-state">没有找到匹配影片</div>';
        return;
      }

      searchResults.innerHTML = filtered.map(card).join('');

      searchResults.querySelectorAll('img[data-cover]').forEach(function (img) {
        img.addEventListener('error', function () {
          img.classList.add('is-hidden');
        });
      });
    };

    [input, region, type, year].forEach(function (el) {
      if (el) {
        el.addEventListener('input', render);
        el.addEventListener('change', render);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        input.value = '';
        region.value = '';
        type.value = '';
        year.value = '';
        render();
      });
    }

    render();
  }
})();
