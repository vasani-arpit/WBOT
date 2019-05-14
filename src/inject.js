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
            if (exactMatch != undefined) {
                WAPI.sendSeen(message.from._serialized);
                if(exactMatch.type == 'text') {
                    WAPI.sendMessage2(message.from._serialized, exactMatch.response);
                } else if(exactMatch.type == 'file') {
                    WAPI.sendImage(exactMatch.base64encode, message.from._serialized, exactMatch.file, exactMatch.response);
                }
                console.log(`Replying with ${exactMatch.response}`);
            } else {
                console.log("No exact match found");
            }
            var PartialMatch = intents.bot.find(obj => obj.contains.find(ex => message.body.toLowerCase().search(ex) > -1));
            if (PartialMatch != undefined) {
                WAPI.sendSeen(message.from._serialized);
                if(PartialMatch.type == 'text') {
                    WAPI.sendMessage2(message.from._serialized, PartialMatch.response);
                } else if(PartialMatch.type == 'file') {
                    WAPI.sendImage(PartialMatch.base64encode, message.from._serialized, PartialMatch.file, PartialMatch.response);
                }                
                console.log(`Replying with ${PartialMatch.response}`);
            } else {
                console.log("No partial match found");
            }
        }
    });
});
