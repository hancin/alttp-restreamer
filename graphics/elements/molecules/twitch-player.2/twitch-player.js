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
				drawProps: {
					type: Object,
					default: {stop: false}
				}
			}
		}

		clear() {
			this.timerContext.clearRect(0, 0, 178, 47);
			this.gameContext.clearRect(0, 0, 558, 446);
		}

		draw(self){
			if(self.videoSource.paused || self.videoSource.ended || self.drawProps.stop)
				return ;
	
			self.timerContext.drawImage(self.videoSource,0,0,178,47);
			self.gameContext.drawImage(self.videoSource,0,0,558,446);
			window.requestAnimationFrame(self.cb);
		}


		_streamChanged(newVal, oldVal){
			const video = this.$.video;
			const $this = this;
			if(this.drawProps === undefined){
				this.drawProps = {stop: false};
			}

			this.timerContext = this.$.timer.getContext('2d');
			this.gameContext = this.$.game.getContext('2d');
			this.drawProps.stop = false;

			videojs(video, {}, () => {
				video.play();
				const cb = () => $this.draw({timerContext: this.timerContext,gameContext: this.gameContext,videoSource: video, drawProps: this.drawProps, cb: cb});
				window.requestAnimationFrame(cb);
			});
				
			if(!newVal || newVal.hlsUrl == ""){
				this.currentStreamUrl = "";
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
					
				video.src = newVal.hlsUrl;
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
