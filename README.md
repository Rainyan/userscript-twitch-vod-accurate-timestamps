# userscript-twitch-vod-accurate-timestamps
Replace the fuzzy Twitch VOD dates with accurate timestamps.

## Example

![example](https://github.com/Rainyan/userscript-twitch-vod-accurate-timestamps/assets/6595066/47f83819-eb07-4514-8a69-0ea4fd53e1c3)


## Installation

### Userscript installation

First, you'll need a [userscript manager](https://en.wikipedia.org/wiki/Userscript_manager) for your browser. If you don't have a preference, I'd suggest [Violentmonkey](https://violentmonkey.github.io/).

Click here for a [direct download link to the userscript](https://github.com/Rainyan/userscript-twitch-vod-accurate-timestamps/raw/main/twitch_accurate_vod_timestamps.user.js), which should initiate the installation for most managers. If not, copy-paste the code contents to your userscript manager as appropriate.

Tested with Violentmonkey/Firefox, but it should probably work with other userscript managers/browsers as well.

### Twitch API config

1) **Register a [new Twitch app here](https://dev.twitch.tv/console/apps/create)**

Note that your app name will have to be unique, and it cannot contain the word "Twitch".

You can fill the redirect URI as `http://localhost`, and set the category as "Browser Extension".

![register_twitch_extension_app](https://github.com/Rainyan/userscript-twitch-vod-accurate-timestamps/assets/6595066/080b1dd0-726e-47de-a7ef-cf8ff3ece86b)

2) In your [Twitch developer apps Console](https://dev.twitch.tv/console/apps), **click "Manage"** for your newly created app:

![twitch_app_manage](https://github.com/Rainyan/userscript-twitch-vod-accurate-timestamps/assets/6595066/888a34f4-07a2-4f7b-8110-a0ec5188133a)

3) In the app page, **press "New Secret"**. Now you'll have the app Client ID, and the app Client Secret (do not expose the secret value to others). You need to paste these two values to the extension the first time you use it.

![twitch_app_id_and_secret](https://github.com/Rainyan/userscript-twitch-vod-accurate-timestamps/assets/6595066/566a6ae2-8852-4723-9df4-f7fcf99f866d)

4) Go to a Twitch VOD page (any URL that starts with `https://twitch.tv/videos/`). You should see two popup prompts, asking you to fill in the Client ID and Client Secret for the app you just created. Copy-paste these values in the two popups.

Prompt for the Client ID:

![popup_clientid](https://github.com/Rainyan/userscript-twitch-vod-accurate-timestamps/assets/6595066/c8cfe1de-215c-4bf5-9e7a-4c0364f559eb)

Prompt for the Client Secret:

![popup_clientsecret](https://github.com/Rainyan/userscript-twitch-vod-accurate-timestamps/assets/6595066/65363b02-a727-4885-b1e8-eac52a65e760)

And that's it! The fuzzy timestamps should now hopefully get appended with the accurate information.

## Troubleshooting
* Timestamps aren't being replaced
  * Please see the developer console for any related error messages, and/or file a new bug issue for the problem
  * Make sure your Twitch App/API key is still valid
  * Make sure you aren't hitting any [Twitch API rate limits](https://dev.twitch.tv/docs/api/guide/#twitch-rate-limits) with the app key you are using for the extension

* How to reset the app Client ID or Client Secret values stored by the userscript?
  * Temporarily flip the boolean flag near the top of the userscript file:
    https://github.com/Rainyan/userscript-twitch-vod-accurate-timestamps/blob/c2d78839b94b4ed9abe91ec99757eefc0e0e1276/twitch_accurate_vod_timestamps.user.js#L20-L23
    to `(true)` instead of `(false)`, and reload the userscript & website. Remember to undo the change after resetting the values.
