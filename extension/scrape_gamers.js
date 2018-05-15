/* Run this on a sign up page to create players.json*/
(function playerList(){
    var list = document.querySelectorAll("select[name=personid] option");
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
            commentators: line.cells[3].innerText.split(', '),
            trackers: line.cells[4].innerText.split(', '),
            pk: parseInt(line.cells[0].querySelector("a").id.substr(1))
        };
        
        order += 1;

        valid.push(run);
    });

    return JSON.stringify(valid);
})();

(function runList(){
    var entries = document.querySelectorAll("tr");
    var valid = [];
    var order = 0;

    entries.forEach(line => {
        //This is not restreamed by us.
        if(line.cells[2].innerText.indexOf("ALTTPRandomizer") !== 0 && line.cells[2].innerText.indexOf("SpeedGaming") !== 0){
            return;
        }

        var run = {
            order: order,
            name: line.cells[1].innerText,
            time: line.cells[0].innerText,
            runners: line.cells[1].innerText.split(" vs "),
            channel: line.cells[2].innerText,
            commentators: line.cells[3].innerText.replace('[SIGN UP]', '').trim().split(', '),
            trackers: line.cells[4].innerText.replace('[SIGN UP]', '').trim().split(', '),
            broadcasters: line.cells[2].innerText.startsWith('SpeedGaming') ? [] : line.cells[5].innerText.replace('[SIGN UP]', '').trim().split(', '),
            pk: parseInt(line.cells[0].querySelector("a").id.substr(1))
        };
        
        order += 1;

        valid.push(run);
    });

    return JSON.stringify(valid);
})();