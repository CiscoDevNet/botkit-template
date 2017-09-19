//
// Stores a user choice in botkit 'users' storage, so that the value can be retreived later
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

            // Ask for favorite color
            askForFavoriteColor(controller, bot, message, userId);
        });
    });
}

function showUserPreference(controller, bot, message, userId, color) {
    bot.startConversation(message, function (err, convo) {

        convo.sayFirst(`Hey, I know you <@personId:${userId}>!<br/> '${color}' is your favorite color.`);

        // Remove user preferences if supported
        if (!controller.storage.users.remove) {
            convo.say("_To erase your preference, simply restart the bot as you're using in-memory transient storage._");
            convo.next();
            return;
        }

        convo.ask("Should I erase your preference?  yes/(no)", [
            {
                pattern: "^yes|ya|da|si|oui$",
                callback: function (response, convo) {

                    controller.storage.users.remove(userId, function (err) {
                        if (err) {
                            convo.say(message, 'sorry, could not access storage, err: ' + err.message);
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
                    convo.say("Got it, leaving your color preference as is.");
                    convo.next();
                }
            }
        ]);
    });
}

function askForFavoriteColor(controller, bot, message, userId) {
    bot.startConversation(message, function (err, convo) {

        convo.ask("What is your favorite color?", [
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

                        convo.transitionTo("success", `_stored user preference_`);
                    });

                },
            },
            {
                default: true,
                callback: function (response, convo) {
                    convo.say("Sorry, I don't know this color. Try another one...");
                    convo.repeat();
                    convo.next();
                }
            }
        ], { key: "answer" });

        // Success thread
        convo.addMessage(
            "Cool, I love '{{responses.answer}}' too",
            "success");
    });
}
