var playerBlocks = document.querySelectorAll("[data-player]");

playerBlocks.forEach(function (block) {
    var video = block.querySelector("video");
    var overlay = block.querySelector(".player-overlay");
    var trigger = block.querySelector(".play-trigger");
    var source = video ? video.getAttribute("data-src") : "";
    var isReady = false;
    var loading = false;
    var hlsInstance = null;

    async function prepareVideo() {
        if (!video || !source || isReady || loading) {
            return;
        }

        loading = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            isReady = true;
            loading = false;
            return;
        }

        try {
            var module = await import("./hls.js");
            var Hls = module.H || module.default;

            if (Hls && Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                await new Promise(function (resolve) {
                    var resolved = false;

                    function finish() {
                        if (!resolved) {
                            resolved = true;
                            resolve();
                        }
                    }

                    hlsInstance.on(Hls.Events.MANIFEST_PARSED, finish);
                    hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            finish();
                        }
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    window.setTimeout(finish, 1500);
                });

                isReady = true;
            } else {
                video.src = source;
                isReady = true;
            }
        } catch (error) {
            video.src = source;
            isReady = true;
        }

        loading = false;
    }

    async function startPlayback() {
        if (!video) {
            return;
        }

        await prepareVideo();
        video.setAttribute("controls", "controls");

        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener("click", startPlayback);
    }

    if (trigger) {
        trigger.addEventListener("click", function (event) {
            event.stopPropagation();
            startPlayback();
        });
    }

    if (video) {
        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });
    }

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
});
