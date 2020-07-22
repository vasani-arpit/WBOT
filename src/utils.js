var path = require("path");
const mime = require('mime');
var fs = require("fs");
var constants = require("./constants");

this.injection = function (filename) {
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

this.getDirStore = function (dir) {
    return new Promise((resolve, reject) => {
        //console.log("reading file from " + dir);

        var store = {};
        store.chat = [];

	fs.readdir(dir, (err, files) => {
            if (err) {
		console.log('found err' + err);
                return reject(err);
            } else {
                // files object contains all file names in store dir
                //
		//console.log('Files:' + files);
                files.forEach(file => {
                    try {
			const data = fs.readFileSync(path.join(dir, file), 'utf8');
                        //console.log(data);
                        store.chat.push(JSON.parse(data));
			//console.log(store);
                    } catch (err) {
			return reject(err);
                    }
                });
		//console.log('Final Store:\n' + JSON.stringify(store,null,2));
		const resolution = Buffer.from(JSON.stringify(store));
		//console.log(resolution);
		resolve(resolution);
	    }
        });
    });
}

this.putDirStoreEntry = function (file, json) {
    return new Promise((resolve, reject) => {

        //console.log('About to open writeStream: ' + path.join(constants.DEFAULT_CHATID_STORE_DIR, file + '.json'));

        let writer = fs.createWriteStream(path.join(constants.DEFAULT_CHATID_STORE_DIR, file + '.json'))
        .on('error', function (err) {
            console.log('A write stream error' + err);
            reject(err);
        });
        writer.write(json);
        resolve(path.join(dir, file));
    });
}




this.getFileInBase64 = function (filename) {
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
