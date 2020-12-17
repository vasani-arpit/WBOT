var path = require("path");
var http = require('http');
const mime = require('mime');
var fs = require("fs");
this.injection = function(filename) {
    return new Promise((resolve, reject) => {
        var filepath = path.join(__dirname, filename);
        //console.log("reading file from" + (filepath));
        fs.readFile(filepath, 'utf8', (err, data) => {
            if (err) return reject(err);
            console.log("1 " + data);
            resolve(data);
        });
    });
}

this.externalBotInjection = function() {
    //load from server
    const https = require('https');
    let url = "https://raw.githubusercontent.com/inspirasiprogrammer/WBOT/master/bot.json";

    let data;
    https.get(url, (res) => {
        let body = "";

        res.on("data", (chunk) => {
            body += chunk;
        });

        res.on("end", () => {
            try {
                botJson = JSON.parse(body);
                // do something with JSON                          
            } catch (error) {
                console.error(error.message);
            };
        });
    }).on("error", (error) => {
        console.error(error.message);
    });

    return new Promise((resolve, reject) => {
        if (err) return reject(err);
        resolve(data);
    });
}

// this.externalInjection = function(filename) {
//     return new Promise((resolve, reject) => {
//         // console.log("reading file from" + process.cwd());
//         // Load From Local
//         var filepath = path.join(process.cwd(), filename);
//         fs.readFile(filepath, 'utf8', (err, data) => {
//             if (err) return reject(err);
//             resolve(data);
//         });
//     });
// }

this.getFileInBase64 = function(filename) {
    return new Promise((resolve, reject) => {
        try {
            filename = path.join(process.cwd(), filename);
            // get the mimetype
            const fileMime = mime.getType(filename);
            var file = fs.readFileSync(filename, { encoding: 'base64' });
            resolve(`data:${fileMime};base64,${file}`);
        } catch (error) {
            reject(error);
        }
    });
}

this.delay = ms => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
};