// ==UserScript==
// @name         Chrome Web Store Plus
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Changes to the Chrome Web Store to make it more usable
// @author       You
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        none
// ==/UserScript==

const escapeHTMLPolicy = trustedTypes.createPolicy("ChromeWebStorePlus", {
    createHTML: (to_escape) => to_escape
});


// find div with role=dialog
let dialog = document.querySelector("div[role=dialog]");
if (dialog) {
    console.log("Found Dialog");
} else {
    console.log("Dialog Not Found");
    // return;
}


// progressively start from document and get the parents
let curr = document;
while (curr.parentNode != null) {
    curr = curr.parentNode;
    console.log("Current Parent: " + curr.nodeName);
}


console.log("Making Reviews Clearer");

// create style using trusted types
let style = document.createElement('style');
style.id = 'ChromeWebStorePlus';
style.type = 'text/css';
style.innerHTML = escapeHTMLPolicy.createHTML(`
    .rsw-unstarred {
        opacity: 0.4;
    }
`);

console.log("Adding Style Change to Document");
document.getElementsByTagName('head')[0].appendChild(style);

// verify that the style was added
if (document.getElementById('ChromeWebStorePlus')) {
    console.log("Style Change Added");
} else {
    console.log("Style Change Failed");
}