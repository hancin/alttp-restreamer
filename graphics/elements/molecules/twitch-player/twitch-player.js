(function () {
	'use strict';

	const twitchPlayerStreams = nodecg.Replicant('twitchPlayerStreams');

	class TwitchPlayer extends Polymer.Element 
    {
		static get is() 
        {
			return 'twitch-player';
		}
		static get properties()
		{
			return {
				'runnerStream': String,
				'streamObject': Object
			}
		}

		ready()
		{
            super.ready();
			var video = this.$.video;
			if(Hls.isSupported()) {

				twitchPlayerStreams.on('change', newVal =>{
					if(!newVal)
						return;
					if(newVal[this.runnerStream] === undefined)
						return;

					this.streamObject = newVal[this.runnerStream];

					var hls = new Hls();
					hls.loadSource(this.streamObject.url);
					hls.attachMedia(video);
					hls.on(Hls.Events.MANIFEST_PARSED,function() {
						video.play();
					});
				});
			}
			// hls.js is not supported on platforms that do not have Media Source Extensions (MSE) enabled.
			// When the browser has built-in HLS support (check using `canPlayType`), we can provide an HLS manifest (i.e. .m3u8 URL) directly to the video element throught the `src` property.
			// This is using the built-in support of the plain video element, without using hls.js.
			else if (video.canPlayType('application/vnd.apple.mpegurl')) {
				video.src = 'https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8';
				video.addEventListener('canplay',function() {
					video.play();
				});
			}
            
		}

	}

	customElements.define(TwitchPlayer.is, TwitchPlayer);
})();
