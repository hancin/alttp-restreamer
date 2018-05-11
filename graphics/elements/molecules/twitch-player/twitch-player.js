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

		drawTimer() {
			const {video, context, width, height} = this.savedParams;

			if(video.paused || video.ended)
				return false;

			//context.drawImage(video,1020, 58, 249, 43, 0, 0, width, height);
			context.drawImage(video,0,0,width,height);
		}
	
		_checkElapsedTime(timestamp){
			this.drawTimer();
			window.requestAnimationFrame(this._checkElapsedTime.bind(this));
		}
	

		_streamChanged(newVal, oldVal){
			const video = this.$.video;
			if(!this.hls){
				this.hls = new Hls();
				this.hls.on(Hls.Events.MANIFEST_PARSED,function() {
					video.play();
				});

				const canvas = this.$.timer;
				const context = canvas.getContext('2d');
				canvas.width = 178;
				canvas.height = 47;
				const $this = this;
				this.animationTime = 0;


				video.addEventListener('play', (function() {
					$this.savedParams = {
						video: this,
						context: context,
						width: canvas.width,
						height: canvas.height
					}
					window.requestAnimationFrame($this._checkElapsedTime.bind($this));

				}));
			}
			if(!newVal || newVal.hlsUrl == ""){
				this.currentStreamUrl = "";
				this.hls.detachMedia(video);
				video.src = '';
				return;
			}
			video.muted = newVal.muted;
			video.volume = newVal.volume;

			let isReloading = false;

			if(newVal.hlsUrl != this.currentStreamUrl || newVal.forceReloadClient){

				isReloading = true;
				this.currentStreamUrl = newVal.hlsUrl;
					
				const [width, height] = this._autoDownscaleTo448p(newVal.resolution);
				const [x, y] = [14, 8];
				const [w, h] = [860 / 1.6, 703 / 1.6];

				video.width = 860;
				video.height = 446;
				video.style.marginLeft = `-${x}px`;
				video.style.marginTop = `-${y}px`;

				this.hls.attachMedia(video);
				this.hls.loadSource(this.currentStreamUrl);
			}

			
			if(video.paused != newVal.paused){
				if(newVal.paused)
					video.pause();
				else if(!isReloading)
					video.play();
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
