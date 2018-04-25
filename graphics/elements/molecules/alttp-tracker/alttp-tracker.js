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
				index: Number
			};
		}


		getTrackerInfo(itemTrackers, index){
			if(itemTrackers[index] === undefined)
				return null;


			return itemTrackers[index].url;
		}
	}

	customElements.define(AlttpTracker.is, AlttpTracker);
})();
