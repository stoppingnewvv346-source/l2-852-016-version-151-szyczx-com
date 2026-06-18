(() => {
  const toggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, itemIndex) => {
        slide.classList.toggle('active', itemIndex === index);
      });
      dots.forEach((dot, itemIndex) => {
        dot.classList.toggle('active', itemIndex === index);
      });
    };

    const start = () => {
      timer = window.setInterval(() => show(index + 1), 5200);
    };

    const restart = () => {
      window.clearInterval(timer);
      start();
    };

    prev?.addEventListener('click', () => {
      show(index - 1);
      restart();
    });

    next?.addEventListener('click', () => {
      show(index + 1);
      restart();
    });

    dots.forEach((dot, itemIndex) => {
      dot.addEventListener('click', () => {
        show(itemIndex);
        restart();
      });
    });

    start();
  }

  const inputs = Array.from(document.querySelectorAll('.js-search'));
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const cards = Array.from(document.querySelectorAll('[data-card]'));
  let activeFilter = 'all';

  const queryFromUrl = new URLSearchParams(window.location.search).get('q');

  if (queryFromUrl && inputs.length) {
    inputs[0].value = queryFromUrl;
  }

  const applyFilter = () => {
    const term = inputs.map((input) => input.value.trim().toLowerCase()).find(Boolean) || '';

    cards.forEach((card) => {
      const haystack = (card.dataset.search || '').toLowerCase();
      const category = card.dataset.category || '';
      const matchedText = !term || haystack.includes(term);
      const matchedCategory = activeFilter === 'all' || category === activeFilter;
      card.classList.toggle('is-hidden', !(matchedText && matchedCategory));
    });
  };

  inputs.forEach((input) => {
    input.addEventListener('input', applyFilter);
  });

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter || 'all';
      filterButtons.forEach((item) => item.classList.toggle('active', item === button));
      applyFilter();
    });
  });

  if (queryFromUrl) {
    applyFilter();
  }

  document.querySelectorAll('.player-card').forEach((player) => {
    const video = player.querySelector('video');
    const overlay = player.querySelector('.player-overlay');
    const source = player.dataset.stream;
    let loaded = false;
    let hls = null;

    const revealOverlay = (text) => {
      if (!overlay) {
        return;
      }
      const label = overlay.querySelector('strong');
      if (label && text) {
        label.textContent = text;
      }
      overlay.classList.remove('is-hidden');
    };

    const prepare = () => {
      if (!video || !source || loaded) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        loaded = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, (event, data) => {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            revealOverlay('暂时无法播放');
          }
        });
        loaded = true;
        return;
      }

      video.src = source;
      loaded = true;
    };

    const play = async () => {
      if (!video) {
        return;
      }
      prepare();
      overlay?.classList.add('is-hidden');
      try {
        await video.play();
      } catch (error) {
        revealOverlay('点击继续播放');
      }
    };

    overlay?.addEventListener('click', play);

    video?.addEventListener('play', () => {
      overlay?.classList.add('is-hidden');
    });

    video?.addEventListener('pause', () => {
      if (!video.ended) {
        revealOverlay('继续播放');
      }
    });

    video?.addEventListener('ended', () => {
      revealOverlay('重新播放');
    });

    window.addEventListener('pagehide', () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
