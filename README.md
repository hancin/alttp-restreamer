# alttp-restreamer
NodeCG bundle for ALTTP randomizer restreamer

# Intro
This bundle was created for the tournament of The Legend of Zelda: A Link to the Past randomizer 
tournament hosted on SpeedGaming and ALLTPRandomizer. After doing the initial setup for the ALLTPR channels,
I noticed how inefficient and manual the process is, leading to small variations between the various volunteers broadcasting.

# What's available
* Timer to keep track of time for the race
* Checklist to ensure all steps are followed properly
* Layout for the tournament stream format.
* Schedule to pull all the information you need for your restream to be successful.
* Integration with our tracker to have 2 click setup.
* Information right there to copy to the various runners & crew helping you.

# How to use
You'll need to configure the various settings required for the app to function in cfg/alltp-restreamer.json file in your NodeCG instance. 
The configSchema.json file contains the various settings and what they should look like. If you're one of our restreamers, just hit us up
in the tool channel and we'll give you the right stuff.

You'll also need to put a copy of ffmpeg in vendor/ffmpeg in your nodecg directory for screenshots to work properly.

It might not work completely out of the box, we recommend using this work to make a derivative that works for your use cases.

# Credits
This bundle is heavily inspired from the AGDQ 2018 layout bundle, especially the timer and schedule code which were adapted to work with 
the SpeedGaming schedule pages.
