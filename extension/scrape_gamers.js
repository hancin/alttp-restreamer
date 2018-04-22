/* Run this on a sign up page to create players.json*/
(function playerList(){
    var list = document.querySelectorAll("option");
    var finalList = [];
    list.forEach(option => {
        var splits = option.text.split(" | ");
    
        if(splits.length != 3)
            return;
    
        finalList.push({
            pk: parseInt(option.value),
            name: splits[0],
            twitch: splits[1].substr(splits[1].indexOf("= ")+2),
            discord: splits[2].substr(splits[2].indexOf("= ")+2)
        });
    });
    
    return JSON.stringify(finalList);
})();

/* Run this on the ALTTP randomizer tournament schedule to create schedule.json */
(function runList(){
    var entries = document.querySelectorAll("tr");
    var valid = [];
    var order = 0;

    entries.forEach(line => {
        //This is not restreamed by us.
        if(line.cells[2].innerText.indexOf("ALTTPRandomizer") === -1){
            return;
        }

        var run = {
            order: order,
            name: line.cells[1].innerText,
            time: line.cells[0].innerText,
            runners: line.cells[1].innerText.split(" vs "),
            channel: line.cells[2].innerText,
            commentary: line.cells[3].innerText,
            tracking: line.cells[4].innerText,
            pk: parseInt(line.cells[0].querySelector("a").id.substr(1))
        };
        
        order += 1;

        valid.push(run);
    });

    return JSON.stringify(valid);
})();