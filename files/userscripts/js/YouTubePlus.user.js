// ==UserScript==
// @name         YouTube Plus
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Adds features to YouTube
// @author       Bane
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        none
// ==/UserScript==



// ============================
// ===== Update and Check ===============
// ================================================

setInterval(function() {
    if (window.location.href.includes("youtube.com/shorts/"))
    {
        // add volume control to shorts
        shortsVolumeControl();
        // add shortcut to open short as video
        shortsOpenAsVideo();
    }
}, 1000);



function loadMaterialFonts()
{
    // load Material Icons if it hasn't been loaded already
    if (!document.getElementById("material-icons")) {
        var link = document.createElement('link');
        link.id = "material-icons";
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = "https://fonts.googleapis.com/icon?family=Material+Icons"
        document.getElementsByTagName('head')[0].appendChild(link);
    }
    // load Material Icons Outlined if it hasn't been loaded already
    if (!document.getElementById("material-icons-outlined")) {
        var link = document.createElement('link');
        link.id = "material-icons-outlined";
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = "https://fonts.googleapis.com/icon?family=Material+Icons+Outlined"
        document.getElementsByTagName('head')[0].appendChild(link);
    }
}


function shortsOpenAsVideo()
{
    if (document.getElementById("shorts-player") == null) { return; }

    // get ytd-reel-video-renderer with is-active attribute
    var activeReel = document.querySelector("ytd-reel-video-renderer[is-active]");
    // if #bane-short-open-as-video is part of the active reel, then we have already added the button
    if (activeReel != null && activeReel.querySelector("#bane-short-open-as-video") != null) { return; }

    console.log("Adding Shorts Open As Video Button")

    // find current #shorts-player
    var shortsPlayer = document.getElementById("shorts-player");
    // get the ytd-reel-video-renderer that is one of the parents of the #shorts-player
    var ytdReel = shortsPlayer.parentElement;
    while (ytdReel.tagName != "YTD-REEL-VIDEO-RENDERER")
        ytdReel = ytdReel.parentElement;

    // find the #actions element that is a child of the ytd-reel-video-renderer
    var actions = ytdReel.querySelector("#actions.ytd-reel-player-overlay-renderer-v2")

    // Add button to open shorts as video, starting with a container
    var buttonContainer = document.createElement("div");
    buttonContainer.id = "bane-short-open-as-video";
    buttonContainer.classList.add("button-container", "style-scope", "ytd-reel-player-overlay-renderer-v2");

    var buttonHolder = document.createElement("div");
    buttonHolder.classList.add("button-holder", "style-scope", "ytd-reel-player-overlay-renderer-v2");

    var button = document.createElement("button");
    button.classList.add("material-icons-outlined", "style-scope", "ytd-reel-player-overlay-renderer-v2");

    button.innerHTML = "tv";

    buttonHolder.onclick = function() {
        // get the video id from the url, which is the last part of the url
        var videoId = window.location.href.split("/").pop();
        // open the video in a new tab
        window.open("https://www.youtube.com/watch?v=" + videoId);
    }

    var label = document.createElement("span");
    label.classList.add("label", "style-scope", "ytd-reel-player-overlay-renderer-v2");
    label.innerHTML = "Video";

    // add button to container
    buttonHolder.appendChild(button);
    // add label to container
    buttonHolder.appendChild(label);

    // add button holder to container
    buttonContainer.appendChild(buttonHolder);

    // add container to actions as third to last element
    actions.insertBefore(buttonContainer, actions.children[actions.children.length - 2]);

    // if there's not already a style element, add one 
    if (document.getElementById("bane-short-open-as-video-style") == null) {
        var style = document.createElement('style');
        style.id = "bane-short-open-as-video-style";
        style.type = 'text/css';
        style.innerHTML = `
            #bane-short-open-as-video {
                display: flex;
                flex-direction: column;
                width: 64px;
                height: 88px;
                background: #0000;
                flex-wrap: nowrap;
                justify-content: center;
                cursor: pointer !important;
            }
            #bane-short-open-as-video .button-holder {
                margin-right: 16px;
                padding-bottom: 16px;
                width: 48px;
                height: 100%;
                cursor: pointer !important;
            }
            #bane-short-open-as-video button {
                width: 100%;
                background: none;
                border: none;
                color: white;
                font-size: 34px;
                height: 46px;
                cursor: pointer !important;
            }
            #bane-short-open-as-video .label {
                color: #f1f1f1;
                font-size: 14px;
                font-family: "Roboto", "Arial", sans-serif;
                text-align: center;
                padding-top: 7px;
                display: block;
                font-weight: 500;
                cursor: pointer !important;
            }
        `;

        document.getElementsByTagName('head')[0].appendChild(style);
    }

}

