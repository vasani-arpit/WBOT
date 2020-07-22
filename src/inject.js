window.log(`DEBUG:  #### INJECT CODE EXECUTED!!!`);
// --
// show Current active Quiz details
//
//if (interaction.quiz.active == true) {
//    window.log('*** Quiz Summary ***');
//    window.log('Quiz Name: ' + interaction.quiz.id);
//    window.log('Quiz Preamble: ' + interaction.quiz.preamble);
//    window.log('Number of Questions: ' + interaction.quiz.question.length);
//    interaction.quiz.question.forEach(itemQuestion => {
//        window.log('Question: ' + itemQuestion.text)
//        itemQuestion.answer.forEach(itemAnswer => {
//    	window.log('  Answer:   ' + itemAnswer.text + (itemAnswer.isCorrect == true ? ' (correct) ':' (incorrect)'));
//        window.log('    -> '+ itemAnswer.response);
//        });
//    });
//}

//function parse(str) {
//
//  return Function(` return (${str})`)()
//
//}
name = "Adam";
score = 2;
ppre = `Hi ${name} you scored ${score}`;
test = `${ppre}`;
window.log('DEBUG: ${test} ' + test);

WAPI.waitNewMessages(false, async (data) => {
    for (let i = 0; i < data.length; i++) {
        //fetch API to send and receive response from server
        let message = data[i];
        body = {};
        body.text = message.body;
        body.type = 'message';
        body.user = message.chatId._serialized;
        //body.original = message;
        if (intents.appconfig.webhook) {
            fetch(intents.appconfig.webhook, {
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

            // --- QUIZ START ---

            // ------------------------------------------------
            // SETUP/LOOKUP DATASTORE STRUCTURE FOR A MESSAGE SENDER
            var response = "";
            var KnownChatIds = WAPI.getAllChatIds();

            // STATUS of CURRENT QUIZ
            if (interaction.quiz && interaction.quiz.active == true)
                window.log("DEBUG: quiz: current quiz: '" + interaction.quiz.id + "' is active");
            else
                window.log("DEBUG: quiz: current quiz '" + interaction.quiz.id + "' is NOT active");

            // set a single ChatId to test
            var itemPhone = chatIdStore.chat.find(o => o.chatId === message.chatId);

            // STATUS of CHAT-ID? Generate itemPhone object
            if (itemPhone == undefined) {
                window.log('DEBUG: itemPhone: chatId does not exist');
                chatIdStore.chat.push({"chatId": message.chatId,"quiz":[]});
                itemPhone = chatIdStore.chat.find(o => o.chatId === message.chatId);
                window.log("DEBUG: KnownChatIds " + JSON.stringify(KnownChatIds));
                if (KnownChatIds.includes(message.chatId._serialized)) {
                      itemPhone.contact = WAPI.getContact(message.chatId);
                      window.log("DEBUG: message.chatId is in KnownChatIds");
                      window.log(itemPhone.contact);
                }
                window.log("DEBUG: itemPhone: chatId created for " + itemPhone.chatId)
            }

            // IS CURRENT QUIZ a NEW QUIZ for CHAT-ID? Generate itemPhone.quiz
            var itemQuiz = itemPhone.quiz.find(o => o.id === interaction.quiz.id);
            if (itemQuiz == undefined) {
                window.log("DEBUG: chatId: current quiz '" + interaction.quiz.id + "' does NOT exist in " + itemPhone.chatId + "'s  profile");
                // Populate itemPhone.itemQuiz with current quiz object
                itemPhone.quiz.push({"id":interaction.quiz.id,"preamble":interaction.quiz.preamble,"question":[],"postamble":interaction.quiz.postamble,"isCompleted":false});
                itemQuiz = itemPhone.quiz.find(o => o.id === interaction.quiz.id);
                for (let q of interaction.quiz.question) {
                    itemQuiz.question.push({"preamble":q.preamble,"postamble":q.postamble,"text":q.text,"answer":q.answer,"isCompleted":false,"reply":{}});
                }
                window.log("DEBUG: chatId: current quiz '" + interaction.quiz.id + "' element created for " + itemPhone.chatId + "'s  profile");
            } else
                window.log("DEBUG: chatId: current quiz '" + interaction.quiz.id + "' already exists in " + itemPhone.chatId + "'s  profile");

            if (itemQuiz.isCompleted == false) {
                // END: SETUP/LOOKUP DATASTORE STRUCTURE FOR A MESSAGE SENDER
                // ------------------------------------------------

                var itemQuestion = itemQuiz.question.find(o => o.isCompleted != true);

                if (itemQuiz.hasBegun == true) {
                    // RECEIVE RESPONSE
                    itemQuestion.reply.text = message.body;
                    window.log('DEBUG: FAKE set message.body = ' + message.body);

                    // PROCESS RESPONSE
                    var itemPartialMatch = itemQuestion.answer.find(obj => obj.contains.find(ex => message.body.toLowerCase().search(ex) > -1));
                    window.log("DEBUG: JSON.stringify(itemPartialMatch) =" + JSON.stringify(itemPartialMatch));
                    if (itemPartialMatch != undefined) {
                        //response = response.concat('\n', itemPartialMatch.response);
                        WAPI.sendMessage2(message.chatId._serialized, itemPartialMatch.response);
                        window.log(`Replying with ${response}`);
                        itemQuestion.reply.isCorrect = itemPartialMatch.isCorrect;
                        itemQuestion.isCompleted = true;
                        itemQuestion = itemQuiz.question.find(o => o.isCompleted != true);
                    } else {
                        window.log("No partial match found");
                    }
                } else {
                    window.log("DEBUG: Quiz '" + itemQuiz.id + "' has started for " + itemPhone.chatId);
                    window.log("SEND: QUIZ PREAMBLE to " + itemPhone.chatId + " quiz.preamble[]: " + itemQuiz.preamble);
                    //response = response.concat('\n', itemQuiz.preamble);
                    var name = itemPhone.contact.pushname;
                    if (name == undefined) name = itemPhone.contact.name;
		    var mixed = itemQuiz.preamble.toString().replace('#name', name);
                    window.log("DEBUG: mixed = " + mixed);

                    WAPI.sendMessage2(itemPhone.chatId, mixed);
                    itemQuiz.hasBegun = true;
                }

                if (itemQuestion != undefined) {
                    window.log("SEND: QUIZ QUESTION PREAMBLE to " + itemPhone.chatId + " question.preamble[]: " + itemQuestion.preamble);
                    //response = response.concat('\n\n', itemQuestion.preamble);
                    window.log("DEBUG: RESPONSE:" + response);
                    WAPI.sendMessage2(itemPhone.chatId, itemQuestion.preamble.toString());
                    window.log("SEND: QUIZ QUESTION TEXT to " + itemPhone.chatId + " question.text: " + itemQuestion.text);
                    //response = response.concat('\n\n', itemQuestion.text);
                    WAPI.sendMessage2(itemPhone.chatId, itemQuestion.text.toString());
                    // window.log("DEBUG: RESPONSE:" + response);
                    var itemAnswer = itemQuestion.answer.forEach(o => {
                        if (o.text != undefined) {
                             window.log("DEBUG: ANSWER -> " + o.text);
                             response = response.concat('\n', o.text);
                        }
                    });
                } else {
                    window.log("DEBUG: No unanswered questions found.");
                    if (itemQuiz.postamble != undefined) {
                        var name = itemPhone.contact.pushname;
                        if (name == undefined) name = itemPhone.contact.name;
                        window.log("DEBUG: name = " + name);
		        var mixed = itemQuiz.postamble.toString().replace('#name', name);
                        var correctReplies = itemQuiz.question.filter(o => o.reply.isCorrect == true);
		        var mixed = mixed.replace('#correct_replies', correctReplies.length);
                        window.log("DEBUG: correctReplies.length = " + correctReplies.length);
		        var mixed = mixed.replace('#questions', itemQuiz.question.length);
                        window.log("DEBUG: itemQuiz.question.length = " + itemQuiz.question.length);
                        window.log("DEBUG: mixed = " + mixed);
                        window.log("SEND: QUIZ POSTAMBLE to " + itemPhone.chatId + " quiz.postamble[]: " + mixed);
                        // response = response.concat('\n\n', mixed);
                        WAPI.sendMessage2(itemPhone.chatId, mixed);
                    }
                    // Quiz complete. Mark as so.
                    itemQuiz.isCompleted = true;
                }

                putStoreFile(itemPhone.chatId, JSON.stringify(itemPhone, null, 4));
                window.log('DEBUG: chatIdStore updated for '+ itemPhone.chatId);
                window.log('FINAL SEND:\n' + response);
                if (KnownChatIds.includes(message.chatId._serialized) && response.length > 0) {
                    WAPI.sendMessage2(itemPhone.chatId, response);
                }
            }

            // --- QUIZ END ---

            var exactMatch = intents.bot.find(obj => obj.exact.find(ex => ex == message.body.toLowerCase()));
            var response = "";
            if (exactMatch != undefined) {
                response = await resolveSpintax(exactMatch.response);
                window.log(`Replying with ${response}`);
            } else {
                response = await resolveSpintax(intents.noMatch);
                window.log(`No exact match found. So replying with ${response} instead`);
            }
            var PartialMatch = intents.bot.find(obj => obj.contains.find(ex => message.body.toLowerCase().search(ex) > -1));
            if (PartialMatch != undefined) {
                response = await resolveSpintax(PartialMatch.response);
                window.log(`Replying with ${response}`);
            } else {
                console.log("No partial match found");
            }
            WAPI.sendSeen(message.chatId._serialized);
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
        } else {
		window.log(`DEBUG: Message type ${message.type} received`);
	}
    }
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
