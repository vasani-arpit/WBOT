var path = require("path");
var fs = require("fs");
this.injection = function (filename) {
    return new Promise((resolve, reject) => {
        var filepath = path.join(__dirname, filename);
        //console.log("reading file from" + (filepath));
        fs.readFile(filepath, 'utf8', (err, data) => {
            if (err) return reject(err);
            console.log("1 "+data);
            resolve(data);
        });
    });
}

this.externalInjection = function (filename) {
    return new Promise((resolve, reject) => {
        //console.log("reading file from" + process.cwd());
        var filepath = path.join(process.cwd(), filename);
        fs.readFile(filepath, 'utf8', (err, data) => {
            if (err) return reject(err);
            resolve(data);
        });
    });
}

this.delay = ms => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
};