function shortsVolumeControl()
{
    if (document.getElementById("shorts-player") == null) { return; }

    // get ytd-reel-video-renderer with is-active attribute
    var activeReel = document.querySelector("ytd-reel-video-renderer[is-active]");

    // if #bane-short-volume-control is part of the active reel, then we have already added the volume control
    if (activeReel != null && activeReel.querySelector("#bane-short-volume-control") != null) { return; }

    console.log("Adding Shorts Volume Control")

    // find current #shorts-player
    var shortsPlayer = document.getElementById("shorts-player");
    // get the #player-container that is one of the parents of the #shorts-player
    var ytdPlayer = shortsPlayer.parentElement;
    while (ytdPlayer.id != "player-container")
        ytdPlayer = ytdPlayer.parentElement;

    // find the ytd-shorts-player-controls element that is a child of the #player-container
    var shortsControls = ytdPlayer.getElementsByTagName("ytd-shorts-player-controls")[0];


    // Add volume control to shorts
    console.log("Adding volume control to shorts...")
    var sliderContainer = document.createElement("div");
    sliderContainer.id = "bane-short-volume-control-container";
    sliderContainer.classList.add("slider");
    sliderContainer.style.width = "100%";
    sliderContainer.style.margin = "4px 10px";

    var volumeControl = document.createElement("input");
    volumeControl.id = "bane-short-volume-control";
    volumeControl.type = "range";
    volumeControl.min = 0;
    volumeControl.max = 100;
    // set value to video volume
    volumeControl.value = document.querySelector("#shorts-player > div.html5-video-container > video").volume * 100;
    // set the background of the volume control to match the volume
    volumeControl.style.background = `linear-gradient(to right, #FFF ${volumeControl.value}%, #FFF5 ${volumeControl.value}%)`;
    volumeControl.style.width = "100%";
    volumeControl.style.height = "5px";
    volumeControl.oninput = function()
    {
        var video = document.querySelector("#shorts-player > div.html5-video-container > video");
        video.volume = volumeControl.value / 100;

        // change the background of the volume control to match the volume
        volumeControl.style.background = `linear-gradient(to right, #FFF ${volumeControl.value}%, #FFF5 ${volumeControl.value}%)`;
    }

    // add the volume control to the slider container
    sliderContainer.appendChild(volumeControl);

    // append the slider container to the shorts controls as the second child
    shortsControls.insertBefore(sliderContainer, shortsControls.children[1]);

    // if there's not already a style element, add one
    if (document.getElementById("shorts-volume-control-style") != null)
        return;

    // add a style element
    var style = document.createElement("style");
    style.id = "shorts-volume-control-style";
    // add the style
    style.innerHTML = `
    // set the volume control to have a white main track and a grey background track
    .slider {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        width: 500px;
        height: 60px;
        padding: 30px;
        padding-left: 40px;
        background: #fcfcfc;
        border-radius: 20px;
        display: flex;
        align-items: center;
        box-shadow: 0px 15px 40px #7E6D5766;

        margin: 4px 10px;
      }

    input[type='range']
    {
      width: 80px;
      -webkit-appearance: none;
      background: linear-gradient(to right, #FFF 100%, #FFF5 100%);

      border-radius: 15px;
    }

    input[type='range']::-webkit-slider-runnable-track {
      height: 10px;
      -webkit-appearance: none;
      color: #13bba4;
      margin-top: -1px;
    }

    input[type='range']::-webkit-slider-thumb {
        width: 15px;
        -webkit-appearance: none;
        height: 15px;

        position: relative;
        top: -2px;

        border-radius: 50%;
        cursor: ew-resize;

        background: white;
    }

    #bane-short-volume-control-container { pointer-events: all; }
    `

    // add the style to the document
    document.body.appendChild(style);
}




function commentFormatButtons()
{
    // if a button element was clicked
    if (event.target.tagName == "button")
    {
        // if the button's parent is not a yt-button-shape element
        if (event.target.parentElement.tagName != "yt-button-shape")
            return;

        console.log("Button click to reply to comment")
    }
}



function videoDownloadButton()
{
    // find the .ytp-right-controls element
    var rightControls = document.getElementsByClassName("ytp-right-controls")[0];

    // if it exists
    if (!rightControls) { return; }

    // add a container for the button called "ytp-bane-controls"
    var newElement = document.createElement("div");
    newElement.classList.add("ytp-bane-controls");

    // add a button with the id "downloadButton"
    var newButton = document.createElement("button");
    newButton.id = "downloadButton";
    newButton.classList.add("ytp-button");
    newButton.classList.add("material-icons");
    newButton.title = "Download video";
    // add a download icon from Material Icons
    newButton.innerHTML = 'download';

    // add the button to the container
    newElement.appendChild(newButton);

    // add the container to the right controls as the first child
    rightControls.insertBefore(newElement, rightControls.firstChild);

    // add an event listener to the button
    newButton.addEventListener("click", function() {
        // get the URL
        var url = window.location.href;
        // replace youtube.com with ssyoutube.com
        url = url.replace("youtube.com", "ssyoutube.com");
        // open the URL in a new tab
        window.open(url, "_blank");
    });

    // add a style element
    var style = document.createElement("style");
    // add the style
    style.innerHTML = `
        .ytp-bane-controls {
            display: flex;
            align-items: center;

            display: flex;
            padding: 0 5px;
            height: 100%;
            /*border: 2px solid #ffffff33;*/
            border-top: none;
            border-bottom: none;
            width: 31px;
        }

        .ytp-bane-controls button {
            background: none;
            border: none;
            color: white;
            font-size: 28px;

            font-family: "Material Icons";
            font-weight: normal;
            font-style: normal;
        }
    `;

    // add the style to the head
    document.head.appendChild(style);
}