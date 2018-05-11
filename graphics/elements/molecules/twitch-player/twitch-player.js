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

		clear() {
			this.timerContext.clearRect(0, 0, 178, 47);
			this.gameContext.clearRect(0, 0, 558, 446);
		}

		draw(self){
			if(self.videoSource.paused || self.videoSource.ended)
				return ;
	
			self.timerContext.drawImage(self.videoSource,0,0,178,47);
			self.gameContext.drawImage(self.videoSource,0,0,558,446);
			window.requestAnimationFrame(self.cb);
		}

		_streamChanged(newVal, oldVal){
			const video = this.$.video;
			const $this = this;
			if(!this.hls){
				this.hls = new Hls();
				this.hls.on(Hls.Events.MANIFEST_PARSED,function() {
					video.play();
				});

				this.timerContext = this.$.timer.getContext('2d');
				this.gameContext = this.$.game.getContext('2d');
				
				const cb = () => $this.draw({timerContext: this.timerContext,gameContext: this.gameContext,videoSource: video, cb: cb});

				video.addEventListener('play', function() {
					window.requestAnimationFrame(cb);
				});
			}
			if(!newVal || newVal.hlsUrl == ""){
				this.currentStreamUrl = "";
				this.hls.detachMedia(video);
				video.src = '';
				window.requestAnimationFrame($this.clear.bind($this));
				return;
			}
			video.muted = newVal.muted;
			video.volume = newVal.volume;

			let isReloading = false;

			if(newVal.hlsUrl != this.currentStreamUrl || newVal.forceReloadClient){

				console.log(newVal.hlsUrl);
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
