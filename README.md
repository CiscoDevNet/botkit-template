# Botkit template

This project implements a Botkit + Webex Teams adapter bot, based on the [generator-botkit](https://www.npmjs.com/package/generator-botkit) Yoeman template, providing a few extra good-practice features, plus several interesting samples:

- A 'health check' URL: check bot availability, uptime and metadata by browsing to the bot's public URL

- Quality-of-life features: fallback/catch-all module, welcome message when user joins a space

- 'Help' command auto-generation framework

- Redis/MongoDB storage support for persistent/scalable storage of conversation state

- checkAddMention() function to automatically format bot commands for 1-1 or group space usage

## How to run (local machine)

Assuming you plan to expose your bot via [ngrok](https://ngrok.com), you can run this template in a jiffy:

1. Clone this repo:

    ```sh
    git clone https://github.com/CiscoDevNet/botkit-template.git
    ```

1. Install the Node.js dependencies:

    ```sh
    cd botkit-template
    npm install
    ```

1. Create a Webex Teams bot account at ['Webex for Developers'](https://developer.webex.com/my-apps/new/bot), and note/save your bot's access token

1. Launch ngrok to expose port 3000 of your local machine to the internet:

    ```sh
    ngrok http 3000
    ```

    Note/save the 'Forwarding' HTTPS (not HTTP) address that ngrok generates

1. Edit the `.env` file and configure the settings and info for your bot.

    >Note: you can also specify any of these settings via environment variables (which will take precedent over any settings configured in the `.env` file)...often preferred in production environments

    To successfully run, you'll need to specify at minimum a `PUBLIC_ADDRESS` (ngrok HTTPS forwarding URL), and a `ACCESS_TOKEN` (Webex Teams bot access token.)

    >If running on Glitch.me or Heroku (with [Dyno Metadata](https://devcenter.heroku.com/articles/dyno-metadata) enbaled), the `PUBLIC_URL` will be auto-configured

    Additional values in the `.env` file (like `OWNER` and `CODE`) are used to populate the healthcheck URL metadata

    Be sure to save the `.env` file!

1. You're ready to run your bot:

    ```sh
    node bot.js
    ```

## Quick start on Glitch.me

* Click [![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/import/github/CiscoDevNet/botkit-template)

* Open the `.env` file, then uncomment the `ACCESS_TOKEN` variable and paste in your bot's access token

    **Optional**: enter appropirate info in the "Bot meta info..." section

    >Note that thanks to Glitch `PROJECT_DOMAIN` env variable, you do not need to add a `PUBLIC_URL` variable pointing to your app domain

You bot is all set, responding in 1-1 and 'group' spaces, and sending a welcome message when added to a space!

You can verify the bot is up and running by browsing to its healthcheck URL (i.e. the app domain.)

## Quick start on Heroku

* Create a new project pointing to this repo.

* Open your app settings, view your config variables, and add an ACCESS_TOKEN variable with your bot's access token as value.

* Unless your app is using [Dyno Metadata](https://devcenter.heroku.com/articles/dyno-metadata), you also need to add a PUBLIC_URL variable pointing to your app domain.

![](assets/images/heroku_config-variables.png)

You bot is all set, responding in 1-1 and 'group' spaces, and sending a welcome message when added to a space!

You can verify the bot is up and running by browsing to its healthcheck URL (i.e. the app domain.)