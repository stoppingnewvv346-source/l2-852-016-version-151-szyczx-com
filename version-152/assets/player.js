import { H as Hls } from './hls-vendor-dru42stk.js';

var players = document.querySelectorAll('[data-player]');

players.forEach(function (video) {
  var source = video.getAttribute('data-stream');
  var frame = video.closest('.player-frame');
  var layer = frame ? frame.querySelector('.play-layer') : null;
  var status = frame ? frame.querySelector('.player-status') : null;
  var ready = false;
  var hls = null;

  var setStatus = function (message) {
    if (!status) {
      return;
    }

    if (message) {
      status.textContent = message;
      status.classList.add('visible');
    } else {
      status.textContent = '';
      status.classList.remove('visible');
    }
  };

  var load = function () {
    if (ready || !source) {
      return;
    }

    ready = true;
    setStatus('正在加载影片');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        setStatus('');
      }, { once: true });
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus('');
      });

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus('视频加载失败，请稍后重试');
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
      return;
    }

    setStatus('当前浏览器不支持播放');
  };

  var play = function () {
    load();

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        setStatus('点击播放器开始观看');
      });
    }
  };

  load();

  if (layer) {
    layer.addEventListener('click', play);
  }

  video.addEventListener('play', function () {
    if (layer) {
      layer.classList.add('hidden');
    }
    setStatus('');
  });

  video.addEventListener('pause', function () {
    if (layer && video.currentTime === 0) {
      layer.classList.remove('hidden');
    }
  });
});
