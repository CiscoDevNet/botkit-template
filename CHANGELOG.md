# Changes

### v0.9 (2018-12-12): botkit framework update
    - updating to Bokit v0.7

### v0.8 (2018-06-07): metadata updates
   - fix for botcommons 'platform' (formely 'plaform')
   - turning botcommons and healtcheck JSON to snake_case (formely kebab-case)

### v0.7 (2018-05-17): reflecting Webex Teams rebrand
   - introducing ACCESS_TOKEN env variable
   - backward compatibility for SPARK_TOKEN env variable
   - documentation updates (removing spark mentions)
   - added popular skills from convos@sparkbot.io

### v0.6 (2017-11-17): legacy version for Cisco Spark
   - configuration through environment variables or hard-coded values in the .env file
   - skills: organize your bot behaviours by placing 'commands', 'conversations' and 'events' in the skills directory
   - user experience: the template comes with ready-to-use skills: a 'welcome' invite, as well as 'help' and 'fallback' commands.
   - healthcheck: easily check that everything goes well by hitting the ping endpoint automatically exposed.
   - metadata: expose extra info via command and on a public address so that Spark users can inquire on Bot Author / Legal mentions / Healthcheck endpoint...
   - mentions: the appendMention utility function helps Spark users remind to mention the bot in Group spaces.
popular cloud providers: the bot self-configures when run on Glitch, and also Heroku (if dyno-metadata are installed for Heroku).
