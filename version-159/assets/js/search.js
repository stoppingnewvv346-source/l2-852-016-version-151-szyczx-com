(function () {
    var form = document.querySelector('[data-search-page-form]');
    var input = document.querySelector('[data-search-page-input]');
    var results = document.querySelector('[data-search-results]');
    var title = document.querySelector('[data-search-title]');
    var movies = window.SEARCH_MOVIES || [];

    function escapeHtml(value) {
        return String(value).replace(/[&<>"]/g, function (item) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[item];
        });
    }

    function card(movie) {
        var tags = movie.tags.slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return '' +
            '<article class="movie-card movie-card-medium">' +
                '<a class="poster-link" href="' + movie.url + '">' +
                    '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>' +
                '</a>' +
                '<div class="card-body">' +
                    '<a class="card-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>' +
                    '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="meta-line">' +
                        '<span>' + escapeHtml(movie.region) + '</span>' +
                        '<span>' + escapeHtml(movie.type) + '</span>' +
                        '<span>' + escapeHtml(movie.genre) + '</span>' +
                    '</div>' +
                    '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
            '</article>';
    }

    function render(keyword) {
        var query = keyword.trim().toLowerCase();
        var matched = movies.filter(function (movie) {
            var text = [
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                movie.category,
                movie.oneLine,
                movie.tags.join(' ')
            ].join(' ').toLowerCase();
            return !query || text.indexOf(query) >= 0;
        }).slice(0, 120);

        if (title) {
            title.textContent = query ? '搜索：' + keyword.trim() : '全站搜索';
        }

        if (!results) {
            return;
        }

        if (!matched.length) {
            results.innerHTML = '<div class="empty-state">没有找到相关内容</div>';
            return;
        }

        results.innerHTML = '<div class="grid grid-medium">' + matched.map(card).join('') + '</div>';
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
        input.value = initial;
    }
    render(initial);

    if (form && input) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var keyword = input.value.trim();
            var nextUrl = keyword ? './search.html?q=' + encodeURIComponent(keyword) : './search.html';
            history.replaceState(null, '', nextUrl);
            render(keyword);
        });
    }
}());
