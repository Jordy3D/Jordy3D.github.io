// ==UserScript==
// @name         YouTube Plus
// @namespace    Bane
// @version      0.5.7
// @description  Adds features to YouTube
// @author       Bane
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        none
// ==/UserScript==

// ==Changelog==
// Before   - Added button to download video from YouTube
//          - Added button to open Shorts as video
//          - Added button to download Shorts
//          - Added volume control to Shorts
//          - Added duration to playlists (broken)
//          - Added format buttons to comment and reply boxes
// 
// 0.5.6    - Start of changelog
//          - Removed everything after &pp in URLs cuz they're gross
// 0.5.7    - Made middle click work on thumbnails again


// ============================
// ===== Initialize =====================
// ================================================

function loadMaterialFonts() {
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

var debug = false;

loadMaterialFonts();

// ============================
// ===== Update and Check ===============
// ================================================

setInterval(function () {
    loadMaterialFonts();
    if (window.location.href.includes("youtube.com/shorts/")) {
        shortsVolumeControl();
        shortsOpenAsVideo();
        shortsDownload();
    }
    if (window.location.href.includes("youtube.com/playlist")) {
        playlistDuration();
    }

    // run removePP
    removePP();
    // run YouTube download button
    videoDownloadButton();
    // run middle click
    middleClickThumbnails();

}, 1000);

// ============================
// ===== Shorts =========================
// ================================================
//#region Shorts

function addNewShortsButton(id, label, icon, onclick, iconType = "material-icons-outlined") {
    if (document.getElementById("shorts-player") == null) { return; }

    // get ytd-reel-video-renderer with is-active attribute
    var activeReel = document.querySelector("ytd-reel-video-renderer[is-active]");
    // if #bane-short-open-as-video is part of the active reel, then we have already added the button
    if (activeReel != null && activeReel.querySelector(`#${id}`) != null) { return; }

    if (debug)
        console.log(`Adding ${label} button to Shorts`);

    // find current #shorts-player
    var shortsPlayer = document.getElementById("shorts-player");
    // get the ytd-reel-video-renderer that is one of the parents of the #shorts-player
    var ytdReel = shortsPlayer.parentElement;
    while (ytdReel.tagName != "YTD-REEL-VIDEO-RENDERER")
        ytdReel = ytdReel.parentElement;

    // find the #actions element that is a child of the ytd-reel-video-renderer
    var actions = ytdReel.querySelector("#actions.ytd-reel-player-overlay-renderer-v2") || ytdReel.querySelector("#actions.ytd-reel-player-overlay-renderer");

    // if the button already exists in the actions, then return
    if (actions.querySelector(`#${id}`) != null) { return; }

    // if v2, then store v2 as true
    var v2 = actions.classList.contains("ytd-reel-player-overlay-renderer-v2");

    // Add button to open shorts as video, starting with a container
    var buttonContainer = document.createElement("div");
    buttonContainer.id = id;
    buttonContainer.classList.add("button-container", "style-scope", "ytd-reel-player-overlay-renderer" + v2 ? "-v2" : "", "bane-short-button");

    var buttonHolder = document.createElement("div");
    buttonHolder.classList.add("button-holder", "style-scope", "ytd-reel-player-overlay-renderer" + v2 ? "-v2" : "");

    var button = document.createElement("button");
    button.classList.add(iconType, "style-scope", "ytd-reel-player-overlay-renderer" + v2 ? "-v2" : "");

    button.innerHTML = icon;

    buttonHolder.onclick = onclick;

    var buttonLabel = document.createElement("span");
    buttonLabel.classList.add("label", "style-scope", "ytd-reel-player-overlay-renderer" + v2 ? "-v2" : "");
    buttonLabel.innerHTML = label;

    // add button to container
    buttonHolder.appendChild(button);
    // add label to container
    buttonHolder.appendChild(buttonLabel);

    // add button holder to container
    buttonContainer.appendChild(buttonHolder);

    // add container to actions as third to last element
    actions.insertBefore(buttonContainer, actions.children[actions.children.length - 2]);

    // if there's not already a style element, add one
    if (document.getElementById("bane-short-button-style") == null) {
        var style = document.createElement('style');
        style.id = "bane-short-button-style";
        style.type = 'text/css';
        style.innerHTML = `
            .bane-short-button {
                display: flex;
                flex-direction: column;
                width: 64px;
                height: 88px;
                background: #0000;
                flex-wrap: nowrap;
                justify-content: center;
            }
            .ytd-reel-player-overlay-renderer .bane-short-button {
                align-items: center;
            }
            .bane-short-button .button-holder {
                margin-right: 16px;
                padding-bottom: 16px;
                width: 48px;
                height: 100%;
            }
            .ytd-reel-player-overlay-renderer .bane-short-button .button-holder {
                margin-right: 0px;
                padding-bottom: 0px;
                padding-top: 16px;
            }
            .bane-short-button button {
                width: 100%;
                background: none;
                border: none;
                color: white;
                font-size: 34px;
                height: 46px;
                cursor: pointer !important;
            }
            .bane-short-button .label {
                color: var(--yt-spec-text-primary);
                font-size: var(--ytd-tab-system-font-size);
                font-family: "Roboto", "Arial", sans-serif;
                text-align: center;
                padding-top: 7.5px;
                display: block;
                font-weight: 400;
                cursor: pointer !important;
            }



        `;

        document.getElementsByTagName('head')[0].appendChild(style);
    }
}

function shortsOpenAsVideo() {
    var openAsVideo = function () {
        // get the video id from the url, which is the last part of the url
        var videoId = window.location.href.split("/").pop();
        // open the video in a new tab
        window.open("https://www.youtube.com/watch?v=" + videoId);
    }

    addNewShortsButton("bane-short-open-as-video", "Video", "tv", openAsVideo);
}

function shortsDownload() {
    var downloadShort = function () {
        // get the URL
        var url = window.location.href;
        // replace youtube.com with ssyoutube.com
        url = url.replace("youtube.com", "ssyoutube.com");
        // open the URL in a new tab
        window.open(url, "_blank");
    }

    addNewShortsButton("bane-short-download-short", "Save", "file_download", downloadShort, "material-icons");
}

function shortsVolumeControl() {
    if (document.getElementById("shorts-player") == null) { return; }

    // get ytd-reel-video-renderer with is-active attribute
    var activeReel = document.querySelector("ytd-reel-video-renderer[is-active]");

    // if #bane-short-volume-control is part of the active reel, then we have already added the volume control
    if (activeReel != null && activeReel.querySelector("#bane-short-volume-control") != null) { return; }

    if (debug)
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
    volumeControl.oninput = function () {
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
//#endregion

// ====================
// ===== Comments ===============
// ========================================
//#region Comments

document.addEventListener("click", function (event) {
    var source = event.target;

    var found = false;

    while (found == false && source != null && source.parentElement != null) {
        // same as above, but as an if/else statement
        if (source.id == "action-buttons")
            found = true;
        else if (source.id == "main" && source.classList.contains("ytd-commentbox"))
            found = true;
        else
            source = source.parentElement;
    }

    commentFormatButtons(source);
});

function commentFormatButtons(target) {
    console.log("Adding comment format buttons")
    var spawnPoint = target.querySelector(".ytd-commentbox#footer");

    if (spawnPoint != null && !spawnPoint.classList.contains("bane")) {
        spawnPoint.classList.add("bane");
        spawnButtons(spawnPoint);
    }
}

function spawnButtons(commentbox) {
    // Creates the button container and controls the spawning of buttons
    console.log("Spawning buttons...");

    var style_holder = document.createElement("div");
    style_holder.id = "bane_style_holder";
    var spawned_holder = commentbox.insertBefore(style_holder, commentbox.children[1]);

    spawnButton("format_bold", "bane_style_bold", "*", spawned_holder);
    spawnButton("format_italic", "bane_style_italics", "_", spawned_holder);
    spawnButton("strikethrough_s", "bane_style_strikethrough", "-", spawned_holder);

    // add style to the document
    var style = document.createElement("style");
    style.id = "bane-comment-format-style";
    style.innerHTML = `
        #bane_style_holder
        {
            border-radius: 100px;
            border: 1px solid #f1f1f1;

            display: flex;

            padding: 2px;
        }

        #bane_style_holder button
        {
            background: #0f0f0f;
            color: #f1f1f1;

            width:  25px;

            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0;
            border: none;
        }
        #bane_style_holder button:hover { background: #272727 !important; }

        #bane_style_holder button span
        {
            font-size: 18px;
            color: #f1f1f1;

            animation: hide_failure 200ms forwards;
        }
        @keyframes hide_failure {
        0% {color: #f1f1f100;}
        99% {color: #f1f1f100;}
        100% {color: #f1f1f1;}
        }

        #bane_style_holder button:first-child { border-radius: 50% 0 0 50%; }
        #bane_style_holder button:not(:first-child):not(:last-child) > span { border: 2px solid #1e1e1e; border-top: none; border-bottom: none; }

        #bane_style_holder button:last-child { border-radius: 0 50% 50% 0; }
    `;
    document.body.appendChild(style);

}

function spawnButton(inner, id, styletext, parent) {
    // Actually spawns the buttons and their text, with support for Material Icons
    var btn = document.createElement("button");
    var btn_txt = document.createElement("span");
    btn.type = "button"

    if (debug)
        console.log("Spawning " + id + " button...")

    var spawned = parent.appendChild(btn);
    var spawned_txt = spawned.appendChild(btn_txt);
    spawned.id = id;
    spawned_txt.innerHTML = inner;
    spawned_txt.className = "material-icons-outlined";
    spawned.onclick = function () {
        surroundSelectedText(styletext);
    }
}

function surroundSelectedText(mdChar) {
    /// Thank you, https://stackoverflow.com/a/3997896
    // Finds the text that is selected on the screen, surrounds it with the markdown character, then replaces it
    var chatbox = document.querySelector("#contenteditable-root.yt-formatted-string")

    var sel, range;
    sel = window.getSelection();

    if (sel.baseNode.parentNode.id != "contenteditable-root") {
        console.log("Selected text not in chat box.")
        return;
    }

    if (sel) {
        var replacement = ""
        //if(str.charAt(0) === mdChar && str.charAt(str.length - 1) === mdChar)
        //    replacement = str.replaceAll(mdChar, '')
        //else
        //    replacement = `${mdChar}${sel}${mdChar}`

        // if sel ends with a space
        if (sel.toString().endsWith(" "))
            replacement = `${mdChar}${sel}${mdChar} `
        else
            replacement = `${mdChar}${sel}${mdChar}`

        if (sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(replacement));
        }
    } else if (document.selection && document.selection.createRange) {
        range = document.selection.createRange();
        range.text = replacement;
    }
}
//#endregion


// ====================
// ===== Playlist ===============
// ========================================

let tryCount = 0;

function playlistDuration() {
    // if (tryCount < 3)
    //     return;

    var playlist = document.querySelector("ytd-playlist-video-list-renderer");
    if (playlist != null) {
        var videos = playlist.querySelectorAll("ytd-playlist-video-renderer");
        var videoLoadedTotal = videos.length;
        var totalDuration = 0;

        var stats = document.querySelectorAll(".metadata-stats")[0];

        // find the total number of videos in the playlist as listed on the page
        var videoCountTotal = stats.children[1].children[0].innerText;
        var videoCounter = 0;

        var prevSeconds = 0;
        for (var i = 0; i < videos.length; i++) {
            videos = playlist.querySelectorAll("ytd-playlist-video-renderer");
            var video = videos[i];
            var time = video.querySelector("span.ytd-thumbnail-overlay-time-status-renderer");
            if (time != null) {
                var seconds = 0;
                var again = true;
                while (again) {
                    var timeStr = time.innerText.replace(/(\r\n|\n|\r)/gm, "");
                    var timeArr = timeStr.split(":");
                    if (timeArr.length == 2)
                        seconds = parseInt(timeArr[0]) * 60 + parseInt(timeArr[1]);
                    else if (timeArr.length == 3)
                        seconds = parseInt(timeArr[0]) * 3600 + parseInt(timeArr[1]) * 60 + parseInt(timeArr[2]);

                    if (seconds != prevSeconds) {
                        if (debug)
                            console.log(`Video ${i + 1} of ${videoCountTotal} | ${timeStr} | ${seconds} seconds | Prev Seconds: ${prevSeconds}`);

                        again = false;
                        totalDuration += seconds;
                        prevSeconds = seconds;
                        videoCounter++;
                    }
                }
            }
        }

        var hours = Math.floor(totalDuration / 3600);
        var minutes = Math.floor(totalDuration / 60) - (hours * 60);
        var seconds = totalDuration % 60;

        var durationDisplay = document.getElementById("bane-playlist-duration");
        var durationText = document.getElementById("bane-playlist-duration-text");
        var tooltip = document.getElementById("bane-playlist-duration-tooltip");

        var metadata = document.querySelector(".metadata-text-wrapper");

        durationDisplay = ifNotExistCreate(durationDisplay, "bane-playlist-duration", metadata)
        durationText = ifNotExistCreate(durationText, "bane-playlist-duration-text", durationDisplay)
        tooltip = ifNotExistCreate(tooltip, "bane-playlist-duration-tooltip", durationDisplay)

        tooltip.classList.add("tooltip");

        var tipContent = `Loaded ${videoLoadedTotal} of ${videoCountTotal} videos.`;
        if (videoLoadedTotal != videoCountTotal)
            tipContent += `<br>Scroll down to load more videos.`

        tooltip.innerHTML = tipContent;

        // durationDisplay.innerText = "Total Duration:"
        durationText.innerText = `${hours}h ${minutes}m ${seconds}s`;

        if (videoLoadedTotal != videoCountTotal)
            durationText.classList.add("warning");
        else
            durationText.classList.remove("warning");

        // add style
        var style = document.getElementById("bane-playlist-duration-style");
        if (style == null) {
            var style = document.createElement("style");
            style.type = "text/css";
            style.id = "bane-playlist-duration-style";
            style.innerHTML = `
                #bane-playlist-duration {
                    font-family: "Roboto","Arial",sans-serif;
                    font-size: 1.2rem;
                    line-height: 1.8rem;
                    font-weight: 400;
                    position: relative;

                    display: flex;
                    gap: 7px;
                }
                #bane-playlist-duration::before {
                    content: "Total Duration: ";
                    color: #FFFFFF;
                }
                #bane-playlist-duration .warning {
                    color: #fdba74;
                }
                #bane-playlist-duration .warning::after {
                    content: " 🛈"
                }

                #bane-playlist-duration .tooltip {
                    visibility: hidden;
                    width: 200px;
                    background-color: #555;
                    color: #fff;
                    text-align: center;
                    border-radius: 6px;
                    padding: 5px 0;
                    position: absolute;
                    z-index: 1;
                    bottom: 125%;
                    left: 50%;
                    margin-left: -100px;
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                #bane-playlist-duration .tooltip::after {
                    content: "";
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    margin-left: -5px;
                    border-width: 5px;
                    border-style: solid;
                    border-color: #555 transparent transparent transparent;
                }
                #bane-playlist-duration:hover .tooltip {
                    visibility: visible;
                    opacity: 1;
                }

            `;
            document.body.appendChild(style);
        }


    }
}




function ifNotExistCreate(element, id, parent, type = "div") {
    if (document.getElementById(id) == null) {
        console.log(`Creating element ${id}`);
        element = document.createElement(type);
        element.id = id;
        if (parent)
            parent.appendChild(element);
    }
    else
        element = document.getElementById(id);

    return element;
}








function videoDownloadButton() {
    // find the .ytp-right-controls element
    var rightControls = document.getElementsByClassName("ytp-right-controls")[0];
    // if it doesn't exist, return
    if (!rightControls) { return; }

    // if ytp-bane-controls already exists, return
    if (document.getElementsByClassName("ytp-bane-controls")[0]) { return; }

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
    newButton.addEventListener("click", function () {
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



// remove &pp=XXX from all URLs
function removePP() {
    console.log("Removing &pp=XXX from all URLs");
    var links = document.getElementsByTagName("a");
    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        var href = link.getAttribute("href");
        if (href && href.includes("&pp="))
            link.setAttribute("href", href.split("&pp=")[0]);
    }
}


// make Thumbnails middle-clickable
function middleClickThumbnails() {
    if (document.getElementById("bane-middle-click-style")) { return; }

    var style = document.createElement("style");
    style.id = "bane-middle-click-style";
    // add the style
    style.innerHTML = `
        ytd-video-preview[active] { pointer-events: none !important; }
    `;
    // add the style to the head
    document.head.appendChild(style);
}