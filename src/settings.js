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
function loadSettings(event, filename, page) {
    // Check event type
    if (event === "change") {
        // console.log("Settings changed");
        // //load from local
        // let botJson = utils.externalInjection(filename);
        //load from server
        let botJson = utils.externalBotInjection();
    } else if (event === "rename") {
        console.log("warn: filename changed");
    }
}

this.LoadBotSettings = loadSettings;