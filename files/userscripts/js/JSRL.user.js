// ==UserScript==
// @name         JetSetRadio.live Plus
// @namespace    http://tampermonkey.net/
// @version      0.4.2
// @description  JetSetRadio.live, but more
// @author       You
// @match        https://jetsetradio.live/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=jetsetradio.live
// @grant        none
// ==/UserScript==


// dict of all station internal names and their display names
var stationNames = {
    "classic": "Classic",
    "future": "Future",
    "ultraremixes": "Ultra Remixes",
    "garage": "The Garage",
    "turntablism": "Turntablism",
    "lofi": "Lo-Fi",
    "ggs": "GG's",
    "noisetanks": "Noise Tanks",
    "poisonjam": "Poison Jam",
    "rapid99": "Rapid 99",
    "loveshockers": "Love Shockers",
    "immortals": "The Immortals",
    "doomriders": "Doom Riders",
    "goldenrhinos": "Golden Rhinos",
    "ganjah": "Ganjah",
    "outerspace": "Outer Space",
    "retroremix": "Retro Remix",
    "classical": "Classical Remix",
    "revolution": "Revolution",
    "endofdays": "End of Days",
    "chiptunes": "Chiptunes",
    "spacechannel5": "Space Channel 5",
    "crazytaxi": "Crazy Taxi",
    "ollieking": "Ollie King",
    "lethalleagueblaze": "Lethal League Blaze",
    "toejamandearl": "Toe Jam & Earl",
    "hover": "Hover",
    "butterflies": "Butterflies",
    "silvagunner": "SilvaGunner X JSR",
    "bonafidebloom": "BonafideBloom",
};

var currentStation = "";

(function () {
    'use strict';

    // UI Changes
    addVolumeSlider();
    addNewSoulAnimation();

    // Menu Changes
    addMenuCSS();
    addMenuButton("https://github.com/Jordy3D/Jordy3D.github.io/raw/master/files/logo.ico", test);

    // Functional Changes
})();

// periodically refresh songlist
setInterval(function () {
    // try to refresh songlist, if it fails, don't do anything
    try {
        let songList = document.getElementById("songList");
        let songListHover = document.querySelector("#songList:hover");

        let titleOverlay = document.getElementById("titleScreenDiv");
        let titleOverlayVisible = titleOverlay.style.visibility != "hidden";

        // if the songList is not hovered over, and the title overlay is not visible, refresh the songlist
        if (!songListHover && !titleOverlayVisible) {
            drawSongList();
        }
    } catch (e) { }
}, 1000);




function addMenuButton(img_src, onclick = null) {
    // find #menu
    let menu = document.getElementById("menu");

    // create image
    let img = document.createElement("img");
    img.src = img_src;
    img.classList.add("objectSettings");
    img.classList.add("touchableOn");

    // add onclick event
    img.onclick = onclick;

    // add image to #menu
    menu.appendChild(img);
}

function addMenuCSS() {
    // if the style already exists, don't add it again
    if (document.getElementById("JSRLPlusMenu") != null) return;

    // create style
    let style = document.createElement('style');
    style.id = 'JSRLPlusMenu';
    style.type = 'text/css';
    style.innerHTML = `
        #menu
        {
            display: flex;
            flex-direction: column;
            flex-wrap: nowrap;
        
            height: 100vh !important;
            align-items: center;
        }

        #menu img
        {
            top: unset !important;
            display: block !important;
            
            position: unset !important;
            
            height: 40px;
            width: 40px;
            
            cursor: pointer;
        }
    `;
    document.getElementsByTagName('head')[0].appendChild(style);
}

