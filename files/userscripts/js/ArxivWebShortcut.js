// ==UserScript==
// @name         ArxivWebShortcut
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Add a shortcut to the web version of an arxiv paper at ar5iv.org
// @author       Bane
// @match        https://arxiv.org/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=arxiv.org
// @grant        none
// ==/UserScript==

// find the .extra-services element
var extraServices = document.getElementsByClassName("extra-services")[0];

// if it exists
if (extraServices) {
    console.log("Found extra-services element, adding link");

    var newElement = document.createElement("div");
    newElement.classList.add("bane");
    newElement.classList.add("extra-ref-cite");
    newElement.style.borderTop = "medium solid #ddd";
    
    // add a heading
    var newHeading = document.createElement("h3");
    newHeading.innerHTML = "Bane's Bonuses";

    newHeading.style.fontWeight = "bold";
    newHeading.style.fontSize = "140%";

    newElement.appendChild(newHeading);

        // append this image to before the heading https://github.com/Jordy3D/Jordy3D.github.io/raw/master/files/logo.ico, inline with it
        var newImg = document.createElement("a");
        // set link to jordy3d.github.io
        newImg.href = "https://jordy3d.github.io";
        // set image
        newImg.style.backgroundImage = "url(https://github.com/Jordy3D/Jordy3D.github.io/raw/master/files/logo.ico)";

        newImg.style.width = "1em";
        newImg.style.height = "1em";
        newImg.style.marginRight = "5px";
        newImg.style.verticalAlign = "middle";
        newImg.style.borderRadius = "13%";

        newImg.style.backgroundSize = "contain";
        newImg.style.backgroundRepeat = "no-repeat";
        newImg.style.backgroundPosition = "center";

        newImg.style.display = "inline-block";
          
        // append as first child
        newHeading.insertBefore(newImg, newHeading.firstChild);

    // add the link
    var newA = document.createElement("a");
    newA.classList.add("bane-link");
    newA.innerHTML = "Web version";
    newA.style.fontSize = "16px";

    var newURL = window.location.href.replace("arxiv.org", "ar5iv.org");
    newA.href = newURL;

    // add tooltip to the link
    var newSpan = document.createElement("span");
    newSpan.classList.add("tooltiptext");
    newSpan.innerHTML = "Open the web version of this paper at ar5iv.org";

    newA.appendChild(newSpan);

    newElement.appendChild(newA);

    extraServices.appendChild(newElement);
}
else
{
    console.log("Could not find extra-services element");
}

// add css for tooltip
var newStyle = document.createElement("style");
newStyle.innerHTML = `
.bane-link {
    position: relative;
    display: inline-block;
}

.bane-link .tooltiptext {
    visibility: hidden;
    width: 120px;
    background-color: black;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    margin-left: -60px;
    opacity: 0;
    transition: opacity 0.3s;
}

.bane-link .tooltiptext::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: black transparent transparent transparent;
}

.bane-link:hover .tooltiptext {
    visibility: visible;
    opacity: 1;
}
`;

document.head.appendChild(newStyle);