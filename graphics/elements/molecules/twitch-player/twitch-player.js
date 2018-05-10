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

			var hls = new Hls();

			twitchPlayerStreams.on('change', newVal =>{
				console.log(newVal);
				if(!newVal)
					return;
				if(newVal[this.runnerStream] === undefined)
					return;

				if(!newVal[this.runnerStream].isLoaded){
					video.stop();
					hls.detachMedia();
					return;
				}

				this.streamObject = newVal[this.runnerStream];
				const resolution = this._autoDownscaleTo720p(this.streamObject.streamInfo.resolution.split("x"));
				console.log(video.style);
				video.style.width = resolution[0]+"px";
				video.style.height = resolution[1]+"px";
				hls.loadSource(this.streamObject.streamInfo.url);
				hls.attachMedia(video);
			});

			hls.on(Hls.Events.MANIFEST_PARSED,function() {
				video.play();
			});
            
		}

		
		_autoDownscaleTo720p(resolution) {
			const srcRes = {width: parseInt(resolution[0]), height: parseInt(resolution[1])};

			const scale = Math.min(srcRes.width / 1280, srcRes.height / 720);

			return [srcRes.width / scale, srcRes.height / scale];
		}

	}

	customElements.define(TwitchPlayer.is, TwitchPlayer);
})();
