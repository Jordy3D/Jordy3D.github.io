// ==UserScript==
// @name         Deathworlders Modifications
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Modifications to the Deathworlders web novel
// @author       Bane
// @match        https://deathworlders.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=deathworlders.com
// @grant        none
// ==/UserScript==



// Changlog
// 0.2 - Added code to support conversation styling
// 0.1 - Initial version 
//          - adds cover image to the top of the article

var conversationSet = false;

var conversationScan = 3;

setInterval(function() {
    addCover();
    setConversationElement();
}, 1000);


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

function setConversationElement()
{
    if (conversationSet) return;

    // find all .p tags that only contain em tags and/or br tags, and not their own text, and are not just <p></p>
    var pTags = document.querySelectorAll('p');
    for (var i = 0; i < pTags.length; i++) {
        var pTag = pTags[i];
        var emTags = pTag.querySelectorAll('em');
        if (emTags.length == 0) continue;

        var brTags = pTag.querySelectorAll('br');

        if (emTags.length + (brTags.length*2) == pTag.childNodes.length) {

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
                let ref = i+j;

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

    conversationSet = true;
}