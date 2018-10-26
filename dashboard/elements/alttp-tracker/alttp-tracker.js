(function () {
	'use strict';

	const currentRun = nodecg.Replicant('currentRun');
	const currentRunExtraRep = nodecg.Replicant('currentRunExtra');

	function helper(text) {
		if (!text) {
			return '_';
		}

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
				itemTrackers: {type: Array, value: []},
				standings: {type: Array, value: []},
				baseUrl: String,
				password: String,
				twitchChannel: String,
				mixerChannel: String,
				srtvPage: String,
				title2: String,
				seed: String,
				title1: String,
				runName: String,
				stage: {
					type: Number,
					value: 1
				},
				seriesMatches: {
					type: Number,
					value: 3
				},
				selectedInfoTab: {
					type: String,
					value: '0'
				},
				variationsEnabled: {
					type: Boolean,
					value: false
				},
				variationsGame: {
					type: String,
					value: "bg-open"
				},
				variationsDifficulty: {
					type: String,
					value: "bg-normal"
				},
				variationsSword: {
					type: String,
					value: "bg-themysterysword"
				},
				variationsGoal: {
					type: String,
					value: "bg-defeatganon"
				},
				variationsMode: {
					type: String,
					value: "bg-vanilla"
				}
			};
		}

		ready() {
			super.ready();

			this.clipboard = new ClipboardJS(this.shadowRoot.querySelectorAll('textarea'));

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
				if (!newVal || !newVal.itemTrackers) {
					return;
				}
				/* I think? this is causing on-input to not work?? */
				if(!newVal.itemTrackers){
					this.itemTrackers = [];
				}else{
					this.itemTrackers = newVal.itemTrackers.map(x => Object.assign({}, x));
				}
				if(!newVal.standings){
					this.standings = [];
				}else{
					this.standings = newVal.standings.map(x => Object.assign({}, x));
				}
				this.twitchChannel = newVal.twitchChannel;
				this.seriesMatches = newVal.seriesMatches;
				this.mixerChannel = newVal.mixerChannel;
				this.stage = newVal.stage;
				this.password = newVal.password;
				this.seed = newVal.seed;
				this.title2 = newVal.title2;
				this.title1 = newVal.title1;
				this.srtvPage = newVal.srtvPage;
				this.pk = newVal.pk;
				this.variationsEnabled = newVal.variationsEnabled;
				this.variationsDifficulty = newVal.variationsDifficulty;
				this.variationsGame = newVal.variationsGame;
				this.variationsGoal = newVal.variationsGoal;
				this.variationsMode = newVal.variationsMode;
				this.variationsSword = newVal.variationsSword;

				this._updateTrackerLines();
				this._updateGenerateButton();
			});
		}

		updateRunInfo(run) {
			this.runName = run.name;
			this.runners = run.runners;
			this.textRunnerNames = (!run.runners) ? '' : run.runners.map(x=>x.name.replace(' ','')).join(' ');
			this.textBroadcasterStreams = (!run.broadcasters) ? '_' : `${helper(run.broadcasters[0])}`;
			this.textCommentatorStreams = (!run.commentators) ? '_ _' : `${helper(run.commentators[0])} ${helper(run.commentators[1])}`;
			this.textCommentatorDiscords = (!run.commentators) ? '' : run.commentators.map(x=>x.discord).join(', ');
			this.textRunnerStreams = (!run.runners) ? '' : run.runners.map(x=>x.stream).join(' ');
			this.textRunnerDiscords = (!run.runners) ? '' : run.runners.map(x=>x.discord).join(', ');
			this.textTrackerStreams = (!run.trackers) ? '_' : run.trackers.map(x=>x.stream).join(' ');
			this.textTrackerDiscords = (!run.trackers) ? '' : run.trackers.map(x=>x.discord).join(', ');
			this.textVariations = run.variations;
			this.eventShort = run.event;
			this.commandNames = (run.runners && run.runners.length > 2) ? {
				c: '!qualc',
				r: '!qualr',
				title: '!qualtitle',
				variations: '!editmode'
			} : {
				c: '!editc',
				r: '!editr',
				title: '!falltitle',
				variations: '!editmode'
			};
			this.commandNamesRestream = (run.runners && run.runners.length > 2) ? {
				c: '!cedit4',
				r: '!redit4',
				title: '!retitle4'
			} : {
				c: '!cedit',
				r: '!redit',
				title: '!retitle'
			};
			this.runPk = run.pk;

			this._updateTrackerLines();
			this._updateGenerateButton();
		}

		copyTextToClipboard() {

		}

		_srtvGuid(srtvUrl) {
			if(!srtvUrl)
				return '';
			return srtvUrl.replace('https://speedracing.tv/races/', '');
		}

		makeID() {
			let text = '';
			let possible = 'abcdefghijklmnopqrstuvwxyz0123456789';

			for (var i = 0; i < 15; i++)
				text += possible.charAt(Math.floor(Math.random() * possible.length));

			return text;
		}

		showLine2(runners, variations) {
			return (!runners || runners.length <= 2) && !variations;
		}
		showStandings(stage){
			return stage === 2;
		}


		randomIntFromInterval(min, max) {
			return Math.floor(Math.random() * (max - min + 1) + min);
		}

		saveChanges() {

			nodecg.sendMessage('modifyRunExtra', {
				itemTrackers: this.itemTrackers.map(x => Object.assign({}, x)),
				standings: this.standings.map(x => Object.assign({}, x)),
				seriesMatches: this.seriesMatches,
				twitchChannel: this.twitchChannel,
				mixerChannel: this.mixerChannel,
				password: this.password,
				stage: this.stage,
				title2: this.title2,
				seed: this.seed,
				title1: this.title1,
				variationsEnabled: this.variationsEnabled,
				variationsDifficulty: this.variationsDifficulty,
				variationsGame: this.variationsGame,
				variationsGoal: this.variationsGoal,
				variationsMode: this.variationsMode,
				variationsSword: this.variationsSword,
				srtvPage: this.srtvPage,
				pk: this.pk
			}, () => {
				console.log('change ok');
			});
		}

		generateItemTrackers() {
			this.password = this.randomIntFromInterval(1, 99999).toString().padStart(5, '0');
			for (let i = 0; i < this.runners.length; i++) {
				if(this.itemTrackers.length <= i){
					this.push('itemTrackers', {
						'runnerName': this.runners[i].name,
						'url': this.makeID()
					});
				} else {
					this.set('itemTrackers.' + i + '.runnerName', this.runners[i].name);
					this.set('itemTrackers.' + i + '.url', this.makeID());
				}
			}

			while(this.itemTrackers.length > this.runners.length){
				this.pop('itemTrackers');
			}

			this._updateGenerateButton();
		}

		isKeysanity(variationsEnabled, variationsMode){
			return variationsEnabled && variationsMode === 'bg-keysanity';
		}

		_updateTrackerLines() {
			for (let i = 0; i < this.runners.length; i++) {
				if(this.itemTrackers.length <= i){
					this.push('itemTrackers', {
						'runnerName': this.runners[i].name,
						'url': ''
					});
				}
				if(this.standings.length <= i){
					this.push('standings', {
						'runnerName': this.runners[i].name,
						'record': ''
					});
				}
			}

			
			while(this.itemTrackers.length > this.runners.length){
				this.pop('itemTrackers');
			}
			
			while(this.standings.length > this.runners.length){
				this.pop('standings');
			}
		}

		_updateGenerateButton() {
			//this is bugged so this; is intentional right now
			if (!this.itemTrackers);
				return true;
			this.$.generateTrackers.disabled = this.itemTrackers.find(itemThing => {
				return itemThing.url !== '';
			}) !== undefined;
		}


	}

	customElements.define(AlttpTracker.is, AlttpTracker);
})();
