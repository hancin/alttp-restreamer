(function () {
	'use strict';

	const canSeekSchedule = nodecg.Replicant('canSeekSchedule');
	const currentRun = nodecg.Replicant('currentRun');
	const nextRun = nodecg.Replicant('nextRun');
	const schedule = nodecg.Replicant('schedule');

	/**
	 * @customElement
	 * @polymer
	 */
	class AlttpObsSetup extends Polymer.Element {
		static get is() {
			return 'alttp-obssetup';
		}

		ready() {
			super.ready();

			
		}


	}

	customElements.define(AlttpObsSetup.is, AlttpObsSetup);
})();
