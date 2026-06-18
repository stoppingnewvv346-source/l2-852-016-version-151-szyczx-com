(function () {
    var navToggle = document.querySelector(".nav-toggle");
    var navMenu = document.querySelector(".nav-menu");

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", function () {
            var open = navMenu.classList.toggle("open");
            navToggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var searchForm = document.querySelector("[data-search-form]");
    var searchInput = document.querySelector("[data-search-input]");
    var searchResults = document.querySelector("[data-search-results]");

    function renderSearch(query) {
        if (!searchResults || !window.MOVIES_DATA) {
            return;
        }

        var keyword = (query || "").trim().toLowerCase();
        var data = window.MOVIES_DATA;

        var results = keyword
            ? data.filter(function (item) {
                return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine]
                    .join(" ")
                    .toLowerCase()
                    .indexOf(keyword) > -1;
            }).slice(0, 80)
            : data.slice(0, 32);

        if (!results.length) {
            searchResults.innerHTML = '<div class="empty-state">没有找到匹配内容</div>';
            return;
        }

        searchResults.innerHTML = results.map(function (item) {
            var tags = item.tags.split(",").filter(Boolean).slice(0, 3).map(function (tag) {
                return "<span>" + escapeHtml(tag) + "</span>";
            }).join("");

            return '<article class="movie-card">' +
                '<a class="card-poster" href="' + item.url + '">' +
                    '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                    '<span class="play-mark">▶</span>' +
                '</a>' +
                '<div class="card-body">' +
                    '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
                    '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
                    '<p>' + escapeHtml(item.oneLine) + '</p>' +
                    '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
            '</article>';
        }).join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    if (searchInput && searchResults) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        searchInput.value = initial;
        renderSearch(initial);

        searchInput.addEventListener("input", function () {
            renderSearch(searchInput.value);
        });
    }

    if (searchForm) {
        searchForm.addEventListener("submit", function (event) {
            event.preventDefault();
            renderSearch(searchInput ? searchInput.value : "");
        });
    }
})();
