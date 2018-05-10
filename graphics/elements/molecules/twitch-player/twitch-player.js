(function () {
	'use strict';


	class TwitchPlayer extends Polymer.Element 
    {
		static get is() 
        {
			return 'twitch-player';
		}
		static get properties()
		{
			return {
				stream: {
					type: Object,
					observer: '_streamChanged'
				},
				currentStreamUrl: String,
			}
		}

		_streamChanged(newVal, oldVal){
			if(!this.hls){
				this.hls = new Hls();
				this.hls.on(Hls.Events.MANIFEST_PARSED,function() {
					video.play();
				});
			}
			const video = this.$.video;
			console.log(newVal);
			if(!newVal || newVal.hlsUrl == ""){
				this.currentStreamUrl = "";
				video.pause();
				this.hls.detachMedia(video);
				video.src = '';
				return;
			}
			video.muted = newVal.muted;
			video.volume = newVal.volume;

			if(newVal.hlsUrl != this.currentStreamUrl){

				if(!video.paused)
					video.pause();
				this.currentStreamUrl = newVal.hlsUrl;
					
				const [width, height] = this._autoDownscaleTo448p(newVal.resolution);
				video.style.width = width+"px";
				video.style.height = height+"px";

				this.hls.attachMedia(video);
				this.hls.loadSource(this.currentStreamUrl);
			}

		}

		ready()
		{
            super.ready();

		}

		
		_autoDownscaleTo448p([width, height]) {
			const scale = Math.min(width / 793, height / 446);
			return [width / scale, height / scale];
		}

	}

	customElements.define(TwitchPlayer.is, TwitchPlayer);
})();
