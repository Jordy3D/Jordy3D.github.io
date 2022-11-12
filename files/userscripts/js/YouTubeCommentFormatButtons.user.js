// ==UserScript==
// @name         YouTube Comment Format Buttons
// @namespace    http://tampermonkey.net/
// @version      0.2
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

//#region Document click detection
$(document.body).on('click', 'button', function() {
    if(!$(this).parent().is("yt-button-shape")) return; // Returns if not a YouTube button

    var replyContainer = (this).closest('ytd-comment-action-buttons-renderer');

    if(!replyContainer) return; // If it's not found
    if(replyContainer.children.length < 1) return; // If it has no children

    if(replyContainer.children[1].id == "reply-dialog") // If the container contains the right child
    {
        findCommentFooter(replyContainer);
    }
});

$(document.body).on('click', 'ytd-comment-simplebox-renderer', function() {
    var commentContainer = (this).closest('#simple-box');
    sleep(50).then(() => { // We need to wait juuuuuuust a little for the rest of the comment box to spawn before continuing
        findCommentFooter(commentContainer);
    });
});
//#endregion

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

//#region Sorting and Spawning
function findCommentFooter(commentContainer)
{
    /// Finds the footer for the comment box and stops repeat spawns
    var spawnPoint = commentContainer.querySelector(".ytd-commentbox#footer");
    if(!$(spawnPoint).hasClass("got-baned"))
    {
        $(spawnPoint).addClass("got-baned");
        spawnButtons(spawnPoint);
    }
}

function spawnButtons(commentbox){
    // Creates the button container and controls the spawning of buttons
    console.log("Spawning buttons...")

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
//#endregion

//# Formatting
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
        //if(str.charAt(0) === mdChar && str.charAt(str.length - 1) === mdChar)
        //{
        //    replacement = str.replaceAll(mdChar, '')
        //}
        //else
        //{
        //    replacement = `${mdChar}${sel}${mdChar}`
        //}

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




