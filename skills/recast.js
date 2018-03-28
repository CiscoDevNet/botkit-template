
const recastai = require('recastai');

// Several direction (up, left, right, down) intents (no entities)
const recast = new recastai.request('9dd85824b8718f9d0bf8244fb5bdfb07', 'en');
//const recast = new recastai.request('9dd85824b8718f9d0bf8244fb5bdfb07', 'fr');

// A single 'move' intent (direction-up, left, ... as entities)
//const recast = new recastai.request('25848725978fea50d64c7eba9e998f4d', 'en');

module.exports = function (controller) {

    controller.hears([/^recast$/], 'direct_message,direct_mention', function (bot, message) {
        bot.startConversation(message, function (err, convo) {
            convo.say('This is a NLP sample.');

            convo.ask('Type something that relates to moving directions?', function (response, convo) {
                // Invoking Recast.ai
                recast.analyseText(response.text)
                    .then(function (res) {
                        if (!res.intent()) {
                            convo.say("sorry, I could not catch a direction. Please again!");
                            convo.repeat();
                            convo.next();
                            return;
                        }

                        switch (res.intent().slug) {
                            case 'up':
                                convo.gotoThread("move-up");
                                return;

                            case 'down':
                                convo.gotoThread("move-down");
                                return;

                            case 'left':
                                convo.gotoThread("move-left");
                                return;

                            case 'right':
                                convo.gotoThread("move-right");
                                return;

                            default:
                                console.log("recast skill: should not happen !!!")
                                convo.say("sorry, I am not feeling well. Please try again");
                                convo.repeat();
                                convo.next();
                        }
                    })
                    .catch(function (err) {
                        console.log(`recast error: ${err.message}`);
                    })
            });

            convo.addMessage(
                "got it, turning left",
                "move-left");

            convo.addMessage(
                "got it, turning right",
                "move-right");

            convo.addMessage(
                "got it, moving up",
                "move-up");

            convo.addMessage(
                "got it, going down",
                "move-down");
        });
    });
};
