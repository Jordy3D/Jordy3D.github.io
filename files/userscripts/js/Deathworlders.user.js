// ==UserScript==
// @name         Deathworlders Tweaks
// @namespace    http://tampermonkey.net/
// @version      0.7.7
// @description  Modifications to the Deathworlders web novel
// @author       Bane
// @match        https://deathworlders.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=deathworlders.com
// @grant        none
// ==/UserScript==

// ===== Changelog =====
//
// 0.1 - Initial version 
//          - Adds cover image to the top of the article
// 0.2 - Added code to support conversation styling
// 0.3 - Added extra CSS to the script rather than loading it separately
// 0.4 - Added a settings menu to enable/disable features
//          - Saves settings to localstorage
//          - Added a konami code to reset settings
// 0.5 - Added a fix for the conversation styling failing on certain instances
//     - Added a way for new settings to be added without overwriting old settings (hopefully)
//     - Added a setting for adding a cover image
//     - Organized settings into categories
//     - Fixed a bug where non-paragrapgh elements were being justified
// 0.6 - Added a setting for fancy chat log
//          - Setting for keeping the ++NAME++ flavour in the chat log
//          - Setting for rounded system messages
//     - Rewrote the settings code to be more efficient 
//     - Added Light Mode support
// 0.7 - Added a check for new versions of the script
//     - Redesigned the settings menu
//     - Fixed some fancy chat log items not being detected
//     - Fixed some fancy chat log items being detected incorrectly
//     - Fixed an issue with justification justifying incorrect elements
//
// ===== End Changelog =====




var conversationSet = false;
var conversationScan = 3;
var chatLogSet = false;

// ===== Settings =====

var defaultSettings = [];
defaultSettings.push({ name: 'replaceSectionEndHeaders', value: true, fancyText: 'Replace Section End Headers', tag: 'Fix' });
defaultSettings.push({ name: 'fixBrokenHRTags', value: true, fancyText: 'Fix Broken HR Tags', tag: 'Fix' });
defaultSettings.push({ name: 'darkScrollbars', value: true, fancyText: 'Dark Scrollbar', tag: 'Style' });
defaultSettings.push({ name: 'fixCodeBlocks', value: true, fancyText: 'Fix Code Blocks', tag: 'Fix' });
defaultSettings.push({ name: 'fixBlockquotes', value: true, fancyText: 'Fix Blockquotes', tag: 'Fix' });
defaultSettings.push({ name: 'fancySMS', value: true, fancyText: 'Fancy SMS', tag: 'Style' });
defaultSettings.push({ name: 'fancySMSBubbles', value: true, fancyText: 'Fancy SMS Bubbles', tag: 'Style' });
defaultSettings.push({ name: 'justifyParagraphs', value: true, fancyText: 'Justify Paragraphs', tag: 'Style' });
defaultSettings.push({ name: 'addCover', value: true, fancyText: 'Add Cover', tag: 'Function' });
defaultSettings.push({ name: 'fancyChatLog', value: true, fancyText: 'Fancy Chat Log', tag: 'Style' });
defaultSettings.push({ name: 'fancyChatLogKeep++', value: true, fancyText: 'Fancy Chat Log Keep ++', tag: 'Style' });
defaultSettings.push({ name: 'fancyChatLogRoundedSystem', value: true, fancyText: 'Fancy Chat Log Rounded System', tag: 'Style' });

var settings = [];

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

    checkNewVersion();
    checkNewSettings();
}

