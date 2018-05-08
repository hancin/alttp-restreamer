(function () {
	'use strict';

	const currentOperator = nodecg.Replicant('currentOperator');
	const runnersRep = nodecg.Replicant('runners');
	/**
	 * @customElement
	 * @polymer
	 */
	class AlttpOperatorSetup extends Polymer.Element {
		static get is() {
			return 'alttp-operatorsetup';
		}

		static get properties() {
			return {
				runners: Array,
				operatorName: String
			}
		}



		ready() {
			super.ready();

			runnersRep.on('change', newVal => {
				if(!newVal)
					return;
				
					this.runners = Object.values(newVal);
			});

			currentOperator.on('change', newVal =>{
				if(!newVal)
					return;

				this.operatorName = newVal.name;
			});


		}

		saveSettings() {
			nodecg.sendMessage('updateOperator', this.operatorName, () => {
				console.log('update ok?');
			});
		}


	}

	customElements.define(AlttpOperatorSetup.is, AlttpOperatorSetup);
})();
