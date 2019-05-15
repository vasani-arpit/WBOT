WAPI.waitNewMessages(false, (data) => {
    console.log(data)
    data.forEach((message) => {
        console.log(`Message from ${message.from.user} checking..`);
        if (intents.blocked.indexOf(message.from.user) >= 0) {
            console.log("number is blocked by BOT. no reply");
            return;
        }
        if (message.type == "chat") {
            //message.isGroupMsg to check if this is a group
            if (message.isGroupMsg == true && intents.appconfig.isGroupReply == false) {
                console.log("Message received in group and group reply is off. so will not take any actions.");
                return;
            }
            var exactMatch = intents.bot.find(obj => obj.exact.find(ex => ex == message.body.toLowerCase()));
            var response = "";
            if (exactMatch != undefined) {
                response = exactMatch.response;
                console.log(`Replying with ${exactMatch.response}`);
            } else {
                response = intents.noMatch;
                console.log("No exact match found");
            }
            var PartialMatch = intents.bot.find(obj => obj.contains.find(ex => message.body.toLowerCase().search(ex) > -1));
            if (PartialMatch != undefined) {
                response = PartialMatch.response;
                console.log(`Replying with ${PartialMatch.response}`);
            } else {
                console.log("No partial match found");
            }
            WAPI.sendSeen(message.from._serialized);
            WAPI.sendMessage2(message.from._serialized, response);
        }
    });
});