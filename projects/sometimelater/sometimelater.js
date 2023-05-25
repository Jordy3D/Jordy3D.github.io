
var backgroundCount = 18;

var fontSize = 12;



var variables = getURLvariables();
var timecard = document.getElementById("timecard");

replaceTimeCard();
setBackground();
setTextColour();


function getURLvariables() {
    // get the URL variables
    let url = window.location.href;
    // if ? is not present, then return an empty object
    if (url.indexOf("?") == -1) return {};
    let variables = url.split("?")[1];
    // if & is not present, then return the variable as an object
    if (variables.indexOf("&") == -1) return { [variables.split("=")[0]]: variables.split("=")[1] };
    let variableArray = variables.split("&");
    let variableObject = {};

    // create an object with the variables
    for (let i = 0; i < variableArray.length; i++) {
        let variable = variableArray[i].split("=");
        variableObject[variable[0]] = variable[1];
    }

    return variableObject;
}


function replaceTimeCard() {
    // if the URL contains ?timecard=, then replace the timecard with the one specified in the URL
    if (variables.timecard) {
        let timecardText = variables.timecard;

        // replace URL encoded characters
        timecardText = decodeURIComponent(timecardText);
        timecard.innerText = timecardText;
    }
}

function setBackground() {
    // if the URL contains ?background=, then replace the background with the one specified in the URL
    if (variables.background) {
        let background = variables.background;
        document.body.style.backgroundImage = "url('sometimelater/bgs/" + background + ".webp')";
    }
    else
    {
        // grab a random background from the backgrounds folder, starting from 1
        let background = Math.floor(Math.random() * backgroundCount) + 1;
        // turn the background into a string and pad it with 0s to make it 3 digits long
        background = background.toString().padStart(3, "0");
        variables.background = background;
        document.body.style.backgroundImage = "url('sometimelater/bgs/" + background + ".webp')";        
    }
}

function setTextColour() {
    // if the URL contains ?textcolour=, then replace the text colour with the one specified in the URL
    if (variables.textcolour) {
        let textColour = variables.textcolour;
        document.body.style.color = textColour;
    }
    else {
        var img = document.createElement('img');
        img.src = "sometimelater/bgs/" + variables.background + ".webp";
        img.style.display = "none";
        document.body.appendChild(img);

        img.onload = function () {
            // get the average colour of the background image
            let rgb = getAverageRGB(img);
            console.log(rgb);
            let inv = invertRGB(rgb);

            let luminance = rgbToHSL(inv).l;
            console.log(luminance);

            timecard.style.color = rgbToHex(inv);

            // if luminance is above 0.5, then make the text drop shadow and text-stroke black
            if (luminance > 0.5) {
                let shadow = inv;
                shadow.r = Math.round(shadow.r * 0.5);
                shadow.g = Math.round(shadow.g * 0.5);
                shadow.b = Math.round(shadow.b * 0.5);
                shadow = rgbToHex(shadow);

                timecard.style.textShadow = `.1em .1em 0 ${shadow}`
                // timecard.style.WebkitTextStroke = `1px ${rgbToHex(rgb)}`;
            }

        }
    }
}

function getAverageRGB(imgEl) {
    var blockSize = 5, // only visit every 5 pixels
        defaultRGB = { r: 0, g: 0, b: 0 }, // for non-supporting envs
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data, width, height,
        i = -4,
        length,
        rgb = { r: 0, g: 0, b: 0 },
        count = 0;

    if (!context) {
        return defaultRGB;
    }

    height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

    context.drawImage(imgEl, 0, 0);

    try {
        data = context.getImageData(0, 0, width, height);
    } catch (e) {
        /* security error, img on diff domain */alert('x');
        return defaultRGB;
    }

    length = data.data.length;

    while ((i += blockSize * 4) < length) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i + 1];
        rgb.b += data.data[i + 2];
    }

    // ~~ used to floor values
    rgb.r = ~~(rgb.r / count);
    rgb.g = ~~(rgb.g / count);
    rgb.b = ~~(rgb.b / count);

    return rgb;

}

function invertRGB(rgb) {
    return { r: 255 - rgb.r, g: 255 - rgb.g, b: 255 - rgb.b };
}

function rgbToHex(rgb) {
    return "#" + componentToHex(rgb.r) + componentToHex(rgb.g) + componentToHex(rgb.b);
}

function rgbToHSL(rgb) {
    let r = rgb.r / 255;
    let g = rgb.g / 255;
    let b = rgb.b / 255;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    }
    else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max - min);

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }

        h /= 6;
    }

    return { h: h, s: s, l: l };
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}


// hotkey to save the timecard as an image
document.addEventListener("keydown", function (event) {
    // if esc is hit, unfocus the timecard
    if (event.key == "Escape")
        document.activeElement.blur();
    
    // if the timecard is focused, don't do anything
    if (document.activeElement == timecard)
        return;

    if (event.key == "s")
        saveTimecard();
});

// add scroll event listener to the document
document.addEventListener("wheel", (e) => {

    console.log(e);
    
    // if the timecard is focused
    if (document.activeElement == timecard) {
        // if scroll up, make font size bigger
        if (e.deltaY < 0)
        {
            fontSize += 0.1;
            timecard.style.fontSize = fontSize + "rem";
        }
        // if scroll down, make font size smaller
        else if (e.deltaY > 0)
        {   
            fontSize -= 0.1;
            timecard.style.fontSize = fontSize + "rem";
        }
    }
});

function saveTimecard() {
    const screenshotTarget = document.body;

    html2canvas(screenshotTarget).then((canvas) => {
        const base64image = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = base64image;
        a.download = decodeURIComponent(timecard.innerText) + ".png";
        a.click();
        a.remove();
    });
}