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

function loadFile() {
    var source = document.getElementById("source");
    // remove classes from the input
    source.className = "";

    // download the .txt file from the url given in the input
    var url = source.value;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // store the content of the .txt file in a variable
            textContent = this.responseText;

            // give the input a green border to indicate that the file was loaded
            source.className = "loaded";
        }
        // if load failed
        else if (this.readyState == 4 && this.status != 200) {
            // give the input a red border to indicate that the file was not loaded
            source.className = "failed";
        }
        else
        {
            // give the input a yellow border to indicate that the file is loading
            source.className = "loading";
        } 
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}

function search() {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            var search = document.getElementById("search").value.toLowerCase();
            var content = document.getElementById("content");

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
                    var link = document.createElement("a");
                    link.href = line;
                    // display the line as the link text, split at &dn=
                    line = line.split("&dn=")[1];
                    link.innerHTML = line;
                    link.target = "_blank";
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
    // clear the div
    document.getElementById("content").innerHTML = "";

    var loading = document.getElementById("loading");
    var loaded = document.getElementById("loaded");
    loading.removeAttribute("hide");
    loaded.setAttribute("hide", "");
    loading.innerHTML = "Loading...";

    var count = 0;
    // asynchronously search the text
    search().then(function (result) {
        console.log("Number of lines: " + result);
        count = result;

        loading.setAttribute("hide", "");
        loaded.removeAttribute("hide");
        loaded.innerHTML = "Loaded " + count + " results";
    }).catch(function (error) {
        console.error("An error occurred: " + error);
    });
}