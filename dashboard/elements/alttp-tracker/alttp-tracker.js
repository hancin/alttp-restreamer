(function () {
	'use strict';

	const currentRun = nodecg.Replicant('currentRun');
	const schedule = nodecg.Replicant('schedule');

	/**
	 * @customElement
	 * @polymer
	 */
	class AlttpTracker extends Polymer.Element {
		static get is() {
			return 'alttp-tracker';
		}

		ready() {
			super.ready();


			currentRun.on('change', newVal => {
				if (!newVal) {
					return;
				}

			});
			
		}


	}

	customElements.define(AlttpTracker.is, AlttpTracker);
})();
