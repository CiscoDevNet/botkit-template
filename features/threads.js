    const { BotkitConversation } = require( 'botkit' );

    module.exports = function( controller ) {

        const convo = new BotkitConversation( 'states_quiz', controller );

        convo.ask( 'Can you name one of the last three states admitted to the U.S.?', [
            {
                pattern: '^Arizona|Alaska|Hawaii$',
                handler: async (response, convo, bot) => {
                    await convo.setVar( 'guess', response );
                    await convo.gotoThread( 'correct' );
                },
            },
            {
                default: true,
                handler: async (response, convo, bot) => {
                    await convo.gotoThread( 'incorrect' );
                },
            }
        ]);

        convo.addMessage({
            text: 'Correct! "{{ vars.guess }}" is one of the last three US states',
            action: 'complete'
        }, 'correct' );

        convo.addMessage({
            text: 'Incorrect :/  \nTry again!',
            action: 'repeat',
        }, 'incorrect');

        controller.addDialog( convo );

        controller.hears( 'states', 'message,direct_message', async ( bot, message ) => {

            await bot.beginDialog( 'states_quiz' );
        });

        controller.commandHelp.push( { command: 'states', text: 'Conversation/thread example implementing a state quiz' } );

    }