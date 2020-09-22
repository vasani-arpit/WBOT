const { constants } = require("crypto");
 /**
  * Live settings loader
  */

var utils = require("./utils");

/**
 * This function will load settings from JSON configuration file
 * @param {*} event Event name
 * @param {*} filename Name of the file
 * @param {*} page Handle to webpage 
 */
function loadSettings(event, filename, page) 
{
    // Check event type
    if(event === "change")
    {
        // console.log("Settings changed");

        // Load JSON settings file
        let botJson = utils.externalInjection(filename);

        // Update settings
        botJson.then((data) => {
            page.evaluate(`var intents = ${data}`);
        }).catch((err) => {
            console.log(`there was an error ${err}`);
        });
    } else if(event === "rename") {
        console.log("warn: filename changed");
    }
}

this.LoadBotSettings = loadSettings;