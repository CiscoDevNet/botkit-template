//
// Demonstrate CRUD operations on conversation variables, to test Botkit storage
// Note: Botkit uses in-memory (non-persistent) storage by default, configure REDIS_URL
// or MONGO_URI in .env to enable persistent/scalable storage

const { BotkitConversation } = require( 'botkit' );

module.exports = function (controller) {

    const convo = new BotkitConversation( 'storage_chat', controller );

    convo.say( `If Botkit persistent storage is configured, I can remember your favorite color even if I'm restarted!` );
    convo.ask( `What is your favorite color (don't forget to @mention me if in a group Space?)`, [], 'statedColor' );

    convo.say( 'Your favorite color is: {{ vars.statedColor }}' );
    convo.ask( `You can now stop and restart the bot app...\nWhen the bot app is restarted, enter "ready" to test my powers of recall (don't forget to @mention me if in a group Space!)\n`, [], {} );
    convo.say( 'Your favorite color is: {{ vars.statedColor }}' );

    controller.addDialog( convo );

    controller.hears( 'storage', 'message,direct_message', async ( bot, message ) => {

        await bot.beginDialog( 'storage_chat' );

    });

    controller.commandHelp.push( { command: 'storage', text: 'Example showing use of Redis/MongoDB to persist conversation data' } );

}