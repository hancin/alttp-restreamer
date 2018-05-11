(function () {
	'use strict';

	const currentRunExtra = nodecg.Replicant('currentRunExtra');
	/**
	 * @customElement
	 * @polymer
	 */
	class AlttpTwitchChat extends Polymer.Element {
		static get is() {
			return 'alttp-twitchchat';
		}

		static get properties() {
			return {
				runners: Array
			}
		}



		ready() {
			super.ready();
	
			currentRunExtra.on('change', newVal =>{

				if(!newVal)
					return;

				if(newVal.twitchChannel.indexOf("ALTTPRandomizer") === -1
				&& newVal.twitchChannel.indexOf("SpeedGaming") === -1)
				return;
					this.twitchChannel = newVal.twitchChannel;
			});


		}


	}

	customElements.define(AlttpTwitchChat.is, AlttpTwitchChat);
})();
