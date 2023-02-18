// ==UserScript==
// @name         YouTube Plus
// @namespace    http://tampermonkey.net/
// @version      0.1
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
    {
        ytdPlayer = ytdPlayer.parentElement;
    }
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
    volumeControl.value = 100;
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