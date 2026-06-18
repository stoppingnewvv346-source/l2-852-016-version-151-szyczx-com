(function () {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mainNav = document.querySelector('[data-main-nav]');
    var searchToggle = document.querySelector('[data-search-toggle]');
    var searchBar = document.querySelector('[data-search-bar]');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function () {
            mainNav.classList.toggle('is-open');
        });
    }

    if (searchToggle && searchBar) {
        searchToggle.addEventListener('click', function () {
            searchBar.classList.toggle('is-open');
            var input = searchBar.querySelector('input');
            if (input && searchBar.classList.contains('is-open')) {
                input.focus();
            }
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
        var index = 0;

        function showSlide(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
            });
        });

        setInterval(function () {
            showSlide(index + 1);
        }, 5200);
    }

    var filterInput = document.querySelector('[data-filter-input]');
    if (filterInput) {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        filterInput.addEventListener('input', function () {
            var keyword = filterInput.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-tags') || '',
                    card.getAttribute('data-genre') || '',
                    card.textContent || ''
                ].join(' ').toLowerCase();
                card.style.display = text.indexOf(keyword) >= 0 ? '' : 'none';
            });
        });
    }
}());
