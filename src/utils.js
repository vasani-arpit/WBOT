var path = require("path");
const mime = require('mime');
var fs = require("fs");
const argv = require("yargs").argv;
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

/**
 * resolves path and returns file data in base64
 * @param {filepath} filename absolute or relative file path including extension
 * @returns {fileMime,base64}
 */
this.getFileData = function (filename) {
    return new Promise((resolve, reject) => {
        try {
            filename = path.join(process.cwd(), filename);
            // get the mimetype
            const fileMime = mime.getType(filename);
            var file = fs.readFileSync(filename, { encoding: 'base64' });
            resolve({ fileMime, base64: file });
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

this.saveFileFromBase64 = (base64Data, name, type) => {
    console.log("save file called")
    let extension = mime.getExtension(type)
    try {
        fs.writeFileSync(path.join(process.cwd(), name + "." + extension), base64Data, 'base64')
    } catch (error) {
        console.error("Unable to write downloaded file to disk")
    }
}

this.isMacArm64 = () => {
  return process.platform === "darwin" && process.arch === "arm64";
};

this.getChromePathMacArm = () => {
  if (argv.chromePath && String(argv.chromePath).trim()) {
    return String(argv.chromePath).trim();
  }
  if (process.env.CHROME_PATH && String(process.env.CHROME_PATH).trim()) {
    return String(process.env.CHROME_PATH).trim();
  }

  const candidate =
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (fs.existsSync(candidate)) return candidate;

  throw new Error(
    [
      `Chrome not found in: ${candidate}`,
      "Download and install Google Chrome for macOS first:",
      "https://www.google.com/chrome/",
    ].join("\n")
  );
};