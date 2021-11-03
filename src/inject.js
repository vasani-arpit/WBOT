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
    return data;
}

//Updating string prototype to support variables
String.prototype.fillVariables = String.prototype.fillVariables ||
    function () {
        "use strict";
        var str = this.toString();
        if (arguments.length) {
            var t = typeof arguments[0];
            var key;
            var args = ("string" === t || "number" === t) ?
                Array.prototype.slice.call(arguments)
                : arguments[0];

            for (key in args) {
                str = str.replace(new RegExp("\\[#" + key + "\\]", "gi"), args[key]);
            }
        }

        return str;
    };

//check if there is pending unread messages. if yes then push it to data
if (intents.appconfig.replyUnreadMsg) {
    // check for pending unread messages
    log("=====> Keep in mind that bot will reply to unread messages but you have to manually mark them as seen.")
    WAPI.getUnreadMessages(false, true, true, (messages) => {
        let processData = []
        data = messages.filter((m) => !m.archive)
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            for (let j = 0; j < element.messages.length; j++) {
                const message = element.messages[j];
                processData.push(message)
            }
        }
        console.log(processData)
        processMessages(processData)
    })
}

function delay(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
};

async function waitBeforeSending(exactMatch, PartialMatch) {
    if (exactMatch || PartialMatch) {
        if ((exactMatch || PartialMatch).afterSeconds) {
            await delay((exactMatch || PartialMatch).afterSeconds * 1000)
        }
    }
}

