//
// Stores a user choice in Botkit 'users' storage, so that the value can be retreived later
//
module.exports = function (controller) {

    controller.hears([/^storage$/], 'direct_message,direct_mention', function (bot, message) {

        // Check if a User preference already exists
        var userId = message.raw_message.actorId;
        controller.storage.users.get(userId, function (err, data) {
            if (err) {
                bot.reply(message, 'could not access storage, err: ' + err.message, function (err, message) {
                    bot.reply(message, 'sorry, I am not feeling well \uF613! try again later...');
                });
                return;
            }

            // User preference found
            if (data) {
                // Show user preference
                showUserPreference(controller, bot, message, userId, data.value);
                return;
            }

            // Ask for prefrence
            askForUserPreference(controller, bot, message, userId);
        });
    });
}

function showUserPreference(controller, bot, message, userId, color) {
    bot.startConversation(message, function (err, convo) {

        // [GOOD TO KNOW] Mentions are now failing in 1-1 spaces
        //convo.sayFirst(`Hey, I know you <@personId:${userId}>!<br/> '${color}' is your favorite color.`);
        convo.sayFirst(`Hey, I know you! **'${color}'** is your favorite color.`);

        convo.ask("Should I erase your preference? (yes/**no**)", [
            {
                pattern: "^yes|ya|da|si|oui$",
                callback: function (response, convo) {

                    // [WORKAROUND] use storage.users.delete if in-memory storage and storage.users.remove if redis storage
                    controller.storage.users.delete(userId, function (err) {
                        if (err) {
                            // [TODO] Turn into a thread or simply stop the current conversation
                            // convo.say(message, 'sorry, could not access storage, err: ' + err.message);
                            convo.repeat();
                            return;
                        }

                        convo.say("Successfully reset your color preference.");
                        convo.next();
                    });

                },
            },
            {
                default: true,
                callback: function (response, convo) {
                    convo.say("Got it, leaving your preference as is.");
                    convo.next();
                }
            }
        ]);
    });
}

function askForUserPreference(controller, bot, message, userId) {
    bot.startConversation(message, function (err, convo) {

        convo.ask("Please tell me your favorite color?", [
            {
                pattern: "^blue|green|pink|red|yellow$",
                callback: function (response, convo) {

                    // Store color as user preference
                    var pickedColor = convo.extractResponse('answer');
                    var userPreference = { id: userId, value: pickedColor };
                    controller.storage.users.save(userPreference, function (err) {
                        if (err) {
                            convo.say(message, 'sorry, could not access storage, err: ' + err.message);
                            convo.next();
                            return;
                        }

                        convo.transitionTo("success", "_successfully stored user preference_");
                    });

                },
            },
            {
                default: true,
                callback: function (response, convo) {
                    convo.gotoThread('bad_response');
                }
            }
        ], { key: "answer" });

        // Bad response
        convo.addMessage({
            text: "Sorry, I don't know this color.<br/>_Tip: try blue, green, pink, red or yellow!_",
            action: 'default',
        }, 'bad_response');

        // Success thread
        convo.addMessage(
            "Cool, I love '{{responses.answer}}' too",
            "success");
    });
}
