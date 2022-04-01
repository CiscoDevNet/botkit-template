/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

module.exports = function(controller) {

    controller.hears('sample','message,direct_message', async (bot, message) => {
        await bot.reply(message, 'I heard a sample message.');
    });

    controller.on('message', async (bot, message) => {
        console.log("MESSAGE from: " + message.personEmail);
        await bot.reply(message, `Echo: ${ message.text }`);
    });

}
