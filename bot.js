// Copyright (c) 2018 Cisco and/or its affiliates.
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//  __   __  ___        ___
// |__) /  \  |  |__/ |  |
// |__) \__/  |  |  \ |  |

// This is the main file for the template bot.

// Load process.env values from .env file
var path = require('path');
require('dotenv').config();

var public_url;

if (process.env.PUBLIC_ADDRESS) public_url = process.env.PUBLIC_ADDRESS
else {

    // Heroku hosting: available if dyno metadata are enabled, https://devcenter.heroku.com/articles/dyno-metadata
    if (process.env.HEROKU_APP_NAME) {
        public_url = 'https://' + process.env.HEROKU_APP_NAME + '.herokuapp.com'
    }

    // Glitch hosting
    if (process.env.PROJECT_DOMAIN) {
        public_url = 'https://' + process.env.PROJECT_DOMAIN + '.glitch.me'
    }
}

var storage;

if (process.env.REDIS_URL) {

    const redis = require('redis');
    const { RedisDbStorage } = require('botbuilder-storage-redis');

    // Initialize redis client
    const redisClient = redis.createClient(process.env.REDIS_URL, { prefix: 'bot-storage:' });
    storage = new RedisDbStorage(redisClient);
}

if (process.env.MONGO_URI) {

    const { MongoDbStorage } = require('botbuilder-storage-mongodb');

    storage = new MongoDbStorage({ url: process.env.MONGO_URI })
}

// Create Webex Adapter
const uuidv4 = require('uuid/v4');
const { WebexAdapter } = require('botbuilder-adapter-webex');
const adapter = new WebexAdapter({

    access_token: process.env.ACCESS_TOKEN,
    public_address: public_url,
    secret: uuidv4()
});

// Create Botkit controller
const { Botkit } = require('botkit');
const controller = new Botkit({

    webhook_uri: '/api/messages',
    adapter: adapter,
    storage
});

if (process.env.CMS_URI) {
    const { BotkitCMSHelper } = require('botkit-plugin-cms');
    controller.usePlugin(new BotkitCMSHelper({
        uri: process.env.CMS_URI,
        token: process.env.CMS_TOKEN
    }));
};

controller.commandHelp = [];

// Once the bot has booted up its internal services, you can use them to do stuff.
controller.ready(() => {

    // load traditional developer-created local custom feature modules
    controller.loadModules(path.join(__dirname, 'features'));
    console.log('Health check available at: ' + public_url);
});

controller.publicFolder('/www', __dirname + '/www');

controller.webserver.get('/', (req, res) => {

    res.send(JSON.stringify(controller.botCommons, null, 4));
});

controller.checkAddMention = function (roomType, command) {

    var botName = adapter.identity.displayName;

    if (roomType === 'group') {

        return `\`@${botName} ${command}\``
    }

    return `\`${command}\``
}
