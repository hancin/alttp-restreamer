'use strict';

// Native
const fs = require('fs');
const path = require('path');
const {exec} = require('child_process');

// Packages
const OBSUtility = require('nodecg-utility-obs');

// Ours
const nodecg = require('./util/nodecg-api-context').get();


const commentatorOBS = new OBSUtility(nodecg, {namespace: 'commentatorOBS'});
const restreamOBS = new OBSUtility(nodecg, {namespace: 'restreamOBS'});

commentatorOBS.replicants.sceneList.on('change', newVal => {
	console.log(newVal);
});
commentatorOBS.replicants.programScene.on('change', newVal => {
	if (!newVal) {
		return;
	}

	newVal.sources.some(source => {
		if (!source.name) {
			return false;
		}

		console.log(source);

		/*commentatorOBS.send('GetSceneItemProperties', {"item": "Left Runner"}).then(res=>{
			console.log(res);
		});*/

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
		
	
		return "ok";
	},

	resetCropping() {
		return commentatorOBS.send('ResetCropping').catch(error => {
			nodecg.log.error('resetCropping error:', error);
		});
	},

	setCurrentScene(sceneName) {
		return commentatorOBS.setCurrentScene({
			'scene-name': sceneName
		});
	},

	get commentatorOBSConnected() {
		return commentatorOBS._connected;
	},
	
	get restreamOBSConnected() {
		return restreamOBS._connected;
	}
};
