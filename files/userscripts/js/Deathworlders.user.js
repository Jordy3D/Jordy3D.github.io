// ==UserScript==
// @name         Deathworlders Tweaks
// @namespace    http://tampermonkey.net/
// @version      0.6.1
// @description  Modifications to the Deathworlders web novel
// @author       Bane
// @match        https://deathworlders.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=deathworlders.com
// @grant        none
// ==/UserScript==

// ===== Changelog =====
// 0.1 - Initial version 
//          - adds cover image to the top of the article
// 0.2 - Added code to support conversation styling
// 0.3 - Added extra CSS to the script rather than loading it separately
// 0.4 - Added a settings menu to enable/disable features
//          - saves settings to localstorage
//          - added a konami code to reset settings
// 0.5 - Added a fix for the conversation styling failing on certain instances
//     - Added a way for new settings to be added without overwriting old settings (hopefully)
//     - Added a setting for adding a cover image
//     - Organized settings into categories
//     - Fixed a bug where non-paragrapgh elements were being justified
// 0.6 - Added a setting for fancy chat log
//     - Rewrote the settings code to be more efficient


var conversationSet = false;
var conversationScan = 3;
var chatLogSet = false;

// ===== Settings =====

var defaultSettings = [];
defaultSettings.push({ name: 'replaceSectionEndHeaders', value: true, fancyText: 'Replace Section End Headers', tag: 'Fix' });
defaultSettings.push({ name: 'fixBrokenHRTags', value: true, fancyText: 'Fix Broken HR Tags', tag: 'Fix' });
defaultSettings.push({ name: 'darkScrollbars', value: true, fancyText: 'Dark Scrollbars', tag: 'Style' });
defaultSettings.push({ name: 'fixCodeBlocks', value: true, fancyText: 'Fix Code Blocks', tag: 'Fix' });
defaultSettings.push({ name: 'fixBlockquotes', value: true, fancyText: 'Fix Blockquotes', tag: 'Fix' });
defaultSettings.push({ name: 'fancySMS', value: true, fancyText: 'Fancy SMS', tag: 'Style' });
defaultSettings.push({ name: 'fancySMSBubbles', value: true, fancyText: 'Fancy SMS Bubbles', tag: 'Style' });
defaultSettings.push({ name: 'justifyParagraphs', value: true, fancyText: 'Justify Paragraphs', tag: 'Style' });
defaultSettings.push({ name: 'addCover', value: true, fancyText: 'Add Cover', tag: 'Function' });
defaultSettings.push({ name: 'fancyChatLog', value: true, fancyText: 'Fancy Chat Log', tag: 'Style' });
defaultSettings.push({ name: 'fancyChatLogKeep++', value: true, fancyText: 'Fancy Chat Log Keep ++', tag: 'Style' });

var settings = [];

function checkNewSettings() {
    settings = defaultSettings;

    // check if settings exist in localstorage
    if (localStorage.getItem('bane-deathworlders-settings') != null) {
        // load settings from localstorage
        var loadedSettings = JSON.parse(localStorage.getItem('bane-deathworlders-settings'));

        // loop through loaded settings and update the default settings
        for (var setting in loadedSettings) {
            for (var defaultSetting in defaultSettings) {
                if (defaultSettings[defaultSetting].name == loadedSettings[setting].name) {
                    defaultSettings[defaultSetting].value = loadedSettings[setting].value;
                }
            }
        }
    } else {
        // save default settings to localstorage
        localStorage.setItem('bane-deathworlders-settings', JSON.stringify(defaultSettings));
    }
}

// konami code
var konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
var konamiCodePosition = 0;
document.addEventListener('keydown', function (e) {
    if (e.keyCode === konamiCode[konamiCodePosition++]) {
        if (konamiCodePosition === konamiCode.length) {
            konamiCodePosition = 0;
            // delete settings
            localStorage.removeItem('bane-deathworlders-settings');
            // reload page
            window.location.reload();
        }
    } else {
        konamiCodePosition = 0;
    }
});


