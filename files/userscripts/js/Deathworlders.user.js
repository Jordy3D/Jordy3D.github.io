// ==UserScript==
// @name         Deathworlders Modifications
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Modifications to the Deathworlders web novel
// @author       Bane
// @match        https://deathworlders.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=deathworlders.com
// @grant        none
// ==/UserScript==

setInterval(function() {
    addCover();
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