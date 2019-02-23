const ora = require('ora');

var step = {};
var spinner;

this.start = function (text) {
    spinner = ora({
        spinner: "dots2",
        text: text
    }).start();
}

this.update = function (text) {
    spinner.text = text;
}

this.info = function (text) {
    spinner.info(text);
}

this.stop = function (text) {
    spinner.succeed(text);
}

