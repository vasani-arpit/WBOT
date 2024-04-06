const puppeteer = require('puppeteer-core');
const _cliProgress = require('cli-progress');
const spintax = require('mel-spintax');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
require("./welcome");
var spinner = require("./step");
var utils = require("./utils");
var qrcode = require('qrcode-terminal');
var path = require("path");
var argv = require('yargs').argv;
var rev = require("./detectRev");
var constants = require("./constants");
var configs = require("../bot");
var fs = require("fs");
const fetch = require("node-fetch");
const { lt } = require('semver');
const mime = require('mime');
const moment = require('moment')
// only when server object is there in bot.json
// take parameter from json 
// only after authentication success from whatsapp
const graphicalInterface = require('./server/server')
//TODO: remove this
// const {write,read}=require('../media/tem')



let appconfig = null;

//console.log(process.cwd());

async function Main() {

    try {
        //console.log(configs);
        var page;
        await downloadAndStartThings();
        // var isLogin = await checkLogin();
        // if (!isLogin) {
        //     await getAndShowQR();
        // }
        // if (configs.smartreply.suggestions.length > 0) {
        //     await setupSmartReply();
        // }
        // await setupPopup();
        await checkForUpdate();
        console.log("WBOT is ready !! Let those message come.");
    } catch (e) {
        console.error("\nLooks like you got an error. " + e);
        try {
            page.screenshot({ path: path.join(process.cwd(), "error.png") })
        } catch (s) {
            console.error("Can't create shreenshot, X11 not running?. " + s);
        }
        console.warn(e);
        console.error("Don't worry errors are good. They help us improve. A screenshot has already been saved as error.png in current directory. Please mail it on vasani.arpit@gmail.com along with the steps to reproduce it.\n");
        throw e;
    }

    /**
     * If local chrome is not there then this function will download it first. then use it for automation. 
     */
    async function downloadAndStartThings() {
        let botjson = utils.externalInjection("bot.json");
        appconfig = await utils.externalInjection("bot.json");
        appconfig = JSON.parse(appconfig);
        spinner.start("Downloading chromium\n");
        const browserFetcher = puppeteer.createBrowserFetcher({ platform: process.platform, path: process.cwd() });
        const progressBar = new _cliProgress.Bar({}, _cliProgress.Presets.shades_grey);
        progressBar.start(100, 0);
        //var revNumber = await rev.getRevNumber();
        const revisionInfo = await browserFetcher.download("982053", (download, total) => {
            //console.log(download);
            var percentage = (download * 100) / total;
            progressBar.update(percentage);
        });
        progressBar.update(100);
        spinner.stop("Downloading chromium ... done!");
        //console.log(revisionInfo.executablePath);
        spinner.start("Launching browser\n");
        var pptrArgv = [];
        if (argv.proxyURI) {
            pptrArgv.push('--proxy-server=' + argv.proxyURI);
        }
        const extraArguments = Object.assign({});
        extraArguments.userDataDir = constants.DEFAULT_DATA_DIR;
        // const browser = await puppeteer.launch({
        //     executablePath: revisionInfo.executablePath,
        //     defaultViewport: null,
        //     headless: appconfig.appconfig.headless,
        //     userDataDir: path.join(process.cwd(), "ChromeSession"),
        //     devtools: false,
        //     args: [...constants.DEFAULT_CHROMIUM_ARGS, ...pptrArgv], ...extraArguments
        // });

        const wwebVersion = '2.2412.54';
        const client = new Client({
            puppeteer: {
                executablePath: revisionInfo.executablePath,
                defaultViewport: null,
                headless: appconfig.appconfig.headless,
                devtools: false,
                slowMo: 500,
                args: [...constants.DEFAULT_CHROMIUM_ARGS, ...pptrArgv], ...extraArguments
            },
            webVersionCache: {
                type: 'remote',
                remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
            },
        });
        if (argv.proxyURI) {
            spinner.info("Using a Proxy Server");
        }

        client.on('qr', (qr) => {
            // Generate and scan this code with your phone
            console.log('QR RECEIVED', qr);
            qrcode.generate(qr, { small: true });
        });

        client.on('ready', async () => {
            spinner.info('WBOT is spinning up!');
            await utils.delay(5000)
            let server = appconfig.appconfig.server
            if (server) {

                //Graphical interface to edit bot.json
                const USERNAME = server.username;
                const PASSWORD = server.password;
                const PORT = server.port;

                graphicalInterface(USERNAME, PASSWORD, PORT);
            }
            // await smartReply({client: client})
            //TODO: if replyUnreadMsg is true then get the unread messages and reply to them.
        });

        client.on('authenticated', () => {
            spinner.info('AUTHENTICATED');
        });

        client.on('auth_failure', msg => {
            // Fired if session restore was unsuccessful
            console.error('AUTHENTICATION FAILURE', msg);
            // process.exit(1);
        });

        client.on('message', async msg => {
            // console.log(msg.body)

            // write(msg)

            let chat = await client.getChatById(msg.from)
            console.log(`Message ${msg.body} received in ${chat.name} chat`)
            const messages = require(path.resolve('messages.json'));
            msg.timestamp = moment().format('DD/MM/YYYY HH:mm');
            msg._data['chatName'] = chat.name
            messages.push(msg)
            fs.writeFileSync(path.resolve('messages.json'), JSON.stringify(messages, null, 2))
            // if it is a media message then download the media and save it in the media folder
            if (msg.hasMedia && configs.appconfig.downloadMedia) {
                console.log("Message has media. downloading");
                const media = await msg.downloadMedia()
                // checking if director is present or not
                if (!fs.existsSync(path.join(process.cwd(), "receivedMedia"))) {
                    fs.mkdirSync(path.join(process.cwd(), "receivedMedia"));
                }

                if (media) {
                    // write the data to a file
                    let extension = mime.getExtension(media.mimetype)
                    fs.writeFileSync(path.join(process.cwd(), "receivedMedia", msg.from + msg.id.id + "." + extension), media.data, 'base64')
                    console.log("Media has been downloaded");
                } else {
                    console.log("There was an issue in downloading the media");
                }
            } else {
                console.log("Message doesn't have media or it is not enabled in bot.config.json");
            }


            if (msg.body.length != 0) {
                //TODO: reply according to the bot.config.json
                await smartReply({ msg, client });
                //TODO: call the webhook
            }
        });


        await client.initialize();

        spinner.stop("Launching browser ... done!");

        // When the settings file is edited multiple calls are sent to function. This will help
        // to prevent from getting corrupted settings data
        let timeout = 5000;

        // Register a filesystem watcher
        fs.watch(constants.BOT_SETTINGS_FILE, (event, filename) => {
            setTimeout(async () => {
                console.log("Settings file has been updated. Reloading the settings");
                configs = JSON.parse(fs.readFileSync(path.join(process.cwd(), "bot.json")));
                appconfig = await utils.externalInjection("bot.json");
                appconfig = JSON.parse(appconfig);
            }, timeout);
        });

        // page.exposeFunction("getFile", utils.getFileInBase64);
        // page.exposeFunction("saveFile", utils.saveFileFromBase64);
        // page.exposeFunction("resolveSpintax", spintax.unspin);
    }
}

