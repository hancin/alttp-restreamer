(function () {
	'use strict';

	const currentRun = nodecg.Replicant('currentRun');
	const nextRun = nodecg.Replicant('nextRun');
	const twitchPlayer = nodecg.Replicant('twitchPlayer');
	const gameAudioChannels = nodecg.Replicant('gameAudioChannels');

	var currentRunInfo;
	var desiredRunInfo;

	var currentPlayerInfo;

	var videoWidth = 0;
	var videoHeight = 0;
	var countRunners = 0;

	var playerReady = false;
	var runReady = false;
	var init = false;

	var playerA;
	var playerB;
	var playerC;
	var playerD;

	var aWasPaused = false;
	var bWasPaused = false;
	var cWasPaused = false;
	var dWasPaused = false;

	var doesPlayerAExist = false;
	var doesPlayerBExist = false;
	var doesPlayerCExist = false;
	var doesPlayerDExist = false;

	var aPlayerContainer;
	var bPlayerContainer;
	var cPlayerContainer;
	var dPlayerContainer;

	var testMode = false;

	var isBusy = false;

	var giveStats = false;

	var delayCheckTimeout;
	var lastDelayToHost = 0;

	var isDoingFade = false;
	var currFadeValMS = 0;
	var targetDelayMS = 0;
	var fadeTimeout;

	function isLeader(playID)
	{
	    if (doesPlayerAExist || doesPlayerBExist || doesPlayerCExist || doesPlayerDExist)
	    {
	        if (!gameAudioChannels.value[0].audio.muted && playID == playerA) //player 1 (left) isnt muted thus he leads
	        {
	            return true;
	        }
	        else if (!gameAudioChannels.value[1].audio.muted && playID == playerB) //player 2 (right) isnt muted thus he leads
	        {
	            return true;
	        }
	        else if (!gameAudioChannels.value[2].audio.muted && playID == playerC) //player 3 (bottom-left) isnt muted thus he leads
	        {
	            return true;
	        }
	        else if (!gameAudioChannels.value[3].audio.muted && playID == playerD) //player 4 (bottom-right) isnt muted thus he leads
	        {
	            return true;
	        }
	        else
	        {
	            return false;
	        }
	    }

	    return false;
	}

	function monitorDelay()
	{
	    let stats;

	    if (doesPlayerAExist)
	    {        
	       stats = playerA.getPlaybackStats();
	       
	       if (stats)
	       {
	           let delay = stats.hlsLatencyBroadcaster;

	           console.log("delay A: ", delay);

	           if (delay > 0)
	           {
	               targetDelayMS = delay * 1000;

	               twitchPlayer.value.streamADelay = targetDelayMS;

	               if (isLeader(playerA))
	                   twitchPlayer.value.streamLeaderDelay = targetDelayMS;
	           }
	       }
	    }

	    if (doesPlayerBExist) {
	        stats = playerB.getPlaybackStats();

	        if (stats)
	        {
	            let delay = stats.hlsLatencyBroadcaster;

	            console.log("delay B: ", delay);

	            if (delay > 0) {
	                targetDelayMS = delay * 1000;

	                twitchPlayer.value.streamBDelay = targetDelayMS;

	                if (isLeader(playerB))
	                    twitchPlayer.value.streamLeaderDelay = targetDelayMS;
	            }
	        }
	    }

	    if (doesPlayerCExist) {
	        stats = playerC.getPlaybackStats();

	        if (stats) {
	            let delay = stats.hlsLatencyBroadcaster;

	            console.log("delay C: ", delay);

	            if (delay > 0) {
	                targetDelayMS = delay * 1000;

	                twitchPlayer.value.streamCDelay = targetDelayMS;

	                if (isLeader(playerC))
	                    twitchPlayer.value.streamLeaderDelay = targetDelayMS;
	            }
	        }
	    }

	    if (doesPlayerDExist) {
	        stats = playerD.getPlaybackStats();

	        if (stats) {
	            let delay = stats.hlsLatencyBroadcaster;

	            console.log("delay D: ", delay);

	            if (delay > 0) {
	                targetDelayMS = delay * 1000;

	                twitchPlayer.value.streamDDelay = targetDelayMS;

	                if (isLeader(playerD))
	                    twitchPlayer.value.streamLeaderDelay = targetDelayMS;
	            }
	        }
	    }

	    //Schedule Next Delay Check Timeout
	    delayCheckTimeout = setTimeout(() =>
	    {
	        monitorDelay();
	    }, 10 * 1000); //10 seconds
	}

	/*
	function getRes()
	{
		var layoutCount = currentRunInfo.notes.split("_");
		layoutCount[1] = "_" + layoutCount[1];

		videoWidth = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].width;
		videoHeight = twitchPlayer.value.layoutSetup[layoutCount[0]][layoutCount[1]].height;

		console.log("Layout: " + currentRunInfo.notes + " Width: " + videoWidth + " Height: " + videoHeight);
	}
	*/

	function positionPlayer(iFrame, playerID)
	{
		iFrame.style.position = "relative";

		if (playerID == 0) {
			iFrame.style.left = twitchPlayer.value.streamALeft.toString() + "px";
			iFrame.style.top = twitchPlayer.value.streamATop.toString() + "px";
		}
		else if (playerID == 1) {
			iFrame.style.left = twitchPlayer.value.streamBLeft.toString() + "px";
			iFrame.style.top = twitchPlayer.value.streamBTop.toString() + "px";
		}
		else if (playerID == 2) {
			iFrame.style.left = twitchPlayer.value.streamCLeft.toString() + "px";
			iFrame.style.top = twitchPlayer.value.streamCTop.toString() + "px";
		}
		else if (playerID == 3) {
			iFrame.style.left = twitchPlayer.value.streamDLeft.toString() + "px";
			iFrame.style.top = twitchPlayer.value.streamDTop.toString() + "px";
		}

		console.log("Layout: " + currentRunInfo.notes + " Left: " + iFrame.style.left + " Top: " + iFrame.style.top);
	}

	function stopAllPlayers()
	{ 
	    if (playerA && doesPlayerAExist == true)
	    {
	        playerA.pause();

	        var a = document.getElementById("twitch-streamA");
	        if (a)
	        {
	            a.hidden = true;
	            a.parentNode.removeChild(a);
	        }

            var node = document.createElement('div');
            node.setAttribute("id", "twitch-streamA");

            aPlayerContainer.appendChild(node);

            playerA = null;
            doesPlayerAExist = false;
	    }

	    if (playerB && doesPlayerBExist == true)
	    {
	        playerB.pause();

	        var b = document.getElementById("twitch-streamB");
	        if (b)
	        {
	            b.hidden = true;
	            b.parentNode.removeChild(b);
	        }

            var node = document.createElement('div');
            node.setAttribute("id", "twitch-streamB");

            bPlayerContainer.appendChild(node);

            playerB = null;
            doesPlayerBExist = false;
	    }

	    if (playerC && doesPlayerCExist == true) {
	        playerC.pause();

	        var c = document.getElementById("twitch-streamC");
	        if (c) {
	            c.hidden = true;
	            c.parentNode.removeChild(c);
	        }

	        var node = document.createElement('div');
	        node.setAttribute("id", "twitch-streamC");

	        cPlayerContainer.appendChild(node);

	        playerC = null;
	        doesPlayerCExist = false;
	    }

	    if (playerD && doesPlayerDExist == true) {
	        playerD.pause();

	        var d = document.getElementById("twitch-streamD");
	        if (d) {
	            d.hidden = true;
	            d.parentNode.removeChild(d);
	        }

	        var node = document.createElement('div');
	        node.setAttribute("id", "twitch-streamD");

	        dPlayerContainer.appendChild(node);

	        playerD = null;
	        doesPlayerDExist = false;
	    }
	}

	function updatePlayer()
	{
	    if (playerA && doesPlayerAExist == true && currentPlayerInfo.streamARunning)
	    {
	        playerA.setVolume(currentPlayerInfo.streamAVolume);
	        playerA.setMuted(currentPlayerInfo.streamAMuted);

	        if (playerA.getChannel() !== currentPlayerInfo.streamAURL)
	            playerA.setChannel(currentPlayerInfo.streamAURL);

	        var a = document.getElementById("twitch-streamA");

	        if (currentPlayerInfo.streamAPaused == false && aWasPaused == true) {

	            aWasPaused = false;

	            playerA.play();
	            a.hidden = false;
	        }
	        else if (currentPlayerInfo.streamAPaused == true && aWasPaused == false) {

	            aWasPaused = true;

	            a.hidden = true;
	            playerA.pause();
	        }
	    }

	    if (playerB && doesPlayerBExist == true && currentPlayerInfo.streamBRunning)
	    {
	        playerB.setVolume(currentPlayerInfo.streamBVolume);
	        playerB.setMuted(currentPlayerInfo.streamBMuted);

	        if (playerB.getChannel() !== currentPlayerInfo.streamBURL)
	            playerB.setChannel(currentPlayerInfo.streamBURL);

	        var b = document.getElementById("twitch-streamB");

	        if (currentPlayerInfo.streamBPaused == false && bWasPaused == true) {

	            bWasPaused = false;

	            playerB.play();
	            b.hidden = false;
	        }
	        else if (currentPlayerInfo.streamBPaused == true && bWasPaused == false) {

	            bWasPaused = true;

	            b.hidden = true;
	            playerB.pause();
	        }
	    }

	    if (playerC && doesPlayerCExist == true && currentPlayerInfo.streamCRunning) {
	        playerC.setVolume(currentPlayerInfo.streamCVolume);
	        playerC.setMuted(currentPlayerInfo.streamCMuted);

	        if (playerC.getChannel() !== currentPlayerInfo.streamCURL)
	            playerC.setChannel(currentPlayerInfo.streamCURL);

	        var c = document.getElementById("twitch-streamC");

	        if (currentPlayerInfo.streamCPaused == false && cWasPaused == true) {

	            cWasPaused = false;

	            playerC.play();
	            c.hidden = false;
	        }
	        else if (currentPlayerInfo.streamCPaused == true && cWasPaused == false)
	        {
	            cWasPaused = true;

	            c.hidden = true;
	            playerC.pause();
	        }
	    }

	    if (playerD && doesPlayerDExist == true && currentPlayerInfo.streamDRunning) {
	        playerD.setVolume(currentPlayerInfo.streamDVolume);
	        playerD.setMuted(currentPlayerInfo.streamDMuted);

	        if (playerD.getChannel() !== currentPlayerInfo.streamDURL)
	            playerD.setChannel(currentPlayerInfo.streamDURL);

	        var d = document.getElementById("twitch-streamD");

	        if (currentPlayerInfo.streamDPaused == false && dWasPaused == true) {

	            dWasPaused = false;

	            playerD.play();
	            d.hidden = false;
	        }
	        else if (currentPlayerInfo.streamDPaused == true && dWasPaused == false) {

	            dWasPaused = true;

	            d.hidden = true;
	            playerD.pause();
	        }
	    }
	}

	function switchRun(desiredRun)
	{
	    if (currentRunInfo)
	    {
	        if (currentRunInfo.shortName == desiredRun.shortName) {
	            return;
	        }

	        console.log(currentRunInfo.shortName + " " + desiredRun.shortName);
	    }

	    /*
	    if (playerReady == false)
	    {
	        isBusy = false;
	        return;
	    }

	    if (currentPlayerInfo.playerInstanceCreated == false) //user agent exception:  window.navigator.userAgent === "Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.0 Safari/537.36"
	    {
	        if (currentRunInfo)
	        {
	            if (currentRunInfo.shortName == desiredRun.shortName)
	            {
	                isBusy = false;
	                return;
	            }
	        }

	        currentRunInfo = desiredRun;
	        currentPlayerInfo.playerInstanceCreated = true;

	        testMode = false;

	        console.log("run is now: ", currentRunInfo.shortName);

            //Reset all fade infos on run start/change
	        isDoingFade = false;
	        lastDelayToHost = 0;

	        clearTimeout(delayCheckTimeout);
	        clearTimeout(fadeTimeout);
	    }
	    else //test mode for next run setup
	    {
	        testMode = true;

	        if (nextRun.value)
	        {
	            currentRunInfo = nextRun.value;

	            console.log("TEST MODE. Testing next run: ", currentRunInfo.shortName);
	        }
	        else
	        {
	            console.log("TEST MODE. No next run available");
	            return;
	        }
	    }
        */

        /*
	    if (currentRunInfo)
	    {
	        if (currentRunInfo.shortName == desiredRun.shortName) {
	            isBusy = false;
	            return;
	        }
	    }
        */

	    currentRunInfo = desiredRun;
	    currentPlayerInfo.playerInstanceCreated = true;

	    testMode = false;

	    console.log("run is now: ", currentRunInfo.shortName);

	    //Reset all fade infos on run start/change
	    isDoingFade = false;
	    lastDelayToHost = 0;

	    clearTimeout(delayCheckTimeout);
	    clearTimeout(fadeTimeout);

	    init = true;

	    stopAllPlayers();

	    //getRes();

	    countRunners = 0;
	    lastDelayToHost = 0;

	    currentRunInfo.runners.forEach((runner, index) => {
	        if (!runner) {
	            return;
	        }
	        else {
	            countRunners += 1;
	        }
	    });

	    var optionsStreamA =
        {
			width: twitchPlayer.value.streamAWidth,
			height: twitchPlayer.value.streamAHeight,
            channel: currentPlayerInfo.streamAURL,
            controls: false,
        };

	    var optionsStreamB =
        {
			width: twitchPlayer.value.streamBWidth,
			height: twitchPlayer.value.streamBHeight,
            channel: currentPlayerInfo.streamBURL,
            controls: false,
        };

	    var optionsStreamC =
        {
			width: twitchPlayer.value.streamCWidth,
			height: twitchPlayer.value.streamCHeight,
            channel: currentPlayerInfo.streamCURL,
            controls: false,
        };

	    var optionsStreamD =
        {
			width: twitchPlayer.value.streamDWidth,
			height: twitchPlayer.value.streamDHeight,
            channel: currentPlayerInfo.streamDURL,
            controls: false,
        };

	    if (countRunners > 0) {

	        console.log("this run has 1-4 runners");

            //Player 1
	        var a = document.getElementById("twitch-streamA");
	        if (a)
	        {
	            playerA = new Twitch.Player("twitch-streamA", optionsStreamA);
	            playerA.setQuality("chunked");

	            a.hidden = false;

	            doesPlayerAExist = true;
	            aPlayerContainer = a.parentNode;

	            positionPlayer(a.children[0], 0);

	            playerA.addEventListener(Twitch.Player.READY, function () {
	                console.log("PLAYER A READY!!");

	                if (testMode == false) {
	                    setTimeout(() => {
	                        currentPlayerInfo.streamARunning = true;
	                    }, 2000);
	                }
	            });

	            playerA.addEventListener(Twitch.Player.ONLINE, function () {
	                console.log("PLAYER A ONLINE!!");

	                playerA.play();
	            });

	            playerA.addEventListener(Twitch.Player.OFFLINE, function () {
	                console.log("PLAYER A OFFLINE!!");
	            });

	            playerA.addEventListener(Twitch.Player.PAUSE, function () {
	                console.log("PLAYER A PAUSED!!");
	            });

	            playerA.addEventListener(Twitch.Player.PLAY, function () {
	                console.log("PLAYER A PLAYING!!");

	                if (testMode == false) {
	                    var a = document.getElementById("twitch-streamA");

	                    if (a)
	                        a.hidden = false;

	                    currentPlayerInfo.streamAPaused = false;
	                    aWasPaused = false;

	                    playerA.setVolume(currentPlayerInfo.streamAVolume);
	                    playerA.setMuted(currentPlayerInfo.streamAMuted);	                
	                }
	                else {
	                    playerA.setVolume(0.5);
	                    playerA.setMuted(false);
	                }
	            });
	        }

            //Player 2	   
	        var b = document.getElementById("twitch-streamB");
	        if (b)
	        {
	            playerB = new Twitch.Player("twitch-streamB", optionsStreamB);
	            playerB.setQuality("chunked");

	            b.hidden = false;

	            doesPlayerBExist = true;
	            bPlayerContainer = b.parentNode;

	            positionPlayer(b.children[0], 1);

	            playerB.addEventListener(Twitch.Player.READY, function () {
	                console.log("PLAYER B READY!!");

	                if (testMode == false) {
	                    setTimeout(() => {
	                        currentPlayerInfo.streamBRunning = true;
	                    }, 2000);
	                }
	            });

	            playerB.addEventListener(Twitch.Player.ONLINE, function () {
	                console.log("PLAYER B ONLINE!!");

	                playerB.play();
	            });

	            playerB.addEventListener(Twitch.Player.OFFLINE, function () {
	                console.log("PLAYER B OFFLINE!!");
	            });

	            playerB.addEventListener(Twitch.Player.PAUSE, function () {
	                console.log("PLAYER B PAUSED!!");
	            });

	            playerB.addEventListener(Twitch.Player.PLAY, function () {
	                console.log("PLAYER B PLAYING!!");

	                if (testMode == false) {
	                    var b = document.getElementById("twitch-streamB");

	                    if (b)
	                        b.hidden = false;

	                    currentPlayerInfo.streamBPaused = false;
	                    bWasPaused = false;

	                    playerB.setVolume(currentPlayerInfo.streamBVolume);
	                    playerB.setMuted(currentPlayerInfo.streamBMuted);

	                   
	                }
	                else {
	                    playerB.setVolume(0.5);
	                    playerB.setMuted(false);
	                }
	            });
	        }
	       
	        //Player 3
	        var c = document.getElementById("twitch-streamC");
	        if (c)
	        {
	            playerC = new Twitch.Player("twitch-streamC", optionsStreamC);
	            playerC.setQuality("chunked");

	            c.hidden = false;

	            doesPlayerCExist = true;
	            cPlayerContainer = c.parentNode;

	            positionPlayer(c.children[0], 2);

	            playerC.addEventListener(Twitch.Player.READY, function () {
	                console.log("PLAYER C READY!!");

	                if (testMode == false) {
	                    setTimeout(() => {
	                        currentPlayerInfo.streamCRunning = true;
	                    }, 2000);
	                }
	            });

	            playerC.addEventListener(Twitch.Player.ONLINE, function () {
	                console.log("PLAYER C ONLINE!!");

	                playerC.play();
	            });

	            playerC.addEventListener(Twitch.Player.OFFLINE, function () {
	                console.log("PLAYER C OFFLINE!!");
	            });

	            playerC.addEventListener(Twitch.Player.PAUSE, function () {
	                console.log("PLAYER C PAUSED!!");
	            });

	            playerC.addEventListener(Twitch.Player.PLAY, function () {
	                console.log("PLAYER C PLAYING!!");

	                if (testMode == false) {
	                    var c = document.getElementById("twitch-streamC");

	                    if (c)
	                        c.hidden = false;

	                    currentPlayerInfo.streamCPaused = false;
	                    cWasPaused = false;

	                    playerC.setVolume(currentPlayerInfo.streamCVolume);
	                    playerC.setMuted(currentPlayerInfo.streamCMuted);

	                  
	                }
	                else {
	                    playerC.setVolume(0.5);
	                    playerC.setMuted(false);
	                }
	            });
	        }
	       
	        //Player 4
	        var d = document.getElementById("twitch-streamD");
	        if (d)
	        {
	            playerD = new Twitch.Player("twitch-streamD", optionsStreamD);
	            playerD.setQuality("chunked");

	            d.hidden = false;

	            doesPlayerDExist = true;
	            dPlayerContainer = d.parentNode;

	            positionPlayer(d.children[0], 3);

	            playerD.addEventListener(Twitch.Player.READY, function () {
	                console.log("PLAYER D READY!!");

	                if (testMode == false) {
	                    setTimeout(() => {
	                        currentPlayerInfo.streamDRunning = true;
	                    }, 2000);
	                }
	            });

	            playerD.addEventListener(Twitch.Player.ONLINE, function () {
	                console.log("PLAYER D ONLINE!!");

	                playerD.play();
	            });

	            playerD.addEventListener(Twitch.Player.OFFLINE, function () {
	                console.log("PLAYER D OFFLINE!!");
	            });

	            playerD.addEventListener(Twitch.Player.PAUSE, function () {
	                console.log("PLAYER D PAUSED!!");
	            });

	            playerD.addEventListener(Twitch.Player.PLAY, function () {
	                console.log("PLAYER D PLAYING!!");

	                if (testMode == false) {
	                    var d = document.getElementById("twitch-streamD");

	                    if (d)
	                        d.hidden = false;

	                    currentPlayerInfo.streamDPaused = false;
	                    dWasPaused = false;

	                    playerD.setVolume(currentPlayerInfo.streamDVolume);
	                    playerD.setMuted(currentPlayerInfo.streamDMuted);

	                    
	                }
	                else {
	                    playerD.setVolume(0.5);
	                    playerD.setMuted(false);
	                }
	            });
	        }

	        //Schedule initial Delay Check Timeout
	        delayCheckTimeout = setTimeout(() => {
	            monitorDelay();
	        }, 5 * 1000); //5 seconds
	    }

	    isBusy = false;
	}

	function nextGameChanged(newVal)
	{
	    if (isBusy == true) {
	        setTimeout(() => {
	            nextGameChanged(newVal);
	        }, 100);

	        return;
	    }

	    desiredRunInfo = newVal;

	    isBusy = true;
	    runReady = true;

        console.log("send msg askchangeplayer");

	    nodecg.sendMessage('askChangePlayer');
	}
	
	class TwitchPlayer extends Polymer.Element 
    {
		static get is() 
        {
			return 'twitch-player';
		}

		ready()
		{
            super.ready();

            const replicants = 
            [
				currentRun,
                nextRun,
                twitchPlayer,
                gameAudioChannels
			];

			let numDeclared = 0;
			replicants.forEach(replicant => 
            {
				replicant.once('change', () => 
                {
					numDeclared++;
                
					// Start the loop once all replicants are declared
					if (numDeclared >= replicants.length) 
                    {                    
					    twitchPlayer.on('change', newVal => {

		                    if (!newVal)
		                        return;

                            console.log("twitch player change");

		                    currentPlayerInfo = newVal;

		                    if (init == true && testMode == false && currentPlayerInfo.playerInstanceCreated == true)
		                        updatePlayer();
		                });

		                currentRun.on('change', newVal =>
		                {
		                    if (!newVal)
		                        return;

                            console.log("currentrun change");
		                    
		                    switchRun(newVal);

		                    //nextGameChanged(newVal);
		                });

		                nodecg.listenFor('playerChanged', cb =>
		                {
                            console.log("playerchanged");
		                    currentPlayerInfo = twitchPlayer.value;
		                    switchRun(desiredRunInfo);
		                    if (typeof cb === 'function') {
		                        cb();
		                    }
						});

						nodecg.listenFor('resetTwitchPlayer', this._resetTwitchPlayer);
					}
				});
			});   
		}

		_resetTwitchPlayer(resetValues)
		{
			console.log("Reset Player: ", resetValues.id);
			console.log("Force Reset: ", resetValues.forceReset);

			if (!resetValues.forceReset) {

				if (resetValues.id == 1) {

					var a = document.getElementById("twitch-streamA");
					if (a) {
						positionPlayer(a.children[0], 0);
					}
				}
				else if (resetValues.id == 2) {

					var b = document.getElementById("twitch-streamB");
					if (b) {
						positionPlayer(b.children[0], 1);
					}
				}
				else if (resetValues.id == 3) {
					var c = document.getElementById("twitch-streamC");
					if (c) {
						positionPlayer(c.children[0], 2);
					}
				}
				else if (resetValues.id == 4) {
					var d = document.getElementById("twitch-streamD");
					if (d) {
						positionPlayer(d.children[0], 3);
					}
				}
			}
			else
			{			
				if (resetValues.id == 1) { //Player A

					if (playerA && doesPlayerAExist == true) {
						playerA.pause();

						doesPlayerAExist = false;

						var a = document.getElementById("twitch-streamA");
						if (a) {
							a.hidden = true;
							a.parentNode.removeChild(a);
						}

						var node = document.createElement('div');
						node.setAttribute("id", "twitch-streamA");

						aPlayerContainer.appendChild(node);

						playerA = null;
					}

					var optionsStream =
						{
							width: twitchPlayer.value.streamAWidth,
							height: twitchPlayer.value.streamAHeight,
							channel: currentPlayerInfo.streamAURL,
							controls: false
						};

					var a = document.getElementById("twitch-streamA");
					if (a) {

						playerA = new Twitch.Player("twitch-streamA", optionsStream);
						playerA.setQuality("chunked");

						a.hidden = false;

						aPlayerContainer = a.parentNode;

						positionPlayer(a.children[0], 0);

						playerA.addEventListener(Twitch.Player.READY, function () {
							console.log("PLAYER A READY!!");

							doesPlayerAExist = true;

							if (testMode == false) {
								setTimeout(() => {
									currentPlayerInfo.streamARunning = true;
								}, 2000);
							}
						});

						playerA.addEventListener(Twitch.Player.ONLINE, function () {
							console.log("PLAYER A ONLINE!!");

							doesPlayerAExist = true;

							playerA.play();
						});

						playerA.addEventListener(Twitch.Player.OFFLINE, function () {
							console.log("PLAYER A OFFLINE!!");
						});

						playerA.addEventListener(Twitch.Player.PAUSE, function () {
							console.log("PLAYER A PAUSED!!");
						});

						playerA.addEventListener(Twitch.Player.PLAY, function () {
							console.log("PLAYER A PLAYING!!");

							doesPlayerAExist = true;

							if (testMode == false) {
								var a = document.getElementById("twitch-streamA");

								if (a)
									a.hidden = false;

								currentPlayerInfo.streamAPaused = false;
								aWasPaused = false;

								playerA.setVolume(currentPlayerInfo.streamAVolume);
								playerA.setMuted(currentPlayerInfo.streamAMuted);
							}
							else {
								playerA.setVolume(0.5);
								playerA.setMuted(false);
							}
						});
					}
				}
				else if (resetValues.id == 2) { //Player B

					if (playerB && doesPlayerBExist == true) {
						playerB.pause();

						doesPlayerBExist = false;

						var b = document.getElementById("twitch-streamB");
						if (b) {
							b.hidden = true;
							b.parentNode.removeChild(b);
						}

						var node = document.createElement('div');
						node.setAttribute("id", "twitch-streamB");

						bPlayerContainer.appendChild(node);

						playerB = null;
					}

					var optionsStream =
						{
							width: twitchPlayer.value.streamBWidth,
							height: twitchPlayer.value.streamBHeight,
							channel: currentPlayerInfo.streamBURL,
							controls: false
						};

					var b = document.getElementById("twitch-streamB");
					if (b) {

						playerB = new Twitch.Player("twitch-streamB", optionsStream);
						playerB.setQuality("chunked");

						b.hidden = false;

						bPlayerContainer = b.parentNode;

						positionPlayer(b.children[0], 1);

						playerB.addEventListener(Twitch.Player.READY, function () {
							console.log("PLAYER B READY!!");

							doesPlayerBExist = true;

							if (testMode == false) {
								setTimeout(() => {
									currentPlayerInfo.streamBRunning = true;
								}, 2000);
							}
						});

						playerB.addEventListener(Twitch.Player.ONLINE, function () {
							console.log("PLAYER B ONLINE!!");

							doesPlayerBExist = true;

							playerB.play();
						});

						playerB.addEventListener(Twitch.Player.OFFLINE, function () {
							console.log("PLAYER B OFFLINE!!");
						});

						playerB.addEventListener(Twitch.Player.PAUSE, function () {
							console.log("PLAYER B PAUSED!!");
						});

						playerB.addEventListener(Twitch.Player.PLAY, function () {
							console.log("PLAYER B PLAYING!!");

							doesPlayerBExist = true;

							if (testMode == false) {
								var b = document.getElementById("twitch-streamB");

								if (b)
									b.hidden = false;

								currentPlayerInfo.streamBPaused = false;
								bWasPaused = false;

								playerB.setVolume(currentPlayerInfo.streamBVolume);
								playerB.setMuted(currentPlayerInfo.streamBMuted);
							}
							else {
								playerB.setVolume(0.5);
								playerB.setMuted(false);
							}
						});
					}
				}
				else if (resetValues.id == 3) { //Player C
					if (playerC && doesPlayerCExist == true) {
						playerC.pause();

						doesPlayerCExist = false;

						var c = document.getElementById("twitch-streamC");
						if (c) {
							c.hidden = true;
							c.parentNode.removeChild(c);
						}

						var node = document.createElement('div');
						node.setAttribute("id", "twitch-streamC");

						cPlayerContainer.appendChild(node);

						playerC = null;
					}

					var optionsStream =
						{
							width: twitchPlayer.value.streamCWidth,
							height: twitchPlayer.value.streamCHeight,
							channel: currentPlayerInfo.streamCURL,
							controls: false
						};

					var c = document.getElementById("twitch-streamC");
					if (c) {

						playerC = new Twitch.Player("twitch-streamC", optionsStream);
						playerC.setQuality("chunked");

						c.hidden = false;

						cPlayerContainer = c.parentNode;

						positionPlayer(c.children[0], 2);

						playerC.addEventListener(Twitch.Player.READY, function () {
							console.log("PLAYER C READY!!");

							doesPlayerCExist = true;

							if (testMode == false) {
								setTimeout(() => {
									currentPlayerInfo.streamCRunning = true;
								}, 2000);
							}
						});

						playerC.addEventListener(Twitch.Player.ONLINE, function () {
							console.log("PLAYER C ONLINE!!");

							doesPlayerCExist = true;

							playerC.play();
						});

						playerC.addEventListener(Twitch.Player.OFFLINE, function () {
							console.log("PLAYER C OFFLINE!!");
						});

						playerC.addEventListener(Twitch.Player.PAUSE, function () {
							console.log("PLAYER C PAUSED!!");
						});

						playerC.addEventListener(Twitch.Player.PLAY, function () {
							console.log("PLAYER C PLAYING!!");

							doesPlayerCExist = true;

							if (testMode == false) {
								var c = document.getElementById("twitch-streamC");

								if (c)
									c.hidden = false;

								currentPlayerInfo.streamCPaused = false;
								cWasPaused = false;

								playerC.setVolume(currentPlayerInfo.streamCVolume);
								playerC.setMuted(currentPlayerInfo.streamCMuted);
							}
							else {
								playerC.setVolume(0.5);
								playerC.setMuted(false);
							}
						});
					}
				}	
				else if (resetValues.id == 4) { //Player D
					if (playerD && doesPlayerDExist == true) {
						playerD.pause();

						doesPlayerDExist = false;

						var d = document.getElementById("twitch-streamD");
						if (d) {
							d.hidden = true; 
							d.parentNode.removeChild(d);
						}

						var node = document.createElement('div');
						node.setAttribute("id", "twitch-streamD");

						dPlayerContainer.appendChild(node);

						playerD = null;
					}

					var optionsStream =
						{
							width: twitchPlayer.value.streamDWidth,
							height: twitchPlayer.value.streamDHeight,
							channel: currentPlayerInfo.streamDURL,
							controls: false
						};

					var d = document.getElementById("twitch-streamD");
					if (d) {

						playerD = new Twitch.Player("twitch-streamD", optionsStream);
						playerD.setQuality("chunked");

						d.hidden = false;

						dPlayerContainer = d.parentNode;

						positionPlayer(d.children[0], 3);

						playerD.addEventListener(Twitch.Player.READY, function () {
							console.log("PLAYER D READY!!");

							doesPlayerDExist = true;

							if (testMode == false) {
								setTimeout(() => {
									currentPlayerInfo.streamDRunning = true;
								}, 2000);
							}
						});

						playerD.addEventListener(Twitch.Player.ONLINE, function () {
							console.log("PLAYER D ONLINE!!");

							doesPlayerDExist = true;

							playerD.play();
						});

						playerD.addEventListener(Twitch.Player.OFFLINE, function () {
							console.log("PLAYER D OFFLINE!!");
						});

						playerD.addEventListener(Twitch.Player.PAUSE, function () {
							console.log("PLAYER D PAUSED!!");
						});

						playerD.addEventListener(Twitch.Player.PLAY, function () {
							console.log("PLAYER D PLAYING!!");

							doesPlayerDExist = true;

							if (testMode == false) {
								var d = document.getElementById("twitch-streamD");

								if (d)
									d.hidden = false;

								currentPlayerInfo.streamDPaused = false;
								dWasPaused = false;

								playerD.setVolume(currentPlayerInfo.streamDVolume);
								playerD.setMuted(currentPlayerInfo.streamDMuted);
							}
							else {
								playerD.setVolume(0.5);
								playerD.setMuted(false);
							}
						});
					}
				}		
			}
		}
	}

	customElements.define(TwitchPlayer.is, TwitchPlayer);
})();
