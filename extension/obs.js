'use strict';

// Native
const fs = require('fs');
const path = require('path');
const {exec} = require('child_process');

// Packages
const {OBSUtility} = require('nodecg-utility-obs');

// Ours
const nodecg = require('./util/nodecg-api-context').get();

const model = {
	commentary: {
		obs: new OBSUtility(nodecg, {namespace: 'commentatorOBS'}),
		scene: nodecg.Replicant('commentatorScene'),
	},
	restream: {
		obs: new OBSUtility(nodecg, {namespace: 'restreamOBS'}),
		scene: nodecg.Replicant('restreamScene'),
	},
	leftRunner: {
		timerSource: nodecg.Replicant('leftTimerSource'),
		gameSource: nodecg.Replicant('leftGameSource')
	},
	rightRunner: {
		timerSource: nodecg.Replicant('rightTimerSource'),
		gameSource: nodecg.Replicant('rightGameSource')
	}
};

function _dispatch(cb){
	cb(model.commentary);
	cb(model.restream);
}



_dispatch(obsVm => obsVm.obs.replicants.sceneList.on('change', newVal => {
	if(!newVal)
		return;

	const scene = obsVm.scene.value;
	if(!scene)
		return;
	
	if(newVal.includes(scene)){
		console.log(`Scene ${scene} present in OBS, looking good!`);
	}else{
		console.warn(`Scene ${scene} not present in OBS! Please check your config.`);
	}
	
}));

_dispatch(obsVm => obsVm.obs.replicants.previewScene.on('change', newVal => {
	if(!newVal)
		return;
	
	
}));

_dispatch(obsVm => obsVm.obs.replicants.programScene.on('change', newVal => {
	if (!newVal) {
		return;
	}

	newVal.sources.some(source => {
		if (!source.name) {
			return false;
		}

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
}));

module.exports = {
	updateRestream() {
		
	
		return "ok";
	},

	resetCropping() {
	},

	setCurrentScene(sceneName) {
		_dispatch(obsVm => obsVm.obs.setCurrentScene({'scene-name': sceneName}));
	},

	get commentatorOBSConnected() {
		return model.commentary.obs._connected;
	},
	
	get restreamOBSConnected() {
		return model.restream.obs._connected;
	}
};
