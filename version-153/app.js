
const STREAM_SOURCES = [
  'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e398cb38b257828eeedbcaa0ae2856da/manifest/video.m3u8',
  'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/77ae15566dde5cfb920bae4712a38399/manifest/video.m3u8',
  'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/41cb67b47a3668efaea014219666e659/manifest/video.m3u8',
  'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/31227358d3c181b7168e28ad248cfb4e/manifest/video.m3u8',
  'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/d0af4221b8947fda8c23f4955947cb58/manifest/video.m3u8',
  'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/e70b98acb53eb889d108057988609efb/manifest/video.m3u8',
  'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/86ea18f9954dbaf22eff5e16c41b4a25/manifest/video.m3u8',
  'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/2df81e778442675885257ce3e84c7173/manifest/video.m3u8',
  'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/af3d3f3b4940cee04efcd8ff2c9eef0a/manifest/video.m3u8',
  'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/60b4ddb3d166e1239abfc7adf611a6a3/manifest/video.m3u8',
  'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/a27121d514ff0079e1e81a6678f14e0c/manifest/video.m3u8',
  'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/f0d38b8679a1231eff816a8e04cc1a0c/manifest/video.m3u8',
  'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/c66b5309b3b64d15ed856810d6cc0b72/manifest/video.m3u8',
  'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/c99d86ece73a935b77e57d322461ddb5/manifest/video.m3u8',
  'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/fe0c41d994d01211debb24e84e3384a9/manifest/video.m3u8',
  'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/929fdb8e536c1fc43a83b32d1a838547/manifest/video.m3u8',
  'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/fbc04ae173a0e633458658e80ee78c2a/manifest/video.m3u8',
  'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/0ba4f146b0e6ea192526706f495d460f/manifest/video.m3u8',
  'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/1e53f0e1aef7ec2fb5f30ef5d309d69c/manifest/video.m3u8',
  'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/1116997bf50b78f22bbfaced8975a021/manifest/video.m3u8'
];

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function initNav() {
  const toggle = $('[data-nav-toggle]');
  const nav = $('[data-nav]');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) nav.classList.remove('open');
  });
}

function initHeroCarousel() {
  const wrap = $('[data-carousel]');
  if (!wrap) return;
  const slides = $$('.hero-slide', wrap);
  const prev = $('[data-carousel-prev]');
  const next = $('[data-carousel-next]');
  if (!slides.length) return;
  let index = 0;
  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, n) => s.classList.toggle('active', n === index));
  }
  show(0);
  const timer = setInterval(() => show(index + 1), 5200);
  [prev, next].forEach(btn => btn && btn.addEventListener('click', () => {
    clearInterval(timer);
    show(index + (btn === next ? 1 : -1));
  }));
}

function normalize(str) {
  return (str || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function initSearch() {
  const input = $('[data-search-box]');
  const scope = $('[data-search-scope]');
  if (!input || !scope) return;
  const cards = $$('[data-search-item]', scope);
  const count = $('[data-search-count]');
  const filter = () => {
    const keyword = normalize(input.value);
    let visible = 0;
    cards.forEach(card => {
      const text = normalize(card.getAttribute('data-search-item'));
      const ok = !keyword || text.includes(keyword);
      card.classList.toggle('hidden', !ok);
      if (ok) visible += 1;
    });
    if (count) count.textContent = String(visible);
  };
  input.addEventListener('input', filter);
  filter();
}

function pickSource(seed) {
  const n = STREAM_SOURCES.length;
  const idx = ((seed * 7 + 3) % n + n) % n;
  return idx;
}

function initPlayer() {
  const video = $('[data-player]');
  if (!video) return;
  const seedMeta = $('[data-stream-seed]');
  const seed = parseInt(seedMeta?.content || '1', 10) || 1;
  const baseIndex = pickSource(seed);
  const sourceButtons = $('[data-source-buttons]');
  const label = $('[data-source-label]');
  const playButton = $('[data-play-btn]');
  let current = baseIndex;

  function setSource(i) {
    current = ((i % STREAM_SOURCES.length) + STREAM_SOURCES.length) % STREAM_SOURCES.length;
    const src = STREAM_SOURCES[current];
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      if (video._hls) { video._hls.destroy(); }
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      video._hls = hls;
    } else {
      video.src = src;
    }
    if (label) label.textContent = `线路 ${current + 1}`;
    if (sourceButtons) {
      $$('.source-btn', sourceButtons).forEach((btn, idx) => btn.classList.toggle('active', idx === current));
    }
  }

  function buildButtons() {
    if (!sourceButtons) return;
    sourceButtons.innerHTML = '';
    const picks = [current, (current + 1) % STREAM_SOURCES.length, (current + 5) % STREAM_SOURCES.length];
    [...new Set(picks)].forEach((idx) => {
      const btn = document.createElement('button');
      btn.className = 'source-btn';
      btn.type = 'button';
      btn.textContent = `线路 ${idx + 1}`;
      btn.addEventListener('click', () => { setSource(idx); video.play().catch(() => {}); });
      sourceButtons.appendChild(btn);
    });
  }

  setSource(baseIndex);
  buildButtons();
  if (playButton) playButton.addEventListener('click', () => video.play().catch(() => {}));
  video.addEventListener('error', () => {
    const nextIndex = (current + 1) % STREAM_SOURCES.length;
    if (nextIndex !== current) {
      setSource(nextIndex);
      video.play().catch(() => {});
    }
  });
}

function initTabs() {
  const tabs = $$('[data-tab]');
  if (!tabs.length) return;
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const name = tab.getAttribute('data-tab');
      $$('[data-tab-panel]').forEach(panel => panel.classList.toggle('hidden', panel.getAttribute('data-tab-panel') !== name));
      tabs.forEach(t => t.classList.toggle('active', t === tab));
    });
  });
}

function initBackToTop() {
  const btn = $('[data-top]');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.style.opacity = window.scrollY > 700 ? '1' : '0';
    btn.style.pointerEvents = window.scrollY > 700 ? 'auto' : 'none';
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

window.addEventListener('DOMContentLoaded', () => {
  initNav();
  initHeroCarousel();
  initSearch();
  initPlayer();
  initTabs();
  initBackToTop();
});
