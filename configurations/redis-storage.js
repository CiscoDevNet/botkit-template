//
// Copyright (c) 2017 Cisco Systems
// Licensed under the MIT License 
//

/**
 * Adds a persistent storage to Redis to Botkit configuration
 *
 * Setup instructions:
 *    - add a REDIS_URL env variable pointing to the redis instance
 *    - add a project dependency to the 'botkit-storage-redis' module, aka "npm install botkit-storage-redis"
 *     - [optional] customize the configuration below
 */
module.exports = function (configuration) {

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
}
