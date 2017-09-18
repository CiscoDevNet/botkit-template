//
// Adds meta information about the bot, and exposes them at a public endpoint 
//
module.exports = function (controller) {

    //
    // OVERRIDE WITH YOUR BOT INFORMATION
    //
    var botcommons = {

        // Bot description
        "description": "It's an awesome bot for sure!",

        // Where to get more information about the bot
        "url": "https://github.com/CiscoDevNet/botkit-ciscospark-samples",

        // Legal owner
        "legal-owner": "Cisco DevNet <https://developer.cisco.com>",

        // Contact name for support
        "support-contact": "Stève Sfartz <mailto:stsfartz@cisco.com>",

        // Messaging platform
        "plaform": "ciscospark",

        // the precise bot identity is loaded asynchronously, as /people/me request - issued by "BotKit CiscoSparkBot.js" - returns
        "identity": "convos@sparkbot.io",

        // Endpoint where to check the bot is alive
        "healthcheck": "http://127.0.0.1:3000/ping",

        // BotCommons specifications version (should be an href)
        "botcommons": "draft",
    }

    // Adding a metadata endpoint
    controller.webserver.get("/botcommons", function (req, res) {
        res.json(botcommons);
    });
    console.log("CiscoSpark: Bot metadata available at: /botcommons");

    //
    // .commons skill
    //
    controller.hears([/^\.about$/, /^\.commons$/, /^\.bot$/, /^\.ping$/], 'direct_message,direct_mention', function (bot, message) {

        // Return metadata
        var metadata = '{\n'
            + '   "description" : "' + botcommons["description"] + '",\n'
            + '   "url"         : "' + botcommons["url"] + '",\n'
            + '   "owner"       : "' + botcommons["legal-owner"] + '",\n'
            + '   "support"     : "' + botcommons["support-contact"] + '",\n'
            + '   "healthcheck" : "' + botcommons["healthcheck"] + '",\n'
            + '}\n';

        bot.reply(message, '```json\n' + metadata + '\n```');
    });

}
