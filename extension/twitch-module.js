'use strict';

// Ours
const nodecg = require('./util/nodecg-api-context').get();
const obs = require('./obs');
const NodeCache = require( "node-cache" );

// Native
const fs = require('fs');
const path = require('path');

const twitchPlayer = nodecg.Replicant('twitchPlayer', {defaultValue: {}, persistent: true});
const twitchPlayerStreams = nodecg.Replicant('twitchPlayerStreams', {defaultValue: {}, persistent: false});
const currentRun = nodecg.Replicant('currentRun');
const twitchStreams = require('twitch-get-stream')(nodecg.bundleConfig.twitchClientId); // twitch now ENFORCES client id usage apparently, so this is now required.
const hls = require("hls-live-thumbnails");

nodecg.listenFor('takeStreamSnapshot', _takeStreamSnapshot);

var currentRunInfo;
var thumbGenerator;

var initialLayoutFileLoaded = false;
const snapPath = path.resolve(process.env.NODECG_ROOT, `bundles/${nodecg.bundleName}/graphics/img/streamSnaps`);


const hlsUrlCache = new NodeCache({stdTTL: 900, checkperiod: 150});

/*
 *	This function exists to be able to pick up runners after they go live, without operator intervention. 
 */
function _findHlsStreams()
{
	if(twitchPlayerStreams.value === undefined)
		return;

	const unknownStreams = twitchPlayerStreams.value.filter(stream => stream.hlsUrl === "" || stream.forceReload);

	unknownStreams.forEach(async (item, index) => {
		const changes = await getStreamInfo(item.stream, item.forceReload);

		if(!changes)
			return;

		twitchPlayerStreams.value[index] = {...item, ...changes};
	});
	
}

async function getStreamInfo(channel, forceReload)
{
	const cacheKey = `stream-${channel}`;
	if(forceReload)
		hlsUrlCache.del(cacheKey);

	let stream = hlsUrlCache.get(cacheKey);
	if(stream === undefined){
		await twitchStreams.get(channel).then(streams => {
			if(!streams || streams.length === 0)
				return {};
			stream = streams[0];
			hlsUrlCache.set(cacheKey, stream);
		}).catch(error => nodecg.log.info(error));
	}
	//Not in cache, and not available? Is the runner offline?
	if(stream === undefined)
		return {};

	const [width, height] = stream.resolution.split("x");
	return {
		hlsUrl: stream.url,
		resolution: [parseInt(width), parseInt(height)],
		forceReload: false
	}
}


setInterval(_findHlsStreams, 20000);


currentRun.on('change', async newVal => {
	if(!newVal || !newVal.runners)
		return;

	let newRunnerInfo = [];

	for (let runner of newVal.runners) {
		const runnerStream = {
			hlsUrl: "",
			name: runner.name,
			stream: runner.stream,
			running: false,
			paused: false,
			crop: {top: 0, left: 0, right: 0, bottom: 0},
			volume: 0,
			muted: true,
			forceReload: false,
			resolution: [1280, 720],
			delay: 0
		};

		const streamData = await getStreamInfo(runner.stream, false);

		newRunnerInfo.push({...runnerStream, ...streamData});
	};

	twitchPlayerStreams.value = newRunnerInfo;
});



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