// ===== End Settings =====

initialize();

spawnSettings();

setInterval(function () {
    addCover();
    setConversationElement();
    setChatLogElement();
}, 1000);


function initialize() {
    // print Deathworlders Tweaks in large letters
    var textCSSMain = 'font-size: 30px; font-weight: bold; text-shadow: -3px 0px 0px rgba(255, 0, 0, 1),3px 0px 0px rgba(8, 0, 255, 1);';
    var textCSSSub = 'font-size: 15px; font-weight: bold;';
    console.log(`%cDeathworlders Tweaks%c${GM_info.script.version}\nby Bane`, textCSSMain, textCSSSub);

    checkNewSettings();
}


function spawnSettings() {
    var settingsDiv = document.createElement('div');
    settingsDiv.classList.add('bane-settings');
    settingsDiv.innerHTML = `
        <h1>Deathworlders Tweaks</h1>
        <h4>by Bane</h4>
        <hr>
    `;

    // get a list of all unique tags
    var tags = [];
    for (var setting in settings) {
        if (!tags.includes(settings[setting].tag))
            tags.push(settings[setting].tag);
    }

    // loop through settings and add them to the div
    for (var tag in tags) {
        var tagHeader = document.createElement('h3');
        tagHeader.classList.add('bane-setting-tag');
        tagHeader.innerHTML = tags[tag];
        settingsDiv.appendChild(tagHeader);

        var hr = document.createElement('hr');
        settingsDiv.appendChild(hr);

        for (var setting in settings) {
            if (settings[setting].tag != tags[tag])
                continue;

            var settingDiv = document.createElement('div');
            settingDiv.classList.add('bane-setting');
            settingDiv.innerHTML = `
                <label for="bane-setting-${setting}">${settings[setting].fancyText}</label>
                <input type="checkbox" id="bane-setting-${setting}" ${settings[setting].value ? 'checked' : ''}>
                <label for="bane-setting-${setting}">switch</label>
            `;

            settingDiv.querySelector(`#bane-setting-${setting}`).addEventListener('change', updateSettings);

            settingsDiv.appendChild(settingDiv);
        }
    }
    document.body.appendChild(settingsDiv);

    // add style
    var style = document.createElement('style');
    style.id = 'bane-settings-style';
    style.innerHTML = `
        .bane-settings
        {
            background: #222222;
            
            border: 4px solid #CECECE;
            border-top: none;
            border-left: none;
            border-radius: 0 0 1em 0;
            
            padding: 20px;
            box-sizing: border-box;
            
            position: fixed;
            left: 0;
            top: 0;
            transform: translatex(calc(20px - 100%));
            
            opacity: 0.1;
            
            transition: all 100ms ease-in-out;
        }

        .bane-settings h1, 
        .bane-settings h4,
        .bane-setting-tag
        {
            margin: 0;
        }
        .bane-settings h4
        {
            font-size: 12px;
            text-align: right;
        }

        .bane-settings:hover
        {
            opacity: 1;  
            transform: translatex(0);
            transition: all 300ms ease-in-out;
        }

        .bane-setting
        {
            display: flex;
            gap: 5px;
            justify-content: flex-end;
            margin-bottom: 5px;
        }

        .bane-setting-tag
        {
            margin-top: 1em;
            text-align: center;
        }

        /* Modifed based on https://codepen.io/mburnette/pen/LxNxNg */
        input[type=checkbox]{
            height: 0;
            width: 0;
            visibility: hidden;
        }

        label:last-child {
            cursor: pointer;
            text-indent: -9999px;
            width: 40px;
            height: 20px;
            background: grey;
            display: block;
            border-radius: 100px;
            position: relative;
        }

        label:last-child:after {
            content: '';
            position: absolute;
            top: 3px;
            left: 5px;
            width: 14px;
            height: 14px;
            background: #fff;
            border-radius: 90px;
            transition: 0.3s;
        }

        input:checked + label:last-child { background: #D09242; }

        input:checked + label:last-child:after {
            left: calc(100% - 5px);
            transform: translateX(-100%);
        }

        label:last-child:active:after { width: 15px; }
    `;

    document.head.appendChild(style);

    loadCSS();
}

