// ==UserScript==
// @name         ImageDownloadButton
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Download the World
// @author       You
// @match        *://*/*
// @grant        none
// ==/UserScript==


setInterval(function () {
    imageButtons();
    masterButton();
}, 1000);

function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}

function imageButtons() {
    // Get the container that holds all chat messages
    var images = document.querySelectorAll("img")

    images.forEach(img => {
        if(img.classList.contains('bane-download')) return;

        if(img.offsetWidth < 50 || img.offsetHeight < 50) return;

        img.classList.add('bane-download')

        img.parentElement.style.display = 'flex';

        const top = img.offsetTop;
        const right = (img.offsetLeft);

        const button = document.createElement('button');
        button.innerHTML = '<b>⭳</b>';
        button.classList.add('download-button');
        button.style.position = 'absolute';

        button.style.left = '0';

        button.style.zIndex = '10000000000';
        button.style.color = 'white';
        button.style.background = 'black'
        button.style.border = '1px solid white'
        button.style.borderRadius = '13%'
        button.style.aspectRatio = '1 / 1'
        button.style.height = '24px'

        button.style.pointerEvents = 'all';

        button.addEventListener('click', e => {
            download(img.src, img.src);
            // disable other click events
            e.stopPropagation();
        });
        
        img.parentNode.insertBefore(button, img.nextSibling);
    });
}

function masterButton()
{
    // if #bane-master exists, return
    if(document.querySelector("#bane-master")) return;

    // create div in the top middle of the screen
    var baneMaster = document.createElement("div");
    baneMaster.id = "bane-master";
    baneMaster.style.position = "fixed";
    baneMaster.style.top = "0";
    baneMaster.style.left = "50%";
    baneMaster.style.transform = "translateX(-50%)";
    baneMaster.style.zIndex = "10000000000";

    // create button
    var baneButton = document.createElement("button");
    baneButton.id = "bane-download-all";
    baneButton.innerHTML = "<b>⭳</b>";
    baneButton.style.color = "white";
    baneButton.style.background = "black";
    baneButton.style.border = "1px solid white";
    baneButton.style.borderRadius = "13%";
    baneButton.style.aspectRatio = "1 / 1";
    baneButton.style.height = "24px";
    baneButton.style.pointerEvents = "all";
    baneButton.onclick = downloadAll;

    // add button to div
    baneMaster.appendChild(baneButton);

    // add div to body
    document.body.appendChild(baneMaster);
}

function downloadAll()
{
    // find every img element
    var images = document.querySelectorAll("img");

    // loop through every img element
    images.forEach(img => {
        // if the img element is too small, return
        if(img.offsetWidth < 50 || img.offsetHeight < 50) return;

        // if the src doesn't end with .jpg, .png, or .gif, add .jpg
        var src = img.src;
        if(!src.endsWith(".jpg") && !src.endsWith(".png") && !src.endsWith(".gif"))
        {
            src += ".jpg";
        }

        // download the image
        download(src, src);
    });

}