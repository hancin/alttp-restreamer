class AlttpRunSection extends Polymer.MutableData(Polymer.Element) {
	static get is() {
		return 'alttp-run-section';
	}

	static get properties() {
		return {
			showingOriginal: {
				type: Boolean,
				value: false
			},
			data: { type: Array,
				value: [] },
			originalValues: Array,
			name: String,
			max: Number
		};
	}

	_add(e) {
		this.push('data', {name: '', discord:'', stream:''});
	}

	_canAddMore(count, max){
		if(!max)
			return true;
		
		return count < max;
	}

	calcDisabledIndex(index, count, last){

		var realLast = last === 1;
		if(!realLast && index === 0)
			return true;
		if(realLast && index === count-1)
			return true;
		return false;
	}

	calcVal(originalValues, index, name){
		if(typeof originalValues === 'undefined' || originalValues === null)
			return '';
		
		return this.get(name, originalValues[index]);
	}

	
	_moveDown(e) {
		const index = parseInt(e.target.closest('[data-index]').getAttribute('data-index'), 10);
		this.data = this._moveRunner(this.data, index, 'down');
	}

	_moveUp(e) {
		const index = parseInt(e.target.closest('[data-index]').getAttribute('data-index'), 10);
		this.data = this._moveRunner(this.data, index, 'up');
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
	
	_shouldDisplayOriginal(path1, path2, showingOriginal){
		const originalPath = ['originalValues', path1, path2];

		const originalValue = this.get(originalPath);
		const hasOriginal = typeof originalValue !== 'undefined';
		return showingOriginal && hasOriginal;
	}

}

customElements.define(AlttpRunSection.is, AlttpRunSection);