function updateSettings() {
    for (var setting in settings) {
        var checkbox = document.querySelector(`#bane-setting-${setting}`);
        settings[setting].value = checkbox.checked;
    }

    // save settings
    localStorage.setItem('bane-deathworlders-settings', JSON.stringify(settings));

    loadCSS();
}

function addCover() {

    if (settings.find(x => x.name == 'addCover').value == false) {
        // find .bane-cover and remove it if it exists
        var cover = document.querySelector('.bane-cover');
        if (cover)
            cover.remove();

        return;
    }
    else {
        var cover = document.querySelector('.bane-cover');
        if (cover) return;

        // look for .story-specific-images
        var storySpecificImages = document.querySelector('.story-specific-images');
        if (!storySpecificImages) return;

        // look for .download-epub-cover-img.wider and copy it, placing it after the article's h1
        var cover = document.querySelector('.download-epub-cover-img.wider');
        if (!cover) return;

        // get the article
        var article = document.querySelector('article');
        article.classList.add('bane-article');

        // clone the cover and insert it after the h1
        var coverCopy = cover.cloneNode(true);
        // add onerror="this.style.display='none'" to coverCopy
        coverCopy.setAttribute('onerror', "this.style.display='none'");

        var h1 = article.querySelector('h1');
        h1.parentNode.insertBefore(coverCopy, h1.nextSibling);

        // add a class to the cover so we can style it
        coverCopy.classList.add('bane-cover');
    }

    // add style
    if (document.querySelector('#bane-cover-style')) return;

    var style = document.createElement('style');
    style.id = 'bane-cover-style';
    style.innerHTML = `
        .bane-cover {
            height: auto;
            width: 500px;
            margin: 0 auto;
            box-shadow: none;
            border-radius: 0.5em;
        }
        .bane-article {
            display: flex;
            flex-direction: column;
            align-content: center;
            width: 100%;
        }
    `;
    document.head.appendChild(style);
}

function setConversationElement() {
    if (conversationSet) return;

    // find all .p tags that only contain em tags and/or br tags, and not their own text, and are not just <p></p>
    var pTags = document.querySelectorAll('p');
    for (var i = 0; i < pTags.length; i++) {
        var pTag = pTags[i];
        var emTags = pTag.querySelectorAll('em');
        // if (emTags.length == 0) continue;

        var brTags = pTag.querySelectorAll('br');

        // pTag.classList.add(`em-${emTags.length}`);
        // pTag.classList.add(`br-${brTags.length * 2}`)
        // pTag.classList.add(`p-${pTag.childNodes.length}`);

        if (emTags.length + (brTags.length * 2) == pTag.childNodes.length || (emTags.length == 0 && brTags.length > 0)) {

            // if pTag doesn't contain strong
            if (pTag.querySelectorAll('strong').length == 0)
                pTag.classList.add('consider');
        }
    }

    // find all divs with the style attribute text-align: right and add the class conversation
    var divs = document.querySelectorAll('div[style="text-align: right"]');
    for (var i = 0; i < divs.length; i++) {
        var div = divs[i];
        div.classList.add('conversation');
        div.classList.add('right');
    }

    // search through every child of the main>article and remove every .conversation that isn't within 3 of another .conversation
    var article = document.querySelector('main>article');
    var children = [];
    // set children to all immediate children of article
    for (var i = 0; i < article.childNodes.length; i++) {
        var child = article.childNodes[i];
        if (child.nodeType == 1)
            children.push(child);
    }

    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child.classList && child.classList.contains('consider')) {
            // for the 3 siblings before and after, if there are no .conversation siblings, remove the class
            for (var j = -conversationScan; j < conversationScan; j++) {
                let ref = i + j;

                if (ref < 0) continue; // skip if we're going to go out of bounds
                if (ref >= children.length) continue; // skip if we're going to go out of bounds

                if (j == 0) continue;

                let sibling = children[ref];

                if (sibling && sibling.classList && sibling.classList.contains('conversation')) {
                    child.classList.add('conversation');
                    child.classList.add('left');
                    break;
                }
            }
        }
    }

    // go through every .conversation.right and merge it with the previous .conversation.right if it starts with a lowercase letter
    var conversations = document.querySelectorAll('.conversation.right');
    for (var i = 0; i < conversations.length; i++) {
        var conversation = conversations[i];
        var previous = conversations[i - 1];

        if (previous) {
            var previousText = previous.innerText;
            var conversationText = conversation.innerText;

            if (conversationText[0] == conversationText[0].toLowerCase()) {
                previous.innerText = previousText + ' ' + conversationText;
                conversation.remove();
            }
        }
    }


    // find every <br> that is immediately after a .conversation and remove it
    var brs = document.querySelectorAll('.conversation+br');
    for (var i = 0; i < brs.length; i++) {
        var br = brs[i];
        br.remove();
    }

    // find every <p></p> and remove it
    var ps = document.querySelectorAll('p');
    for (var i = 0; i < ps.length; i++) {
        var p = ps[i];
        if (p.innerHTML == '') p.remove();
    }

    // remove all .consider
    var considers = document.querySelectorAll('.consider');
    for (var i = 0; i < considers.length; i++) {
        var consider = considers[i];
        consider.classList.remove('consider');
    }

    conversationSet = true;
}

