// === GLOBAL VARIABLES ===

var textContent = "";

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

// === MAIN FUNCTIONS ===
// on load, set contentDiv to the div with id "content"
window.onload = function () {
    contentDiv = document.getElementById("content");
    statusDiv = document.getElementById("status");
}

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
        // store the content of the .txt file in a variable
        textContent = e.target.result;

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

function search() {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            var search = document.getElementById("search").value.toLowerCase();
            var content = contentDiv;

            // if the search term is empty, display all lines
            if (search == "") {
                var lines = textContent.split("\n");
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];

                    var isLink = false;

                    // if the line matches a link type, make it a link
                    for (var type in linkTypes)
                        if (line.indexOf(type) != -1)
                            isLink = true;

                    if (isLink) {
                        var link = document.createElement("a");
                        link.href = line;

                        if (type == "magnet")
                            line = line.split("&dn=")[1];

                        link.innerHTML = line;
                        content.appendChild(link);
                        content.appendChild(document.createElement("br"));
                    } else {
                        // it's not a link, so just display it as text
                        var text = document.createElement("p");
                        text.innerHTML = line;
                        content.appendChild(text);
                    }
                }
                // resolve the promise with the number of lines
                resolve(lines.length);
            } else {
                var searchTerms = search.split(" ");

                var txt = textContent;

                var lines = txt.split("\n");
                // create an array to store the lines that contain the search term
                var found = [];
                // loop through the lines
                for (var i = 0; i < lines.length; i++) {
                    // if the line contains all of the search terms, add it to the array
                    var line = lines[i].toLowerCase();

                    var contains = true;
                    for (var j = 0; j < searchTerms.length; j++)
                        if (line.indexOf(searchTerms[j]) == -1)
                            contains = false;

                    if (contains)
                        found.push(lines[i]);
                }
                // display the lines that contain the search term, each as links
                for (var i = 0; i < found.length; i++) {
                    var line = found[i];

                    var link = createLink(line);
                    content.appendChild(link);
                    content.appendChild(document.createElement("br"));
                }

                // give the input a green border to indicate that the search was completed
                document.getElementById("search").className = "loaded";

                // resolve the promise with the number of lines that contain the search term
                resolve(found.length);
            }
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

// === HELPER FUNCTIONS ===

function statusMessage(message) {
    statusDiv.removeAttribute("hide");
    statusDiv.innerHTML = message;
}


function clearContent() {
    contentDiv.innerHTML = "";
    statusDiv.setAttribute("hide", "");
}


function createLink(line) {
    var link = document.createElement("a");
    link.href = line;
    // display the line as the link text, split at &dn=
    line = line.split("&dn=")[1];
    link.innerHTML = line;
    link.target = "_blank";
    return link;
}