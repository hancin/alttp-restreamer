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
				cssClass: {type:String, value:""},
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
				if(isNaN(winCount))
					winCount = 0;

			}

			if (Array.isArray(results) && results[index] && results[index].place === 1) {
				winCount += 1;
			}

			if (winCount >= minimum){
				return "assets/images/triforce-on.png";
			}

			return "assets/images/triforce-off.png";


		}

		calcStatusGraph2(results, index) {
			if (!results) {
				return "assets/images/standby.png";
			}

			if(results[index] && results[index].forfeit)
				return "assets/images/forfeit.png"; 
			
			if(results[index] && results[index].place === 1)
				return "assets/images/winner.png"; 

			return "assets/images/standby.png";


		}

	}

	customElements.define(AlttpRunner.is, AlttpRunner);
})();
