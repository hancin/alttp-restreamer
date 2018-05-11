class GdqScheduleRuninfo extends Polymer.Element {
	static get is() {
		return 'gdq-schedule-runinfo';
	}

	static get properties() {
		return {
			notes: {
				type: String,
				observer: '_notesChanged'
			},
			time: {
				type: String,
				observer: '_timeChanged'
			},
			label: {
				type: String,
				reflectToAttribute: true
			},
			commentators: {
				type: Array,
				value: []
			},
			trackers: {
				type: Array,
				value: []
			},
			runners: Array,
			category: String,
			name: String,
			originalValues: Object,
			broadcasters: {
				type: Array,
				value: []
			},
			order: Number,
			animationTime: Number
		};
	}

	_notesChanged(newVal) {
		if (newVal) {
			this.$.notes.querySelector('.value').innerHTML = newVal.replace(/\r\n/g, '<br/>').replace(/\n/g, '<br/>');
		} else {
			this.$.notes.querySelector('.value').innerHTML = '';
		}
	}

	_timeChanged(newVal){
		if (newVal) {
			this.$.timeago.innerHTML = moment(newVal).fromNow();
		} else {
			this.$.timeago.innerHTML = '';
		}
	}

	setRun(run) {
		this.name = run.name;
		this.commentators = run.commentators;
		this.trackers = run.trackers;
		this.runners = run.runners;
		this.category = run.category;
		this.order = run.order;
		this.notes = run.notes;
		this.broadcasters = run.broadcasters;
		this.time = run.time;
		this.originalValues = run.originalValues;

	}

	ready(){
		super.ready();
		
		setInterval((() => this._timeChanged(this.time)).bind(this), 15000);
	}

	calcName(name) {
		if (name) {
			return name.split('\\n').join(' ');
		}

		return name;
	}

	calcModified(original) {
		return typeof original === 'undefined' || original === null ? '' : 'modified';
	}
}

customElements.define(GdqScheduleRuninfo.is, GdqScheduleRuninfo);
