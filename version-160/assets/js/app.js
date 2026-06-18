(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var root = document.querySelector('[data-hero-slider]');
        if (!root) {
            return;
        }
        var slides = selectAll('.hero-slide', root);
        var dots = selectAll('[data-hero-dot]', root);
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var filterRoot = document.querySelector('[data-filter-root]');
        var cardArea = document.querySelector('[data-card-area]');
        if (!filterRoot || !cardArea) {
            return;
        }
        var searchInput = filterRoot.querySelector('[data-card-search]');
        var selects = selectAll('[data-card-select]', filterRoot);
        var clear = filterRoot.querySelector('[data-card-clear]');
        var cards = selectAll('.movie-card', cardArea);
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (searchInput && initial) {
            searchInput.value = initial;
        }

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function matchesSelect(card, key, value) {
            if (!value) {
                return true;
            }
            var cardValue = card.getAttribute('data-' + key) || '';
            return cardValue.indexOf(value) !== -1;
        }

        function apply() {
            var query = normalize(searchInput ? searchInput.value : '');
            cards.forEach(function (card) {
                var keywords = normalize(card.getAttribute('data-keywords'));
                var visible = !query || keywords.indexOf(query) !== -1;
                selects.forEach(function (select) {
                    var key = select.getAttribute('data-card-select');
                    if (!matchesSelect(card, key, select.value)) {
                        visible = false;
                    }
                });
                card.classList.toggle('is-hidden', !visible);
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', apply);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });
        if (clear) {
            clear.addEventListener('click', function () {
                if (searchInput) {
                    searchInput.value = '';
                }
                selects.forEach(function (select) {
                    select.value = '';
                });
                apply();
            });
        }
        apply();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
