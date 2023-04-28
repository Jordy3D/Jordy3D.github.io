// ==UserScript==
// @name         Deathworlders Tweaks
// @namespace    http://tampermonkey.net/
// @version      0.4.5
// @description  Modifications to the Deathworlders web novel
// @author       Bane
// @match        https://deathworlders.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=deathworlders.com
// @grant        none
// ==/UserScript==



// Changlog
// 0.1 - Initial version 
//          - adds cover image to the top of the article
// 0.2 - Added code to support conversation styling
// 0.3 - Added extra CSS to the script rather than loading it separately
// 0.4 - Added a settings menu to enable/disable features
//          - saves settings to localstorage

var conversationSet = false;
var conversationScan = 3;

// ===== Settings =====

var settings = [];

// if we have settings saved, load them
if (localStorage.getItem('bane-deathworlders-settings')) {
    settings = JSON.parse(localStorage.getItem('bane-deathworlders-settings'));
} else {
    settings.push({ name: 'replaceSectionEndHeaders', value: true, fancyText: 'Replace Section End Headers', tag: 'Fix' });
    settings.push({ name: 'fixBrokenHRTags', value: true, fancyText: 'Fix Broken HR Tags', tag: 'Fix' });
    settings.push({ name: 'darkScrollbars', value: true, fancyText: 'Dark Scrollbars', tag: 'Style' });
    settings.push({ name: 'fixCodeBlocks', value: true, fancyText: 'Fix Code Blocks', tag: 'Fix' });
    settings.push({ name: 'fixBlockquotes', value: true, fancyText: 'Fix Blockquotes', tag: 'Fix' });
    settings.push({ name: 'fancySMS', value: true, fancyText: 'Fancy SMS', tag: 'Style' });
    settings.push({ name: 'fancySMSBubbles', value: true, fancyText: 'Fancy SMS Bubbles', tag: 'Style' });
    settings.push({ name: 'justifyParagraphs', value: true, fancyText: 'Justify Paragraphs', tag: 'Style' });
}


// ===== End Settings =====

spawnSettings();

setInterval(function () {
    addCover();
    setConversationElement();
}, 1000);



function spawnSettings() {
    var settingsDiv = document.createElement('div');
    settingsDiv.classList.add('bane-settings');
    settingsDiv.innerHTML = `
        <h1>Deathworlders Tweaks</h1>
        <h4>by Bane</h4>
        <hr>
    `;
    // loop through settings and add them to the div
    for (var setting in settings) {
        var settingDiv = document.createElement('div');
        settingDiv.classList.add('bane-setting');
        settingDiv.innerHTML = `
            <label for="bane-setting-${setting}">${settings[setting].fancyText}</label>
            <input type="checkbox" id="bane-setting-${setting}" ${settings[setting].value ? 'checked' : ''}>
        `;

        settingDiv.querySelector(`#bane-setting-${setting}`).addEventListener('change', updateSettings);

        settingsDiv.appendChild(settingDiv);
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
        .bane-settings h4
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
        }
    `;

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

    // look for .story-specific-images
    var storySpecificImages = document.querySelector('.story-specific-images');
    if (!storySpecificImages) return;

    // if .story-specific-images has .bane then we've already done this
    if (storySpecificImages.classList.contains('bane')) return;
    storySpecificImages.classList.add('bane');

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

    // add style
    var style = document.createElement('style');
    style.innerHTML = `
        .bane-cover {
            height: auto;
            width: 500px;
            margin: 0 auto;
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
        if (emTags.length == 0) continue;

        var brTags = pTag.querySelectorAll('br');

        if (emTags.length + (brTags.length * 2) == pTag.childNodes.length) {

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

    conversationSet = true;
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
            console.log(setting);
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
                        p:not(.conversation)
                        {
                            text-align: justify;
                        }
                    `;
                    break;
            }
        }
    }

    // add the CSS to the page
    document.head.appendChild(style);
}

