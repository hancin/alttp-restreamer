'use strict';

// Ours
const nodecg = require('./util/nodecg-api-context').get();
const obs = require('./obs');

// Native
const fs = require('fs');
const path = require('path');

const twitchPlayer = nodecg.Replicant('twitchPlayer', {defaultValue: {}, persistent: true});
const nextGame = nodecg.Replicant('currentRun');
const runners = nodecg.Replicant('runners');
const log = new nodecg.Logger(`${nodecg.bundleName}:twitch-module`);
const schedule = nodecg.Replicant('schedule');
const twitchStreams = require('twitch-get-stream')(nodecg.bundleConfig.twitchClientId); // twitch now ENFORCES client id usage apparently, so this is now required.
const hls = require("hls-live-thumbnails");

nodecg.listenFor('askChangePlayer', _askChangeRun);
nodecg.listenFor('askSwitchRunners', _askSwitchRunners);
nodecg.listenFor('askReloadLayoutConfig', _askReloadLayoutConfig);
nodecg.listenFor('takeStreamSnapshot', _takeStreamSnapshot);

var currentRunInfo;
var thumbGenerator;

var initialLayoutFileLoaded = false;

const snapPath = path.resolve(process.env.NODECG_ROOT, `bundles/${nodecg.bundleName}/graphics/img/streamSnaps`);

twitchPlayer.value =
{
	layoutSetup: {},
	runnerList: [],
	streamData: {
		leader: 0,
		leaderDelay: 0,
		streams: [
		{
			channel: "speedgaming",
			muted: false,
			running: false,
			paused: false,
			volume: 0.5,
			delay: 0,
			width: 0,
			height: 0,
			top: 0,
			left: 0,
			scaleX: 1,
			scaleY: 1
		},
		]
	},
    playerInstanceCreated: false,
    streamAURL: "speedgaming2", //enter a default twitchname here for testing
    streamAMuted: false,
    streamARunning: false,
    streamAPaused: false,
    streamAVolume: 0.5,
    streamADelay: 0,
	streamLeaderDelay: 0,
	streamAWidth: 0,
	streamAHeight: 0,
	streamALeft: 0,
	streamATop: 0,
};

function _askReloadLayoutConfig() {
	const layoutFilePath = path.resolve(process.env.NODECG_ROOT, 'twitchPlayerSetup.json');
	const layoutFileExists = fs.existsSync(layoutFilePath);

	if (layoutFileExists) {
		const rawLayoutFile = fs.readFileSync(layoutFilePath, 'utf8');

		let layoutFile;
		try {
			layoutFile = JSON.parse(rawLayoutFile);
		} catch (e) {
			throw new Error(`Failed to parse ${layoutFilePath}. Please ensure that it contains only valid JSON.`);
		}

		if (layoutFile) {
			twitchPlayer.value.layoutSetup = layoutFile;

			log.info("Twitch Player Layout file parsed/updated!");

			if (initialLayoutFileLoaded)
				_setPlayerDefaults(nextGame.value);

			initialLayoutFileLoaded = true;
		}
	}
	else {
		throw new Error("Twitch Player Layout file could not be found!");
	}
}

_askReloadLayoutConfig();

runners.on('change', newVal => { //this is probably called too often and should be changed

	if (!newVal)
		return;

	if (twitchPlayer.value.runnerList.length > 0)
		twitchPlayer.value.runnerList.length = 0;

	let runnerCount = 0;
	if (newVal.length > 0) {
		newVal.forEach(runner => {
			if (runner) {
				twitchPlayer.value.runnerList.push({ name: runner.name, checked: false, id: "" });

				if(twitchPlayer.value.streamData.streams.length > runnerCount){
					twitchPlayer.value.streams[runnerCount].channel = runner.stream;
				}else{
					twitchPlayer.value.streamData.streams.push({
						channel: runner.twitch,
						muted: false,
						running: false,
						paused: false,
						volume: 0.5,
						delay: 0,
						width: 0,
						height: 0,
						scaleX: 1,
						scaleY: 1
					});
				}
			}
		});

		_setPlayerDefaults(nextGame.value);
	}
});


