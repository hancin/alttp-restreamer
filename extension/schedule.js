'use strict';

// Packages
const clone = require('clone');
const deepEqual = require('deep-equal');
const EventEmitter = require('events');
const cheerio = require('cheerio');
const request = require('request-promise').defaults({jar: true}); // <= Automatically saves and re-uses cookies.
const NodeCache = require('node-cache');
const moment = require('moment');

const scheduleCache = new NodeCache({stdTTL: 120, checkperiod: 60});

// Ours
const nodecg = require('./util/nodecg-api-context').get();
const timer = require('./timekeeping');
const {calcOriginalValues, mergeChangesFromTracker} = require('./lib/diff-run');

const POLL_INTERVAL = 60 * 60 * 1000;
const SD_POLL_INTERVAL = 5 * 60 * 1000;

let updateInterval;
let displayInterval;

const checklist = require('./checklist');
const canSeekScheduleRep = nodecg.Replicant('canSeekSchedule');
const currentRunRep = nodecg.Replicant('currentRun');
const currentRunExtraRep = nodecg.Replicant('currentRunExtra');
const nextRunRep = nodecg.Replicant('nextRun');
const runnersRep = nodecg.Replicant('runners', {defaultValue: {}, persistent: false});
const runOrderMap = nodecg.Replicant('runOrderMap', {defaultValue: {}, persistent: false});
const scheduleRep = nodecg.Replicant('schedule', {defaultValue: [], persistent: false});
const scheduleInfoRep = nodecg.Replicant('scheduleInfo', {defaultValue: [], persistent: false});

const emitter = new EventEmitter();
module.exports = emitter;
module.exports.update = update;

update();

currentRunRep.on('change', newVal => {
	
	if(!newVal) 
		return;

	if(newVal.pk === undefined)
		return;
		
	if(newVal.pk != currentRunExtraRep.value.pk || currentRunExtraRep.value.itemTrackers === undefined){

		const updatedItem = {
			itemTrackers: newVal.runners.map(runner => {
				return {
					'runnerName': runner.name,
					'url': ''
				}
			}),
			password: '',
			twitchChannel: newVal.notes.split("\r\n")[0],
			mixerChannel: '',
			standings: '',
			round: '',
			seed: '',
			srtvPage: '',
			pk: newVal.pk
		}
		
		updatedItem.mixerChannel = updatedItem.twitchChannel;

		if(updatedItem.twitchChannel == "ALTTPRandomizer")
			updatedItem.mixerChannel += "1";

		currentRunExtraRep.value = clone(updatedItem);
	}

});

// Get latest schedule data every POLL_INTERVAL milliseconds
updateInterval = setInterval(update, POLL_INTERVAL);
displayInterval = setInterval(prepareInfo, SD_POLL_INTERVAL);

// Dashboard can invoke manual updates
nodecg.listenFor('updateSchedule', (data, cb) => {
	nodecg.log.info('Manual schedule update button pressed, invoking update...');
	clearInterval(updateInterval);
	updateInterval = setInterval(update, POLL_INTERVAL);
	update().then(updated => {
		if (updated) {
			nodecg.log.info('Schedule successfully updated');
		} else {
			nodecg.log.info('Schedule unchanged, not updated');
		}

		prepareInfo();

		cb(null, updated);
	}, error => {
		cb(error);
	});
});


nodecg.listenFor('nextRun', (data, cb) => {
	if (!canSeekScheduleRep.value) {
		nodecg.log.error('Attempted to seek to nextRun while seeking was forbidden.');
		return cb();
	}

	_seekToNextRun();
	cb();
});

nodecg.listenFor('previousRun', (data, cb) => {
	if (!canSeekScheduleRep.value) {
		nodecg.log.error('Attempted to seek to previousRun while seeking was forbidden.');
		return cb();
	}

	_seekToPreviousRun();
	cb();
});

