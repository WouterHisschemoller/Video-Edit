var WH = WH || {};

(function(WH) {

    WH.createPlayer = function(specs = {}, my = {}) {
        let that,
            video,
            canvas,
            ctx,
            data,
            resources,
            // clipData,
            clipDataIndex = 0,
            clipIndex = 0,
            captureCounter,
            captureEndTime,
            frameCounter,
            socket;
            // settings = {
            //     videoPath: null,
            //     clipData: null,
            //     framerate: 30,
            //     canvasHeight: 360,
            //     canvasWidth: 480,
            //     startOffset: 0,
            //     isCapture: false
            // };
            
        const dev = {
                info: true,
                infoTimeEl: document.querySelector('.info__time'),
                startOffset: 0
            },
            clips = [],
            numClips = 8,

            init = function() {
                
                data = WH.createData({
                    dataObject: WH.dataBerlinerDom
                });
                
                resources = WH.createResources({
                    data: data.resources,
                    loadedCallback: onVideosLoaded
                });
                
                canvas = document.getElementById('canvas');
                canvas.width = data.settings.canvasWidth;
                canvas.height = data.settings.canvasHeight;
                ctx = canvas.getContext('2d');
            },
            
            onVideosLoaded = function() {
                console.log('onVideosLoaded');
            },
                
            // setup = function() {
            //     video = document.createElement('video');
            //     video.src = data.resources[0].url;
            //     video.addEventListener('loadeddata', onVideoLoaded);
            // },

            onVideoLoaded = function() {
                // create clips to play video fragments
                for (let i = 0; i < numClips; i++) {
                    clips.push(WH.createClip({
                        video: video.cloneNode()
                    }));
                }

                video.currentTime = settings.startOffset;

                // start later in the video (while developing)
                if (dev.startOffset > 0) {
                    video.currentTime += dev.startOffset;

                    // adjust the clipDataIndex to skip clips
                    let isAllSkipped = true;
                    for (let i = 0, n = clipData.length; i < n; i++) {
                        console.log(clipData[i].start, video.currentTime);
                        clipDataIndex = i;
                        if (clipData[i].start >= video.currentTime) {
                            isAllSkipped = false;
                            break;
                        }
                    }

                    // if all clips skipped
                    if (isAllSkipped && clipData.length > 0) {
                        clipDataIndex = clipData.length;
                    }
                }

                if (settings.isCapture === true) {
                    socket = io.connect('http://localhost:3000');
                    frameCounter = 0;
                    captureCounter = 0;
                    captureEndTime = video.currentTime + 2;
                    capture();
                } else {
                    video.play();
                    draw();
                }
            },

            draw = function() {
                ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

                let isDone = false;
                while (!isDone) {
                    isDone = checkClipData();
                }

                clips.forEach(function(clip) {
                    if (clip.getIsPlaying(video.currentTime)) {
                        clip.draw(ctx);
                    }
                });

                if (dev.info) {
                    dev.infoTimeEl.innerHTML = video.currentTime.toFixed(1);
                }

                requestAnimationFrame(draw);
            },
            
            capture = function() {
                if (captureCounter % 30 === 0) {
                    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                    video.currentTime += 1 / settings.framerate;
                    
                    let isDone = false;
                    while (!isDone) {
                        isDone = checkClipData();
                    }
                    
                    clips.forEach(function(clip) {
                        if (clip.getIsPlaying(video.currentTime)) {
                            clip.capture(ctx, settings.framerate);
                        }
                    });
                    
                    if (dev.info) {
                        dev.infoTimeEl.innerHTML = video.currentTime.toFixed(1);
                    }
                    
                    socket.emit('render-frame', {
                        frame: frameCounter,
                        file: canvas.toDataURL()
                    });
                    
                    frameCounter++;
                }
                
                if (video.currentTime < captureEndTime) {
                    captureCounter++;
                    requestAnimationFrame(capture);
                }
            },

            checkClipData = function() {
                let isNothingToStart = true;
                if (clipDataIndex < clipData.length && clipData[clipDataIndex].start <= video.currentTime) {
                    clips[clipIndex].start(clipData[clipDataIndex], settings.isCapture);
                    clipDataIndex++;
                    clipIndex = (clipIndex + 1) % numClips;
                    isNothingToStart = false;
                }
                return isNothingToStart;
            };

        that = specs.that || {};

        init();

        return that;
    };

})(WH);
