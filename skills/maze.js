//
// Quiz: example of a muti-threaded conversation with timeout
//
//
module.exports = function (controller) {

    controller.hears(['maze'], 'direct_message,direct_mention', function (bot, message) {

        bot.startConversation(message, function (err, convo) {

            // Default thread
            convo.ask("Ready to engage in a game? (yes/no/cancel)", [
                {
                    pattern: "yes|yeh|sure|oui|si",
                    callback: function (response, convo) {

                        // Check user preference
                        getPreferredLevel(controller, message, function (err, difficulty) {
                            
                            // Initialize a new maze
                            var maze = createMaze(difficulty, 1000);

                            // Associate it to the current convo
                            convo.setVar("game", maze);
                            convo.gotoThread('game');
                        });

                    },
                }
                , {
                    pattern: "no|neh|non|na|birk",
                    callback: function (response, convo) {
                        convo.say("Too bad, looking forward to play with you later...");
                        convo.next();
                    },
                }
                , {
                    pattern: "cancel|stop|exit",
                    callback: function (response, convo) {
                        convo.gotoThread('cancel');
                    },
                }
                , {
                    default: true,
                    callback: function (response, convo) {
                        convo.say("Sorry, I did not understand.");
                        convo.repeat();
                        convo.next();
                    }
                }
            ]);

            // Cancel thread
            convo.addMessage({
                text: "Got it, cancelling...",
                action: 'stop', // this marks the converation as unsuccessful
            }, 'cancel');

            // Game thread
            convo.addMessage("Then, here you are, lost in a maze looking for a treasure.\n\nYou are starting with **{{vars.game.score}}** points.", "game");

            convo.addQuestion("Please, enter a direction (up/down/left/right or cancel) ", function (response, convo) {
                // fetch current maze
                var game = convo.vars["game"];
                var move;
                switch (response.text) {
                    case 'up': move = game.up(); break;
                    case 'down': move = game.down(); break;
                    case 'left': move = game.left(); break;
                    case 'right': move = game.right(); break;

                    case 'cancel':
                    case 'stop':
                    case 'exit':
                        convo.say("Got it, leaving the game.");
                        convo.next();
                        return

                    default:
                        convo.say("Sorry, I did not get it.");
                        convo.repeat();
                        convo.next();
                        return;
                }

                // 
                convo.say(`_moving ${response.text}..._`);

                if (move.success) {

                    // Have we found the treasure
                    if (move.points == 5000) {
                        convo.transitionTo('success', `${move.thing}\n\nYou earned: **${move.points} points**`);
                        return;
                    }

                    convo.say(move.thing);
                    convo.say(`**${move.points} points**: your score is now ${game.score}.`)
                    convo.repeat();
                    convo.next();
                    return;
                }

                // move failed
                convo.say(move.outcome);
                convo.say(`**${move.points} points**: your score is now ${game.score}.`)
                convo.repeat();
                convo.next();
                return;

            }, {}, 'game');

            // Success thread
            convo.addMessage("**Your final score is {{vars.game.score}}**", "success");

        });
    });
};


function createMaze(difficulty, points) {

    // Build structures
    var structures = []

    var structure = []
    structure[0] = ['|', '-', '-', '-', '-', '-', '|']
    structure[1] = ['|', 'M', 'C', '_', '_', '_', '|']
    structure[2] = ['|', '_', '_', 'X', 'D', '_', '|']
    structure[3] = ['|', '_', 'X', '?', 'X', '_', '|']
    structure[4] = ['|', '_', '_', '_', '_', 'X', '|']
    structure[5] = ['|', '-', '-', '-', '-', '-', '|']
    structures[0] = structure

    structure = []
    structure[0] = ['|', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '|']
    structure[1] = ['|', '_', '_', '_', 'D', 'X', '_', '_', '_', 'M', '_', 'X', '_', '_', 'X', '_', '|']
    structure[2] = ['|', 'C', 'X', '_', '_', 'X', '_', 'X', '_', '_', '_', '_', '_', 'X', 'X', 'C', '|']
    structure[3] = ['|', '_', '_', 'X', '_', '_', '_', 'D', 'X', 'C', '_', 'X', '_', '_', '_', '_', '|']
    structure[4] = ['|', 'D', '_', '?', 'X', '_', '_', '_', '_', 'X', '_', 'X', '_', '_', 'X', '_', '|']
    structure[5] = ['|', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '|']
    structures[1] = structure

    structure = []
    structure[0] = ['|', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '|']
    structure[1] = ['|', 'C', '_', '_', 'D', '_', 'M', '_', 'X', '_', '_', '_', 'C', 'D', '_', 'C', '_', '_', '_', 'X', '_', '_', '_', '_', '_', '_', 'X', 'C', '_', 'D', '_', '_', 'X', '|']
    structure[2] = ['|', '_', '_', 'X', 'X', '_', '_', '_', 'X', 'C', 'M', '_', 'X', '_', '_', '_', 'M', 'D', '_', '_', 'X', '_', '_', 'X', 'D', '_', '_', 'X', '_', '_', '_', 'X', 'C', '|']
    structure[3] = ['|', '_', 'X', 'C', '_', 'X', 'X', '_', '_', '_', 'X', 'X', '_', '_', 'D', 'X', 'X', '_', '_', 'X', '_', 'M', 'X', 'C', '_', '_', 'M', '_', '_', 'X', '_', '_', '_', '|']
    structure[4] = ['|', '_', '_', 'D', '_', '_', '?', 'X', '_', 'X', 'C', '_', '_', 'X', 'X', 'X', 'D', '_', '_', '_', 'C', '_', '_', '_', 'X', '_', '_', '_', 'C', 'X', '_', 'D', 'M', '|']
    structure[5] = ['|', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '|']
    structures[2] = structure

    var walls = ['|', '-', 'X']

    var phrases = {}
    phrases['|'] = "cannot get there, this a maze border you just hitted."
    phrases['-'] = "cannot get there, this a maze border you just hitted."
    phrases['|'] = "cannot get there, this a maze border you just hitted."
    phrases['X'] = "ouch, you bumped a wall!"
    phrases['_'] = "nothing here, let's continue exploring..."
    phrases['C'] = "hello kitty, you look hungry. Are you lost too? Jump in."
    phrases['D'] = "WOW, an agressive dog is lying here. You've been bitten!"
    phrases['M'] = "Too bad, the ugly monster saw you. RUN AWAY!!!"
    phrases['?'] = "CONGRATS, you found the treasure!!!"

    var scores = {}
    scores['|'] = -200
    scores['-'] = -200
    scores['|'] = -200
    scores['X'] = -100
    scores['_'] = 50
    scores['C'] = 200
    scores['D'] = -200
    scores['M'] = -500
    scores['?'] = 5000

    var levels = []
    levels[0] = 'rookie'
    levels[1] = 'seasoned'
    levels[2] = 'expert'

    // Create Maze
    console.log("Starting a new Maze")
    const Maze = require('./utils/maze')
    var game = new Maze(structures[difficulty], walls, phrases, scores, '?')
    game.pickInitialPosition('_')
    game.updateScore(points)

    return game;
}

function getPreferredLevel(controller, message, cb) {
    // Check if a User preference already exists
    var userId = message.raw_message.actorId;
    controller.storage.users.get(userId, function (err, data) {
        if (err) {
            console.log("could not access storage, defaulting to level 0")
            return cb(null, 0);
        }

        if (!data) {
            console.log("no stored preference, defaulting to level 0")
            return cb(null, 0);
        }

        return cb(null, data.value);
    });
}
