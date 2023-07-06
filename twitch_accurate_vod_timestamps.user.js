// ==UserScript==
// @name            Twitch Accurate VOD Timestamps
// @description     Replace the fuzzy dates with accurate timestamps for Twitch VOD videos.
// @icon            https://www.google.com/s2/favicons?sz=64&domain=twitch.tv
// @namespace       TwitchAccurateVodTimestamps
// @version         0.1.0
// @author          https://github.com/Rainyan
// @match           https://www.twitch.tv/videos/*
// @updateURL       https://cdn.jsdelivr.net/gh/Rainyan/userscript-twitch-vod-accurate-timestamps@main/twitch_accurate_vod_timestamps.user.js
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_registerMenuCommand
// @noframes
// ==/UserScript==

"use strict";

// Set temporarily to true if you need to reset your Twitch API App token(s).
const RESET_GM_DATA = false;

// Gets user's stored app fieldName data value, or prompts for it if empty.
function getUserAppData(fieldName) {
  if (RESET_GM_DATA) {
    GM_setValue(fieldName, "");
  }

  var data = GM_getValue(fieldName, "");
  if (data === "") {
    data = prompt(`Your Twitch API app's registered ${fieldName}: `);
    GM_setValue(fieldName, data);
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

// Returns an API bearer token, or null on failure
async function getBearerToken() {
  const apiUrl = "https://id.twitch.tv/oauth2/token";

  const response = await fetch(apiUrl, {
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `client_id=${getClientId()}&client_secret=${getClientSecret()}&grant_type=client_credentials`,
  });

  if (response.status !== 200) {
    console.error("API call failed: " + response.status);
    return null;
  }

  const data = await response.json();

  return data.access_token;
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

  if (response.status !== 200) {
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