async function getResponse(msg, message) {
    function greetings() {
        let date = new Date();
        hour = date.getHours();

        if (hour >= 0 && hour < 12) {
            return "Good Morning";
        }

        if (hour >= 12 && hour < 18) {
            return "Good evening";
        }

        if (hour >= 18 && hour < 24) {
            return "Good night";
        }
    }

    let response = await spintax.unspin(message);

    // Adding variables: 
    response = response.replace('[#name]', msg._data.notifyName)
    response = response.replace('[#greetings]', greetings())
    response = response.replace('[#phoneNumber]', msg.from.split("@")[0])

    return response;
}



async function sendReply({ msg, client, data, noMatch }) {
    let globalWebhook = appconfig.appconfig.webhook;

    if (noMatch) {
        if (appconfig.noMatch.length != 0) {
            let response = await getResponse(msg, appconfig.noMatch);;
            console.log(`No match found Replying with ${response}`);
            if (!configs.appconfig.quoteMessageInReply) {
                await client.sendMessage(msg.from, response);
            }
            else {
                await msg.reply(response);
            }
            await processWebhook({ msg, client, webhook: globalWebhook });

            return;
        }
        console.log(`No match found`);
        return;
    }



    let response = await getResponse(msg, data.response);
    console.log(`Replying with ${response}`);


    if (data.afterSeconds) {
        await utils.delay(data.afterSeconds * 1000);
    }


    if (data.file) {

        var captionStatus = data.responseAsCaption;

        // We consider undefined responseAsCaption as a false
        if (captionStatus == undefined) {
            captionStatus = false;
        }

        // files = await spintax.unspin(data.file);
        files = data.file
        if (Array.isArray(files)) {
            files.forEach(file => {
                sendFile(file)
            })
        }
        else {
            sendFile(files)
        }
        if (!captionStatus) {
            if (!configs.appconfig.quoteMessageInReply) {
                await client.sendMessage(msg.from, response);
            }
            else {
                await msg.reply(response);
            }
        }
        // if responseAsCaption is true, send image with response as a caption
        // else send image and response seperately
    } else {
        if (!configs.appconfig.quoteMessageInReply) {
            await client.sendMessage(msg.from, response);
        }
        else {
            await msg.reply(response);
        }
    }
    if (data.hasOwnProperty('webhook') && data.webhook.length > 0) {
        let localWebhook = data.webhook;
        await processWebhook({ msg, client, webhook: localWebhook });
    }
    await processWebhook({ msg, client, webhook: globalWebhook });

    function sendFile(file) {

        if (captionStatus == true) {
            utils
                .getFileData(file)
                .then(async ({ fileMime, base64 }) => {

                    // console.log(fileMime);
                    // send response in place of caption as a last argument in below function call
                    var media = await new MessageMedia(
                        fileMime,
                        base64,
                        file
                    );
                    if (!configs.appconfig.quoteMessageInReply) {
                        await client.sendMessage(msg.from, media, { caption: response });
                    }
                    else {
                        // #TODO Caption is not working
                        const data = await msg.getChat();
                        // console.log(data)
                        // console.log({ caption: response })
                        // console.log(media)
                        await msg.reply(media, data.id._serialized, { caption: response });
                        // await msg.reply(media,);
                    }
                })
                .catch((error) => {
                    console.log("Error in sending file\n" + error);
                });
        } else {
            console.log(
                "Either the responseAsCaption is undefined or false, Make it true to allow caption to a file"
            );

            utils
                .getFileData(file)
                .then(async ({ fileMime, base64 }) => {
                    // console.log(fileMime);
                    // send blank in place of caption as a last argument in below function call
                    var media = await new MessageMedia(
                        fileMime,
                        base64,
                        file
                    );
                    if (!configs.appconfig.quoteMessageInReply) {
                        await client.sendMessage(msg.from, media);
                    }
                    else {
                        await msg.reply(media);
                    }
                })
                .catch((error) => {
                    console.log("Error in sending file\n" + error);
                })
        }
    }

}

