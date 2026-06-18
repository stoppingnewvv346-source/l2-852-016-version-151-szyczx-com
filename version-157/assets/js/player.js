(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (box) {
    var video = box.querySelector('video');
    var layer = box.querySelector('.player-layer');
    var stream = video ? video.getAttribute('data-stream') : '';
    var hls = null;
    var ready = false;

    function loadAndPlay() {
      if (!video || !stream) {
        return;
      }

      if (!ready) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          ready = true;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls();
          hls.loadSource(stream);
          hls.attachMedia(video);
          ready = true;
        } else {
          video.src = stream;
          ready = true;
        }
      }

      if (layer) {
        layer.classList.add('hidden');
      }

      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (layer) {
      layer.addEventListener('click', loadAndPlay);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!ready || video.paused) {
          loadAndPlay();
        }
      });

      video.addEventListener('play', function () {
        if (layer) {
          layer.classList.add('hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
