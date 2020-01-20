WAPI.waitNewMessages(false, (data) => {
    console.log(data)
    data.forEach((message) => {
        window.log(`Message from ${message.from.user} checking..`);
        //fetch API to send and receive response from server
        body = {};
        body.text = message.body;
        body.type = 'message';
        body.user = message.from.user;
        body.raw = message;
        return fetch(intents.appconfig.webhook, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((resp) => resp.json()).then(function (response) {
            //response received from server
            WAPI.sendSeen(message.from._serialized);
            //replying to the user based on response
            WAPI.sendMessage2(message.from._serialized, response.text, () => {
                if (response.files && response.files.length > 0) {
                    response.files.forEach((file) => {
                        WAPI.sendImage2(message.from._serialized, file.base64, file.name);
                    })
                }
            });
        }).catch(function (error) {
            console.log(error);
        });
        if (intents.blocked.indexOf(message.from.user) >= 0) {
            window.log("number is blocked by BOT. no reply");
            return;
        }
        if (message.type == "chat") {
            //message.isGroupMsg to check if this is a group
            if (message.isGroupMsg == true && intents.appconfig.isGroupReply == false) {
                window.log("Message received in group and group reply is off. so will not take any actions.");
                return;
            }
            var exactMatch = intents.bot.find(obj => obj.exact.find(ex => ex == message.body.toLowerCase()));
            var response = "";
            if (exactMatch != undefined) {
                response = exactMatch.response;
                window.log(`Replying with ${exactMatch.response}`);
            } else {
                response = intents.noMatch;
                console.log("No exact match found");
            }
            var PartialMatch = intents.bot.find(obj => obj.contains.find(ex => message.body.toLowerCase().search(ex) > -1));
            if (PartialMatch != undefined) {
                response = PartialMatch.response;
                window.log(`Replying with ${PartialMatch.response}`);
            } else {
                console.log("No partial match found");
            }
            WAPI.sendSeen(message.from._serialized);
            WAPI.sendMessage2(message.from._serialized, response);
            console.log();
            if ((exactMatch || PartialMatch).file != undefined) {
                window.getFile((exactMatch || PartialMatch).file).then((base64Data) => {
                    //console.log(file);
                    WAPI.sendImage(base64Data, message.from._serialized, (exactMatch || PartialMatch).file);
                }).catch((error) => {
                    window.log("Error in sending file\n" + error);
                })
            }
        }
    });
});
WAPI.getProfilePic = function(url, stream) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, (response) => {
        response.pipe(stream);
        if (response.statusCode < 200 || response.statusCode > 299) {
            reject(new Error('Failed to load page, status code: ' + response.statusCode));
        }
        response.on('end', () => resolve());
        });
        request.on('error', (err) => reject(err));
    });
}
