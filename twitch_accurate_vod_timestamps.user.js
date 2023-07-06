// ==UserScript==
// @name            Twitch Accurate VOD Timestamps
// @description     Replace the fuzzy dates with accurate timestamps for Twitch VOD videos.
// @icon            https://www.google.com/s2/favicons?sz=64&domain=twitch.tv
// @namespace       TwitchAccurateVodTimestamps
// @version         0.2.0
// @author          https://github.com/Rainyan
// @match           https://www.twitch.tv/videos/*
// @updateURL       https://cdn.jsdelivr.net/gh/Rainyan/userscript-twitch-vod-accurate-timestamps@main/twitch_accurate_vod_timestamps.user.js
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_registerMenuCommand
// @noframes
// ==/UserScript==

"use strict";

const PREFIX = "VodDateScript-";

// Gets user's stored app fieldName data value, or prompts for it if empty.
function getUserAppData(fieldName) {
  const fieldNameInternal = `${PREFIX}{fieldName}`;

  // DEBUG
  if (false) {
    GM_setValue(fieldNameInternal, null);
  }

  var data = GM_getValue(fieldNameInternal, null);
  if (data === null) {
    data = prompt(`Your Twitch API app's registered ${fieldName}: `);
    GM_setValue(fieldNameInternal, data);
  }
  return data;
}

function getClientId() {
  return getUserAppData("clientId");
}

function getClientSecret() {
  return getUserAppData("clientSecret");
}

// Returns the video ID integer, or NaN if not found
function getVideoId() {
  return parseInt(
    document.URL.split("https://www.twitch.tv/videos/").pop().split("?")[0],
  );
}

// Returns the timestamp element, or undefined if not found
function getTimeStampElement() {
  const elems = document.getElementsByClassName("timestamp-metadata__bar");
  if (elems[0] === undefined) {
    return undefined;
  }
  const targetElem = Array.from(elems[0].parentElement.children).filter(
    (a) => a.nodeName == "P",
  )[0];
  return targetElem;
}

// Returns the timestamp element, or null on failure
function findTimeStampElement() {
  return new Promise((resolve) => {
    var elem = getTimeStampElement();
    if (elem !== undefined) {
      return resolve(elem);
    }

    const observer = new MutationObserver((mutations) => {
      elem = getTimeStampElement();
      if (elem !== undefined) {
        resolve(elem);
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

// For a bearer token, returns in how many seconds it will invalidate,
// or 0 if it is invalid or if there was an error.
async function validateBearerToken(auth) {
  console.assert(auth !== null);
  console.assert(auth.token_type === "bearer");

  const apiUrl = "'https://id.twitch.tv/oauth2/validate";

  const response = await fetch(apiUrl, {
    method: "get",
    headers: {
      Authorization: `Bearer ${auth.access_token}`,
    },
  });

  if (response.status !== 200) {
    return 0;
  }

  const data = await response.json();

  const expires_in_secs = parseInt(data.expires_in);

  return expires_in_secs !== NaN ? expires_in_secs : 0;
}

const foo = (() => {
  let counter = 0;
  return () => {
    counter += 1;
    console.log(counter);
  };
})();

function getEpoch() {
  return parseInt(new Date() / 1000);
}

async function refreshBearerToken(auth) {
  const apiUrl = "https://id.twitch.tv/oauth2/token";

  const response = await fetch(apiUrl, {
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=refresh_token&refresh_token=${auth.refresh_token}
&client_id=${getClientId()}&client_secret=${getClientSecret()}`,
  });

  if (response.status !== 200) {
    console.error("API call failed: " + response.status);
    return null;
  }

  const refreshData = await response.json();

  auth.access_token = refreshData.access_token;
  auth.refresh_token = refreshData.refresh_token;
  return auth;
}

// Returns an API bearer token, or null on failure.
// Has the side effects of refreshing/creating/caching the token as necessary.
async function getBearerToken() {
  const fieldName = `${PREFIX}auth`;

  var auth = GM_getValue(fieldName, null);

  if (auth !== null) {
    console.assert(auth.token_type === "bearer");

    // As per Twitch docs, apps are required to check token validity at least
	// once per hour.
    const twitchApiRequiredRevalidateInterval = 60 * 60;
    // If we have less than a minute of validity left, refresh our token
    const minimumSafeUseTime = 60;
    console.assert(minimumSafeUseTime <= twitchApiRequiredRevalidateInterval);

    const deltaLastValidated = getEpoch() - auth.lastValidatedEpoch;
    console.assert(deltaLastValidated >= 0);

    const isSafeToUseExistingToken =
      deltaLastValidated < twitchApiRequiredRevalidateInterval &&
      auth.expires_in - deltaLastValidated > minimumSafeUseTime;

    // If it's safe to use the existing token, do it
    if (isSafeToUseExistingToken) {
      auth.lastValidatedEpoch = getEpoch();
      GM_setValue(fieldName, auth);
      return auth.access_token;
    }

    // Else, check if it's still valid
    const expirySecs = await validateBearerToken(auth);
    if (expirySecs > minimumSafeUseTime) {
      auth.lastValidatedEpoch = getEpoch();
      GM_setValue(fieldName, auth);
      return auth.access_token;
    }

    // We have an existing token but it's no longer valid. Try to refresh
    auth = await refreshBearerToken(auth);
    if (auth === null) {
      console.error("Failed to refresh bearer token");
      return null;
    }

    auth.lastValidatedEpoch = getEpoch();
    GM_setValue(fieldName, auth);
    return auth.access_token;
  }

  // Else, either we don't have a token at all yet; get a new one
  const apiUrl = "https://id.twitch.tv/oauth2/token";

  const response = await fetch(apiUrl, {
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `client_id=${getClientId()}&client_secret=${getClientSecret()}&
grant_type=client_credentials`,
  });

  if (response.status !== 200) {
    console.error("API call failed: " + response.status);
    return null;
  }

  auth = await response.json();
  console.assert(auth.token_type === "bearer");
  console.assert(auth.expires_in > 0);

  auth.lastValidatedEpoch = getEpoch();
  GM_setValue(fieldName, auth);
  return auth.access_token;
}

async function replaceFuzzyTimestamp() {
  const vodId = getVideoId();
  if (vodId === NaN) {
    console.error("VOD ID not found");
    return;
  }

  const timestampElement = await findTimeStampElement();

  const vodDate = await getAccurateTimestamp(vodId);
  if (vodDate === null) {
    console.error("Failed to get accurate VOD timestamp");
    return;
  }

  const accurateDateString = vodDate.toLocaleString();
  timestampElement.textContent += ` (${accurateDateString})`;
  //console.log(`Accurate VOD timestamp: ${accurateDateString}`);
}

// Returns accurate VOD date, or null on failure
async function getAccurateTimestamp(vodId) {
  const bearerToken = await getBearerToken();
  if (bearerToken === null) {
    console.error("Failed to get bearer token");
    return null;
  }

  const apiUrl = `https://api.twitch.tv/helix/videos?id=${vodId}`;

  const response = await fetch(apiUrl, {
    method: "get",
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      "Client-Id": `${getClientId()}`,
    },
  });

  if (response.status === 401 || response.status === 403) {
	GM_setValue(`${PREFIX}auth`, null);
	GM_setValue(`${PREFIX}clientId`, null);
	GM_setValue(`${PREFIX}clientSecret`, null);
	return null;
  }
  else if (response.status !== 200) {
    console.error("API call failed: " + response.status);
    return null;
  }

  const data = await response.json();

  if (data["data"] === null) {
    return null;
  }

  return new Date(data["data"][0]["created_at"]);
}

replaceFuzzyTimestamp();
