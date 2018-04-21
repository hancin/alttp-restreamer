'use strict';

// Native
const fs = require('fs');
const path = require('path');
const {exec} = require('child_process');

// Packages
const OBSUtility = require('nodecg-utility-obs');

// Ours
const nodecg = require('./util/nodecg-api-context').get();

// We track what _layout_ is active, not necessarily what _scene_ is active.
// A given layout can be on multiple scenes.
const currentLayout = nodecg.Replicant('gdq:currentLayout');

//const obsScenes = nodecg.Replicant('obs:scenes');

const streamingOBS = new OBSUtility(nodecg, {namespace: 'streamingOBS'});
const recordingOBS = new OBSUtility(nodecg, {namespace: 'recordingOBS'});

streamingOBS.replicants.programScene.on('change', newVal => {
	if (!newVal) {
		return;
	}

	newVal.sources.some(source => {
		if (!source.name) {
			return false;
		}

		const lowercaseSourceName = source.name.toLowerCase();
		if (lowercaseSourceName.indexOf('layout') === 0) {
			currentLayout.value = lowercaseSourceName.replace(/ /g, '_').replace('layout_', '');
			return true;
		}

		/*if(source.name === "Left Runner"){
			const crop = {
				'top' : 23,
				'bottom': 53,
				'left' : 2,
				'right': 0
			}
			const req = {
				'item': "Left Runner",
				'position':{
					'x' : 48,
					'y' : 83
				},
				'bounds':{
					'x': 558.0,
					'y': 446.0,
				},
				'crop': crop
			};

			console.log(req);
			streamingOBS.send('SetSceneItemProperties', req).then(res => {
				console.log(res);
			});
	}*/

		return false;
	});
});

module.exports = {
	updateRestream() {
		/*streamingOBS.getCurrentScene().then(res => {
			console.log(res);

		});*/
	
		return "ok";
	},

	resetCropping() {
		return streamingOBS.send('ResetCropping').catch(error => {
			nodecg.log.error('resetCropping error:', error);
		});
	},

	setCurrentScene(sceneName) {
		return streamingOBS.setCurrentScene({
			'scene-name': sceneName
		});
	},

	get streamingOBSConnected() {
		return streamingOBS._connected;
	}
};
