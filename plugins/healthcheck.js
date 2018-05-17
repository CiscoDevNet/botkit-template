//
// Copyright (c) 2017 Cisco Systems
// Licensed under the MIT License 
//

//
// Goal of the Healthcheck is to return a 200 OK payload
// It also displays extra technical information to ease troubleshooting 
//
module.exports = function (controller, bot) {

    var healthcheck = {
        "up-since": new Date(Date.now()).toGMTString(),
        "hostname": require('os').hostname() + ":" + controller.config.port,
        "version": "v" + require("../package.json").version,
        "bot": "unknown",   // loaded asynchronously
        "botkit": "v" + bot.botkit.version()
    };

    // installing Healthcheck
    var route = process.env.HEALTHCHECK_ROUTE || "/";
    controller.webserver.get(route, function (req, res) {

        // As the identity is load asynchronously from the access token, we need to check until it's fetched
        if (healthcheck.bot == "unknown") {
            var identity = bot.botkit.identity;
            if (bot.botkit.identity) {
                healthcheck.bot = bot.botkit.identity.emails[0];
            }
        }

        res.json(healthcheck);
    });

    console.log("healthcheck available at: " + route);
}    
