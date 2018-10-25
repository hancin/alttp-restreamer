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
				stage: {type:Number, value: 0},
				standing: Object,
				keysanity: {type: Boolean, value: false},
				index: Number,
				seriesMatches: Number,
				stream: Object,
				showTwitch: {type: Boolean, value: false},
				layoutFlag: {type: String, value: "runner2"},
				maxTextWidth: {type: Number, value: 290},
			};
		}

		ready() {
			super.ready();

			if(this.layoutFlag === "runner4l") {
				this.maxTextWidth = 170;
			}

			stopwatch.on('change', this.stopwatchChanged.bind(this));

			currentRunExtra.on('change', newVal => {
				if(!newVal)
					return;
				this.password = newVal.password;
				this.keysanity = newVal.variationsEnabled && newVal.variationsMode === "bg-keysanity";
				this.set('itemTrackers', newVal.itemTrackers.slice(0));
				this.set('standings', [0,0]);
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

		showStandings(stage) {
			return stage === 2;
		}

		showRaceStatus(stage) {
			return true;
		}
		
		calcStatusGraph(results, index, standing, minimum) {
			let winCount = 0;
			if(standing !== undefined){
				winCount = parseInt(standing.record);
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

		showRaceStatusImage(results, index, stage) {
			if (!results) {
				return "assets/images/standby.png";
			}

			if(results[index] && results[index].forfeit)
				return "assets/images/forfeit.png"; 
			
			if(results[index] && results[index].place === 1 && stage !== 0)
				return "assets/images/winner.png"; 

				
			if(results[index] && results[index].place > 0 && stage === 0)
			return "assets/images/finished.png"; 


			return "assets/images/standby.png";


		}

	}

	customElements.define(AlttpRunner.is, AlttpRunner);
})();
