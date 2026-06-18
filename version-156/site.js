
(function () {
  const onReady = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  };

  const clamp = (str, len) => {
    if (!str) return '';
    const s = String(str).replace(/\s+/g, ' ').trim();
    return s.length > len ? s.slice(0, len - 1) + '…' : s;
  };

  const initMobileNav = () => {
    const toggle = document.querySelector('[data-nav-toggle]');
    const menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => {
      const show = menu.classList.toggle('hidden');
      toggle.setAttribute('aria-expanded', String(!show));
    });
  };

  const initBackToTop = () => {
    const btn = document.querySelector('[data-back-top]');
    if (!btn) return;
    const showBtn = () => {
      if (window.scrollY > 520) btn.classList.add('is-show');
      else btn.classList.remove('is-show');
    };
    window.addEventListener('scroll', showBtn, { passive: true });
    showBtn();
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const initHeroCarousel = () => {
    const root = document.querySelector('[data-hero-carousel]');
    if (!root) return;
    const slides = Array.from(root.querySelectorAll('[data-slide]'));
    const dots = Array.from(root.querySelectorAll('[data-dot]'));
    const prev = root.querySelector('[data-prev]');
    const next = root.querySelector('[data-next]');
    if (!slides.length) return;
    let active = 0;
    let timer = null;

    const go = (n) => {
      active = (n + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === active));
      dots.forEach((dot, i) => {
        dot.classList.toggle('bg-white', i === active);
        dot.classList.toggle('bg-white/35', i !== active);
        dot.classList.toggle('opacity-100', i === active);
        dot.classList.toggle('opacity-60', i !== active);
      });
    };

    const resume = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => go(active + 1), 5500);
    };

    if (prev) prev.addEventListener('click', () => { go(active - 1); resume(); });
    if (next) next.addEventListener('click', () => { go(active + 1); resume(); });
    dots.forEach((dot, idx) => dot.addEventListener('click', () => { go(idx); resume(); }));
    root.addEventListener('mouseenter', () => timer && clearInterval(timer));
    root.addEventListener('mouseleave', resume);
    go(0);
    resume();
  };

  const initFilterBlocks = () => {
    const roots = document.querySelectorAll('[data-filter-root]');
    roots.forEach((root) => {
      const input = root.querySelector('[data-filter-input]');
      const select = root.querySelector('[data-filter-select]');
      const cards = Array.from(root.querySelectorAll('[data-filter-item]'));
      const count = root.querySelector('[data-visible-count]');
      if (!input && !select) return;

      const apply = () => {
        const keyword = input ? input.value.trim().toLowerCase() : '';
        const bucket = select ? select.value : 'all';
        let visible = 0;
        cards.forEach((card) => {
          const text = (card.getAttribute('data-search-text') || card.textContent || '').toLowerCase();
          const cardBucket = card.getAttribute('data-bucket') || 'all';
          const okKeyword = !keyword || text.includes(keyword);
          const okBucket = bucket === 'all' || bucket === cardBucket;
          const show = okKeyword && okBucket;
          card.style.display = show ? '' : 'none';
          if (show) visible += 1;
        });
        if (count) count.textContent = String(visible);
      };

      if (input) input.addEventListener('input', apply);
      if (select) select.addEventListener('change', apply);
      apply();
    });
  };

  const initPlayer = () => {
    const root = document.querySelector('[data-player-root]');
    if (!root) return;
    const button = root.querySelector('[data-player-button]');
    const video = root.querySelector('video');
    const overlay = root.querySelector('[data-player-overlay]');
    const poster = root.getAttribute('data-player-poster') || '';
    const source = root.getAttribute('data-player-src') || '';
    const title = root.getAttribute('data-player-title') || '';
    let hlsInstance = null;
    let loaded = false;

    const start = async () => {
      if (!video || loaded) {
        try { await video.play(); } catch (e) {}
        return;
      }
      loaded = true;
      if (overlay) overlay.classList.add('hidden');
      if (poster) video.setAttribute('poster', poster);
      if (window.Hls && Hls.isSupported()) {
        hlsInstance = new Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, async () => {
          try { await video.play(); } catch (e) {}
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', async function once() {
          video.removeEventListener('loadedmetadata', once);
          try { await video.play(); } catch (e) {}
        });
      } else {
        video.src = source;
        try { await video.play(); } catch (e) {}
      }
      video.controls = true;
      if (title) video.setAttribute('aria-label', title);
    };

    if (button) button.addEventListener('click', start);
    if (overlay) overlay.addEventListener('click', start);
    video.addEventListener('play', () => { if (overlay) overlay.classList.add('hidden'); });
    video.addEventListener('pause', () => { if (overlay) overlay.classList.remove('hidden'); });
    root.dataset.ready = '1';
  };

  const initSmoothAnchors = () => {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  };

  onReady(() => {
    initMobileNav();
    initHeroCarousel();
    initFilterBlocks();
    initPlayer();
    initBackToTop();
    initSmoothAnchors();
  });
})();
