// === GLOBAL VARIABLES ===

var textContent = [];
var appendContent = [];

var linkTypes = {
    "http": "http://",
    "https": "https://",
    "www": "https://www.",
    "ftp": "ftp://",
    "ftps": "ftps://",
    "file": "file://",
    "magnet": "magnet:?",
}

var contentDiv = null;
var statusDiv = null;
var appendDiv = null;

// === MAIN FUNCTIONS ===
window.onload = function () {
    contentDiv = document.getElementById("content");
    statusDiv = document.getElementById("status");
    appendDiv = document.getElementsByClassName("append")[0];
}

// if the user presses B, A, N, E, show the append div
var appendCount = 0;
var keySequence = ["b", "a", "n", "e"];
document.addEventListener("keydown", function (event) {
    if (event.key == keySequence[appendCount]) {
        appendCount++;
        if (appendCount == keySequence.length) {
            appendDiv.classList.toggle("hide");
            appendCount = 0;
        }
    }
    else {
        appendCount = 0;
    }
});

//#region Source
function loadURL() {
    var source = document.getElementById("sourceURL");
    // remove classes from the input
    source.className = "";

    clearContent();

    // download the .txt file from the url given in the input
    var url = source.value;

    // if there is no url, give the input a red border to indicate that the file was not loaded
    if (url == "") {
        source.className = "failed";
        return;
    }

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // store the content of the .txt file in a variable
            textContent = this.responseText;

            // give the input a green border to indicate that the file was loaded
            source.className = "loaded";
            statusMessage("File loaded");
        }
        // if load failed
        else if (this.readyState == 4 && this.status != 200) {
            // give the input a red border to indicate that the file was not loaded
            source.className = "failed";
        }
        else {
            // give the input a yellow border to indicate that the file is loading
            source.className = "loading";
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}

function loadFile() {
    var source = document.getElementById("sourceFile");
    // remove classes from the input
    source.className = "";

    clearContent();

    // get the file from the input
    var file = source.files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
        // store each line of the file in the textContent array
        let text = e.target.result;
        if (text != "") {
            populateTextContent(text);
            source.className = "loaded";
        }

        // give the input a green border to indicate that the file was loaded
        source.className = "loaded";
        statusMessage("File loaded");
    };
    reader.onerror = function (e) {
        // give the input a red border to indicate that the file was not loaded
        source.className = "failed";
    };
    reader.readAsText(file);
}
//#endregion

//#region Append
function loadAppendText() {
    appendContent = [];
    // get #appendText, which is a child of the append div
    var source = appendDiv.querySelector("#appendText");
    var text = source.value;
    if (text != "") {
        // if text is a url, download the file
        if (text.indexOf("http") != -1) {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    // store the content of the .txt file in a variable
                    text = this.responseText;
                }
                // if load failed
                if (this.readyState == 4 && this.status != 200) {
                    source.className = "failed";
                }
            };
            xhttp.open("GET", text, false);
            xhttp.send();
        }
        
        populateAppend(text);
        source.className = "loaded";
    }
}

function loadAppendFile() {
    appendContent = [];
    // get #appendFile, which is a child of the append div
    var source = appendDiv.querySelector("#appendFile");

    var file = source.files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
        // store each line of the file in the textContent array
        let text = e.target.result;
        if (text != "") {
            populateAppend(text);
            source.className = "loaded";
        }
    };
    reader.onerror = function (e) {
        source.className = "failed";
    };
    reader.readAsText(file);
}
//#endregion

//#region Search
function search() {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            var search = document.getElementById("search").value.toLowerCase();
            var content = contentDiv;

            var searchTerms = "";
            var displayAll = false;

            if (search != "")
                searchTerms = search.split(" ");
            else
                displayAll = true;

            var lines = textContent;

            // create an array to store the lines that contain the search term
            var found = [];
            // loop through the lines
            for (var i = 0; i < lines.length; i++) {
                // if the line contains all of the search terms, add it to the array
                var line = lines[i].toLowerCase();

                if (displayAll)
                    found.push(lines[i]);
                else {
                    var contains = true;
                    for (var j = 0; j < searchTerms.length; j++)
                        if (line.indexOf(searchTerms[j]) == -1)
                            contains = false;

                    if (contains)
                        found.push(lines[i]);
                }
            }

            for (var i = 0; i < found.length; i++) {
                var line = found[i];

                var isLink = false;

                var foundType = "";

                // if the line matches a link type, make it a link
                for (var type in linkTypes) {
                    if (line.indexOf(type) != -1) {
                        isLink = true;
                        foundType = type;
                    }
                }

                if (isLink) {
                    var link = createLink(line, type);

                    content.appendChild(link);
                    content.appendChild(document.createElement("br"));
                } else {
                    // it's not a link, so just display it as text
                    var text = document.createElement("p");
                    text.innerHTML = line;
                    content.appendChild(text);
                }
            }

            resolve(found.length);
        }, 0);
    });
}

function find() {
    // if the text has not been loaded, display an error message
    if (textContent == "") {
        contentDiv.innerHTML += "Please load a file first.";
        return;
    }

    // clear the div
    contentDiv.innerHTML = "";

    statusMessage("Searching...");

    var count = 0;
    // asynchronously search the text
    search().then(function (result) {
        console.log("Number of lines: " + result);
        count = result;

        statusMessage("Loaded " + count + " results");
    }).catch(function (error) {
        console.error("An error occurred: " + error);
    });
}
//#endregion

// === HELPER FUNCTIONS ===

function statusMessage(message) {
    statusDiv.removeAttribute("hide");
    statusDiv.innerHTML = message;
}

function clearContent() {
    contentDiv.innerHTML = "";
    statusDiv.setAttribute("hide", "");
}

function createLink(line, type) {
    var link = document.createElement("a");

    var url = line;

    // if there's things to append, append them
    if (appendContent.length > 0) {
        for (var i = 0; i < appendContent.length; i++) {
            // for each line of the appendDiv, add it to the end of the textContent line 
            if (type == "magnet")
            {
                let tracker = appendContent[i];
                // url encode the tracker
                tracker = encodeURIComponent(tracker);
                url += `&$tr=${tracker}`;
            }
            else
                url += appendContent[i];
        }
    }

    link.href = url;

    if (type == "magnet")
        line = line.split("&dn=")[1];

    link.innerHTML = line;
    link.target = "_blank";
    return link;
} 

function populateTextContent(text)
{
    let results = text.split("\n");
    for (var i = 0; i < results.length; i++)
        if (results[i] != "" && results[i] != "\n")
            textContent.push(results[i]);
}

function populateAppend(text)
{
    let results = text.split("\n");
    for (var i = 0; i < results.length; i++)
        if (results[i] != "" && results[i] != "\n")
            appendContent.push(results[i]);
}