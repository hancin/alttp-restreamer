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
				keysanity: {
					type: Boolean,
					value: false
				},
				index: Number,
				layoutFlag: {
					type: String,
					value: "runner2"
				}
			};
		}


		getTrackerInfo(itemTrackers, index, layoutFlag, keysanity, baseUrl, password){
			if(itemTrackers[index] === undefined)
				return null;
				var layout = layoutFlag === "runner4l"? "4": "2";
				var url = `${baseUrl}/${itemTrackers[index].url}?password=${password}&layout=${layout}&keysanity=${keysanity}`;
			return url;
		}
	}

	customElements.define(AlttpTracker.is, AlttpTracker);
})();