nodecg.listenFor('setCurrentRunByOrder', (order, cb) => {
	if (!canSeekScheduleRep.value) {
		nodecg.log.error('Attempted to seek to arbitrary run order %s while seeking was forbidden.', order);
		return cb();
	}

	try {
		_seekToArbitraryRun(order);
	} catch (e) {
		nodecg.log.error(e);
		return cb(e);
	}

	cb();
});
function scrubItem(runner){
	if (!runner || typeof runner !== 'object') {
		runner = {};
	}

	if (!{}.hasOwnProperty.call(runner, 'name')) {
		runner.name = undefined;
	}

	if (!{}.hasOwnProperty.call(runner, 'stream')) {
		runner.stream = undefined;
	}

	return runner;
}
nodecg.listenFor('modifyRun', (data, cb) => {
	// We lose any properties that have an explicit value of `undefined` in the serialization process.
	// We need those properties to still exist so our diffing code can work as expected.
	// A property not existing is not the same thing as a property existing but having a value of undefined.
	data.runners = data.runners.map(scrubItem);
	data.commentators = data.commentators.map(scrubItem);
	data.trackers = data.trackers.map(scrubItem);
	data.broadcasters = data.broadcasters.map(scrubItem);

	let run;
	if (currentRunRep.value.pk === data.pk) {
		run = currentRunRep.value;
	} else if (nextRunRep.value.pk === data.pk) {
		run = nextRunRep.value;
	}

	if (run) {
		const original = findRunByPk(run.pk);
		if (original) {
			if (run === original) {
				nodecg.log.error('[schedule:modifyRun] run and original are same object!');
				return;
			}
			Object.assign(run, data);
			run.originalValues = calcOriginalValues(run, original);
		} else {
			nodecg.log.error('[modifyRun] Found current/next run, but couldn\'t find original in schedule. Aborting.');
		}
	} else {
		console.warn('[modifyRun] run not found:', data);
	}

	if (typeof cb === 'function') {
		cb();
	}
});



nodecg.listenFor('modifyRunExtra', (data, cb) => {
	Object.assign(currentRunExtraRep.value, {
		itemTrackers: data.itemTrackers,
		twitchChannel: data.twitchChannel,
		mixerChannel: data.mixerChannel,
		password: data.password,
		standings: data.standings,
		seed: data.seed,
		round: data.round,
		srtvPage: data.srtvPage,
		pk: data.pk
	});

	if (typeof cb === 'function') {
		cb();
	}
})

nodecg.listenFor('resetRun', (pk, cb) => {
	let runRep;
	if (currentRunRep.value.pk === pk) {
		runRep = currentRunRep;
	} else if (nextRunRep.value.pk === pk) {
		runRep = nextRunRep;
	}

	if (runRep) {
		runRep.value = clone(findRunByPk(pk));
		if ({}.hasOwnProperty.call(runRep.value, 'originalValues')) {
			nodecg.log.error(
				'%s had an `originalValues` property after being reset! This is bad! Deleting it...',
				runRep.value.name
			);
			delete runRep.value.originalValues;
		}
	}

	if (typeof cb === 'function') {
		cb();
	}
});


function parseEntry(entry){
	let runner = {
		name: entry.displayName,
		stream: entry.publicStream,
		discord: entry.discordTag
	}

	if(runner.stream === '')
		runner.stream = entry.displayName;

	return runner;
}

function prepareInfo() {
	if(!scheduleRep.value)
		return;

	const startDate = moment().subtract(90, 'minutes');
	const endDate = moment().add(1, 'hour');
	
	const relevantEntries = scheduleRep.value.filter(match => moment(match.time).isBetween(startDate, endDate));

	
	if(deepEqual(relevantEntries, scheduleInfoRep.value)){
		return;
	}

	scheduleInfoRep.value = clone(relevantEntries);
}

function makeDummy(name, handle){
	return {
		approved: true,
		displayName: name,
		publicStream: handle,
		discordTag: `${handle}#0001`
	};
}

