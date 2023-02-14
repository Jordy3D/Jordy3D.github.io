// ==UserScript==
// @name         >greentext
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  >not having greentext on Discord
// @author       Bane
// @match        https://discord.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=discord.com
// @require      http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @grant        GM_addStyle
// ==/UserScript==

// Add CSS for 4chan messages
GM_addStyle (`
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
` );

function LoopForever() {
    // Get the container that holds all chat messages
    var messageContainer = document.querySelector('[data-list-id="chat-messages"]')

    // If message container wasn't found, just skip this loop
    if(!messageContainer) return;

    // Get the messages in that container
    var messages = messageContainer.querySelectorAll("li");

    // Loop through every message in chat
    for (const message of messages) {
        // If the message is already processed and confirmed, ignore it
        if($(message).hasClass("chanMessage")) return;
        
        // Grab some elements of the message
        var messageContentContainer = message.querySelectorAll('[id*="message-content"]')
        var messageContent = messageContentContainer[messageContentContainer.length- 1]
        var cozyMessage = message.children[0]

        var replyCheckChild = cozyMessage.children[0]
        var replyCheckChildId = $(replyCheckChild).attr('id')

        // If the message being checked is a reply, ignore it
        if (replyCheckChildId && replyCheckChildId.includes("reply"))
        {
            cozyMessage = message.children[1]
            return;
        }

        // If the message starts with > (greater-than)...
        var messageText = messageContent.innerHTML;

        if(messageText.startsWith("&gt;"))
        {
            //...the message is a 4chan message
            $(message).addClass("chanMessage");
            $(messageContent).addClass("chanMessageContent");

            // The message starts off as "solo" and will be sorted later.
            $(message).addClass("chanSolo")

            var username = message.querySelector('[class*="username-"]')
            if(username)
            {
                $(message).addClass("chanBody")

                // The username is a username
                $(username).addClass("chanUsername")

                // Get the timestamp for styling
                var timestamp = message.querySelector('[class*="timestamp-"]')
                $(timestamp).addClass("chanTimestamp");

                // Get the header object containing the timestamp and username
                var messageHeader = timestamp.parentElement;
                $(messageHeader).addClass("chanHeader");
            }
            else
            {
                $(message).removeClass("chanBody")
                // changes the borders on previous messages to try and make the whole block look natural
                var prev = message.previousElementSibling;
                var prevprev = prev.previousElementSibling;

                // If the previous message is a 4chan message
                if($(prev).hasClass("chanMessage"))
                {
                    // The previous message is no longer solo, it's a top at least.
                    $(prev).removeClass("chanSolo");
                    $(prev).addClass("chanTop");

                    // This message is no longer solo, it's at least a bottom
                    $(message).removeClass("chanSolo");
                    $(message).addClass("chanBot");

                    // The previous message is no longer solo, it's a mid
                    if($(prev).hasClass("chanBot"))
                    {
                        $(prev).removeClass("chanBot");
                        $(prev).addClass("chanMid");
                    }
                }

                // Fix a little of the padding to look nicer
                $(cozyMessage).addClass("chanBodyCozy")
            }
        }
    }
}

var interval = self.setInterval(function(){LoopForever()},200);