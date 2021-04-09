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

async function downloadFile(message) {
    let filename = ''
    if (message.type === "document") {
        filename = `${message.filename.split(".")[0]}_${Math.random().toString(36).substring(4)}`
    } else if (message.type === "image" || message.type === "video" || message.type === "ptt" || message.type === "audio") {
        filename = `${message.chatId.user}_${Math.random().toString(36).substring(4)}`
    } else {
        window.log("couldn't recognize message type. Skipping download")
        return
    }
    const buffer = await WAPI.downloadBuffer(message.deprecatedMms3Url)
    const decrypted = await window.Store.CryptoLib.decryptE2EMedia(message.type, buffer, message.mediaKey, message.mimetype);
    const data = await window.WAPI.readBlobAsync(decrypted._blob);
    saveFile(data.split(',')[1], filename, message.mimetype)
}

//Updating string prototype to support variables
String.prototype.fillVariables = String.prototype.fillVariables ||
    function() {
        "use strict";
        var str = this.toString();
        if (arguments.length) {
            var t = typeof arguments[0];
            var key;
            var args = ("string" === t || "number" === t) ?
                Array.prototype.slice.call(arguments) :
                arguments[0];

            for (key in args) {
                str = str.replace(new RegExp("\\[#" + key + "\\]", "gi"), args[key]);
            }
        }

        return str;
    };

WAPI.waitNewMessages(false, async (data) => {
    for (let i = 0; i < data.length; i++) {
        //fetch API to send and receive response from server
        let message = data[i];
        //console.log(message)
        body = {};
        body.text = message.body;
        body.type = 'message';
        body.user = message.chatId._serialized;
        //body.original = message;
        if (intents.appconfig.downloadMedia) {
            downloadFile(message)
        }
        if (intents.appconfig.webhook) {
            fetch(intents.appconfig.webhook, {
                method: "POST",
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((resp) => resp.json()).then(function(response) {
                //response received from server
                console.log(response);
                WAPI.sendSeen(message.chatId._serialized);
                //replying to the user based on response
                if (response && response.length > 0) {
                    response.forEach(itemResponse => {
                        itemResponse.text = itemResponse.text.fillVariables({
                            name: message.sender.pushname,
                            phoneNumber: message.sender.id.user,
                            greetings: greetings()
                        });
                        WAPI.sendMessage2(message.chatId._serialized, itemResponse.text);
                        //sending files if there is any 
                        if (itemResponse.files && itemResponse.files.length > 0) {
                            itemResponse.files.forEach((itemFile) => {
                                WAPI.sendImage(itemFile.file, message.chatId._serialized, itemFile.name);
                            })
                        }
                    });
                }
            }).catch(function(error) {
                console.log(error);
            });
        }
        window.log(`Message from ${message.chatId.user} checking..`);
        if (intents.blocked.indexOf(message.chatId.user) >= 0) {
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
                if (exactMatch.link != undefined) {

                    WAPI.sendLinkWithAutoPreview(message.chatId._serialized, exactMatch.link, exactMatch.response);
                } else {
                    response = await resolveSpintax(exactMatch.response);
                    window.log(`Replying with ${response}`);
                }
            } else {
                response = await resolveSpintax(intents.noMatch);
                window.log(`No exact match found. So replying with ${response} instead`);
            }
            var PartialMatch = intents.bot.find(obj => obj.contains.find(ex => message.body.toLowerCase().search(ex) > -1));
            if (PartialMatch != undefined) {
                if (PartialMatch.link != undefined) {
                    WAPI.sendLinkWithAutoPreview(message.chatId._serialized, exactMatch.link, exactMatch.response);
                } else {
                    response = await resolveSpintax(PartialMatch.response);
                    window.log(`Replying with ${response}`);
                }

            } else {
                console.log("No partial match found");
            }


            WAPI.sendSeen(message.chatId._serialized);
            response = response.fillVariables({
                name: message.sender.pushname,
                phoneNumber: message.sender.id.user,
                greetings: greetings()
            })
            WAPI.sendMessage2(message.chatId._serialized, response);


            if ((exactMatch || PartialMatch).file != undefined) {
                files = await resolveSpintax((exactMatch || PartialMatch).file);
                window.getFile(files).then((base64Data) => {
                    //console.log(file);
                    WAPI.sendImage(base64Data, message.chatId._serialized, (exactMatch || PartialMatch).file);
                }).catch((error) => {
                    window.log("Error in sending file\n" + error);
                })
            }
        }
    }
});
WAPI.addOptions = function() {
    var suggestions = "";
    intents.smartreply.suggestions.map((item) => {
        suggestions += `<button style="background-color: #eeeeee;
                                margin: 5px;
                                padding: 5px 10px;
                                font-size: inherit;
                                border-radius: 50px;" class="reply-options">${item}</button>`;
    });
    var div = document.createElement("DIV");
    div.style.height = "40px";
    div.style.textAlign = "center";
    div.style.zIndex = "5";
    div.innerHTML = suggestions;
    div.classList.add("grGJn");
    var mainDiv = document.querySelector("#main");
    var footer = document.querySelector("footer");
    footer.insertBefore(div, footer.firstChild);
    var suggestions = document.body.querySelectorAll(".reply-options");
    for (let i = 0; i < suggestions.length; i++) {
        const suggestion = suggestions[i];
        suggestion.addEventListener("click", (event) => {
            console.log(event.target.textContent);
            window.sendMessage(event.target.textContent).then(text => console.log(text));
        });
    }
    mainDiv.children[mainDiv.children.length - 5].querySelector("div > div div[tabindex]").scrollTop += 100;
}