/**
 * Gets the latest schedule info from the GDQ tracker.
 * @returns {Promise} - A a promise resolved with "true" if the schedule was updated, "false" if unchanged.
 */
function update() {
	const rightNow = moment().startOf('hour');

	return request({
		uri: nodecg.bundleConfig.useMockData ?
			'https://www.dropbox.com/s/fghcrrst55c5qsi/schedule.json' :
			nodecg.bundleConfig.speedgaming.scheduleNew,
		qs: {
			event: 'alttpr',
			from: moment().startOf('hour').subtract(5, 'hours').format(),
			to: moment().startOf('hour').add(3, 'hours').endOf('day').format(),
			dl: 1 // For Dropbox only
		},
		json: true
	}).then(entries=> {

		if(!entries){
			entries = [{
				approved: true,
				match1: {players: [makeDummy('Player 1', 'player1'), makeDummy('Player 2', 'player2')]},
				channel: {name: 'ALTTPRandomizer', id: 993},
				when: moment().startOf('hour').format(),
				trackers: [makeDummy('Tracker','tracker')],
				commentators: [makeDummy('Crossproduct', 'crossproduct'), makeDummy('Tairr', 'tairr')],
				broadcasters: [makeDummy('You', 'me')],
				id: 69420
			}];
		}

		//Channels to ignore at all times.
		const bannedChannels = [31,36];

		console.log(`There were ${entries.length} results from search, before any filters.`);

		let valid = [];
		let order = 1;
		const filteredResults = entries.filter(m => m.approved && (
			  (m.channel !== undefined && m.channel !== null && !bannedChannels.includes(m.channel.id))
		      ||(m.channels !== undefined && m.channels !== null && m.channels.some(c=> c !== null && !bannedChannels.includes(c.id)))
			)
		);
		
		console.log(`After filtering them, ${filteredResults.length} results will be read.`);

		for(let match of filteredResults){

			if(!match.channel){
				match.channel = match.channels.find(c=> c !== null && !bannedChannels.includes(c.id));
			}

			let run = {
				order: order,
				name: match.match1.players.map(x=>x.displayName).join(" vs "),
				time: match.when,
				channel: match.channel.name,
				runners: [...match.match1.players.map(parseEntry)],
				trackers : match.trackers.filter(x=>x.approved).map(parseEntry),
				commentators: match.commentators.filter(x=>x.approved).map(parseEntry),
				broadcasters: match.broadcasters.filter(x=>x.approved).map(parseEntry),
				id: match.id,
				pk: match.id,
				event: match.event.shortName,
				slug: match.event.slug,
				type: 'run'
			};

			if(!run.name){
				run.name = match.match1.title;
			}
			
			run.notes = `${run.channel}\r\n${moment(match.when).calendar()}`;

			order += 1;
			valid.push(run);
		}
		
		return Promise.resolve(valid);
	}).then(runsJSON => {

		// If nothing has changed, return.
		if (deepEqual(runsJSON, scheduleRep.value)) {
			return false;
		}

		scheduleRep.value = runsJSON;

		const newRunOrderMap = {};
		runsJSON.forEach(run => {
			newRunOrderMap[run.name] = run.order;
		});
		runOrderMap.value = newRunOrderMap;

		/* If no currentRun is set, set currentRun to the first run.
		 * Else, update the currentRun by pk, merging with and local changes.
		 */
		if (!currentRunRep.value || typeof currentRunRep.value.order === 'undefined') {
			const timeBased = findRunByTime(moment().startOf('hour'));
			if(timeBased){
				_seekToArbitraryRun(timeBased);
			}else{
				_seekToArbitraryRun(1);
			}
		} else {
			const currentRunAsInSchedule = findRunByPk(currentRunRep.value.pk);

			// If our current nextRun replicant value not match the actual next run in the schedule anymore,
			// throw away our current nextRun and replace it with the new next run in the schedule.
			// This can only happen for two reasons:
			//     1) The nextRun was deleted from the schedule.
			//     2) A new run was added between currentRun and nextRun.
			const newNextRun = currentRunAsInSchedule? _findRunAfter(currentRunAsInSchedule) : _findRunAfter(currentRunRep.value);
			if (!newNextRun || !nextRunRep.value || newNextRun.pk !== nextRunRep.value.pk) {
				nextRunRep.value = clone(newNextRun);
			}

			/* If currentRun was found in the schedule, merge any changes from the schedule into currentRun.
			 * Else if currentRun has been removed from the schedule (determined by its `pk`),
			 * set currentRun to something that's running close to now.
			 * If that fails, set currentRun to the final run in the schedule.
			 */
			if (currentRunAsInSchedule) {
				[currentRunRep, nextRunRep].forEach(activeRunReplicant => {
					if (activeRunReplicant.value && activeRunReplicant.value.pk) {
						const runFromSchedule = findRunByPk(activeRunReplicant.value.pk);
						activeRunReplicant.value = mergeChangesFromTracker(activeRunReplicant.value, runFromSchedule);
					}
				});
			} else {
				const timeBased = findRunByTime(moment().startOf('hour'));
				if(timeBased){
					_seekToArbitraryRun(timeBased);
				}else{
					const lastRunInSchedule = runsJSON.slice(0).reverse().find(item => item.type === 'run');
					_seekToArbitraryRun(lastRunInSchedule);
				}
			}
		}

		prepareInfo();
		return true;
	}).catch(error => {
		const response = error.response;
		const actualError = error.error || error;
		if (response) {
			nodecg.log.error('[schedule] Failed to update, got status code', response.statusCode);
		} else {
			nodecg.log.error('[schedule] Failed to update:', actualError);
		}
	});
}

