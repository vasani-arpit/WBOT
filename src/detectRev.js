var os = require("os");
var platform = os.platform();
var chromePlatform;
const fetch = require("node-fetch");

switch (platform) {
    case "win32":
        chromePlatform = "win";
        break;
    case "darwin":
        chromePlatform = "mac";
        break;
    default:
        chromePlatform = "linux"
        break;

}

this.getRevNumber = function () {
    return new Promise((resolve) => {
        // fetch('https://omahaproxy.appspot.com/all.json?os=' + chromePlatform, { method: "get" })
        //     .then(res => res.json())
        //     .then(json => {
        //         //console.log(json);
        //         var betaChannel = json[0].versions.find(x => x.channel == "canary").branch_base_position;
        resolve("666595");
        // });
    })

}
