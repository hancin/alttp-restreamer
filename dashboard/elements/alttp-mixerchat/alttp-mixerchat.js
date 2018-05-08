(function () {
	'use strict';

	const currentRunExtra = nodecg.Replicant('currentRunExtra');
	/**
	 * @customElement
	 * @polymer
	 */
	class AlttpMixerChat extends Polymer.Element {
		static get is() {
			return 'alttp-mixerchat';
		}

		static get properties() {
			return {
				runners: Array
			}
		}



		ready() {
			super.ready();


			const mixerMap = {
				"ALTTPRandomizer1" : "24200959",
				"ALTTPRandomizer2" : "24203038",
				"ALTTPRandomizer3" : "24204043",
				"ALTTPRandomizer4" : "24216184"
			}
			

			currentRunExtra.on('change', newVal =>{

				if(!newVal)
					return;

				if(newVal.twitchChannel.indexOf("ALTTPRandomizer") === -1)
					return;
					this.mixerChannel = mixerMap[newVal.mixerChannel];
			});


		}


	}

	customElements.define(AlttpMixerChat.is, AlttpMixerChat);
})();
