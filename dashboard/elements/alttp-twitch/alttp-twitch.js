(function () {
	'use strict';

	const experimentalTwitch = nodecg.Replicant('experimentalTwitch');

	class AlttpTwitch extends Polymer.Element {
		static get is() {
			return 'alttp-twitch';
		}

		static get properties() {
			return {};
		}

		ready() {
			super.ready();
			Polymer.RenderStatus.beforeNextRender(this, () => {
				experimentalTwitch.on('change', newVal => {
					this.$.cycleToggle.checked = newVal;
				});

			});
		}

		_handleCycleToggleChange(e) {
			experimentalTwitch.value = e.target.checked;
		}

	}

	customElements.define(AlttpTwitch.is, AlttpTwitch);
})();
