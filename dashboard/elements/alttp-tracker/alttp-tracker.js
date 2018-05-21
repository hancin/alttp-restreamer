(function () {
	'use strict';

	const currentRun = nodecg.Replicant('currentRun');
	const schedule = nodecg.Replicant('schedule');
	const currentRunExtraRep = nodecg.Replicant('currentRunExtra');

	function helper(text){
		if(!text)
		return "_";

		return text.stream;
	}

	/**
	 * @customElement
	 * @polymer
	 */
	class AlttpTracker extends Polymer.Element {
		static get is() {
			return 'alttp-tracker';
		}

		static get properties() {
			return {
				'itemTrackers': Array,
				'baseUrl': String,
				'password': String,
				'twitchChannel': String,
				'mixerChannel': String,
				'srtvPage': String,
				'standings': String,
				'seed': String,
				'round': String,
				'runName': String,
				'selectedInfoTab': {
					"type": String,
					"value": "0"
				}
			}
		}
		
		ready() {
			super.ready();

			this.clipboard = new ClipboardJS(this.shadowRoot.querySelectorAll("textarea"));

			this.clipboard.on('success', newVal => {
				console.log(newVal);
			});

			this.baseUrl = nodecg.bundleConfig.tracker.url;

			currentRun.on('change', newVal => {
				if (!newVal || !newVal.runners) {
					return;
				}
				this.updateRunInfo(newVal);
			});
			currentRunExtraRep.on('change', newVal => {
				if (!newVal || !newVal.itemTrackers)
					return;
				/* I think? this is causing on-input to not work??*/
				this.itemTrackers = newVal.itemTrackers.map(x => Object.assign({}, x));
				this.twitchChannel = newVal.twitchChannel;
				this.mixerChannel = newVal.mixerChannel;
				this.password = newVal.password;
				this.seed = newVal.seed;
				this.standings = newVal.standings;
				this.round = newVal.round;
				this.srtvPage = newVal.srtvPage;
				this.pk = newVal.pk;


				this._updateGenerateButton();
			});


		}

		updateRunInfo(run) {
			this.runName = run.name;
			this.textRunnerNames = (!run.runners) ? "" : run.runners.map(x=>x.name.replace(" ","")).join(" ");
			this.textBroadcasterStreams = (!run.broadcasters) ? "_" : `${helper(run.broadcasters[0])}`;
			this.textCommentatorStreams = (!run.commentators) ? "_ _" : `${helper(run.commentators[0])} ${helper(run.commentators[1])}`;
			this.textCommentatorDiscords = (!run.commentators) ? "" : run.commentators.map(x=>x.discord).join(", ");
			this.textRunnerStreams = (!run.runners) ? "" : run.runners.map(x=>x.stream).join(" ");
			this.textRunnerDiscords = (!run.runners) ? "" : run.runners.map(x=>x.discord).join(", ");
			this.textTrackerStreams = (!run.trackers) ? "_" : `${helper(run.trackers[0])}`;
			this.textTrackerDiscords = (!run.trackers) ? "" : run.trackers.map(x=>x.discord).join(", ");
			this.runPk = run.pk;

			this._updateGenerateButton();
		}

		copyTextToClipboard(e){
			
		}

		_srtvGuid(srtvUrl){
			if(!srtvUrl)
				return "";
			return srtvUrl.replace("https://speedracing.tv/races/", "");
		}

		makeID() {
			var text = "";
			var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

			for (var i = 0; i < 12; i++)
				text += possible.charAt(Math.floor(Math.random() * possible.length));

			return text;
		}


		randomIntFromInterval(min, max) {
			return Math.floor(Math.random() * (max - min + 1) + min);
		}

		saveChanges() {

			nodecg.sendMessage('modifyRunExtra', {
				itemTrackers: this.itemTrackers.map(x => Object.assign({}, x)),
				twitchChannel: this.twitchChannel,
				mixerChannel: this.mixerChannel,
				password: this.password,
				standings: this.standings,
				seed: this.seed,
				round: this.round,
				srtvPage: this.srtvPage,
				pk: this.pk
			}, () => {
				console.log('change ok');
			});
		}

		generateItemTrackers() {
			this.password = this.randomIntFromInterval(1, 9999).toString().padStart(4, "0");
			for (var i = 0; i < this.itemTrackers.length; i++) {
				this.set('itemTrackers.' + i + '.url', this.makeID());
			}

			this._updateGenerateButton();
		}

		_updateGenerateButton() {
			if (!this.itemTrackers);
			return true;
			this.$.generateTrackers.disabled = this.itemTrackers.find(itemThing => {
				return itemThing.url !== "";
			}) !== undefined;
		}


	}

	customElements.define(AlttpTracker.is, AlttpTracker);
})();
