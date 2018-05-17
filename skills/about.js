//
// Adds meta information about the bot
//
module.exports = function (controller, bot) {

    //
    // .botcommons skill
    //
    controller.hears([/^about$/, /^botcommons$/, /^\.commons$/, /^\.bot$/], 'direct_message,direct_mention', function (bot, message) {

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
