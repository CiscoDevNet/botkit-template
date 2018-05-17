//
// Copyright (c) 2017 Cisco Systems
// Licensed under the MIT License 
//

//
// BotKit configuration
//

// Load environment variables from project .env file
require('node-env-file')(__dirname + '/.env');


// Fetch token from environement
// [COMPAT] supports SPARK_TOKEN for backward compatibility
var accessToken = process.env.ACCESS_TOKEN || process.env.SPARK_TOKEN 
if (!accessToken) {
    console.log("Could not start as this bot requires a Webex Teams API access token.");
    console.log("Please invoke with an ACCESS_TOKEN environment variable");
    console.log("Example: ");
    console.log("> ACCESS_TOKEN=XXXXXXXXXXXX PUBLIC_URL=YYYYYYYYYYYYY node bot.js");
    process.exit(1);
}

// Get public URL where Web will post notifications (webhook registration)
var public_url = process.env.PUBLIC_URL;
// Infer the app domain for popular Cloud PaaS
if (!public_url) {

    // Heroku hosting: available if dyno metadata are enabled, https://devcenter.heroku.com/articles/dyno-metadata
    if (process.env.HEROKU_APP_NAME) {
        public_url = "https://" + process.env.HEROKU_APP_NAME + ".herokuapp.com";
    }

    // Glitch hosting
    if (process.env.PROJECT_DOMAIN) {
        public_url = "https://" + process.env.PROJECT_DOMAIN + ".glitch.me";
    }
}
if (!public_url) {
    console.log("Could not start as this bot must expose a public endpoint.");
    console.log("Please add env variable PUBLIC_URL on the command line or to the .env file");
    console.log("Example: ");
    console.log("> ACCESS_TOKEN=XXXXXXXXXXXX PUBLIC_URL=YYYYYYYYYYYYY node bot.js");
    process.exit(1);
}


//
// Create bot
//

var Botkit = require('botkit');

var env = process.env.NODE_ENV || "development";

var configuration = {
    log: true,
    public_address: public_url,
    ciscospark_access_token: accessToken,
    secret: process.env.SECRET, // this is a RECOMMENDED security setting that checks if incoming payloads originate from Webex    webhook_name: process.env.WEBHOOK_NAME || ('built with BotKit (' + env + ')')
}

if (process.env.REDIS_URL) {

    // Initialize Redis storage
    var redisConfig = {
        // for local dev:  redis://127.0.0.1:6379
        // if on heroku :  redis://h:PASSWORD@ec2-54-86-77-126.compute-1.amazonaws.com:60109
        url: process.env.REDIS_URL

        // uncomment to add extra global key spaces to store data, example:
        //, methods: ['activities']

        // uncomment to override the Redis namespace prefix, Defaults to 'botkit:store', example:
        //, namespace: 'cisco:devnet'         
    };

    // Create Redis storage for Botkit
    try {
        var redisStorage = require('botkit-storage-redis')(redisConfig);

        configuration.storage = redisStorage;
        console.log("Redis storage successfully initialized");

        // Note that we did not ping'ed Redis yet
        // then a 'ECONNREFUSED' error will be thrown if the Redis can be ping'ed later in the initialization process
        // which is fine in a "Fail Fast" strategy
    }
    catch (err) {
        console.log("Could not initialise Redis storage, check the provided Redis URL, err: " + err.message);
    }
}

var controller = Botkit.sparkbot(configuration);

var bot = controller.spawn({
});


//
// Launch bot
//

var port = process.env.PORT || 3000;
controller.setupWebserver(port, function (err, webserver) {
    controller.createWebhookEndpoints(webserver, bot, function () {
        console.log("webhooks setup successfully");
    });

    // installing Healthcheck
    var healthcheck = {
        "up-since": new Date(Date.now()).toGMTString(),
        "hostname": require('os').hostname() + ":" + port,
        "version": "v" + require("./package.json").version,
        "bot": "unknown",   // loaded asynchronously
        "botkit": "v" + bot.botkit.version()
    };
    webserver.get(process.env.HEALTHCHECK_ROUTE, function (req, res) {

        // As the identity is load asynchronously from the access token, we need to check until it's fetched
        if (healthcheck.bot == "unknown") {
            var identity = bot.botkit.identity;
            if (bot.botkit.identity) {
                healthcheck.bot = bot.botkit.identity.emails[0];
            }
        }

        res.json(healthcheck);
    });
    console.log("healthcheck available at: " + process.env.HEALTHCHECK_ROUTE);
});


//
// Load skills
//

var normalizedPath = require("path").join(__dirname, "skills");
require("fs").readdirSync(normalizedPath).forEach(function (file) {
    try {
        require("./skills/" + file)(controller, bot);
        console.log("loaded skill: " + file);
    }
    catch (err) {
        if (err.code == "MODULE_NOT_FOUND") {
            if (file != "utils") {
                console.log("could not load skill: " + file);
            }
        }
    }
});


//
// Webex Teams Utilities
//

// Utility to add mentions if Bot is in a 'Group' space
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

// [COMPAT] Adding this function to ease interoperability with the skills part of the Botkit samples project
bot.enrichCommand = bot.appendMention;