function addVolumeSlider() {
    // find audio sources
    let audioPlayer = document.getElementById("audioPlayer");
    let staticPlayer = document.getElementById("staticPlayer");

    // find #information
    let information = document.getElementById("information");

    // find #programInformationText
    let programInformationText = document.getElementById("programInformationText");

    // create volume slider
    let volumeSlider = document.createElement("input");
    volumeSlider.id = "baneVolumeSlider";
    volumeSlider.classList.add("styled-slider");
    volumeSlider.type = "range";
    volumeSlider.min = "0";
    volumeSlider.max = "100";
    volumeSlider.value = "100";
    volumeSlider.step = "1";

    // add volume slider to #information after #programInformationText
    information.insertBefore(volumeSlider, programInformationText.nextSibling);

    // add event listener to volume slider
    volumeSlider.addEventListener("input", function () {
        audioPlayer.volume = volumeSlider.value / 100;
        staticPlayer.volume = volumeSlider.value / 100;
    });

    // create style
    let style = document.createElement('style');
    style.id = 'JSRLPlus';
    style.type = 'text/css';
    style.innerHTML = `
    /* Volume Slider Changes */
    #baneVolumeSlider {
        width: 150px;
        margin: 0 0 0 10px;

        pointer-events: all;

        z-index: 10;
        margin-right: 50px;

        height: 10px;
        overflow: hidden;
        border-radius: 0.5em;
    }

    #baneVolumeSlider {
        -webkit-appearance: none;
        background: none;
    }

    #baneVolumeSlider::-webkit-slider-thumb {
        -webkit-appearance: none;
        background: white;
        width: 10px;
        height: 10px;

        border-radius: 100px !important;
        box-shadow: -105px 0 0 100px #fff;

        transition: all 200ms ease-in-out;
    }

    #baneVolumeSlider:hover::-webkit-slider-thumb
    {
        background: #ffe222;
        box-shadow: -105px 0 0 100px #ffe222;
    }

    #baneVolumeSlider::-webkit-slider-runnable-track {
        border-radius: 0.5em;
        background: #ffffff52;
        overflow: hidden;
    }

    /* Same as above, but supporting other Browsers */
    #baneVolumeSlider::-moz-range-thumb {
        background: #fff;
        width: 10px;
        height: 10px;

        border:none !important;
        outline: none !important;

        border-radius: 0 100px 100px 0 !important;
        box-shadow: -105px 0 0 100px #fff;

        transition: all 200ms ease-in-out;
    }

    #baneVolumeSlider:hover::-moz-range-thumb
    {
        background: #ffe222;
        box-shadow: -105px 0 0 100px #ffe222;
    }
    #baneVolumeSlider::-moz-range-track {
        background: #ffffff52;
        height: 10px;
    }


    /* Other Changes to Accommodate Volume Slider */
    #information
    {
        display: flex !important;
        align-items: center;
        width: 100vw;

        background: #0005;
    }

    #information > *:not(#progressBar):not(#progressBarBackground):not(#loadingTrackCircle):not(#pauseTrackButton):not(#playTrackButton)
    {
        width: unset !important;
        position: unset !important;
    }

    #programInformationText
    {
        margin-right: auto;
        height: unset !important;
    }

    #informationBackground { display: none !important; }
    #guiSwitchOFF
    {
        top: unset !important;
        bottom: 60px;
    }
`;
    document.getElementsByTagName('head')[0].appendChild(style);
}



function test() {
    let station = getCurrentStation();
    console.log(station);

    let stationTracks = getStationTracks(station);
    console.log(stationTracks);

    let track = getCurrentTrack();
    console.log(track);

    let trackIndex = getTrackIndex(station, track);
    console.log(trackIndex);

    drawSongList();
    style.type = 'text/css';
    style.innerHTML = `
        /* Vinyl Logo */
        #graffitiSoul
        {
            animation: recordSpin 4s linear infinite;
            
            background: radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 4%, rgba(0,0,0,1) 5%, rgba(107,0,0,1) 6%, rgba(139,0,0,1) 16%, rgba(0,0,0,1) 17%, rgba(29,29,29,1) 18%, rgba(0,0,0,1) 40%, rgba(26,26,26,1) 41%, rgba(6,6,6,1) 42%, rgba(0,0,0,1) 57%, rgba(19,19,19,1) 59%, rgba(0,0,0,1) 60%, rgba(14,14,14,1) 79%, rgba(0,0,0,1) 81%, rgba(8,8,8,1) 82%, rgba(0,0,0,1) 100%);
            border-radius: 50%;
        }

        #graffitiSoulFramel
        {
            filter: drop-shadow(0px 0px 15px #000) drop-shadow(0px 0px 15px #000);
            overflow: visible;
        }

        @keyframes recordSpin {
            100% { transform: rotate(360deg); }
        }
    `;
    document.getElementsByTagName('head')[0].appendChild(style);
}

function test() {
    // go to the url https://jordy3d.github.io/ in a new tab
    window.open("https://jordy3d.github.io/", "_blank");
}