/**
 * Seeks to the previous run in the schedule, updating currentRun and nextRun accordingly.
 * Clones the value of currentRun into nextRun.
 * Sets currentRun to the predecessor run.
 * @private
 * @returns {undefined}
 */
function _seekToPreviousRun() {
	const prevRun = scheduleRep.value.slice(0).reverse().find(item => {
		if (item.type !== 'run') {
			return false;
		}

		return item.order < currentRunRep.value.order;
	});

	nextRunRep.value = clone(currentRunRep.value);
	currentRunRep.value = clone(prevRun);
	checklist.reset();
	timer.reset();
}

/**
 * Seeks to the next run in the schedule, updating currentRun and nextRun accordingly.
 * Clones the value of nextRun into currentRun.
 * Sets nextRun to the new successor run.
 * @private
 * @returns {undefined}
 */
function _seekToNextRun() {
	const newNextRun = _findRunAfter(nextRunRep.value);
	currentRunRep.value = clone(nextRunRep.value);
	nextRunRep.value = clone(newNextRun);
	checklist.reset();
	timer.reset();
}

/**
 * Finds the first run that comes after a given run.
 * Will return undefined if this is the last run in the schedule.
 * @param {Object|Number} runOrOrder - Either a run order or a run object to set as the new currentRun.
 * @returns {Object|undefined} - The next run. If this is the last run, then undefined.
 * @private
 */
function _findRunAfter(runOrOrder) {
	const run = _resolveRunOrOrder(runOrOrder);
	return scheduleRep.value.find(item => {
		if (item.type !== 'run') {
			return false;
		}

		return item.order > run.order;
	});
}

/**
 * Sets the currentRun replicant to an arbitrary run, first checking if that run is previous or next,
 * relative to any existing currentRun.
 * If so, call _seekToPreviousRun or _seekToNextRun, accordingly. This preserves local changes.
 * Else, blow away currentRun and nextRun and replace them with the new run and its successor.
 * @param {Object|Number} runOrOrder - Either a run order or a run object to set as the new currentRun.
 * @returns {undefined}
 */
