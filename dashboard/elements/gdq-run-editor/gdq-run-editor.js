const currentOperator = nodecg.Replicant('currentOperator');
class GdqRunEditor extends Polymer.MutableData(Polymer.Element) {
	static get is() {
		return 'gdq-run-editor';
	}

	static get properties() {
		return {
			showingOriginal: {
				type: Boolean,
				value: false
			},
			category: String,
			commentators: Array,
			trackers: Array,
			originalValues: Object,
			uglyCopyPasta: String,
			restreamRacePasta: String,
			name: String
		};
	}

	loadRun(run) {
		this.name = run.name;
		this.category = run.category;
		this.commentators = run.commentators.map(runner => {
			if (runner) {
				return {name: runner.name, stream: runner.stream, discord: runner.discord};
			}

			return undefined;
		});
		this.trackers = run.trackers.map(runner => {
			if (runner) {
				return {name: runner.name, stream: runner.stream, discord: runner.discord};
			}

			return undefined;
		});
		this.runners = run.runners.map(runner => {
			if (runner) {
				return {name: runner.name, stream: runner.stream, discord: runner.discord};
			}

			return undefined;
		});
		this.originalValues = run.originalValues;

		this.notes = run.notes;
		this.pk = run.pk;
		
	}

	ready(){
		super.ready();
	}

	helperRetrieveValue(source){
		const runners = [];
		const runnerNameInputs = source.querySelectorAll('paper-input[label^="Runner"]:not([disabled])');
		const runnerStreamInputs = source.querySelectorAll('paper-input[label="Twitch Channel"]:not([disabled])');
		const runnerDiscordInputs = source.querySelectorAll('paper-input[label="Discord"]:not([disabled])');

		console.log(runnerNameInputs);
		for (let i = 0; i < runnerNameInputs.length; i++) {
			if (runnerNameInputs[i].value || runnerStreamInputs[i].value || runnerDiscordInputs[i].value) {
				runners[i] = {
					name: runnerNameInputs[i].value,
					stream: runnerStreamInputs[i].value,
					discord: runnerDiscordInputs[i].value
				};
			}
		}
		
		return runners;
	}

	applyChanges() {
		// We have to build a new runners object.
		const runners = this.helperRetrieveValue(this.$.runners);

		nodecg.sendMessage('modifyRun', {
			name: this.name,
			commentators: this.commentators,
			trackers: this.trackers,
			runners,
			pk: this.pk
		}, () => {
			this.closest('paper-dialog').close();
		});
	}

	resetRun() {
		nodecg.sendMessage('resetRun', this.pk, () => {
			this.closest('paper-dialog').close();
		});
	}

	calcDisabledIndex(index, count, last){

		var realLast = last === 1;
		if(!realLast && index === 0)
			return true;
		if(realLast && index === count-1)
			return true;
		return false;
	}

	calcVal(path, index, otherPath){
		path = path.split('.');
		path[1]= index+"";
		path[2] = otherPath;
		const originalPath = path.slice(0);
		originalPath.unshift('originalValues');
		return this.get(originalPath);
	}

	calcHide(path, showingOriginal) {
		path = path.split('.');
		const originalPath = path.slice(0);
		originalPath.unshift('originalValues');
		const originalValue = this.get(originalPath);
		const hasOriginal = typeof originalValue !== 'undefined';
		return showingOriginal && hasOriginal;
	}
	calcHide2(path1, path2, path3, showingOriginal){
		return this.calcHide(path1 + "." + path2 + "." + path3, showingOriginal);
	}

	showOriginal() {
		this.showingOriginal = true;
	}

	hideOriginal() {
		this.showingOriginal = false;
	}

	_moveRunnerDown(e) {
		const index = parseInt(e.target.closest('[data-index]').getAttribute('data-index'), 10);
		this.runners = this._moveRunner(this.runners, index, 'down');
	}

	_moveRunnerUp(e) {
		const index = parseInt(e.target.closest('[data-index]').getAttribute('data-index'), 10);
		this.runners = this._moveRunner(this.runners, index, 'up');
	}

	_moveCommentatorDown(e) {
		const index = parseInt(e.target.closest('[data-index]').getAttribute('data-index'), 10);
		this.commentators = this._moveRunner(this.commentators, index, 'down');
	}

	_moveCommentatorUp(e) {
		const index = parseInt(e.target.closest('[data-index]').getAttribute('data-index'), 10);
		this.commentators = this._moveRunner(this.commentators, index, 'up');
	}


	_moveTrackerDown(e) {
		const index = parseInt(e.target.closest('[data-index]').getAttribute('data-index'), 10);
		this.trackers = this._moveRunner(this.trackers, index, 'down');
	}

	_moveTrackerUp(e) {
		const index = parseInt(e.target.closest('[data-index]').getAttribute('data-index'), 10);
		this.trackers = this._moveRunner(this.trackers, index, 'up');
	}

	/**
	 * Moves a runner up or down in the runners array.
	 * @param {Array} runnersArray - The array of runners to base these changes on.
	 * @param {Number} index - The index of the runner to move in the array.
	 * @param {'up'|'down'} direction - Which direction to move the runner in.
	 * @returns {Array} - An array of runners with the desired runner re-arrangement applied to it.
	 */
	_moveRunner(runnersArray, index, direction) {
		if (isNaN(index)) {
			throw new Error(`Index must be a number, got "${index}" which is a "${typeof index}"`);
		}

		if (index < 0 || index >= 4) {
			throw new Error(`Index must be >= 0 and < 4, got "${index}"`);
		}

		const newRunnersArray = runnersArray.slice(0);

		const runnerToMove = newRunnersArray.splice(index, 1)[0];
		newRunnersArray.splice(index + (direction === 'up' ? -1 : 1), 0, runnerToMove);
		return newRunnersArray.slice(0, 4);
	}
}

customElements.define(GdqRunEditor.is, GdqRunEditor);
