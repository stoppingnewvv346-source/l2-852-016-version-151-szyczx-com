
(function () {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function toggleMenu() {
    const btn = qs('[data-menu-toggle]');
    const nav = qs('#site-nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  function bindFallbackImages() {
    qsa('img').forEach((img) => {
      img.addEventListener('error', () => {
        const parent = img.parentElement;
        if (parent) parent.classList.add('no-image');
        img.style.display = 'none';
      }, { once: true });
    });
  }

  function applyLocalFilter(root) {
    const input = qs('[data-filter-input]', root);
    const select = qs('[data-filter-select]', root);
    const cards = qsa('[data-card]', root);
    if (!input && !select) return;

    function sync() {
      const q = (input ? input.value : '').trim().toLowerCase();
      const filter = (select ? select.value : '').trim().toLowerCase();

      cards.forEach((card) => {
        const title = (card.dataset.title || '').toLowerCase();
        const tags = (card.dataset.tags || '').toLowerCase();
        const text = title + ' ' + tags;
        const year = (card.dataset.year || '').toLowerCase();
        const type = (card.dataset.type || '').toLowerCase();
        const matchesQuery = !q || text.includes(q);
        const matchesFilter = !filter || filter === 'all' || year === filter || type.includes(filter) || tags.includes(filter);
        card.hidden = !(matchesQuery && matchesFilter);
      });

      const visible = cards.filter((card) => !card.hidden).length;
      const counter = qs('[data-result-count]', root);
      if (counter) counter.textContent = String(visible);
      const empty = qs('[data-empty-state]', root);
      if (empty) empty.hidden = visible !== 0;
    }

    input && input.addEventListener('input', sync);
    select && select.addEventListener('change', sync);
    sync();
  }

  function initSearchPage() {
    const root = qs('[data-search-page]');
    if (!root || !window.MOVIES) return;

    const params = new URLSearchParams(window.location.search);
    const searchInput = qs('[data-search-input]', root);
    const typeSelect = qs('[data-search-type]', root);
    const sortSelect = qs('[data-search-sort]', root);
    const results = qs('#search-results', root);
    const count = qs('[data-search-count]', root);
    const empty = qs('[data-empty-state]', root);

    const movies = Array.isArray(window.MOVIES) ? window.MOVIES.slice() : [];
    let current = params.get('q') || '';

    if (searchInput) searchInput.value = current;
    if (typeSelect) typeSelect.value = params.get('type') || 'all';
    if (sortSelect) sortSelect.value = params.get('sort') || 'relevance';

    function scoreMovie(movie, q) {
      if (!q) return 0;
      const hay = [
        movie.title, movie.region, movie.type, movie.year, movie.genre,
        (movie.tags || []).join(' '), movie.oneLine
      ].join(' ').toLowerCase();
      if (hay === q) return 100;
      let score = 0;
      if (movie.title.toLowerCase().includes(q)) score += 60;
      if ((movie.genre || '').toLowerCase().includes(q)) score += 20;
      if ((movie.region || '').toLowerCase().includes(q)) score += 10;
      if ((movie.type || '').toLowerCase().includes(q)) score += 8;
      if ((movie.oneLine || '').toLowerCase().includes(q)) score += 15;
      if ((movie.tags || []).join(' ').toLowerCase().includes(q)) score += 18;
      return score;
    }

    function render() {
      const q = (searchInput ? searchInput.value : current).trim().toLowerCase();
      const type = (typeSelect ? typeSelect.value : 'all').toLowerCase();
      const sort = sortSelect ? sortSelect.value : 'relevance';

      let list = movies.filter((movie) => {
        const typeText = `${movie.type || ''} ${movie.genre || ''} ${movie.region || ''}`.toLowerCase();
        const qText = `${movie.title || ''} ${movie.region || ''} ${movie.type || ''} ${movie.year || ''} ${movie.genre || ''} ${(movie.tags || []).join(' ')} ${movie.oneLine || ''}`.toLowerCase();
        const typeOk = !type || type === 'all' || typeText.includes(type);
        const qOk = !q || qText.includes(q);
        return typeOk && qOk;
      });

      if (sort === 'year-desc') {
        list.sort((a, b) => Number(b.year || 0) - Number(a.year || 0) || String(a.title).localeCompare(String(b.title), 'zh-Hans-CN'));
      } else if (sort === 'year-asc') {
        list.sort((a, b) => Number(a.year || 0) - Number(b.year || 0) || String(a.title).localeCompare(String(b.title), 'zh-Hans-CN'));
      } else {
        list.sort((a, b) => scoreMovie(b, q) - scoreMovie(a, q) || Number(b.year || 0) - Number(a.year || 0));
      }

      if (count) count.textContent = String(list.length);

      if (results) {
        results.innerHTML = '';
        if (!list.length) {
          if (empty) empty.hidden = false;
          return;
        }
        if (empty) empty.hidden = true;

        const frag = document.createDocumentFragment();
        list.slice(0, 240).forEach((movie, index) => {
          const a = document.createElement('a');
          a.className = 'movie-card movie-card--medium';
          a.href = `movie-${String(movie.id).padStart(4, '0')}.html?q=${encodeURIComponent(q)}`;
          a.dataset.card = '1';
          a.dataset.title = movie.title || '';
          a.dataset.tags = `${movie.tags || []} ${movie.genre || ''} ${movie.region || ''} ${movie.type || ''}`;
          a.dataset.year = String(movie.year || '');
          a.dataset.type = String(movie.type || '');
          a.innerHTML = `
            <div class="movie-thumb">
              <div class="movie-fallback">
                <span>${(movie.title || '').slice(0, 2) || '片'}</span>
                <small>点击观看</small>
              </div>
              <img src="./${movie.cover_idx || 1}.jpg" alt="${movie.title || ''}" loading="lazy">
              <span class="movie-badge">${movie.year || ''}</span>
            </div>
            <div class="movie-body">
              <div class="movie-kicker">
                <span>${movie.region || ''}</span>
                <span>${movie.type || ''}</span>
              </div>
              <h3 class="movie-title">${movie.title || ''}</h3>
              <p class="movie-text">${movie.oneLine || ''}</p>
              <div class="movie-tags">
                ${(movie.tags || []).slice(0, 2).map((tag) => `<span class="chip">${tag}</span>`).join('')}
              </div>
            </div>
          `;
          frag.appendChild(a);
        });
        results.appendChild(frag);
      }
    }

    const submit = qs('[data-search-form]', root);
    if (submit) {
      submit.addEventListener('submit', (ev) => {
        ev.preventDefault();
        render();
        const params = new URLSearchParams();
        const q = searchInput ? searchInput.value.trim() : '';
        const type = typeSelect ? typeSelect.value : 'all';
        const sort = sortSelect ? sortSelect.value : 'relevance';
        if (q) params.set('q', q);
        if (type && type !== 'all') params.set('type', type);
        if (sort && sort !== 'relevance') params.set('sort', sort);
        const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
        history.replaceState(null, '', newUrl);
      });
    }

    [searchInput, typeSelect, sortSelect].forEach((el) => {
      if (el) el.addEventListener('input', render);
      if (el) el.addEventListener('change', render);
    });

    render();
  }

  function initPlayer() {
    const shell = qs('[data-player-shell]');
    if (!shell) return;
    const video = qs('video', shell);
    const trigger = qs('[data-play-trigger]', shell);
    const source = shell.dataset.source;
    const title = shell.dataset.title || document.title;
    const poster = shell.dataset.poster || '';
    const fallbackTitle = qs('[data-fallback-title]', shell);
    const fallbackDesc = qs('[data-fallback-desc]', shell);

    if (fallbackTitle) fallbackTitle.textContent = title;
    if (fallbackDesc) fallbackDesc.textContent = source ? '点击播放按钮即可开始加载 M3U8 视频流。' : '当前页面未绑定播放源。';

    let initialized = false;
    let hlsInstance = null;

    function attachSource() {
      if (initialized || !video || !source) return;
      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            console.warn('HLS fatal error', data);
          }
        });
      } else {
        video.src = source;
      }
    }

    function play() {
      attachSource();
      shell.classList.add('is-playing');
      video.controls = true;
      video.style.display = 'block';
      if (trigger) trigger.hidden = true;
      video.play().catch(() => {
        // keep controls visible even if autoplay is blocked
      });
    }

    if (trigger) trigger.addEventListener('click', play);
    shell.addEventListener('click', (ev) => {
      if (ev.target === shell || ev.target.classList.contains('player-fallback') || ev.target.classList.contains('fallback-mask')) {
        play();
      }
    });
    if (video) {
      video.addEventListener('play', () => shell.classList.add('is-playing'));
      video.addEventListener('loadedmetadata', () => shell.classList.add('is-playing'));
    }
    if (poster && video) {
      video.poster = poster;
    }
  }

  function initPills() {
    qsa('[data-pill-group]').forEach((group) => {
      const pills = qsa('[data-pill]', group);
      const target = qs('[data-pill-target]', group);
      if (!pills.length || !target) return;
      pills.forEach((pill) => {
        pill.addEventListener('click', () => {
          pills.forEach((p) => p.classList.remove('active'));
          pill.classList.add('active');
          const value = pill.dataset.value || 'all';
          const cards = qsa('[data-card]', target);
          cards.forEach((card) => {
            const text = `${card.dataset.tags || ''} ${card.dataset.year || ''} ${card.dataset.type || ''}`.toLowerCase();
            card.hidden = !(value === 'all' || text.includes(value.toLowerCase()));
          });
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    toggleMenu();
    bindFallbackImages();
    initSearchPage();
    initPlayer();
    initPills();
    qsa('[data-filterable-root]').forEach(applyLocalFilter);
  });
})();