function _seekToArbitraryRun(runOrOrder) {
	const run = _resolveRunOrOrder(runOrOrder);
	if (nextRunRep.value && run.order === nextRunRep.value.order) {
		_seekToNextRun();
	} else {
		currentRunRep.value = clone(run);

		const newNextRun = _findRunAfter(run);
		nextRunRep.value = clone(newNextRun);

		checklist.reset();
		timer.reset();
	}
}

/**
 * Generates a formatted schedule.
 * @param {Array} formattedRunners - A pre-formatted array of hydrated runner objects.
 * @param {Array} scheduleJSON - The raw schedule array from the Tracker.
 * @returns {Array} - A formatted schedule.
 */

function calcFormattedSchedule({rawRuns, formattedRunners}) {
	const schedule = rawRuns
		.map(run => {
			return formatRun(run, formattedRunners);
		})
		.sort(suborderSort);


	return schedule;
}

/**
 * Formats a raw run object from the GDQ Tracker API into a slimmed-down and hydrated version for our use.
 * @param {Object} run - A raw run object from the GDQ Tracker API.
 * @param {Object} formattedRunners - The formatted array of all runners, used to hydrate the run's runners.
 * @returns {Object} - The formatted run object.
 */
function formatRun(run, formattedRunners) {

	return {
		name: run.name || 'Unknown',
		longName: run.name || 'Unknown',
		commentators,
		trackers,
		setupTime: run.time,
		order: run.order,
		notes: run.channel +"\r\n" + run.time,
		runners,
		id: run.pk,
		pk: run.pk,
		type: 'run'
	};
}

/**
 * Splits a comma-separated string into an array of strings, trimming whitespace.
 * @param {string} str - The string to split.
 * @return {Array<string>} - The split string.
 */
function splitString(str) {
	return str.split(',')
		.map(part => part.trim())
		.filter(part => part);
}

/**
 * Sorts objects by their `order` property, then by their `suborder` property.
 * @param {object} a - The first item in the current sort operation.
 * @param {object} b - The second item in the current sort operation.
 * @returns {number} - A number expressing which of these two items comes first in the sort.
 */
function suborderSort(a, b) {
	const orderDiff = a.order - b.order;

	if (orderDiff !== 0) {
		return orderDiff;
	}

	if ('suborder' in a && !('suborder' in b)) {
		return 1;
	}

	if (!('suborder' in a) && 'suborder' in b) {
		return -1;
	}

	return a.suborder - b.suborder;
}

/**
 * Disambiguates a variable that could either be a run object or a numeric run order.
 * @param {Object|Number} runOrOrder - Either a run order or a run object to set as the new currentRun.
 * @returns {Object} - The resolved run object.
 * @private
 */
function _resolveRunOrOrder(runOrOrder) {
	let run;
	if (typeof runOrOrder === 'number') {
		run = findRunByOrder(runOrOrder);
	} else if (typeof runOrOrder === 'object') {
		run = runOrOrder;
	}

	if (!run) {
		throw new Error(`Could not find run at specified order "${runOrOrder}".`);
	}

	return run;
}

/**
 * Searches scheduleRep for a run with the given `order`.
 * @param {number} order - The order of the run to find.
 * @returns {object|undefined} - The found run, or undefined if not found.
 */
function findRunByOrder(order) {
	return scheduleRep.value.find(item => {
		return item.type === 'run' && item.order === order;
	});
}

/**
 * Searches scheduleRep for a run with the given `pk` (or `id`).
 * @param {number} pk - The id or pk of the run to find.
 * @returns {object|undefined} - The found run, or undefined if not found.
 */
function findRunByPk(pk) {
	return scheduleRep.value.find(item => {
		return item.type === 'run' && item.id === pk;
	});
}

function findRunByTime(time) {
	return scheduleRep.value.find(item => {
		return item.type === 'run' && moment(item.time).diff(time) >= 0;
	});
}
