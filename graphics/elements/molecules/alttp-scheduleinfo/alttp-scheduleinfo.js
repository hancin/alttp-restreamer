(function () {
	'use strict';

	const scheduleInfo = nodecg.Replicant('scheduleInfo');

	class AlttpScheduleInfo extends Polymer.Element {
		static get is() {
			return 'alttp-scheduleinfo';
		}

		static get properties() {
			return {
				schedule: {
					type: Array,
					value: []
				}
			};
		}

		ready() {
			super.ready();


			scheduleInfo.on('change', newVal => {
				console.log(newVal);
				if(!newVal)
					return;
				console.log(newVal);
				this.schedule = newVal.slice(0);
			});
			
		}

		formatChannel(channel){
			return channel.replace('SpeedGaming', 'SG').replace('ALTTPRandomizer', 'AR');
		}

		formatTime(time){
			return moment(time).format('h:mm A');
		}

		calcColor(time){
			const realTime = moment(time);

			/* */
			const colorDifference = Math.abs(realTime.diff(moment(), 'minutes'));
			const opacityDifference = Math.max(colorDifference - 60, 0);
			const realColor = 255 - Math.min(colorDifference, 60);

			return `rgba(${realColor},${realColor},${realColor},${1-(opacityDifference/100)})`;

		};

	}

	customElements.define(AlttpScheduleInfo.is, AlttpScheduleInfo);
})();
