/* global SplitText */
(function () {
	'use strict';

	const twitchPlayer = nodecg.Replicant('twitchPlayer');
	const currentRun = nodecg.Replicant('currentRun');
	var layoutWidth;
	var layoutHeight;
	var scaleRatioY;
	var scaleRatioX;
	var aspectRatioWidth;
	var aspectRatioHeight;

	var sourceWidth = 1280;
	var sourceHeight = 720;

	var currRunName = "";
	var currRunNote = "";
	var currRunnerList = [];
	var self;

	class ZsrPlayerLayout extends Polymer.Element
	{
	    static get is()
	    {
			return 'zsr-player-layout';
		}

        static get properties()
        {
			return {
				row: {
                    type: String,
                    reflectToAttribute: true
				},
				col: {
                    type: String,
                    reflectToAttribute: true
				},
				width: {
                    type: String,
                    reflectToAttribute: true
				},
				height: {
                    type: String,
                    reflectToAttribute: true
                }
			};
		}

	    ready()
	    {
			super.ready();

			this.selected = 0; //default select player 1

			const replicants =
				[
					twitchPlayer,
					currentRun
				];
			
			let numDeclared = 0;
			replicants.forEach(replicant => {
				replicant.once('change', () => {
					numDeclared++;

					// Start the loop once all replicants are declared
					if (numDeclared >= replicants.length) {

						self = this;

						nodecg.listenFor('refreshLayoutDashImages', this._refreshLayoutDashImages);

						currentRun.on('change', newVal => {

							if (!newVal)
								return;

							if (currRunName != "" && currRunNote != "" && currRunnerList)
								if (currRunName == newVal.name && currRunNote == newVal.notes)
									if (JSON.stringify(currRunnerList) == JSON.stringify(newVal.runners))
										return;				

							currRunName = newVal.name;
							currRunNote = newVal.notes;
							currRunnerList = newVal.runners;

							this.layoutWidth = 558;
							this.layoutHeight = 446;
							scaleRatioY = layoutHeight / 270;
							scaleRatioX = layoutWidth / scaleRatioY;
							
							aspectRatioWidth = 279;
							aspectRatioHeight = 223; 

							setTimeout(() => {

								this.recalcRectangles();	

							}, 200);										
						});
					}
				});
			});
		}

		recalcRectangles()
		{
			//Load current values

			this.p1R = twitchPlayer.value.streamAWidth;
			this.p1B = twitchPlayer.value.streamAHeight;
			this.p1L = twitchPlayer.value.streamALeft;
			this.p1T = twitchPlayer.value.streamATop;
			

			var selectboxWidth = Math.round((270.0 / aspectRatioHeight) * aspectRatioWidth); 
			console.log(selectboxWidth);
			this.$.selectboxp1.setAttribute("width", selectboxWidth);
			this.$.selectboxp1.setAttribute("height", "270");

			this._adjustScreenshot(0);
		}

		sourceAspectRatio()
		{
			return this.sourceWidth / this.sourceHeight;
		}

		resetPlayer(id)
		{
			this.p1R = 0;
			this.p1B = 0;
			this.p1L = 0;
			this.p1T = 0;
		}

		_submit1() {

			var force = false;

			if (twitchPlayer.value.streamAWidth != this.p1R || twitchPlayer.value.streamAHeight != this.p1B)
				force = true;

			twitchPlayer.value.streamAWidth = this.p1R;
			twitchPlayer.value.streamAHeight = this.p1B;
			twitchPlayer.value.streamALeft = this.p1L;
			twitchPlayer.value.streamATop = this.p1T;

			setTimeout(() => {
				nodecg.sendMessage("resetTwitchPlayer", { id: 1, forceReset: force });
			}, 100);
		}

		_reset1() {
			this.resetPlayer(0);

			this._adjustScreenshot(0);
		}

		_recalcWidth1(event) {
			this._adjustScreenshot(0);
		}

		_recalcHeight1(event) {
			this._adjustScreenshot(0);
		}
		_confirmLeft1(event) {
			this.p1L = event.detail.value;

			this._adjustScreenshot(0);
		}
		_confirmTop1(event) {
			this.p1T = event.detail.value;

			this._adjustScreenshot(0);
		}

        _screenstream1()
        {
            console.log("Message going out");
            nodecg.sendMessage("takeStreamSnapshot", 0);
        }
			
		_adjustScreenshot(id) {
			//Determine what the current content size is that we need to scale.
			var unscaledCropSize = {
				width: this.sourceWidth - this.p1L - this.p1R,
				height: this.sourceHeight - this.p1T - this.p1B
			};
			
			//Now determine how much it needs to be scaled to fit right.
			var selectboxWidth = Math.round((270.0 / aspectRatioHeight) * aspectRatioWidth); 
			var selectBoxHeight = 270;

			var aspectRatioScaleX = selectboxWidth / unscaledCropSize.width;
			var aspectRatioScaleY = selectBoxHeight / unscaledCropSize.height;

			//Then do the scaling 
			var scaledCrop = {
				left: this.p1L * aspectRatioScaleX,
				top: this.p1T * aspectRatioScaleY,
			};
			var scaledSize = {
				width: this.sourceWidth * aspectRatioScaleX,
				height: this.sourceHeight * aspectRatioScaleY
			};

			this.$.screenshot1.setAttribute("width", scaledSize.width);
			this.$.screenshot1.setAttribute("height", scaledSize.height);
			this.$.screenshot1.setAttribute("style",  "Left: " + (-scaledCrop.left) + "px; Top: " + (-scaledCrop.top) + "px;");
		}

		_imageLoad(event) {
			this.sourceWidth = Math.max(event.target.naturalWidth, 1);
			this.sourceHeight = Math.max(event.target.naturalHeight, 1);

			this._adjustScreenshot(0);
		}

		_refreshLayoutDashImages() {

			console.log("Refresh Images");

			self.$.screenshot1.setAttribute("src", "../graphics/img/streamSnaps/0.jpg?" + new Date().getTime());
		}
	}
	customElements.define(ZsrPlayerLayout.is, ZsrPlayerLayout);

})();

