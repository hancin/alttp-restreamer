(function () {
	'use strict';

	const canSeekSchedule = nodecg.Replicant('canSeekSchedule');
	const currentRun = nodecg.Replicant('currentRun');
	const nextRun = nodecg.Replicant('nextRun');
	const schedule = nodecg.Replicant('schedule');
	const sceneList = nodecg.Replicant('commentatorOBS:sceneList');
	/**
	 * @customElement
	 * @polymer
	 */
	class AlttpObsSetup extends Polymer.Element {
		static get is() {
			return 'alttp-obssetup';
		}

		static get properties() {
			return {
				currentScene: String,
				scenes: Array
			}
		}

		ready() {
			super.ready();

			sceneList.on('change', newVal => {
				if(!newVal)
					return;	
				this.scenes = newVal;
			});


		}



	}

	customElements.define(AlttpObsSetup.is, AlttpObsSetup);
})();
