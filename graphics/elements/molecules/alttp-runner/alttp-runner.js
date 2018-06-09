(function () {
	'use strict';

	const currentRun = nodecg.Replicant('currentRun');
	const currentRunExtra = nodecg.Replicant('currentRunExtra');
	const stopwatch = nodecg.Replicant('stopwatch');

	class AlttpRunner extends Polymer.Element {
		static get is() {
			return 'alttp-runner';
		}

		static get properties() {
			return {
				itemTrackers: {type:Array, value: []},
				standings: {type:Array, value: [0,0]},
				runner: Object,
				index: Number,
				stream: Object,
				showTwitch: {type:Boolean, value: false}
			};
		}

		ready() {
			super.ready();

			stopwatch.on('change', this.stopwatchChanged.bind(this));

			currentRunExtra.on('change', newVal => {
				if(!newVal)
					return;
				this.password = newVal.password;
				this.set('itemTrackers', newVal.itemTrackers.slice(0));
				this.set('standings', newVal.standings.split('-'));
			});
			
		}

		
		stopwatchChanged(newVal) {
			if(!newVal)
				return;
			this.time = newVal.time.formatted;
			this.results = newVal.results.slice(0);
		}

		calcRunnerStatus(results, index){
			if (!results) {
				return;
			}
			if(results[index] && results[index].forfeit)
				return '';

			if (results[index] && results[index].time && results[index].time.formatted !== "00:00") {
				return results[index].time.formatted;
			}

			if(this.time && this.time !== "00:00")
				return this.time;
			
		}
		
		calcStatusGraph(results, index, standings, minimum) {
			let winCount = 0;
			if(standings[index] !== undefined){
				winCount = parseInt(standings[index]);
			}

			if (Array.isArray(results) && results[index] && results[index].place === 1) {
				winCount += 1;
			}

			if (winCount >= minimum){
				return "assets/images/triforce-light.png";
			}

			return "assets/images/triforce-dark.png";


		}

	}

	customElements.define(AlttpRunner.is, AlttpRunner);
})();
