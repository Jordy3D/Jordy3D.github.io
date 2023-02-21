// ==UserScript==
// @name         Jellyfin Plus
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Adds features to Jellyfin Web UI
// @author       Bane
// @match        https://www.youtube.com/watch*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        none
// ==/UserScript==


// ==================================
// ===== Settings and Variables ===============
// ======================================================

var filterNames = ["brightness", "contrast", "grayscale", "hue-rotate", "blur", "saturate"];
var filterLabels = ["Brightness", "Contrast", "Grayscale", "Hue Rotate", "Blur", "Saturate"];
var filterRanges = [[0, 2, 0.05, 1], [0, 2, 0.05, 1], [0, 1, 0.05, 0], [-180, 180, 1, 0], [0, 20, 0.1, 0], [0, 2, 0.05, 1]];

var boostMultiplier = 2;

var element = null;



// ============================
// ===== Update and Check ===============
// ================================================

setInterval(function() {
    // if the URL has changed
    if (window.location.href != window.lastUrl) {
        // update the last URL
        window.lastUrl = window.location.href;
        // if the URL contains /web/index.html#!/video
        if (window.location.href.includes("/web/index.html#!/video")) 
        {
            createPlusElements();
        }
        else 
        {
            // hide the filter menu
            var filterMenu = document.getElementsByClassName("filterMenu")[0];
            if (filterMenu) 
                filterMenu.classList.remove("show");
        }
    }
}, 1000);


function createPlusElements()
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


    waitForKeyElements(".videoOsdBottom", function() {
        element = document.getElementsByClassName("htmlvideoplayer")[0];

        var videoOsdBottom = document.getElementsByClassName("videoOsdBottom")[0];
        createFilterButton(videoOsdBottom);
        createBoostButton(videoOsdBottom);

    });
}



// ===================
// ===== Filters ===============
// =======================================

function createFilterButton(videoOsdBottom) {

    var buttonsContainer = videoOsdBottom.getElementsByClassName("buttons")[0];
    if (!buttonsContainer)
    {
        console.log("buttons container not found");
        return;
    }

    // if btnFilter already exists, return
    if (document.getElementsByClassName("btnFilter")[0])
        return;

    // add a button with the class "btnFilter", "autosize", "paper-icon-button-light", title "Filters" and aria-label "Filters"
    var newButton = document.createElement("button");
    newButton.classList.add("btnFilter");
    newButton.classList.add("autosize");
    newButton.classList.add("paper-icon-button-light");
    newButton.classList.add("material-icons");
    newButton.title = "Filters";
    newButton.setAttribute("aria-label", "Filters");

    // add a filter icon from Material Icons
    newButton.innerHTML = 'filter_b_and_w';

    // add the button to the container
    buttonsContainer.appendChild(newButton);

    // create filter menu
    var filterMenu = document.createElement("div");
    filterMenu.classList.add("filterMenu");
    // will add css later
    // add header to filter menu
    var filterMenuHeader = document.createElement("div");
    filterMenuHeader.classList.add("filterMenuHeader");
    filterMenuHeader.innerHTML = "Filters";
    filterMenu.appendChild(filterMenuHeader);

    // add an event listener to the button
    newButton.addEventListener("click", function() {
        // print "Filters button clicked" to the console
        //console.log("Filters button clicked");
        // toggle the filter menu by adding/removing the "show" class
        filterMenu.classList.toggle("show");
    });

    // add a button to reset all filters
    var resetFiltersButton = document.createElement("button");
    resetFiltersButton.classList.add("resetFiltersButton");
    resetFiltersButton.innerHTML = "Reset Filters";
    filterMenu.appendChild(resetFiltersButton);

    // add filter container to filter menu
    var filterContainer = document.createElement("div");
    filterContainer.classList.add("filterContainer");
    filterMenu.appendChild(filterContainer);

    // create 6 filter sliders, each with a label and a slider and add them to the filter container
    // the filter sliders are: brightness, contrast, grayscale, hue-rotate, blur, saturate

    // the range for brightness, saturation and contrast is 0 to 2, with a step of 0.05 and a default value of 1
    // the range for hue-rotate is -180 to 180, with a step of 1 and a default value of 0
    // the range for blur is 0 to 20, with a step of 0.1 and a default value of 0
    // the range for grayscale is 0 to 1, with a step of 0.05 and a default value of 0

    // each filter should just be a div with a label and a slider
    for (var i = 0; i < filterNames.length; i++) {
        let filterName = filterNames[i];
        let filterLabel = filterLabels[i];
        let filterRange = filterRanges[i];

        var filterDiv = document.createElement("div");
        filterDiv.classList.add("filterDiv");
        filterDiv.classList.add("filter" + filterName);
        filterDiv.innerHTML = filterLabel;
        filterContainer.appendChild(filterDiv);

        var filterSlider = document.createElement("input");
        filterSlider.type = "range";
        filterSlider.classList.add("filterSlider");
        filterSlider.classList.add("filter" + filterName);
        filterSlider.min = filterRange[0];
        filterSlider.max = filterRange[1];
        filterSlider.step = filterRange[2];
        filterSlider.value = filterRange[3];

        // set default value of filter
        if (filterName == "hue-rotate") 
            document.documentElement.style.setProperty("--" + filterName, filterRange[3] + "deg");
        else if (filterName == "blur")
            document.documentElement.style.setProperty("--" + filterName, filterRange[3] + "px");
        else
            document.documentElement.style.setProperty("--" + filterName, filterRange[3]);

        //console.log(filterName + " slider created");
        // add event listener to slider
        filterSlider.addEventListener("input", function() {
            // print "filtername slider changed" to the console
            //console.log(filterName + " slider changed");
            if (filterName == "hue-rotate")
                document.documentElement.style.setProperty("--" + filterName, this.value + "deg");
            else if (filterName == "blur")
                document.documentElement.style.setProperty("--" + filterName, this.value + "px");
            else
                document.documentElement.style.setProperty("--" + filterName, this.value);
        });

        filterDiv.appendChild(filterSlider);
    }

    // add filter menu to the body
    document.body.appendChild(filterMenu);

    // add an event listener to the reset filters button
    resetFiltersButton.addEventListener("click", function() {
        // print "Reset filters button clicked" to the console
        //console.log("Reset filters button clicked");
        // reset all filters
        var filterSliders = document.getElementsByClassName("filterSlider");
        for (var i = 0; i < filterSliders.length; i++) {
            // set the value of the slider to the default value
            filterSliders[i].value = filterRanges[i][3];
            // set the css variable in :root to the default value
            document.documentElement.style.setProperty("--" + filterNames[i], filterRanges[i][3]);
        }
    });

    // add css
    var css = document.createElement('style');
    css.type = 'text/css';
    css.innerHTML = `
    .root {
        --brightness: 1;
        --contrast: 1;
        --grayscale: 0;
        --hue-rotate: 0;
        --blur: 0;
        --saturate: 1;
    }

    .htmlvideoplayer
    {
        filter: brightness(var(--brightness)) saturate(var(--saturate)) blur(var(--blur)) contrast(var(--contrast)) grayscale(var(--grayscale)) hue-rotate(var(--hue-rotate));
    }

    .filterMenu {
        position: absolute;
        bottom: 80px;
        right: 20px;
        width: fit-content;
        height: fit-content;
        max-width: 300px;

        background-color: #141414;
        color: #ffffff;

        padding: 5px;

        box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.75);

        z-index: 100;

        display: none;

        transition: 0.5s;
    }

    .filterMenu.show {
        display: block;
    }

    .filterMenuHeader {
        font-size: 26px;
    }

    .filterContainer {
        display: flex;
        flex-wrap: nowrap;
        flex-direction: column;
        align-items: flex-end;
    }

    .bane-button {    
        margin: 0;
        font-size: 25px;
        padding: 10px;
    }
    `;
    document.body.appendChild(css);
}



