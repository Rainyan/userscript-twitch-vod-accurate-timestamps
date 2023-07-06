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

* Register a [new Twitch app here](https://dev.twitch.tv/console/apps/create)

Note that your app name will have to be unique, and it cannot contain the word "Twitch".

You can fill the redirect URI as `http://localhost`, and set the category as "Browser Extension".

Example:

![register_twitch_extension_app](https://github.com/Rainyan/userscript-twitch-vod-accurate-timestamps/assets/6595066/dbee8816-7aaf-45ce-98b1-9845d998b6d9)

