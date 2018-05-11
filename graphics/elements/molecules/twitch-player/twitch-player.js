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
				isReloading = true;
				this.currentStreamUrl = newVal.hlsUrl;
					
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

	}

	customElements.define(TwitchPlayer.is, TwitchPlayer);
})();