function setChatLogElement() {
    if (chatLogSet) return;

    // find all p tags that contain a strong tag, and add the class chat-log if the first child starts with ++
    var pTags = document.querySelectorAll('p');
    for (var i = 0; i < pTags.length; i++) {
        var pTag = pTags[i];
        var strongTags = pTag.querySelectorAll('strong');
        if (strongTags.length == 0) continue;

        // get the first child
        var firstChild = pTag.childNodes[0];
        // if the first child is a strong and the text starts with ++, add the class chat-log
        if (firstChild.tagName == 'STRONG' && firstChild.innerText.startsWith('++')) {
            pTag.classList.add('chat-log');
        }
    }

    // in all the chat-log p tags, remove the ++ and : from the first child, and add the class chat-log-name
    var chatLogs = document.querySelectorAll('.chat-log');
    for (var i = 0; i < chatLogs.length; i++) {
        var chatLog = chatLogs[i];
        var firstChild = chatLog.childNodes[0];

        var name = firstChild.innerText;
        name = name.replace('++', '');
        name = name.replace('++:', '');

        firstChild.innerText = name;
        firstChild.classList.add('chat-log-name');
    }

    // in all chat-log p tags, place everything that isn't the first child into a new span
    var chatLogs = document.querySelectorAll('.chat-log');
    for (var i = 0; i < chatLogs.length; i++) {
        var chatLog = chatLogs[i];
        var firstChild = chatLog.childNodes[0];

        var span = document.createElement('span');
        span.classList.add('chat-log-text');

        while (chatLog.childNodes.length > 1) {
            var child = chatLog.childNodes[1];
            span.appendChild(child);
        }

        chatLog.appendChild(span);
    }

    // find all p tags that contain a strong tag that starts with SYSTEM or ERROR and add the class chat-log-system
    var pTags = document.querySelectorAll('p');
    for (var i = 0; i < pTags.length; i++) {
        var pTag = pTags[i];
        var strongTags = pTag.querySelectorAll('strong');
        if (strongTags.length == 0) continue;

        // get the first child
        var firstChild = pTag.childNodes[0];
        // if the first child is a strong that starts with SYSTEM or ERROR, add the class chat-log-system
        if (firstChild.tagName == 'STRONG' && (firstChild.innerText.startsWith('SYSTEM') || firstChild.innerText.startsWith('ERROR')))
            pTag.classList.add('chat-log-system');

        for (var j = 0; j < strongTags.length; j++) {
            var strongTag = strongTags[j];
            if (strongTag.innerText.startsWith('SYSTEM') || strongTag.innerText.startsWith('ERROR')) {
                pTag.classList.add('chat-log-system');

                // replace SYSTEM:: with SYSTEM:
                strongTag.innerText = strongTag.innerText.replace('::', ':');

                // replace ERROR - with ERROR:
                strongTag.innerText = strongTag.innerText.replace(' - ', ': ');
            }
        }
    }

    // find every p tag that is only an all-caps strong tag and add the class chat-log-system
    var pTags = document.querySelectorAll('p');
    for (var i = 0; i < pTags.length; i++) {
        var pTag = pTags[i];
        var strongTags = pTag.querySelectorAll('strong');
        if (strongTags.length == 0) continue;

        // if the pTag is all caps, add the class chat-log-system
        if (pTag.innerText == pTag.innerText.toUpperCase())
            pTag.classList.add('chat-log-system');
    }

    chatLogSet = true;
}

