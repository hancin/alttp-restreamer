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
			broadcasters: Array,
			originalValues: Object,
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
		this.broadcasters = run.broadcasters.map(runner => {
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


	applyChanges() {
		nodecg.sendMessage('modifyRun', {
			name: this.name,
			commentators: this.commentators.slice(0),
			trackers: this.trackers.slice(0),
			broadcasters: this.broadcasters.slice(0),
			runners: this.runners.slice(0),
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

	calcHide(path, showingOriginal) {
		path = path.split('.');
		const originalPath = path.slice(0);
		originalPath.unshift('originalValues');
		const originalValue = this.get(originalPath);
		const hasOriginal = typeof originalValue !== 'undefined';
		return showingOriginal && hasOriginal;
	}

	showOriginal() {
		this.showingOriginal = true;
	}

	hideOriginal() {
		this.showingOriginal = false;
	}

}

customElements.define(GdqRunEditor.is, GdqRunEditor);
