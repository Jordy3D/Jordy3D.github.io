// ==UserScript==
// @name         JetSetRadio.live Plus
// @namespace    http://tampermonkey.net/
// @version      0.2.5
// @description  JetSetRadio.live, but more
// @author       You
// @match        https://jetsetradio.live/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=jetsetradio.live
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // UI Changes
    addVolumeSlider();

    // Menu Changes
    addMenuCSS();
    addMenuButton("https://github.com/Jordy3D/Jordy3D.github.io/raw/master/files/logo.ico", test);
})();

// periodically refresh songlist
setInterval(function () {
    // try to refresh songlist, if it fails, don't do anything
    try {
        // if songlist exists and isn't being hovered over, refresh it
        let songList = document.getElementById("songList");
        if ((songList && !document.querySelector("#songList:hover")) || !songList)
        {
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
}

function drawSongList() {
    // if a songlist already exists, remove it
    if (document.getElementById("songList") != null) {
        document.getElementById("songList").remove();
    }

    let station = getCurrentStation();
    let stationTracks = getStationTracks(station);

    // create songlist div
    let songList = document.createElement("div");
    songList.id = "songList";

    // add title to songlist div
    let songListTitle = document.createElement("div");
    songListTitle.classList.add("songListTitle");
    songListTitle.innerHTML = "Song List";
    songList.appendChild(songListTitle);

    for (let i = 0; i < stationTracks.length; i++) {
        let song = document.createElement("div");
        song.classList.add("song");

        let songNumber = document.createElement("div");
        songNumber.classList.add("songNumber");
        songNumber.innerHTML = i + 1;

        let songName = document.createElement("div");
        songName.classList.add("songName");
        songName.innerHTML = stationTracks[i];

        song.appendChild(songNumber);
        song.appendChild(songName);

        songList.appendChild(song);
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

    #songList::-webkit-scrollbar { width: 10px; }
    #songList::-webkit-scrollbar-track { background: #fff0; }
    #songList::-webkit-scrollbar-thumb { background: #ffe222; border-radius: 0.5em; }
    #songList::-webkit-scrollbar-thumb:hover { background: white; }
    #songList::-webkit-scrollbar-corner { background: #0000; }

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