function checkNewVersion() {
    console.log('Checking for new version of Deathworlders Tweaks');

    // check https://jordy3d.github.io/files/userscripts/js/Deathworlders.user.js for the latest version
    var url = 'https://jordy3d.github.io/files/userscripts/js/Deathworlders.user.js';
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            var response = request.responseText;
            var version = response.match(/@version\s+([^\s]+)/)[1];
            version = version.replace(/\./g, '');
            version = parseInt(version);

            var curVersion = GM_info.script.version;
            curVersion = curVersion.replace(/\./g, '');
            curVersion = parseInt(curVersion);

            if (version > curVersion) {
                // add a new ::after element to the h1 element in .bane-settings, and make it look like the Minecraft splash text
                var settingsDiv = document.querySelector('.bane-settings');
                settingsDiv.classList.add('new');

                // add a link to the bottom of the settings menu to open https://jordy3d.github.io/files/userscripts 
                var sourceLink = document.createElement('a');
                sourceLink.classList.add('not-button');
                sourceLink.href = 'https://jordy3d.github.io/userscripts';
                sourceLink.target = '_blank';
                sourceLink.innerHTML = 'Download the latest version here';
                settingsDiv.appendChild(sourceLink);


                // create a new style
                var style = document.createElement('style');
                style.id = 'bane-new-version-style';
                style.innerHTML = `
                    /* Update Animations */
                    .bane-settings.new 
                    { 
                        animation: ping 1s infinite; 
                        opacity: 1;
                    }
                    
                    @keyframes ping
                    {
                        0% { outline: 2px solid #d09242; }
                        50% { outline: 5px solid #d09242; }
                        100% { outline: 2px solid #d09242; }
                    }
                    
                    .bane-settings.new h1 { position: relative; }
                    .bane-settings.new h1::after
                    {
                        content: "New version available!";
                        position: absolute;
                        display: block;
                        
                        font-size: 10pt;
                        font-weight: bold;
                        
                        right: -50px;
                        bottom: 0;

                        opacity: 0;
                        transition: opacity 200ms ease-in-out;
                        
                        transform: rotate(-30deg);
                        
                        animation: updateSplash 1s infinite;
                        
                        text-shadow: 0 0 5px #222222, 0 0 5px #222222;
                    }
                    .bane-settings.new:hover h1::after { opacity: 1; }

                    body:not(.inverted) .bane-settings.new h1::after { text-shadow: 0 0 5px #FFFFFF, 0 0 5px #FFFFFF; }
                    
                    @keyframes updateSplash {
                        0% { transform: scale(1) rotate(-25deg); }
                        50% { transform: scale(1) rotate(-15deg); }
                        100% { transform: scale(1) rotate(-25deg); }
                    }
                    
                    
                    /* Update Button */
                    .bane-settings:not(.new) .not-button { display: none; }
                    
                    .not-button
                    {
                        text-align: center;
                        display: block;
                        
                        padding: 1em;
                        margin-top: auto;
                        border: 3px solid #D09242;
                        border-radius: 5em;
                        
                        transition: all 100ms ease-in-out;
                    }
                    
                    .not-button:hover
                    {
                        background: #D09242;
                        color: #222222 !important;
                    }
                `;
                document.head.appendChild(style);
            }
        }
    };

    request.send();
}

