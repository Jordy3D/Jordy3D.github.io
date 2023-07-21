// ==UserScript==
// @name         >greentext
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  >not having greentext on Discord
// @author       Bane
// @match        https://discord.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=discord.com
// @require      http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // add CSS for 4chan messages
    addGreenTextCSS();
    // call findGreenText every 200ms
    setInterval(findGreenText, 200);
})();

function addGreenTextCSS() {
    // add CSS for 4chan messages
    var style = document.createElement("style");
    style.id = "chanCSS";
    style.type = "text/css";
    style.innerHTML = `
        /*Settings*/
        :root {
            --chanRadius: 5px;
        }

        /*Main Style*/
        .chanBody
        {
            background: linear-gradient(to bottom, #ebd5ca 0px, #ebd5ca 25px, #c8b4ad 25px, #c8b4ad 26px, #f4e9e5 26px, #f4e9e5 100%) !important;

            color: #7e9348;

            max-width: 600px;
        }
        .chanBody > div
        {
            margin-top: 0.25rem !important;
            padding-right: 0 !important;
        }
        .chanBodyCozy
        {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            padding-right: 0 !important;
        }

        /*Shape Section*/
        .chanTop { border-radius: var(--chanRadius) var(--chanRadius) 0 0; }
        .chanMid { border-radius: 0; }
        .chanBot { border-radius: 0 0 var(--chanRadius) var(--chanRadius); }
        .chanSolo { border-radius: var(--chanRadius); }

        /*Message Section*/
        .chanMessage
        {
            color: #7e9348;
            font-family: arial;
            font-weight: 400;
            background: #f4e9e5;

            margin-top: 0;

            max-width: 600px;
        }
        .chanMessageContent
        {
            color: inherit;
            font-family: inherit;
            font-weight: inherit;
            background: #0000;
        }

        /*Header Section*/
        .chanHeader
        {
            display: flex !important;
            justify-content: space-between;
            padding-right: 1rem !important;
        }
        .chanUsername
        {
            color: #0c7741 !important;
            font-weight:  600;
            font-family: arial;
        }
        .chanTimestamp
        {
            color: #63140f !important;
            font-weight:  600 !important;
            font-family: arial !important;
        }
    `;
    document.head.appendChild(style);
}

function findGreenText()
{
    // get the container that holds all the messages
    var messageContainer = document.querySelector('[data-list-id="chat-messages"]')

    // if the container is null, return
    if (messageContainer == null) {
        console.log("Message container not found");
        return;
    }

    // get all the messages
    var messages = messageContainer.querySelectorAll("li");

    // for each message, check if it has greentext
    messages.forEach(function (message) {
        // if the message is already marked as .chanMessage, skip it
        if (message.classList.contains("chanMessage")) return;

        // get the container that holds the message content
        var messageContentContainer = message.querySelectorAll('[id*="message-content"]')[0]
        // get the contents of the message
        var messageContent = messageContentContainer.innerText;

        // if the message starts with >, add the chanMessage class
        if (messageContent.startsWith(">") || messageContent.startsWith("&gt;")) {
            console.log("Found greentext");
            greentextParse(message, messageContentContainer);
        }
    });
}

function greentextParse(message, messageContentContainer)
{
    // add the chanMessage class to the message
    message.classList.add("chanMessage");
    // add the chanMessageContent class to the message content
    messageContentContainer.classList.add("chanMessageContent");

    // the message starts off as "solo" and will be sorted later.
    message.classList.add("chanSolo");

    // get the username of the message
    var username = message.querySelector('[class*="username-"]')
    if (username) {
        // add the chanBody class to the message
        message.classList.add("chanBody");

        // add the chanUsername class to the username
        username.classList.add("chanUsername");

        // get the timestamp of the message
        var timestamp = message.querySelector('[class*="timestamp-"]')
        // add the chanTimestamp class to the timestamp
        timestamp.classList.add("chanTimestamp");

        // get the header object containing the timestamp and username
        var messageHeader = timestamp.parentElement;
        // add the chanHeader class to the header
        messageHeader.classList.add("chanHeader");
    }
    else {
        // remove the chanBody class from the message
        message.classList.remove("chanBody");

        var prev = message.previousElementSibling;
        var prevprev = prev.previousElementSibling;

        // if the previous message is a chanMessage
        if (prev.classList.contains("chanMessage")) {
            // the previous message is not solo, it's at least a top
            prev.classList.remove("chanSolo");
            prev.classList.add("chanTop");

            // this message is not solo, it's at least a bottom
            message.classList.remove("chanSolo");
            message.classList.add("chanBot");

            // if the previous msesage has chanBot, it's a mid
            if (prev.classList.contains("chanBot")) {
                prev.classList.remove("chanBot");
                prev.classList.add("chanMid");
            }
        }
    }
}