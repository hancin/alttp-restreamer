# First-time setup

The first time setup requires that you do a couple steps to get the full functionality.

1. Extract the zip file you downloaded to a new folder.
2. Run the "nodecg.exe" program inside the folder. After a few seconds, the main dashboard will show up in your browser. Leave the little 
console window open until you're done streaming.
3. Right-click on your current Scene in OBS, and hit Duplicate. We do this so you can go back to the old ways later if you need to.
4. In the new scene, remove all sources except for the frame overlay (to hide errors in crops), and the left and right runners 
timers and game. All the rest will be rendered unnecessary in the next step.
5. Create a new browser source with the following information:
   * URL: http://localhost:9090/bundles/alttp-restreamer/graphics/restream.html
   * Width: 1280
   * Height: 720
   * FPS: 60 (or 30, if you're broadcasting 30fps)
   * Custom CSS: remove all the existing content in this box.
   * Shutdown source when not visible: Yes
   * Refresh browser when scene becomes active: No (I like to manually refresh if I feel the need to)
 8. Assuming the schedule isn't empty, the overlay will update with the first race it found so you can see it in action!
 9. Proceed to Race Setup.

 # Race Setup
 
 You will do this everytime you want to do a race with the program.
 
 1. Run nodecg.exe, wait for the browser to open.
 2. Open OBS (If you open OBS before nodecg is started, just go to the properties of the browser source and hit "Refresh cache")
 3. Pick your race by typing a name in the "Search" box, and hitting "Take".
 4. Hit "Generate Trackers", then enter the Round (eg. Swiss Round 5) and Standings (eg. 2-2). Finish this config by hitting Save.
 5. Copy the "Start Race Setup" from the Commands tab, and run it in #restreamer on Discord.
 6. Copy the SRTV page that ALTTP Tourney Bot gives you in a DM. enter it in the "SR.TV Page" box, and hit Save.
 7. You can send the information in the "Trackers", "Commentators" and "Runners" to the appropriate people. Their discord tags are 
 mentioned when you click the tab.
 8. Run the "Twitch commands for restreamers" in the twitch channel. If those don't work, check with Felix to make sure he added you,
 and you can paste the commands for moderators in Discord so a mod can do them.
 9. Crop your runners like you used too (You can also use Iceman's excellent crop program. the tools work together.), and do your audio
 checks like you used to.
 10. Send the seed to the runners & Go live
 11. Copy the "start the race" command to the #restreamer channel in discord, and gg!