function drawSongList() {
    let refresh = false;

    let currentSong = getCurrentTrack();
    let station = getCurrentStation();
    let stationTracks = getStationTracks(station);

    let songList = document.getElementById("songList") || null;

    if (songList) {
        if (currentStation != station) {
            console.log(`Current Station: ${currentStation} | New Station: ${station}`);
            currentStation = station;
        }
        refresh = true;

        let songListContainer = songList.getElementsByClassName("songListContainer")[0];
        songList.removeChild(songListContainer);
    }

    let songListTitle = null;

    if (!refresh) {
        // create songlist div
        songList = document.createElement("div");
        songList.id = "songList";

        // add title to songlist div
        songListTitle = document.createElement("div");
        songListTitle.classList.add("songListTitle");
        songList.appendChild(songListTitle);
    }
    else {
        songListTitle = songList.getElementsByClassName("songListTitle")[0];
        songList = document.getElementById("songList");
    }

    songListTitle.innerHTML = `Now Playing on ${getStationDisplayName(currentStation)}`;

    // create song list container
    let songListContainer = document.createElement("div");
    songListContainer.classList.add("songListContainer");
    songList.appendChild(songListContainer);

    let currentSongFound = false;

    for (let i = 0; i < stationTracks.length; i++) {
        let song = document.createElement("div");
        song.classList.add("song");

        let songNumber = document.createElement("div");
        songNumber.classList.add("songNumber");
        songNumber.innerHTML = i + 1;

        let songName = document.createElement("div");
        songName.classList.add("songName");
        songName.innerHTML = stationTracks[i];

        if (!currentSongFound && currentSong != "Bump") {
            if (stationTracks[i] == currentSong && !currentSongFound) {
                currentSongFound = true;
                song.classList.add("currentSong");
            }
        }

        song.appendChild(songNumber);
        song.appendChild(songName);

        songListContainer.appendChild(song);
    }

    // place songlist div absolutely on the left, half the height of the screen and in the middle of the screen
    songList.style.position = "absolute";
    songList.style.left = "0";
    songList.style.top = "50%";
    songList.style.transform = "translateY(-50%)";

    // add songlist div to body
    document.body.appendChild(songList);

    // add event listener to songlist div
    songList.addEventListener("click", function (e) {
        let song = e.target.closest(".song");
        if (song) {
            let songNumber = song.querySelector(".songNumber").innerHTML;
            let songName = song.querySelector(".songName").innerHTML;

            let station = getCurrentStation();
            let stationTracks = getStationTracks(station);

            let trackIndex = getTrackIndex(station, songName);

            playTrack(station, trackIndex);
        }
    });

    // create style
    let style = document.createElement('style');
    style.id = 'JSRLPlusSongList';
    style.type = 'text/css';
    style.innerHTML = `
    #songList
    {
        width: 700px;
        height: 60vh;

        background: #000000b3;
        color: white;

        font-size: 20px;
        font-family: sans-serif;
        font-weight: 500;

        text-align: end;
        font-family: lightfont;

        overflow-y: auto;
        z-index: 1000;

        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 5px;

        padding: 10px;

        border: 10px solid #0000;
        border-right-width: 20px;
        border-radius: 0 0.5em 0.5em 0;
        box-sizing: border-box;

        transition: all 200ms ease-in-out, left 200ms;
        left: calc(-700px + 15px) !important;
    }

    #songList:hover
    {
        left: 0 !important;
        transition: left 500ms;
        border-right-width: 10px;
    }

    .songListTitle
    {
        font-size: 30px;
        text-align: center;
        width: 100%;
        border-bottom: 2px solid white;
        padding-bottom: 5px;
        margin-bottom: 15px;
    }

    .songListContainer
    {
        height: 100%;
        overflow-y: auto;
        
        padding-right: 10px;
    }

    .songListContainer::-webkit-scrollbar { width: 10px; }
    .songListContainer::-webkit-scrollbar-track { background: #fff0; }
    .songListContainer::-webkit-scrollbar-thumb { background: #ffe222; border-radius: 0.5em; }
    .songListContainer::-webkit-scrollbar-thumb:hover { background: white; }
    .songListContainer::-webkit-scrollbar-corner { background: #0000; }

    .song
    {
        display: flex;
        align-items: center;
        justify-content: space-between;

        width: 100%;
    }
    .song:hover 
    {
        cursor: pointer; 
        color: #ffe222; 
    }
    .currentSong
    {
        color: #ffe222;
        font-weight: bold;
    }
    .songNumber { margin-right: 15px; }
    `;
    document.getElementsByTagName('head')[0].appendChild(style);
}


function playTrack(station, trackIndex) {
    // playTrack is just an alias for forceTrack that plays the track at the given index
    let stationTracks = getStationTracks(station);
    let trackName = stationTracks[trackIndex];

    forceTrack(station, trackName);
}


function getStationDisplayName(station) {
    let stationDisplayName = stationNames[station];
    if (!stationDisplayName || stationDisplayName == "undefined") {
        stationDisplayName = "some Station";
    }
    return stationDisplayName;
}


function getCurrentStation() {
    let graffitiSoul = document.getElementById("graffitiSoul");

    let src = graffitiSoul.src;
    let station = src.split("/")[5];

    return station;
}

function getStationTracks(station) {
    let stationTracks = window[`${station}_tracks`];

    return stationTracks;
}

function getCurrentTrack() {
    let programInformationText = document.getElementById("programInformationText");
    let currentTrack = programInformationText.innerHTML;

    return currentTrack;
}

function getTrackIndex(station, track) {
    let stationTracks = getStationTracks(station);

    let trackIndex = stationTracks.indexOf(track);

    return trackIndex;
}