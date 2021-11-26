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
        suggestions += `<button style="background-color: #dcf8c6;
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


WAPI.setupFeaturePage = function () {
    // Setup the WBOT button on the header
    var header = document.querySelector("header");
    var featureButton = document.getElementById("featureButton");
    var presentButton = document.contains(featureButton);

    if(presentButton != true) {
        var newFeatureButton = document.createElement("div");
        newFeatureButton.innerHTML = `
            <button id="featureButton" onClick="openPopup()">WBOT</button>
        `;
        header.append(newFeatureButton);
    }

    // Setup the feature page on the right side of the window (i.e chat window)
    var newPopup = document.createElement("div");
    newPopup.innerHTML = `
            <h1 style="background-color: 
                green; color: white; 
                height: 40px;
                font-size: 30px;
                top: 3px;"
            >Features by WBOT</h1> <br><br>
        <ul>
            <li>
                <label style="font-size: 20px;">Blur name</label> 
                <input id = "blurName" onclick = "handleFeature(this);" type="checkbox"> <br><br>
            </li>
            <li>
                <label style="font-size: 20px">Blur photo</label> 
                <input id = "blurPhoto" onclick = "handleFeature(this);" type="checkbox"><br><br>
            </li>
            <li>
                <label style="font-size: 20px">Blur chat</label>
                <input id = "blurChat" onclick = "handleFeature(this);" type="checkbox"><br><br>
            </li>
            <li>
                <label style="font-size: 20px">Blur recent messages</label>
                <input id = "blurRecentMessages" onclick = "handleFeature(this);" type="checkbox"><br><br>
            </li>
            <li>
                <label style="font-size: 20px">Dark mode</label>
                <input id = "darkMode" onclick = "handleFeature(this);" type="checkbox"><br><br>
            </li>
        </ul>
        <button style="background-color: #4CAF50;
                        border: none;
                        color: white;
                        padding: 15px 32px;
                        text-align: center;
                        text-decoration: none;
                        display: inline-block;
                        font-size: 16px;
                        margin: 4px 2px;
                        cursor: pointer;"
            id="closePopup" onClick = "closePopup();"> Close </button>        
    `;
    newPopup.setAttribute("id", "featurePopup");
    newPopup.style.backgroundColor = "rgb(255, 255, 255)";
    newPopup.style.display = "none";
    newPopup.style.textAlign = "center";
    newPopup.style.zIndex = "999999999";
    newPopup.style.height = "100%";
    newPopup.style.width = "100%";
    newPopup.style.position = "absolute";
    newPopup.style.overflow = "hidden auto";
    var webpage = document.getElementById("main");
    webpage.append(newPopup);
}

openPopup = function () {
    var popup = document.getElementById("featurePopup");
    popup.style.display = "block";
}

closePopup = function () {
    var popup = document.getElementById("featurePopup");
    popup.style.display = "none";
}

function handleFeature (btn) {
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

    if(btnId == "blurRecentMessages") {
        blurRecentMessages(btn);
    }

    if(btnId == "darkMode") {
        darkMode(btn);
    }
}


function blurName (btn) {
    var status = btn.checked;
    if(status == true) {
        var leftSide = document.getElementById("pane-side"); 
        var chatNames = leftSide.getElementsByTagName("span");
        for(var x of chatNames) {
            var textName = x.getElementsByClassName("emoji-texttt");
            if(textName != null) {
                x.style.filter = "blur(4px)";
                x.classList.add("blur");
                x.setAttribute("onmouseover", "toggle_blur(this)");
                x.setAttribute("onmouseout", "toggle_blur(this)");
            }
        }
    } else {
        var leftSide = document.getElementById("pane-side"); 
        var chatNames = leftSide.getElementsByTagName("span");
        for(var x of chatNames) {
            var textName = x.getElementsByClassName("emoji-texttt");
            console.log(textName);
            if(textName != null) {
                x.classList.remove("blur");
                x.style.filter = "none";
            }
        }
    }
}


function blurPhoto (btn) {
    var status = btn.checked;
    if(status == true) {
        // Injecting style in head
        var head =  document.getElementsByTagName('head')[0];
        var style = document.createElement("style");
        style.setAttribute("id", "blur-photos");
        style.innerHTML = `
            ._8hzr9 { filter: blur(4px); } ._8hzr9:hover { filter: blur(0); }
        `;
        head.append(style);
    } else {
        var style = document.getElementById("blur-photos");
        style.remove();
    }
}

function blurRecentMessages (btn) {
    var status = btn.checked;
    if(status == true) {
        // Injecting style in head
        var head =  document.getElementsByTagName('head')[0];
        var style = document.createElement("style");
        style.setAttribute("id", "blur-recent-messages");
        style.innerHTML = `
            .Hy9nV { filter: blur(4px); } .Hy9nV:hover { filter: blur(0); }
        `;
        head.append(style);
    } else {
        var style = document.getElementById("blur-recent-messages");
        style.remove();
    }
}

function blurChat (btn) {
    var status = btn.checked;
    if(status == true) {
        var head =  document.getElementsByTagName('head')[0];
        var style = document.createElement("style");
        style.setAttribute("id", "blur-chats");
        style.innerHTML = `
        .message-out, .message-in { filter: blur(4px); } .message-out:hover, .message-in:hover { filter: blur(0); }
        `;
        head.append(style);
    } else {
        var style = document.getElementById("blur-chats");
        style.remove();
    }
}

function darkMode (btn) {
    var webpage = document.querySelector("body");
    var featureButton = document.getElementById("featureButton");
    var status = btn.checked;
    var suggestions = document.getElementsByClassName("reply-options");
    console.log(suggestions);

    if(status == true) {
        webpage.classList.add("dark");
        featureButton.style.color = "white";
        for(x of suggestions) {
            x.style.backgroundColor = '#056162';
        }
    } else {
        webpage.classList.remove("dark");
        featureButton.style.color = "black";
        for(x of suggestions) {
            x.style.backgroundColor = '#dcf8c6';
        }
    }
}