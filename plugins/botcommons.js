//
// Copyright (c) 2017 Cisco Systems
// Licensed under the MIT License 
//

//
// Adds meta information about the bot, and exposes them at a public endpoint 
//
module.exports = function (controller, bot) {

    //
    // OVERRIDE WITH YOUR BOT INFORMATION
    //
    var botcommons = {

        // Bot description
        "description": "It's an awesome bot for sure!",

        // Where to get more information about the bot
        "url": "https://github.com/CiscoDevNet/botkit-template",

        // Legal owner
        "legal-owner": "Cisco DevNet <https://developer.cisco.com>",

        // Contact name for support
        "support-contact": "Stève Sfartz <mailto:stsfartz@cisco.com>",

        // Messaging platform
        // [WORKAROUND] overriding Botkit's integrated support temporarly as 'ciscospark' is still returned
        //"plaform": bot.type,
        "plaform": "webex",

        // the precise bot identity is loaded asynchronously, as /people/me request - issued by "BotKit CiscoSparkBot.js" - returns
        "identity": "unknown",

        // Endpoint where to check the bot is alive
        "healthcheck": "https://" + controller.config.public_address + process.env.HEALTHCHECK_ROUTE,

        // BotCommons specifications version (should be an href)
        "botcommons": "draft",
    }

    // Making metadata accessible from skills
    controller.metadata = botcommons;

    // Adding a metadata endpoint
    var route = process.env.BOTCOMMONS_ROUTE || "/botcommons";
    controller.webserver.get(route, function (req, res) {

        // As the identity is load asynchronously, we need to check if it's been fetched
        if (controller.metadata.identity == "unknown") {
            // Get the latest status: either the fetched identity or undefined
            if (bot.botkit.identity) {
                controller.metadata.identity = bot.botkit.identity.emails[0];
            }
        }

        res.json(controller.metadata);
    });

    console.log("Bot metadata available at: " + route);
}