function spawnSettings() {
    var settingsDiv = document.createElement('div');
    settingsDiv.classList.add('bane-settings');
    settingsDiv.innerHTML = `
        <h1>Deathworlders Tweaks</h1>
        <div class="bane-settings-subtitle">
            <h4>v${GM_info.script.version}</h4>
            <h4>by Bane</h4>
        </div>
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
            
            border-right: 4px solid #CECECE;
            
            height: 100vh;
            border-radius: 0;
            border-bottom: none;
            
            display: flex;
            flex-direction: column;
            
            padding: 20px;
            box-sizing: border-box;
            
            position: fixed;
            left: 0;
            top: 0;
            transform: translatex(calc(20px - 100%));
            
            opacity: 0.1;
            
            transition: all 100ms ease-in-out;
        }
        body:not(.inverted) .bane-settings { background: #ffffff !important; }

        .bane-settings-subtitle
        {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
        }

        .bane-settings h1, 
        .bane-settings h4,
        .bane-setting-tag
        {
            margin: 0;
        }

        .bane-settings hr { width: 100%; }

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
            var found = false;
            found = findClassWithinDistance(children, i, 3, 'conversation');

            if (found) {
                child.classList.add('conversation');
                child.classList.add('left');
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
        if (pTag.innerText.toUpperCase().includes('END CHAPTER') || pTag.innerText.toUpperCase().includes('END OF PART')) continue;

        // if the first child is a strong and the text starts with ++, add the class chat-log
        if (firstChild.tagName == 'STRONG' && firstChild.innerText.startsWith('++')) {
            // if the text doesn't contain "END CHAPTER", add the class "chat-log
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

        var textContent = pTag.innerText;
        var textContentNormalised = textContent.toUpperCase();

        // if text is only numbers, skip
        if (/^\d+$/.test(textContentNormalised)) continue;

        if (textContentNormalised.includes('END CHAPTER'))
        {
            pTag.classList.add('chapter-end');
            continue;
        }

        if (textContent == textContentNormalised)
            pTag.classList.add('chat-log-system');

        if (textContentNormalised.includes('SESSION #'))
            pTag.classList.add('chat-log-system');

        // if the text matches SESSION XXX where X is a number using regex, add the class chat-log-system
        var regex = /SESSION\s\d+/g;
        if (regex.test(textContentNormalised))
            pTag.classList.add('chat-log-system');
    }

    // find every p tag that is preceeded by a .chat-log-system
    var pTags = document.querySelectorAll('p');
    for (var i = 0; i < pTags.length; i++) {
        var pTag = pTags[i];
        var previous = pTag.previousElementSibling;
        if (previous && previous.classList.contains('chat-log-system')) {
            // if the first word ends with :, add the class chat-log-system
            var text = pTag.innerText;
            var firstWord = text.split(' ')[0];
            if (firstWord.endsWith(':'))
                pTag.classList.add('chat-log-system');
        }
    }

    // find all .chat-log-system elements and remove the class if there isn't a .chat-log-system element within 3 elements
    var pTags = document.querySelectorAll('p');
    for (var i = 0; i < pTags.length; i++) {
        if (!pTags[i].classList.contains('chat-log-system')) continue;

        var chatLogSystem = pTags[i];

        var found = false;
        found = findClassWithinDistance(pTags, i, conversationScan, ['chat-log', 'chat-log-system']);

        if (!found)
        {
            chatLogSystem.classList.remove('chat-log-system');
            chatLogSystem.classList.add('chat-log-system-removed');
        }
    }

    chatLogSet = true;
}

function findClassWithinDistance(array, currentIndex, distance, searchClass) {
    let classes = [searchClass].flat();

    for (var i = 0; i < classes.length; i++) {
        let className = classes[i];
        // console.log(`Looking for ${className} within ${distance} of ${currentIndex}`);

        for (var i = -distance; i < distance; i++) {
            let ref = currentIndex + i;

            if (ref < 0) continue; // skip if we're going to go out of bounds
            if (ref >= array.length) continue; // skip if we're going to go out of bounds
            if (i == 0) continue; // skip if we're looking at the element itself

            let sibling = array[ref];

            if (sibling && sibling.classList && sibling.classList.contains(className))
                return true;
        }
    }

    return false;
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
                        .bane-article > p { text-align: justify; }
                    `;
                    break;
                case 'fancyChatLog':
                    style.innerHTML += `
                        .chat-log
                        {
                            display: flex;
                            
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
                            text-transform: uppercase;
                            border: 1px solid #ddd;
                            
                            padding: 1em;
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

                        .bane-article > .chapter-end { text-align: center; }
                    `;
                    break;
                case 'fancyChatLogKeep++':
                    style.innerHTML += `
                        .chat-log-name::before {content: "++"; }
                        .chat-log-name::after {content: "++:"; }
                    `;
                    break;
                case 'fancyChatLogRoundedSystem':
                    style.innerHTML += `
                        .chat-log-system { border-radius: 1em; }
                        .chat-log-system:has(+.chat-log-system) { border-radius: 1em 1em 0 0; } 
                        .chat-log-system + .chat-log-system { border-radius: 0; }
                        .chat-log-system+.chat-log-system:not(:has(+.chat-log-system)) { border-radius: 0 0 1em 1em; }
                    `;
                    break;
            }
        }
    }

    // add the CSS to the page
    document.head.appendChild(style);
}
