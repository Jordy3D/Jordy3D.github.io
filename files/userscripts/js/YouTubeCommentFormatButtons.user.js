// ==UserScript==
// @name         YouTube Comment Format Buttons
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  YouTube comments support simple Markdown. This supports you.
// @author       Bane
// @match        https://www.youtube.com/watch?v=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @require      http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        GM_addStyle
// ==/UserScript==


// Load Material Icons for use in the buttons
console.log("Trying to load Material Icons into site...")
var link = document.createElement('link');
link.type = 'text/css';
link.rel = 'stylesheet';
link.href = "https://fonts.googleapis.com/icon?family=Material+Icons+Outlined"
document.getElementsByTagName('head')[0].appendChild(link);

// Add CSS for buttons
GM_addStyle (`
    #bane_style_holder
    {
      border-radius: 100px;
      border: 1px solid #f1f1f1;

      display: flex;
    }

    #bane_style_holder button
    {
      background: #0f0f0f;
      color: #f1f1f1;

      width:  25px;

      display: flex;
      justify-content: center;
      align-items: center;
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
` );



// Wait for the chat box to be opened up before doing anything
waitForKeyElements (".ytd-commentbox#footer", spawnButtons)


function spawnButtons(){
    // Creates button container and controls button spawning
    console.log("Spawning buttons...")

    var commentbox = document.querySelector(".ytd-commentbox#footer");

    var style_holder = document.createElement("div")
    style_holder.id = "bane_style_holder"
    var spawned_holder = commentbox.insertBefore(style_holder, commentbox.children[1])

    spawnButton("format_bold", "bane_style_bold", "*", spawned_holder)
    spawnButton("format_italic", "bane_style_italics", "_", spawned_holder)
    spawnButton("strikethrough_s", "bane_style_strikethrough", "-", spawned_holder)
}


function spawnButton (inner, id, styletext, parent) {
    // Actually spawns the buttons and their text, with support for Material Icons
    var btn = document.createElement("button");
    var btn_txt = document.createElement("span");
    btn.type = "button"

    console.log("Spawning " + id + " button...")

    var spawned = parent.appendChild(btn);
    var spawned_txt = spawned.appendChild(btn_txt);
    spawned.id = id;
    spawned_txt.innerHTML = inner;
    spawned_txt.className = "material-icons-outlined";
    spawned.onclick = function() {
        surroundSelectedText(styletext);
    }

}


function surroundSelectedText(mdChar) {
    /// Thank you, https://stackoverflow.com/a/3997896
    // Finds the text that is selected on the screen, surrounds it with the markdown character, then replaces it
    var chatbox = document.querySelector("#contenteditable-root.yt-formatted-string")

    var sel, range;

    sel = window.getSelection();
    if(sel.baseNode.parentNode.id != "contenteditable-root")
    {
        console.log("Selected text not in chat box.")
        return;
    }

    if (sel) {
        var str = sel.toString()

        var replacement = ""
        if(str.charAt(0) === mdChar && str.charAt(str.length - 1) === mdChar)
        {
            replacement = str.replaceAll(mdChar, '')
        }
        else
        {
            replacement = `${mdChar}${sel}${mdChar}`
        }

        //mdChar = `${mdChar}${sel}${mdChar}`
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




