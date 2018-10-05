(function () {
	'use strict';

	class AlttpTracker extends Polymer.Element {
		static get is() {
			return 'alttp-tracker';
		}

		static get properties() {
			return {
				baseUrl: {
					type: String,
					value: nodecg.bundleConfig.tracker.url
				},
				itemTrackers: {type:Array, value: []},
				password: Number,
				index: Number,
				layoutFlag: {
					type: String,
					value: "runner2"
				}
			};
		}


		getTrackerInfo(itemTrackers, index){
			if(itemTrackers[index] === undefined)
				return null;
				var layout = this.layoutFlag === "runner4l"? "4": "2";
				var url = `${this.baseUrl}/${itemTrackers[index].url}?password=${this.password}&layout=${layout}`;
			return url;
		}
	}

	customElements.define(AlttpTracker.is, AlttpTracker);
})();
