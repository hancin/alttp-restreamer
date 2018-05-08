'use strict';

// Packages
const request = require('request-promise').defaults({jar: true}); // <= Automatically saves and re-uses cookies.
const path = require('path');
// Ours
const nodecgApiContext = require('./util/nodecg-api-context');


const ffmpeg_path = path.resolve(process.env.NODECG_ROOT, `vendor/ffmpeg/ffmpeg.exe`);

process.env.FFMPEG_PATH = ffmpeg_path;

module.exports = function (nodecg) {
	// Store a reference to this nodecg API context in a place where other libs can easily access it.
	// This must be done before any other files are `require`d.
	nodecgApiContext.set(nodecg);
	
	const schedule = require('./schedule');

	// Be careful when re-ordering these.
	// Some of them depend on Replicants initialized in others.
	require('./timekeeping');
	const obs = require('./obs');
	require('./countdown');


	require('./twitch-module');

};
