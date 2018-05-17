//
// Copyright (c) 2017 Cisco Systems
// Licensed under the MIT License 
//

/*
 * Utility to add mentions if the bot is in a 'Group' space
 * 
 */
module.exports = function (bot) {

    // Add support for the append mention
    bot.appendMention = function (message, command) {
    
        // if the message is a raw message (from a post message callback such as bot.say())
        if (message.roomType && (message.roomType == "group")) {
            var botName = bot.botkit.identity.displayName;
            return "`@" + botName + " " + command + "`";
        }
    
        // if the message is a Botkit message
        if (message.raw_message && (message.raw_message.data.roomType == "group")) {
            var botName = bot.botkit.identity.displayName;
            return "`@" + botName + " " + command + "`";
        }
    
        return "`" + command + "`";
    }
}