// =======================
// ===== Audio Boost ===============
// ===========================================

function createBoostButton(videoOsdBottom) {
    // if the boost button already exists, don't create it again
    if (document.getElementsByClassName("boostButton").length > 0)
        return;

    // get the .volumeButtons div in order to add the boost button to it at the end
    var volumeButtons = videoOsdBottom.getElementsByClassName("volumeButtons")[0];

    // create boost button
    var boostButton = document.createElement("button");
    boostButton.classList.add("boostButton");
    boostButton.classList.add("material-icons");
    boostButton.classList.add("paper-icon-button-light");
    boostButton.classList.add("bane-button");
    // set button text to a lightning bolt
    boostButton.innerHTML = "flash_off";
    boostButton.title = "Audio boost (off)";

    // add a 5px margin to the left of the button
    boostButton.style.marginLeft = "10px";

    // add button to volumeButtons div
    volumeButtons.appendChild(boostButton);

    // create audio context and store it to change the gain later
    node = createAudioContext();
    
    // add an event listener to the button
    boostButton.addEventListener("click", function() {
        // toggle the boost class on the htmlvideoplayer
        element.classList.toggle("boost");

        var boost_state = element.classList.contains("boost");
        setGain(node, boost_state);
        boostButton.innerHTML = boost_state ? "flash_on" : "flash_off";
        boostButton.title = boost_state ? "Audio boost (on)" : "Audio boost (off)";
    });
}


function createAudioContext()
{
    /// Based on https://stackoverflow.com/a/43794379 ///

    // create an audio context and hook up the video element as the source
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var source = audioCtx.createMediaElementSource(element);

    // create a gain node
    var gainNode = audioCtx.createGain();
    gainNode.gain.value = boostMultiplier;
    source.connect(gainNode);

    // connect the gain node to an output destination
    gainNode.connect(audioCtx.destination);

    return gainNode;
}

function setGain(node, state)
{
    node.gain.value = state ? boostMultiplier : 1;
}