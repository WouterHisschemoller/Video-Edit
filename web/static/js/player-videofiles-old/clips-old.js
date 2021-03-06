/**
 * Manages the video clips.
 *
 * A fixed amount of video clip objects are available.
 * If a video should start an available clip object is taken from idleClips.
 * The clip is started and pushed to activeClips.
 * Clips are played from old to new.
 * When a clip stops it is moved back to idleClips.
 */

var WH = WH || {};

(function(WH) {

    WH.createClips = function(specs = {}, my = {}) {

        let that,
            numClips = 30,
            idleClips = [],
            activeClips = [],
            stoppedClips = [],

            init = function() {
                for (var i = 0; i < numClips; i++) {
                    idleClips.push(WH.createClip());
                }
            },

            startClips = function(clipData, isCapture) {
                let clip;
                for (let i = 0, n = clipData.length; i < n; i++) {
                    if (idleClips.length) {
                        clip = idleClips.pop();
                        clip.start(clipData[i], isCapture);
                        activeClips.push(clip);
                    }
                }
            },

            stopClips = function() {
                idleClips = idleClips.concat(stoppedClips);
                stoppedClips = [];
                activeClips = activeClips.filter(clip => clip.getIsPlaying());
            },

            draw = function(time, ctx) {
                let clip;
                for (let i = 0, n = activeClips.length; i < n; i++) {
                    clip = activeClips[i];
                    clip.update(time);
                    if (clip.getIsPlaying()) {
                        clip.draw(ctx);
                    } else {
                        stoppedClips.push(clip);
                    }
                }

                if (stoppedClips.length) {
                    stopClips();
                }
            },

            capture = function(time, ctx, framerate) {
                let clip;
                for (let i = 0, n = activeClips.length; i < n; i++) {
                    clip = activeClips[i];
                    clip.update(time);
                    if (clip.getIsPlaying()) {
                        clip.capture(ctx, framerate);
                    } else {
                        stoppedClips.push(clip);
                    }
                }

                if (stoppedClips.length) {
                    stopClips();
                }
            };

        that = specs.that || {};

        init();

        that.startClips = startClips;
        that.draw = draw;
        that.capture = capture;
        return that;
    };

})(WH);
