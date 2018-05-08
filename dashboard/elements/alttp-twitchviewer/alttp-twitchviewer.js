(function () {
	'use strict';

	const currentRun = nodecg.Replicant('currentRun');
	/**
	 * @customElement
	 * @polymer
	 */
	class AlttpTwitchViewer extends Polymer.Element {
		static get is() {
			return 'alttp-twitchviewer';
		}

		static get properties() {
			return {
				runners: Array
			}
		}

		ready() {
			super.ready();

			currentRun.on('change', newVal => {
				if(!newVal)
					return;	

				this.runners = newVal.runners.map(x => x.stream);

			});


		}

		_mapToUrl(runners) {
			return `https://kadgar.net/live/${runners.join("/")}`;
		}



	}

	customElements.define(AlttpTwitchViewer.is, AlttpTwitchViewer);
})();
