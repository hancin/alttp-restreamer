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
				baseUrl: String,
				password: String,
				twitchChannel: String,
				mixerChannel: String,
				srtvPage: String,
				standings: String,
				seed: String,
				round: String,
				runName: String,
				stage: {
					type: Number,
					value: 1
				},
				selectedInfoTab: {
					type: String,
					value: '0'
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
				this.itemTrackers = newVal.itemTrackers.map(x => Object.assign({}, x));
				this.twitchChannel = newVal.twitchChannel;
				this.mixerChannel = newVal.mixerChannel;
				this.password = newVal.password;
				this.seed = newVal.seed;
				this.standings = newVal.standings;
				this.round = newVal.round;
				this.srtvPage = newVal.srtvPage;
				this.pk = newVal.pk;

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
			this.eventShort = run.event;
			this.commandNames = (run.runners && run.runners.length > 2) ? {
				c: '!qualc',
				r: '!qualr',
				title: '!qualtitle'
			} : {
				c: '!editc',
				r: '!editr',
				title: '!springtitle'
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

		_updateTrackerLines() {
			for (let i = 0; i < this.runners.length; i++) {
				if(this.itemTrackers.length <= i){
					this.push('itemTrackers', {
						'runnerName': this.runners[i].name,
						'url': ''
					});
				}
			}

			
			while(this.itemTrackers.length > this.runners.length){
				this.pop('itemTrackers');
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
