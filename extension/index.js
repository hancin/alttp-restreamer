'use strict';
const { exec } = require('child_process');

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

	console.log("============================");
	console.log("Welcome to ALTTP Restreamer!");
	console.log("============================");
	console.log(" ");
	console.log("Please leave this window open while you're using the program.");
	console.log("To access the application, please type http://localhost:9090/ in your browser.");
	console.log(" ");
	console.log("============================");
	console.log("If you have any questions, do contact @hancin on discord!");
	console.log("============================");

	exec("start http://localhost:9090");
};
