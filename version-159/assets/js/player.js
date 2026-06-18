(function () {
    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
        script.onload = callback;
        script.onerror = function () {
            callback(new Error('load'));
        };
        document.head.appendChild(script);
    }

    window.initMoviePlayer = function (sourceUrl) {
        var shell = document.querySelector('[data-player-shell]');
        var video = document.querySelector('[data-video]');
        var cover = document.querySelector('[data-player-cover]');
        var button = document.querySelector('[data-player-button]');
        var message = document.querySelector('[data-player-message]');
        var attached = false;
        var hlsInstance = null;

        if (!shell || !video || !sourceUrl) {
            return;
        }

        function showMessage(text) {
            if (message) {
                message.textContent = text;
                message.classList.add('is-visible');
            }
        }

        function attachSource(done) {
            if (attached) {
                done();
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
                attached = true;
                done();
                return;
            }

            loadHls(function (error) {
                if (!error && window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(sourceUrl);
                    hlsInstance.attachMedia(video);
                    attached = true;
                    done();
                } else {
                    showMessage('视频暂时无法播放，请稍后再试');
                }
            });
        }

        function start() {
            attachSource(function () {
                if (cover) {
                    cover.classList.add('is-hidden');
                }
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        if (button) {
                            button.focus();
                        }
                    });
                }
            });
        }

        if (button) {
            button.addEventListener('click', start);
        }
        if (cover) {
            cover.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (!attached || video.paused) {
                start();
            } else {
                video.pause();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
}());