async function processWebhook({ msg, client, webhook }) {

    if (!webhook) return;

    body = {};
    body.text = msg.body;
    body.type = 'message';
    body.user = msg.id.remote;

    const data = await fetch(webhook, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    })

    const response = await data.json();

    //replying to the user based on response
    if (response && response.length > 0) {
        response.forEach(async (itemResponse) => {

            itemResponse.text = await getResponse(msg, itemResponse.text);

            if (!configs.appconfig.quoteMessageInReply) {
                await client.sendMessage(msg.from, itemResponse.text);
            }
            else {
                await msg.reply(itemResponse.text);
            }

            //sending files if there is any 
            if (itemResponse.files && itemResponse.files.length > 0) {
                itemResponse.files.forEach(async (itemFile) => {

                    const mimeTypeMatch = itemFile.file.match(/^data:(.*?);/);

                    const base64Data = mimeTypeMatch ? itemFile.file.split(',')[1] : itemFile.file;

                    const mimeType = mimeTypeMatch ? itemFile.file.split(':')[1].split(';')[0] : "image/jpg";

                    var media = await new MessageMedia(
                        mimeType,
                        base64Data,
                        itemFile.name
                    );

                    if (!configs.appconfig.quoteMessageInReply) {
                        await client.sendMessage(msg.from, media);
                    }
                    else {
                        await msg.reply(media);
                    }
                })
            }
        });
    }
}

async function smartReply({ msg, client }) {

    // console.log(msg.body)
    const data = msg?.body;
    const list = appconfig.bot;

    //Don't reply is sender is blocked
    const senderNumber = msg.from.split("@")[0]
    var blockedNumbers = appconfig.blocked
    var allowedNumbers = appconfig.allowed
    // check if blocked numnbers are there or not. 
    // if current number is init then return
    if (Array.isArray(blockedNumbers) && blockedNumbers.includes(senderNumber)) {
        console.log("Message received but sender is blocked so will not reply.")
        return;
    }

    if (Array.isArray(allowedNumbers) && allowedNumbers.length > 0 && !allowedNumbers.includes(senderNumber)) {
        console.log("Message received but user is not in allowed list so will not reply.")
        return;
    }

    // Don't do group reply if isGroupReply is off
    if (msg.id.participant && appconfig.appconfig.isGroupReply == false) {
        console.log(
            "Message received in group and group reply is off. so will not take any actions."
        );
        return;
    }

    // webhook Call

    var exactMatch = list.find((obj) =>
        obj.exact.find((ex) => ex == data.toLowerCase())
    );

    if (exactMatch != undefined) {
        return sendReply({ msg, client, data: exactMatch });
    }
    var PartialMatch = list.find((obj) =>
        obj.contains.find((ex) => data.toLowerCase().search(ex) > -1)
    );
    if (PartialMatch != undefined) {
        return sendReply({ msg, client, data: PartialMatch });
    }
    sendReply({ msg, client, data: exactMatch, noMatch: true });
}

async function checkForUpdate() {
    spinner.start("Checking for an Update...");
    // Using Github API (https://docs.github.com/en/rest/reference/repos#releases)
    // to get the releases data
    const url = "https://api.github.com/repos/vasani-arpit/WBOT/releases";
    const response = await fetch(url);

    // Storing data in form of JSON
    var data = await response.json();
    var latestVersion = data[0].tag_name;
    var latestVersionLink = `https://github.com/vasani-arpit/WBOT/releases/tag/${latestVersion}`;
    var myVersion = 'v' + require('../package.json').version;

    spinner.stop("Checking for an Update... Completed");

    if (lt(myVersion, latestVersion)) {
        console.log(`An Update is available for you.\nPlease download the latest version ${latestVersion} of WBOT from ${latestVersionLink}`);
    }
}

Main();