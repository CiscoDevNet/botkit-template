//
// Stores a user choice in botkit 'users' storage, so that the value can be retreived later
//
module.exports = function (controller) {

    controller.hears([/^pref$/], 'direct_message,direct_mention', function (bot, message) {

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

            // Ask the user to enter its preferences
            askForUserPreference(controller, bot, message, userId);
        });
    });
}

function showUserPreference(controller, bot, message, userId, difficulty) {
    bot.startConversation(message, function (err, convo) {

        var levels = []
        levels[0] = 'rookie'
        levels[1] = 'seasoned'
        levels[2] = 'expert'
        var level = levels[difficulty];
        convo.sayFirst(`Hey, I know you <@personId:${userId}>: your preferred difficulty is '${level}'.`);

        // Remove user preferences if supported
        if (!controller.storage.users.delete) {
            convo.say("_To erase your preference, simply restart the bot as you're using in-memory transient storage._");
            convo.next();
            return;
        }

        convo.ask("Should I erase your preference? yes/(no)", [
            {
                pattern: "^yes|ya|da|si|oui$",
                callback: function (response, convo) {

                    controller.storage.users.delete(userId, function (err) {
                        if (err) {
                            convo.say(message, 'sorry, could not access storage, err: ' + err.message);
                            convo.repeat();
                            return;
                        }

                        convo.say("Successfully reset your preference.");
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

        convo.ask("Which level do you want to play? Rookie(1), Seasoned(2) or Expert(3)", [
            {
                pattern: "^1|2|3$",
                callback: function (response, convo) {

                    // Store color as user preference
                    var difficulty = parseInt(convo.extractResponse('answer')) - 1;
                    var userPreference = { id: userId, value: difficulty };
                    controller.storage.users.save(userPreference, function (err) {
                        if (err) {
                            convo.say(message, 'sorry, could not access storage, err: ' + err.message);
                            convo.next();
                            return;
                        }

                        convo.gotoThread("success");
                    });

                },
            },
            {
                default: true,
                callback: function (response, convo) {
                    convo.say("Sorry, I don't know this level. Please enter 1, 2 or 3.");
                    convo.repeat();
                    convo.next();
                }
            }
        ], { key: "answer" });

        // Success thread
        convo.addMessage(
            "Successfully stored your preference.",
            "success");
    });
}
