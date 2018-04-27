/* global SplitText */
(function () {
	'use strict';

	const twitchPlayer = nodecg.Replicant('twitchPlayer');
	const currentRun = nodecg.Replicant('currentRun');
	var layoutWidth;
	var layoutHeight;
	var layoutHeightBottom;
	var scaleRatio;
	var scaleRatioBottom;
	var aspectRatioWidth;
	var aspectRatioHeight;
	var aspectRatioBottomWidth;
	var aspectRatioBottomHeight;

	var currRunName = "";
	var currRunNote = "";
	var currRunnerList = [];
	var self;
	var isDS;

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

							var layoutCount = newVal.notes.split("_");
							layoutCount[1] = "_" + layoutCount[1];

							layoutWidth = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].divWidth;
							layoutHeight = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].divHeight;
							layoutHeightBottom = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].divHeight_bottom;
							scaleRatio = layoutHeight / 270;
							scaleRatioBottom = layoutHeightBottom / 270;

							isDS = false;

							if (layoutCount[0] == "Standard") {
								aspectRatioWidth = 4;
								aspectRatioHeight = 3;
							} else if (layoutCount[0] == "Widescreen") {
								aspectRatioWidth = 16;
								aspectRatioHeight = 9;
							} else if (layoutCount[0] == "Gameboy") {
								aspectRatioWidth = 10;
								aspectRatioHeight = 9;
							} else if (layoutCount[0] == "GBA") {
								aspectRatioWidth = 3;
								aspectRatioHeight = 2;
							} else if (layoutCount[0] == "DS") {
								aspectRatioWidth = 4;
								aspectRatioHeight = 3;
								isDS = true;
							} else if (layoutCount[0] == "3DS") {
								aspectRatioWidth = 5; 
								aspectRatioHeight = 3;
								aspectRatioBottomWidth = 4;
								aspectRatioBottomHeight = 3;
								isDS = true;
							} 

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

				this.p1W = twitchPlayer.value.streamAWidth;
				this.p1H = twitchPlayer.value.streamAHeight;
				this.p1L = twitchPlayer.value.streamALeft;
				this.p1T = twitchPlayer.value.streamATop;

				this.p2W = twitchPlayer.value.streamBWidth;
				this.p2H = twitchPlayer.value.streamBHeight;
				this.p2L = twitchPlayer.value.streamBLeft;
				this.p2T = twitchPlayer.value.streamBTop;

				this.p3W = twitchPlayer.value.streamCWidth;
				this.p3H = twitchPlayer.value.streamCHeight;
				this.p3L = twitchPlayer.value.streamCLeft;
				this.p3T = twitchPlayer.value.streamCTop;

				this.p4W = twitchPlayer.value.streamDWidth;
				this.p4H = twitchPlayer.value.streamDHeight;
				this.p4L = twitchPlayer.value.streamDLeft;
				this.p4T = twitchPlayer.value.streamDTop;
			

			var selectboxWidth = (270 / aspectRatioHeight) * aspectRatioWidth; 
			var selectboxBottomWidth = (270 / aspectRatioBottomHeight) * aspectRatioBottomWidth;
			this.$.selectboxp1.setAttribute("width", selectboxWidth);
			this.$.selectboxp1.setAttribute("height", "270");

			this.$.selectboxp2.setAttribute("height", "270");

			this.$.selectboxp3.setAttribute("width", selectboxWidth);
			this.$.selectboxp3.setAttribute("height", "270");

			this.$.selectboxp4.setAttribute("height", "270");

			if ((['3DS', 'Nintendo 3DS'].includes(currentRun.value.console)) && (currentRun.value.runners.length <= 2)) {
				this.$.selectboxp2.setAttribute("width", selectboxBottomWidth);
			} else {
				this.$.selectboxp2.setAttribute("width", selectboxWidth);
			}

			if ((['3DS', 'Nintendo 3DS'].includes(currentRun.value.console)) && (currentRun.value.runners.length <= 2)) {
				this.$.selectboxp4.setAttribute("width", selectboxBottomWidth);
			} else {
				this.$.selectboxp4.setAttribute("width", selectboxWidth);
			}

			this._adjustScreenshot(0);
			this._adjustScreenshot(1);
			this._adjustScreenshot(2);
			this._adjustScreenshot(3);
		}

		resetPlayer(id)
		{
			var layoutCount = currentRun.value.notes.split("_");
			layoutCount[1] = "_" + layoutCount[1]; //adjusted for bingo

			if (id == 0) {
				this.p1W = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].width;
				this.p1H = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].height;
				this.p1L = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].left;
				this.p1T = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].up;
			}
			else if (id == 1) {
				if ((['NDS', 'Nintendo DS', 'NDSi', 'Nintendo DSi', '3DS', 'Nintendo 3DS'].includes(currentRun.value.console))  && (currentRun.value.runners.length <= 2)) {
					nodecg.log.info('3DS dualscreen player2; reset to bottom size');
					this.p2W = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].width_bottom;
					this.p2H = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].height_bottom;
					this.p2L = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].left_bottom;
					this.p2T = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].up_bottom;
				} else {
					this.p2W = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].width;
					this.p2H = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].height;
					this.p2L = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].left;
					this.p2T = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].up;
				}
			}
			else if (id == 2) {
				this.p3W = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].width;
				this.p3H = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].height;
				this.p3L = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].left;
				this.p3T = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].up;
			}
			else if (id == 3) {
				if ((['NDS', 'Nintendo DS', 'NDSi', 'Nintendo DSi', '3DS', 'Nintendo 3DS'].includes(currentRun.value.console)) && (currentRun.value.runners.length <= 2)) {
					nodecg.log.info('3DS dualscreen player4; reset to bottom size');
					this.p4W = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].width_bottom;
					this.p4H = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].height_bottom;
					this.p4L = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].left_bottom;
					this.p4T = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].up_bottom;
				} else {
					this.p4W = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].width;
					this.p4H = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].height;
					this.p4L = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].left;
					this.p4T = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].up;
				}
			}
		}

		_submit1() {

			var force = false;

			if (twitchPlayer.value.streamAWidth != this.p1W || twitchPlayer.value.streamAHeight != this.p1H)
				force = true;

			twitchPlayer.value.streamAWidth = this.p1W;
			twitchPlayer.value.streamAHeight = this.p1H;
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
            this.p1H = event.detail.value;
			this.p1W = Math.round((event.detail.value / 9) * 16);

			this._adjustScreenshot(0);
		}

		_recalcHeight1(event) {
            this.p1W = event.detail.value;
			this.p1H = Math.round((event.detail.value / 16) * 9);

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
			
		_submit2() {

			var force = false;

			if (twitchPlayer.value.streamBWidth != this.p2W || twitchPlayer.value.streamBHeight != this.p2H)
				force = true;

			twitchPlayer.value.streamBWidth = this.p2W;
			twitchPlayer.value.streamBHeight = this.p2H;
			twitchPlayer.value.streamBLeft = this.p2L;
			twitchPlayer.value.streamBTop = this.p2T;

			setTimeout(() => {
				nodecg.sendMessage("resetTwitchPlayer", { id: 2, forceReset: force });
			}, 100);
		}

		_reset2() {
			this.resetPlayer(1);

			this._adjustScreenshot(1);
		}

		_recalcWidth2(event) {

            this.p2H = event.detail.value;
			this.p2W = Math.round((event.detail.value / 9) * 16);

			this._adjustScreenshot(1);
		}

		_recalcHeight2(event) {

            this.p2W = event.detail.value;
			this.p2H = Math.round((event.detail.value / 16) * 9);

			this._adjustScreenshot(1);
		}

		_confirmLeft2(event) {
			this.p2L = event.detail.value;

			this._adjustScreenshot(1);
		}
		_confirmTop2(event) {
			this.p2T = event.detail.value;

			this._adjustScreenshot(1);
		}

        _screenstream2()
        {
            nodecg.sendMessage("takeStreamSnapshot", 1);
        }

		_submit3() {

			var force = false;

			if (twitchPlayer.value.streamCWidth != this.p3W || twitchPlayer.value.streamCHeight != this.p3H)
				force = true;

			twitchPlayer.value.streamCWidth = this.p3W;
			twitchPlayer.value.streamCHeight = this.p3H;
			twitchPlayer.value.streamCLeft = this.p3L;
			twitchPlayer.value.streamCTop = this.p3T;

			setTimeout(() => {
				nodecg.sendMessage("resetTwitchPlayer", { id: 3, forceReset: force });
			}, 100);
		}

		_reset3() {
			this.resetPlayer(2);
			this._adjustScreenshot(2);
		}
	
		_recalcWidth3(event) {

			this.p3H = event.detail.value;
			this.p3W = Math.round((event.detail.value / 9) * 16);
		}

		_recalcHeight3(event) {

			this.p3W = event.detail.value;
			this.p3H = Math.round((event.detail.value / 16) * 9);
		}

		_confirmLeft3(event) {
			this.p3L = event.detail.value;

			this._adjustScreenshot(2);
		}
		_confirmTop3(event) {
			this.p3T = event.detail.value;

			this._adjustScreenshot(2);
		}
        _screenstream3()
        {
            nodecg.sendMessage("takeStreamSnapshot", 2);
        }

		_submit4() {

			var force = false;

			if (twitchPlayer.value.streamDWidth != this.p4W || twitchPlayer.value.streamDHeight != this.p4H)
				force = true;

			twitchPlayer.value.streamDWidth = this.p4W;
			twitchPlayer.value.streamDHeight = this.p4H;
			twitchPlayer.value.streamDLeft = this.p4L;
			twitchPlayer.value.streamDTop = this.p4T;

			setTimeout(() => {
				nodecg.sendMessage("resetTwitchPlayer", { id: 4, forceReset: force });
			}, 100);
		}

		_reset4() {
			this.resetPlayer(3);
			this._adjustScreenshot(3);
		}

		_recalcWidth4(event) {

			this.p4H = event.detail.value;
			this.p4W = Math.round((event.detail.value / 9) * 16);
		}

		_recalcHeight4(event) {

			this.p4W = event.detail.value;
			this.p4H = Math.round((event.detail.value / 16) * 9);
		}
		_confirmLeft4(event) {
			this.p4L = event.detail.value;

			this._adjustScreenshot(3);
		}
		_confirmTop4(event) {
			this.p4T = event.detail.value;

			this._adjustScreenshot(3);
		}

        _screenstream4()
        {
            nodecg.sendMessage("takeStreamSnapshot", 3);
        }

		_adjustScreenshot(id) {
			var scaledHeight;
			var scaledWidth;
			var scaledLeft;
			var scaledTop;

			if (id == 0) {
				scaledHeight = Math.round(this.p1H / scaleRatio);
				scaledWidth = Math.round(this.p1W / scaleRatio);
				scaledLeft = Math.round(this.p1L / scaleRatio);
				scaledTop = Math.round(this.p1T / scaleRatio);
				this.$.screenshot1.setAttribute("width", scaledWidth);
				this.$.screenshot1.setAttribute("height", scaledHeight);
				this.$.screenshot1.setAttribute("style",  "Left: " + scaledLeft + "px; Top: " + scaledTop + "px;");
			} else if (id == 1) {
				if ((isDS) && (currentRun.value.runners.length <= 2)) {
					scaledHeight = Math.round(this.p2H / scaleRatioBottom);
					scaledWidth = Math.round(this.p2W / scaleRatioBottom);
					scaledLeft = Math.round(this.p2L / scaleRatioBottom);
					scaledTop = Math.round(this.p2T / scaleRatioBottom);
				} else {
					scaledHeight = Math.round(this.p2H / scaleRatio);
					scaledWidth = Math.round(this.p2W / scaleRatio);
					scaledLeft = Math.round(this.p2L / scaleRatio);
					scaledTop = Math.round(this.p2T / scaleRatio);
				}
				this.$.screenshot2.setAttribute("width", scaledWidth);
				this.$.screenshot2.setAttribute("height", scaledHeight);
				this.$.screenshot2.setAttribute("style",  "Left: " + scaledLeft + "px; Top: " + scaledTop + "px;");
			} else if (id == 2) {
				scaledHeight = Math.round(this.p3H / scaleRatio);
				scaledWidth = Math.round(this.p3W / scaleRatio);
				scaledLeft = Math.round(this.p3L / scaleRatio);
				scaledTop = Math.round(this.p3T / scaleRatio);
				this.$.screenshot3.setAttribute("width", scaledWidth);
				this.$.screenshot3.setAttribute("height", scaledHeight);
				this.$.screenshot3.setAttribute("style",  "Left: " + scaledLeft + "px; Top: " + scaledTop + "px;");
			} else if (id == 3) {
				if ((isDS) && (currentRun.value.runners.length <= 2)) {
					scaledHeight = Math.round(this.p4H / scaleRatioBottom);
					scaledWidth = Math.round(this.p4W / scaleRatioBottom);
					scaledLeft = Math.round(this.p4L / scaleRatioBottom);
					scaledTop = Math.round(this.p4T / scaleRatioBottom);
				} else {
					scaledHeight = Math.round(this.p4H / scaleRatio);
					scaledWidth = Math.round(this.p4W / scaleRatio);
					scaledLeft = Math.round(this.p4L / scaleRatio);
					scaledTop = Math.round(this.p4T / scaleRatio);
				}
				this.$.screenshot4.setAttribute("width", scaledWidth);
				this.$.screenshot4.setAttribute("height", scaledHeight);
				this.$.screenshot4.setAttribute("style",  "Left: " + scaledLeft + "px; Top: " + scaledTop + "px;");
			}
		}

		_refreshLayoutDashImages() {

			console.log("Refresh Images");

			self.$.screenshot1.setAttribute("src", "../graphics/img/streamSnaps/0.jpg?" + new Date().getTime());
			self.$.screenshot2.setAttribute("src", "../graphics/img/streamSnaps/1.jpg?" + new Date().getTime());
			self.$.screenshot3.setAttribute("src", "../graphics/img/streamSnaps/2.jpg?" + new Date().getTime());
			self.$.screenshot4.setAttribute("src", "../graphics/img/streamSnaps/3.jpg?" + new Date().getTime());
		}
	}
	customElements.define(ZsrPlayerLayout.is, ZsrPlayerLayout);

})();