function loadCSS() {
    // if the style element already exists, remove it
    var style = document.getElementById('BaneDW');
    if (style) style.remove();

    var style = document.createElement('style');
    style.id = 'BaneDW';

    // for settings that are true, add the CSS using a switch statement
    for (i = 0; i < settings.length; i++) {
        var setting = settings[i];
        if (setting.value) {
            switch (setting.name) {
                case 'replaceSectionEndHeaders':
                    style.innerHTML += `
                        body.inverted article h2
                            {
                            color: #fff !important;
                            font-family: "Roboto Slab", serif !important;
                            font-size: 1.2rem;
                            
                            border-bottom: 1px solid white;
                            padding-bottom: 3rem;
                            }
                    `;
                    break;
                case 'fixBrokenHRTags':
                    style.innerHTML += `
                        article hr
                        {
                            width: 100%;
                            padding-bottom: 3rem;
                            border: none;
                            border-bottom: 1px solid white;
                        }
                    `;
                    break;
                case 'darkScrollbars':
                    style.innerHTML += `
                        ::-webkit-scrollbar { width: 10px; }
                        ::-webkit-scrollbar-track { background: #fff0; }
                        ::-webkit-scrollbar-thumb { background: #d09242; }
                        ::-webkit-scrollbar-thumb:hover { background: #dda45b; }
                        ::-webkit-scrollbar-corner { background: #0000; }
                    `;
                    break;
                case 'fixCodeBlocks':
                    style.innerHTML += `
                        pre
                        {
                            background: black !important;
                            border-radius: 10px;
                            
                            box-shadow: none !important;
                        }
                        pre code { white-space: pre-wrap; }
                    `;
                    break;
                case 'fixBlockquotes':
                    style.innerHTML += `
                        blockquote::before
                        {
                            content: "“";
                            font-family: auto;
                        }
                    `;
                    break;
                case 'fancySMS':
                    style.innerHTML += `
                        .conversation.right,
                        .conversation.left,
                        
                        .conversation + p:not(:has(+p))
                        {
                            width: fit-content;
                            max-width: 50%;
                            
                            font-family: system-ui;
                            
                            border-radius: 15px;
                            padding: 10px;
                            
                            margin: 10px 100px;
                            
                            position: relative;
                        }
                        
                        .conversation.left + p:has(+.conversation.right)
                        {
                            background: unset !important;
                            max-width: unset;
                            padding: unset;
                            color: unset;
                            margin: 1em 0;
                            font-family: unset;
                        }
                        .conversation.left + p:has(+.conversation.right)::before,
                        .conversation.left + p:has(+.conversation.right)::after
                        {
                            display: none;
                        }
                        
                        .conversation.right br,
                        .conversation.left br,
                        
                        .conversation + br
                        {
                            display: none;
                        }
                        
                        .conversation.right
                        {
                            background: #159eec !important;
                            margin-left: auto;
                            
                            border-radius: 15px 15px 5px 15px;
                        }
                        .conversation.right:has(+.conversation.right)
                        {
                            border-radius: 15px 15px 5px 15px;
                            margin-bottom: 0;
                        }
                        .conversation.right + .conversation.right
                        {
                            border-radius: 15px 5px 5px 15px;
                            margin-top: 5px;
                        }
                        
                        .conversation.left, .conversation.left em,
                        
                        .conversation + p:not(:has(+p))
                        {
                            background: #d0d0d0 !important;
                            color: black;
                            border-radius: 15px 15px 15px 5px;
                            
                            font-style: normal !important;
                        }
                        
                        body:not(.inverted) .conversation.right { color: white; }
                    `;
                    break;
                case 'fancySMSBubbles':
                    // if the user doesn't have fancySMS enabled, don't enable this
                    if (!settings.find(x => x.name == 'fancySMS').value) break;
                    style.innerHTML += `
                        .conversation.right:not(:has(+.conversation.right))::before,
                        .conversation.left::before,
                        
                        .conversation + p:not(:has(+p))::before
                        {
                            content: "";
                            border-radius: 50%;
                            height: 32px;
                            width: auto;
                            aspect-ratio: 1/1;
                            
                            position: absolute;
                            
                            background: inherit;
                            bottom: 0;
                        }
                        
                        .conversation.right:not(:has(+.conversation.right))::after,
                        .conversation.left::after,
                        
                        .conversation + p:not(:has(+p))::after
                        {
                            content: "";
                            border-radius: 50%;
                            height: 15px;
                            width: auto;
                            aspect-ratio: 1/1;
                            
                            border: 4px solid #222;
                            
                            box-sizing: border-box;
                            
                            position: absolute;
                            
                            background: #22a057;
                            bottom: -4px;
                        }
                        
                        body:not(.inverted) .conversation.right:not(:has(+.conversation.right))::after,
                        body:not(.inverted) .conversation.right + p::after
                        {
                            border-color: #FFFFFF;
                        }
                        
                        .conversation.right::before { right: -40px; }
                        .conversation.left::before { left: -40px; }
                        .conversation + p:not(:has(+p))::before { left: -40px; }
                        
                        .conversation.right::after { right: -44px; }
                        .conversation.left::after { left: -20px; }
                        .conversation + p:not(:has(+p))::after { left: -20px; }
                    `;
                    break;
                case 'justifyParagraphs':
                    style.innerHTML += `
                        p:not(.conversation):not(.chat-log) { text-align: justify; }
                        li p:not(.conversation) { text-align: left; }
                    `;
                    break;
                case 'fancyChatLog':
                    style.innerHTML += `
                        .chat-log
                        {
                            display: flex;
                            gap: 15px;
                            
                            margin: 0;
                            font-family: 'Ruda';
                        }
                        .chat-log-name
                        {
                            min-width: 150px;
                            text-align: right;
                            padding: 1em;
                        }
                        .chat-log-text
                        {
                            border-left: 1px solid #ddd;
                            padding: 1em;

                            justify-content: left;
                        }
                        
                        .chat-log-system
                        {
                            text-align: center !important;
                            border: 1px solid #ddd;
                            border-left: none;
                            border-right: none;
                            
                            padding: 1em 0;
                            margin: 0;
                            
                            font-family: monospace;
                            font-weight: 400;
                        }
                        .chat-log-system:has(+.chat-log-system) { border-bottom: none; }
                        .chat-log-system +.chat-log-system { border-top: none; }
                        
                        .chat-log-system + hr { display: none; }
                        
                        .chat-log,
                        .chat-log-text, .chat-log-text em
                        {
                            text-align: left !important;
                        }
                    `;
                    break;
                case 'fancyChatLogKeep++':
                    style.innerHTML += `
                        .chat-log-name::before {content: "++"; }
                        .chat-log-name::after {content: "++:"; }
                    `;
                    break;
            }
        }
    }

    // add the CSS to the page
    document.head.appendChild(style);
}