async function processWebhook(webhook, message, body) {
    //if message is image then download it first and then call an webhook
    if (message.type == "image") {
        body.base64DataFile = await downloadFile(message)
    }
    fetch(webhook, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((resp) => resp.json()).then(function (response) {
        //response received from server
        console.log(response);
        WAPI.sendSeen(message.chatId._serialized);
        //replying to the user based on response
        if (response && response.length > 0) {
            response.forEach(itemResponse => {
                itemResponse.text = itemResponse.text.fillVariables({ name: message.sender.pushname, phoneNumber: message.sender.id.user, greetings: greetings() });
                WAPI.sendMessage2(message.chatId._serialized, itemResponse.text);
                //sending files if there is any 
                if (itemResponse.files && itemResponse.files.length > 0) {
                    itemResponse.files.forEach((itemFile) => {
                        WAPI.sendImage(itemFile.file, message.chatId._serialized, itemFile.name);
                    })
                }
            });
        }
    }).catch(function (error) {
        console.log(error);
    });
}

async function processMessages(data) {
    for (let i = 0; i < data.length; i++) {
        //fetch API to send and receive response from server
        let message = data[i];
        body = {};
        body.text = message.body;
        body.type = 'message';
        body.user = message.chatId._serialized;
        //body.original = message;
        if (intents.appconfig.downloadMedia) {
            downloadFile(message)
        }
        //global webhook, this will be called no matter what if this is not blank
        if (intents.appconfig.webhook) {
            window.log("Processing global webhook")
            processWebhook(intents.appconfig.webhook, message, body)
        }
        window.log(`Message from ${message.chatId.user} checking..`);
        if (intents.blocked.indexOf(message.chatId.user) >= 0) {
            window.log("number is blocked by BOT. no reply");
            continue;
        }
        if (message.type == "chat") {
            //message.isGroupMsg to check if this is a group
            if (message.isGroupMsg == true && intents.appconfig.isGroupReply == false) {
                window.log("Message received in group and group reply is off. so will not take any actions.");
                continue;
            }
            var exactMatch = intents.bot.find(obj => obj.exact.find(ex => ex == message.body.toLowerCase()));
            var response = "";
            if (exactMatch != undefined) {
                response = await resolveSpintax(exactMatch.response);
                window.log(`Replying with ${response}`);
            }
            var PartialMatch = intents.bot.find(obj => obj.contains.find(ex => message.body.toLowerCase().search(ex) > -1));
            if (PartialMatch != undefined) {
                response = await resolveSpintax(PartialMatch.response);
                window.log(`Replying with ${response}`);
            }
            WAPI.sendSeen(message.chatId._serialized);
            response = response.fillVariables({ name: message.sender.pushname, phoneNumber: message.sender.id.user, greetings: greetings() })
            await waitBeforeSending(exactMatch, PartialMatch)
            if (exactMatch != undefined || PartialMatch != undefined) {
                //sending file if there is any
                if ((exactMatch || PartialMatch).file != undefined) {
                    files = await resolveSpintax((exactMatch || PartialMatch).file);
                    //determining how to send the text. via caption or via separate message
                    if ((exactMatch || PartialMatch).responseAsCaption != undefined) {
                        let caption = ""
                        if ((exactMatch || PartialMatch).responseAsCaption == true) {
                            caption = response
                        }
                        window.getFile(files).then((base64Data) => {
                            console.log(base64Data);
                            WAPI.sendImage(base64Data, message.chatId._serialized, (exactMatch || PartialMatch).file, caption);
                        }).catch((error) => {
                            window.log("Error in sending file\n" + error);
                        })
                    } else {
                        window.log("Please mention how to send the response text. add responseAsCaption in bot.json's image block.")
                    }
                }
                //TODO: refactor this later
                if ((exactMatch || PartialMatch).responseAsCaption == undefined) {
                    WAPI.sendMessage2(message.chatId._serialized, response);
                } else {
                    if ((exactMatch || PartialMatch).responseAsCaption == false) {
                        WAPI.sendMessage2(message.chatId._serialized, response);
                    }
                }

                //call a webhook if there is one in (exactMatch || PartialMatch)
                if ((exactMatch || PartialMatch).webhook) {
                    //okay there is a webhook so let's call it
                    window.log("Processing webhook from block")
                    processWebhook((exactMatch || PartialMatch).webhook, message, body)
                }
            } else {
                // We are sure we haven't found any exact or partial match
                // as we are already checking it in the above if statement
                // So process with the noMatch logic only
                response = await resolveSpintax(intents.noMatch);
                window.log(`No exact or partial match found. So replying with ${response} instead`);
                WAPI.sendMessage2(message.chatId._serialized, response);
            }
        }
    }
}

WAPI.waitNewMessages(false, async (data) => {
    console.log(data)
    processMessages(data)
});
WAPI.addOptions = function () {
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


WAPI.addPopup = function () {
    console.log("In addPopup");
    addFeatureButton();
}

addFeatureButton = function () {
    console.log("In addFeatureButton");
    var header = document.querySelector("header");
    var featureButton = document.getElementById("featureButton");
    var presentButton = document.contains(featureButton);

    console.log("Present Button: ", presentButton);
    if(presentButton != true) {
        var newFeatureButton = document.createElement("div");
        newFeatureButton.innerHTML = `
            <button id="featureButton" onClick="openPopup()">WBOT</button>
        `;
        header.append(newFeatureButton);
    }
}

openPopup = function () {
    console.log("Opened popup");
    var newPopup = document.createElement("div");
    newPopup.innerHTML = `
        <h1> Features by WBOT </h1><br><br>
        <label>Blur name</label> <input id = "blurName" onclick = "handleFeature(this);" type="checkbox"><br><br>
        <label>Blur photo</label> <input id = "blurPhoto" onclick = "handleFeature(this);" type="checkbox"><br><br>
        <label>Blur chat</label> <input id = "blurChat" onclick = "handleFeature(this);" type="checkbox"><br><br>
        <button id="closePopup" onClick = "closePopup();"> Close </button>
    `;
    newPopup.setAttribute("id", "featurePopup");
    newPopup.style.backgroundColor = "#e7e7e7";
    newPopup.style.display = "block";
    newPopup.style.textAlign = "center";
    var webpage = document.getElementById("pane-side");
    console.log(webpage);
    webpage.append(newPopup);
    var button = document.getElementById("closePopup");
    button.style.backgroundColor = "red";
}

closePopup = function () {
    console.log("Closing popup...");
    var popup = document.getElementById("featurePopup");
    console.log(popup);
    popup.style.display = "none";
}

function handleFeature (btn) {
    console.log("Clicked on checkbox of", btn.id);
    console.log(btn.checked);
    var btnId = btn.id;

    if(btnId == "blurName") {
        blurName(btn);
    }

    if(btnId == "blurPhoto") {
        blurPhoto(btn);
    }

    if(btnId == "blurChat") {
        blurChat(btn);
    }
}


function blurName (btn) {
    var status = btn.checked;
    if(status == true) {
        var leftSide = document.getElementById("pane-side"); 
        var chatNames = leftSide.getElementsByTagName("span");
        for(var x of chatNames) {
            var textName = x.getElementsByClassName("emoji-texttt");
            console.log(textName);
            if(textName != null) {
                x.style.filter = "blur(2px)";
            }
        }
        var allSpans = document.getElementsByTagName("span");
        console.log(allSpans);
    } else {
        var leftSide = document.getElementById("pane-side"); 
        var chatNames = leftSide.getElementsByTagName("span");
        for(var x of chatNames) {
            var textName = x.getElementsByClassName("emoji-texttt");
            console.log(textName);
            if(textName != null) {
                x.style.filter = "none";
            }
        }
        var allSpans = document.getElementsByTagName("span");
        console.log(allSpans);
    }
}


function blurPhoto (btn) {
    var status = btn.checked;
    if(status == true) {
        var leftSide = document.getElementById("pane-side");
        var photos = leftSide.getElementsByTagName("img");
        for(var x of photos) {
            x.style.filter = "blur(4px)"
        }
        console.log(photos);
    } else {
        var leftSide = document.getElementById("pane-side");
        var photos = leftSide.getElementsByTagName("img");
        for(var x of photos) {
            x.style.filter = "none";
        }
        console.log(photos);
    }
}

function blurChat (btn) {

}