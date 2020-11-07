var configs = require("../bot");
const axios = require('axios');
var path = require("path");

this.getBrowser = async (puppeteer, revisionInfo, appconfig, constants, pptrArgv, extraArguments) => {

    const response = await axios.get(configs.appconfig.currentChrome)
        .catch(response => response)
    if (response instanceof Error) {
        //Could not find running chrome on remote debugging so going as default
        const browser = await puppeteer.launch({
            executablePath: revisionInfo.executablePath,
            defaultViewport: null,
            headless: appconfig.appconfig.headless,
            userDataDir: path.join(process.cwd(), "ChromeSession"),
            devtools: false,
            args: [...constants.DEFAULT_CHROMIUM_ARGS, ...pptrArgv], ...extraArguments
        })
        return browser
    } else {
        //found running chrome on remote debugging 
        const { webSocketDebuggerUrl } = response.data;
        // Connecting the instance using `browserWSEndpoint`
        const browser = await puppeteer.connect({
            defaultViewport: null,
            browserWSEndpoint: webSocketDebuggerUrl
        });
        return browser
    }

}