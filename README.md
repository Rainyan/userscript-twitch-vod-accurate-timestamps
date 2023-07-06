# userscript-twitch-vod-accurate-timestamps
Replace the fuzzy Twitch VOD dates with accurate timestamps.

## Example

![example](https://github.com/Rainyan/userscript-twitch-vod-accurate-timestamps/assets/6595066/59835c57-7119-425f-a922-c1cc667f07e3)

## Installation

### Userscript installation

First, you'll need a [userscript manager](https://en.wikipedia.org/wiki/Userscript_manager) for your browser. If you don't have a preference, I'd suggest [Violentmonkey](https://violentmonkey.github.io/).

Click here for a [direct download link to the userscript](https://github.com/Rainyan/userscript-twitch-vod-accurate-timestamps/raw/main/twitch_accurate_vod_timestamps.user.js), which should initiate the installation for most managers. If not, copy-paste the code contents to your userscript manager as appropriate.

Tested with Violentmonkey/Firefox, but it should probably work with other userscript managers/browsers as well.

### Twitch API config

1) **Register a [new Twitch app here](https://dev.twitch.tv/console/apps/create)**

Note that your app name will have to be unique, and it cannot contain the word "Twitch".

You can fill the redirect URI as `http://localhost`, and set the category as "Browser Extension".

Example:

![register_twitch_extension_app](https://github.com/Rainyan/userscript-twitch-vod-accurate-timestamps/assets/6595066/dbee8816-7aaf-45ce-98b1-9845d998b6d9)


2) In your [Twitch developer apps Console](https://dev.twitch.tv/console/apps), **click "Manage"** for your newly created app:

![twitch_app_manage](https://github.com/Rainyan/userscript-twitch-vod-accurate-timestamps/assets/6595066/8bc44a93-8cfa-42d0-8351-d921a034aae7)


3) In the app page, **press "New Secret"**. Now you'll have the app Client ID, and the app Client Secret (do not expose the secret value to others). You need to paste these two values to the extension the first time you use it.

![twitch_app_id_and_secret](https://github.com/Rainyan/userscript-twitch-vod-accurate-timestamps/assets/6595066/280ac88d-8045-4807-8be8-d596cf2f29b4)

4) Go to a Twitch VOD page (any URL that starts with `https://twitch.tv/videos/`). You should see two popup prompts, asking you to fill in the Client ID and Client Secret for the app you just created. Copy-paste these values in the two popups.

Prompt for the Client ID:

![popup_clientid](https://github.com/Rainyan/userscript-twitch-vod-accurate-timestamps/assets/6595066/df0629c7-1f56-43a2-b239-51e61ed1446f)

Prompt for the Client Secret:

![popup_clientsecret](https://github.com/Rainyan/userscript-twitch-vod-accurate-timestamps/assets/6595066/9da7892a-4311-4be5-8107-b93606f4c0fa)

And that's it! The fuzzy timestamps should now hopefully get appended with the accurate information.

## Troubleshooting
* Timestamps aren't being replaced
  * Please see the developer console for any related error messages, and/or file a new bug issue for the problem

* How to reset the App Client ID or secret?
  * Temporarily flip the boolean flag at:
    https://github.com/Rainyan/userscript-twitch-vod-accurate-timestamps/blob/c2d78839b94b4ed9abe91ec99757eefc0e0e1276/twitch_accurate_vod_timestamps.user.js#L20-L23
    to `(true)` instead of `(false)`, and reload the userscript & website. Remember to undo the change after resetting the values.
