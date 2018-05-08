(function () {
	'use strict';

	const currentRun = nodecg.Replicant('currentRun');
	const schedule = nodecg.Replicant('schedule');
	const currentRunExtraRep = nodecg.Replicant('currentRunExtra');


	/**
	 * @customElement
	 * @polymer
	 */
	class AlttpTracker extends Polymer.Element {
		static get is() {
			return 'alttp-tracker';
		}

		static get properties(){
			return {
				'itemTrackers': Array,
				'baseUrl': String,
				'password': String,
				'twitchChannel': String,
				'mixerChannel': String,
				'srtvPage': String,
				'standings': String,
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

			this.baseUrl = nodecg.bundleConfig.tracker.url;

			currentRun.on('change', newVal => {
				if (!newVal) {
					return;
				}
				this._updateGenerateButton();
			});


			currentRunExtraRep.on('change', newVal =>{

				if(!newVal)
					return;
				/* I think? this is causing on-input to not work??*/
				this.itemTrackers = newVal.itemTrackers.map(x=>Object.assign({}, x));
				this.twitchChannel = newVal.twitchChannel;
				this.mixerChannel = newVal.mixerChannel;
				this.password = newVal.password;
				this.standings = newVal.standings;
				this.round = newVal.round;
				this.srtvPage = newVal.srtvPage;
				this.pk = newVal.pk;


				this._updateGenerateButton();
			});

			currentRun.on('change', newVal => {
				this.runName = newVal.name;
			});
			
		}

		makeID() {
			var text = "";
			var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
		  
			for (var i = 0; i < 12; i++)
			  text += possible.charAt(Math.floor(Math.random() * possible.length));
		  
			return text;
		  }
		  


		saveChanges(){

			nodecg.sendMessage('modifyRunExtra', {
				itemTrackers: this.itemTrackers.map(x=>Object.assign({}, x)),
				twitchChannel: this.twitchChannel,
				mixerChannel: this.mixerChannel,
				password: this.password,
				standings: this.standings,
				round: this.round,
				srtvPage: this.srtvPage,
				pk: this.pk
			}, () => {
				console.log('change ok');
			});
		}

		generateItemTrackers(){
			for(var i =0; i<this.itemTrackers.length; i++){
				this.set('itemTrackers.'+i+'.url', this.makeID());
			}

			this._updateGenerateButton();
		}

		_updateGenerateButton(){
			if(!this.itemTrackers);
				return true;
			this.$.generateTrackers.disabled = this.itemTrackers.find(itemThing=>{
				return itemThing.url !== "";
			}) !== undefined;
		}


	}

	customElements.define(AlttpTracker.is, AlttpTracker);
})();
