(function () {
	'use strict';

	const scheduleInfo = nodecg.Replicant('scheduleInfo');
	const stopwatch = nodecg.Replicant('stopwatch');

	class AlttpScheduleInfo extends Polymer.Element {
		static get is() {
			return 'alttp-scheduleinfo';
		}

		static get properties() {
			return {
				schedule: {
					type: Array,
					value: []
				},
				isInterviewing: {
					type: Boolean,
					value: false
				}
			};
		}

		ready() {
			super.ready();

			this.updateInterval = setInterval(this.forceUpdate.bind(this), 60000);

			stopwatch.on('change', this.stopwatchChanged.bind(this));
			scheduleInfo.on('change', newVal => {
				if(!newVal)
					return;
				this.schedule = newVal.slice(0);
			});
			
		}

		stopwatchChanged(newVal) {
			if(!newVal)
				return;
			this.isInterviewing = newVal.results.some(x=> x && x.place > 0);
		}

		forceUpdate() {
			if(!this.schedule)
				return;

			for(var i=0;i<this.schedule.length;i++){
				this.notifyPath(`schedule.${i}.time`);
			}
		}

		formatChannel(channel){
			return channel.replace('SpeedGaming', 'SG').replace('ALTTPRandomizer', 'AR');
		}

		formatTime(time){
			return moment(time).fromNow().replace(" minutes", "m").replace(" hour","h");
		}

		calcColor(time){
			const realTime = moment(time);

			const colorDifference = Math.abs(realTime.diff(moment(), 'minutes'))*2;
			const opacityDifference = Math.min(Math.max(colorDifference - 60, 0), 1);
			const realColor = 255 - Math.min(colorDifference, 120);

			return `rgba(${realColor},${realColor},${realColor},${1-(opacityDifference/100)})`;

		};

	}

	customElements.define(AlttpScheduleInfo.is, AlttpScheduleInfo);
})();