function _setPlayerDefaults(currentRunInfo)
{
	twitchPlayer.value.streamData.streams.forEach(stream => {
		stream.width = 558;
		stream.height = 446;
		stream.top = 0;
		stream.left = 0;
		stream.scaleX = 1;
		stream.scaleY = 1;
	});
}

function _askChangeRun() {

    currentRunInfo = nextGame.value;

    twitchPlayer.value.playerInstanceCreated = false;
    twitchPlayer.value.streamAMuted = false;
    twitchPlayer.value.streamARunning = false;
    twitchPlayer.value.streamAPaused = false;
    twitchPlayer.value.streamAVolume = 1.0;
}
function _askSwitchRunners(mode)
{
    log.info("new runner list with mode: " + mode);

    var count = 0;
    var id = 0;
	var newRunnerList = [];
    twitchPlayer.value.runnerList.forEach(newRunner => {
     
        if (newRunner.checked)
			count++;
	});

    twitchPlayer.value.runnerList.forEach(newRunner => {  
        if (newRunner.checked)
        {
            if (newRunner.id == "---> A")
               id = 1;
            else if (newRunner.id == "---> B")
               id = 2;
            else if (newRunner.id == "---> C")
               id = 3;
            else
			   id = 4;
			nodecg.log.info("count: " + count);
            runners.value.find(runner => {
                if (runner) {
					if (runner.name === newRunner.name) {
						log.info("play runner[" + id + "]: " + newRunner.name + " with stream: " + runner.stream);
						switch (id) {
							case 1:
								if (twitchPlayer.value.streamAURL !== runner.stream)
									twitchPlayer.value.streamAURL = runner.stream;

								newRunnerList[0] = { name: newRunner.name, stream: runner.stream };

								break;
							case 2:
								if (twitchPlayer.value.streamBURL !== runner.stream)
									twitchPlayer.value.streamBURL = runner.stream;

								newRunnerList[1] = { name: newRunner.name, stream: runner.stream };

								break;
							case 3:
								if (twitchPlayer.value.streamCURL !== runner.stream)
									twitchPlayer.value.streamCURL = runner.stream;
			
								newRunnerList[2] = { name: newRunner.name, stream: runner.stream };

								break;
							case 4:
								if (twitchPlayer.value.streamDURL !== runner.stream)
									twitchPlayer.value.streamDURL = runner.stream;

								newRunnerList[3] = { name: newRunner.name, stream: runner.stream };

								break;
							default:
								break;
						}
					}
					return true;
				}
                

                return false;
            });
        }
	});

	nextGame.value.runners = newRunnerList;
	
	if (count > 0) {
		_setPlayerDefaults(nextGame.value);
	}
	else
	{
		log.info("No runners selected!");
	}


}

function _takeStreamSnapshot(id)
{
	var streamUrl;

	if(id > twitchPlayer.value.streamData.streams.length){
		return;
		console.log("Not enough streams.");
	}
	
	streamUrl = twitchPlayer.value.streamData.streams[id].channel;

	twitchStreams.get(streamUrl)
		.then(function (streams) {

			var options = {
				playlistUrl: streams[0].url,
				outputDir: snapPath,
				tempDir: snapPath,
				initialThumbnailCount: 1,
				interval: null,
				targetThumbnailCount: 1,
				thumbnailWidth: 1280,
				thumbnailHeight: 720,
				outputNamePrefix: "snap"
			};

			thumbGenerator = new hls.ThumbnailGenerator(options);
			thumbGenerator.getEmitter().on("newThumbnail", thumb => {

				console.log("newThumb: ", thumb.name);

				thumbGenerator.destroy();

				if (fs.existsSync(snapPath + "/" + id + ".jpg"))
					fs.unlinkSync(snapPath + "/" + id + ".jpg");

				fs.renameSync(snapPath + "/" + thumb.name, snapPath + "/" + id + ".jpg");

				console.log("Screenshot of Stream finished");

				nodecg.sendMessage("refreshLayoutDashImages");
			});

		}).catch(function (ex) {

			console.log("Exception in twitchStreams: ", ex);
		});
}

