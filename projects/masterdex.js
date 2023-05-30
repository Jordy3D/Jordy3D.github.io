window.onscroll = function () {
    var header = document.querySelector("header");
    var sticky = header.offsetTop;

    if (window.pageYOffset > sticky)
        header.classList.add("sticky");
    else
        header.classList.remove("sticky");
};

var konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
cheatCode(konami, clearData);

var closeAllBoxes = [38, 40, 38, 40, 66, 65];
cheatCode(closeAllBoxes, function () {
    // find every box and close it
    var boxes = document.querySelectorAll(".box");
    for (var i = 0; i < boxes.length; i++)
        boxes[i].classList.add("closed");
});
var openAllBoxes = [38, 40, 38, 40, 65, 66];
cheatCode(openAllBoxes, function () {
    // find every box and open it
    var boxes = document.querySelectorAll(".box");
    for (var i = 0; i < boxes.length; i++)
        boxes[i].classList.remove("closed");
});

function cheatCode(cheat, callback) {
    var cheat_index = 0;

    document.addEventListener('keydown', function (e) {
        if (e.keyCode == cheat[cheat_index]) {
            cheat_index++;
            if (cheat_index == cheat.length) {
                cheat_index = 0;

                callback();
            }
        } else {
            cheat_index = 0;
        }
    });
}

function clearData() {
    localStorage.clear();
    location.reload();
}

var full_json = null;


// if mobile, load mobile css
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    document.querySelector("head").innerHTML += '<link rel="stylesheet" href="masterdex/mobile.css">';



loadJSON();

loadFromStorage();



function updateStats() {
    var stats = document.querySelector(".stats");

    // count the total number of pokemon 
    var total = full_json.length;
    // count the number of caught pokemon
    var caught = 0;
    for (var i = 0; i < total; i++)
        if (full_json[i].obtained)
            caught++;

    // count the total number of forms
    var total_forms = 0;
    for (var i = 0; i < total; i++)
        total_forms += pokemonVariants(full_json[i]).length || 0;

    // count the number of caught forms
    var caught_forms = 0;
    for (var i = 0; i < total; i++) {
        var variants = pokemonVariants(full_json[i]);
        for (var j = 0; j < variants.length; j++)
            if (variants[j].obtained)
                caught_forms++;
    }

    // set #primaryCaughtCount to caught, #primaryTotalCount to total, #formCaughtCount to caught_forms, #formTotalCount to total_forms
    // also do the calculations for #primaryPercentage and #formPercentage
    stats.querySelector("#primaryCaughtCount").innerHTML = caught;
    stats.querySelector("#primaryTotalCount").innerHTML = total;
    stats.querySelector("#formCaughtCount").innerHTML = caught_forms;
    stats.querySelector("#formTotalCount").innerHTML = total_forms;

    stats.querySelector("#primaryPercentage").innerHTML = Math.round(caught / total * 100) + "%";
    stats.querySelector("#formPercentage").innerHTML = Math.round(caught_forms / total_forms * 100) + "%";
}


// call updateStats() after the page loads
window.onload = updateStats;



function loadJSON() {
    fetch('masterdex/pokemon.json')
        .then(response => response.json())
        .then(json => {
            full_json = json;

            var current_box = 1;

            // ====================================
            // ===== CREATE BASE FORM SECTION ==========
            // ==============================================

            // calculate how many boxes we need
            var boxes = Math.ceil(json.length / 30);

            // create a div for each box
            for (var i = 0; i < boxes; i++)
                createBox(i + 1, "Primary");

            let pokemon_count = json.length;
            for (var i = 0; i < pokemon_count; i++) {
                current_box = Math.floor((json[i].dex_number - 1) / 30) + 1;
                createDiv(json[i], current_box);
            }

            var total_padding = 0;
            var pad = 30 - (pokemon_count % 30);

            total_padding += pad;

            // pad to the next 30
            for (var i = 0; i < pad; i++)
                createDiv(null, current_box);

            // return;

            // ====================================
            // ===== CREATE GENDER SECTION =============
            // ==============================================


            // count the number of gender forms
            let gender_count = 0;
            for (var i = 0; i < pokemon_count; i++) {
                var variants = pokemonVariants(json[i]);
                gender_count += variants.length || 0;
            }

            console.log(`Found ${gender_count} genders...`);

            // add more boxes
            var gender_boxes = Math.ceil(gender_count / 30);
            for (var i = 0; i < gender_boxes; i++)
                createBox(boxes + i + 1, "Gender");

            boxes += gender_boxes;

            let current_gender = 0;

            for (var i = 0; i < pokemon_count; i++) {
                var variants = pokemonVariants(json[i]);
                if (variants.length > 0) {
                    for (var j = 0; j < variants.length; j++) {
                        current_gender++;
                        current_box = Math.floor((pokemon_count + current_gender + total_padding - 1) / 30) + 1;

                        // console.log(`Adding gender variant ${current_gender} - ${variants[j].name} to box ${current_box}`);
                        createDiv(variants[j], current_box, true, json[i]);
                    }
                }
            }

            var complete_total = pokemon_count + gender_count + total_padding;

            // pad to the next 30
            pad = 30 - (complete_total % 30);
            for (var i = 0; i < pad; i++)
                createDiv(null, current_box);

            total_padding += pad;
            complete_total += pad;

            // ====================================
            // ===== CREATE FORME SECTION ==============
            // ==============================================

            // count the number of forme forms
            let forme_count = 0;
            for (var i = 0; i < pokemon_count; i++)
                forme_count += pokemonVariants(json[i], "forme").length || 0;

            console.log(`Found ${forme_count} formes...`);

            // add more boxes
            var forme_boxes = Math.ceil(forme_count / 30);
            for (var i = 0; i < forme_boxes; i++)
                createBox(boxes + i + 1, "Forme");

            boxes += forme_boxes;

            let current_forme = 0;

            for (var i = 0; i < pokemon_count; i++) {
                var variants = pokemonVariants(json[i], "forme");
                if (variants.length > 0) {
                    for (var j = 0; j < variants.length; j++) {
                        current_forme++;
                        current_box = Math.floor((complete_total + current_forme - 1) / 30) + 1;

                        // if variants name is undefined
                        if (variants[j].name == undefined)
                            console.log(variants[j]);


                        // console.log(`Adding forme variant ${current_forme} - ${variants[j].name} to box ${current_box}`);
                        createDiv(variants[j], current_box, true, json[i]);
                    }
                }
            }

            complete_total += forme_count;

            // pad to the next 30
            pad = 30 - (complete_total % 30);
            for (var i = 0; i < pad; i++)
                createDiv(null, current_box);

        });
}

function pokemonVariants(pokemon, type = "gender") {
    var variants = [];
    if (pokemon.forms != []) {
        for (var j = 0; j < pokemon.forms.length; j++) {
            switch (type) {
                case "gender":
                    if (pokemon.forms[j].name == "Male" || pokemon.forms[j].name == "Female")
                        variants.push(pokemon.forms[j]);
                    break;
                case "forme":
                    if (!(pokemon.forms[j].name == "Male" || pokemon.forms[j].name == "Female"))
                        variants.push(pokemon.forms[j]);
            }
        }

        if (variants.length > 0)
            return variants;
        else
            return false;
    }
}

function getPokemonDiv(pokemon) {
    // if pokemon is a string, just return the div
    if (typeof pokemon == "string")
        return document.getElementById(pokemon);

    let pokemon_name = makeID(pokemon.name);

    return document.getElementById(pokemon_name);
}

function saveToStorage() {
    // check the checkboxes for each pokemon that has been caught
    for (var i = 0; i < full_json.length; i++) {
        var pokemon_div = getPokemonDiv(full_json[i]);
        full_json[i].obtained = pokemon_div.classList.contains("caught");
    }

    localStorage.setItem("pokemon", JSON.stringify(full_json));
    full_json = JSON.parse(localStorage.getItem("pokemon"));
}

function setPokemonCaughtState(pokemon_info) {
    var pokemon = getPokemonDiv(pokemon_info);

    if (pokemon_info.obtained)
        pokemon.classList.add("caught");
    else
        pokemon.classList.remove("caught");
}

function setPokemonCaughtStateByName(pokemon_name, caught) {
    var pokemon = getPokemonDiv(pokemon_name);

    if (caught) {
        console.log(`Setting ${pokemon_name} to caught in setPokemonCaughtStateByName`);
        pokemon.classList.add("caught");
    }
    else
        pokemon.classList.remove("caught");
}

function loadFromStorage() {
    // see if all of the divs have been created
    if (full_json == null) {
        setTimeout(loadFromStorage, 100);
        return;
    }

    // load from local storage if it exists
    if (localStorage.getItem("pokemon") != null) {
        var pokemon_data = JSON.parse(localStorage.getItem("pokemon"));
        for (var i = 0; i < pokemon_data.length; i++) {
            var pkmnData = pokemon_data[i];
            console.log(pkmnData);
            updateCaughtStatusFromLoad(pkmnData);
        }

        full_json = pokemon_data;
    }
}


function updateCaughtStatusFromLoad(pokemon) {
    if (pokemon.hasOwnProperty("forms") && pokemon.forms.length > 0) {
        for (var j = 0; j < pokemon.forms.length; j++) {
            var forme = pokemon.forms[j];
            var name = forme.name;

            if (!name)
                console.log(pokemon);

            if (name)
                name = makeID(name, pokemon.name);
            else
                continue;

            setPokemonCaughtStateByName(name, forme.obtained);

            if (forme.obtained)
                console.log(`Setting ${name} to ${forme.obtained}`);
        }
    }
    else {
        setPokemonCaughtState(pokemon, pokemon.obtained);

        if (pokemon.obtained)
            console.log(`Setting ${pokemon.name} to ${pokemon.obtained}`);
    }
}



// create a div for each box
function createBox(box_number, prefix = "") {
    // the box will contain 30 pokemon

    // create the box
    var box = document.createElement("div");
    box.id = "box" + box_number;
    box.className = "box";

    // create the header
    var header = document.createElement("div");
    header.className = "box-header";
    header.innerHTML = prefix != "" ? prefix + " " + box_number : "Box " + box_number;
    box.appendChild(header);

    // add event listeners to the header to toggle the box open and closed
    header.addEventListener("click", function () {
        box.classList.toggle("closed");
    });

    document.getElementById("data").appendChild(box);
}

// create a div for each pokemon
function createDiv(pokemon, box_number, is_form = false, form_of = null) {

    if (pokemon == null) {
        // create a blank div
        var div = document.createElement("div");
        div.classList.add("pokemon");
        div.classList.add("blank");
        document.getElementById("box" + box_number).appendChild(div);
        return;
    }

    var pokemon_name = pokemon.name.replace(" ", "-");
    pokemon_name = is_form ? form_of.name.replace(" ", "-") + "-" + pokemon_name : pokemon_name;

    var div = document.createElement("div");
    if (is_form)
        div.classList.add("form");
    else
        div.classList.add("primary");

    div.id = pokemon_name;
    div.classList.add("pokemon");

    var header = document.createElement("div");
    header.classList.add("header");
    div.appendChild(header);

    // create the name
    var name = document.createElement("h2");
    name.classList.add("name");
    if (is_form)
        name.innerHTML = `${form_of.name} (${pokemon.name})`;
    else
        name.innerHTML = pokemon.name;

    header.appendChild(name);

    // create the dex number
    var dex = document.createElement("p");
    dex.classList.add("dex");
    dex.innerHTML = pokemon.dex_number || form_of.dex_number;
    header.appendChild(dex);

    // create the game requirements
    var gameSection = document.createElement("div");
    gameSection.classList.add("game")
    div.appendChild(gameSection);

    var gameLabel = document.createElement("p");
    gameLabel.innerHTML = "Source:";
    gameSection.appendChild(gameLabel);

    var game = document.createElement("ul");
    game.classList.add("title");

    for (var i = 0; i < pokemon.requirements.length; i++) {
        // try and load an image from masterdex/images and add it to the list, images are named MD_Black2.png
        let img = document.createElement("img");
        img.classList.add("game-icon");
        img.alt = pokemon.requirements[i];
        
        var game_name = pokemon.requirements[i].replace(" ", "");
        img.src = `masterdex/images/MD_${game_name}.png`;

        // if the game_name contains eevee
        if (game_name.toLowerCase().includes("eevee"))
            img.src = `masterdex/images/MD_Eevee.png`;
        else if (game_name.toLowerCase().includes("pikachu"))
            img.src = `masterdex/images/MD_Pikachu.png`;
        else if (game_name.toLowerCase().includes("arceus"))
            img.src = `masterdex/images/MD_LegendsArceus.png`;
        else if (game_name.toLowerCase().includes("xd"))
            img.src = `masterdex/images/MD_XD.png`;
        
        
        let li = document.createElement("li");

        var error = false;

        img.onerror = function () {
            img.display = "none";
            // if the image doesn't exist, just use the text
            li.innerHTML = img.alt;
            game.appendChild(li);
            error = true;
        }

        if (error)
            continue;

        img.onload = function () {
            // if the image exists, add it to the list
            li.appendChild(img);
            game.appendChild(li);

            // add tooltip to the image
            var tooltip = document.createElement("span");
            tooltip.classList.add("tooltip");
            tooltip.innerHTML = img.alt;
            li.appendChild(tooltip);
        }
    }
    gameSection.appendChild(game);

    // create the notes
    var notes = document.createElement("p");
    notes.classList.add("notes");
    notes.innerHTML = pokemon.notes;
    div.appendChild(notes);

    // if pokemon is an outlier, add the outlier class
    if (pokemon.outlier)
        div.classList.add("outlier");

    // create the toggle
    div.addEventListener("click", function (event) {
        if (is_form)
            toggleCaughtForm(pokemon, form_of);
        else
            toggleCaught(pokemon);

        updateStats();
    });

    div.addEventListener("contextmenu", function (event) {
        event.preventDefault();
    });

    // add the div to the box
    document.getElementById("box" + box_number).appendChild(div);
}

function toggleCaught(pokemon) {
    var name = pokemon.name;
    name = name.replace(" ", "-");
    var div = document.getElementById(name);
    div.classList.toggle("caught");

    // toggle the status of the pokemon in the json
    for (var i = 0; i < full_json.length; i++) {
        if (full_json[i].name == name)
            full_json[i].obtained = !full_json[i].obtained;
    }
}

function toggleCaughtForm(forme, form_of) {
    var name = forme.name;
    name = name.replace(" ", "-");
    name = form_of.name.replace(" ", "-") + "-" + name;

    console.log(`toggling ${name}`);

    var div = document.getElementById(name);
    div.classList.toggle("caught");

    // toggle the status of the forme in the json
    for (var i = 0; i < full_json.length; i++) {
        if (full_json[i].name == form_of.name) {
            for (var j = 0; j < full_json[i].forms.length; j++) {
                console.log(`comparing ${full_json[i].forms[j].name} to ${forme.name}`);

                if (full_json[i].forms[j].name == forme.name)
                    full_json[i].forms[j].obtained = !full_json[i].forms[j].obtained;
            }
        }
    }
}

function filter() {
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("filter");
    filter = input.value.toLowerCase();

    // if the filter is empty, show all pokemon
    if (filter == "") {
        var divs = document.getElementsByClassName("pokemon");
        for (i = 0; i < divs.length; i++) {
            divs[i].style.display = "";
            divs[i].classList.remove("found");
            document.getElementById("data").classList.remove("filtered");
        }
        return;
    }

    var divs = document.getElementsByClassName("pokemon");

    // mark the #data div as filtered
    document.getElementById("data").classList.add("filtered");

    // set all divs to display none
    for (i = 0; i < divs.length; i++) {
        divs[i].style.display = "none";
        divs[i].classList.remove("found");
    }

    for (i = 0; i < divs.length; i++) {
        if (divs[i].classList.contains("blank"))
            continue;

        var filterSuccess = false;
        if (divs[i].id.toLowerCase().includes(filter))
            filterSuccess = true;
        else if (divs[i].getElementsByClassName("notes")[0].innerHTML.toLowerCase().includes(filter))
            filterSuccess = true;
        else if (divs[i].getElementsByClassName("dex")[0].innerHTML.toLowerCase().includes(filter))
            filterSuccess = true;
        else if (divs[i].getElementsByClassName("game")[0].innerHTML.toLowerCase().includes(filter))
            filterSuccess = true;
        else if (divs[i].classList.contains(filter))
            filterSuccess = true;

        if (filterSuccess) {
            divs[i].style.display = "";
            // unclose any boxes that contain the filtered pokemon
            divs[i].parentElement.classList.remove("closed");
            divs[i].parentElement.getElementsByClassName("box-header")[0].classList.remove("closed");
            // mark the pokemon as "found"
            divs[i].classList.add("found");
        } else {
            divs[i].style.display = "none";
        }
    }
}

function download(dataUri, fileName) {
    var link = document.createElement("a");
    link.setAttribute("href", dataUri);
    link.setAttribute("download", fileName);
    link.click();
}

function exportToJSON() {
    // remove the "caught" property from the json, cuz it was messing me up a few times
    if (full_json[0].hasOwnProperty("caught")) {
        for (var i = 0; i < full_json.length; i++)
            delete full_json[i].caught;
    }

    // stringify the json with an indent of 4 spaces
    var dataStr = JSON.stringify(full_json, null, 4);
    var dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    // get current date and time and store it in a formatting string
    var date = new Date();
    var dateStr = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "-" + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds();

    // create a file name
    var exportFileDefaultName = 'banemasterdex-' + dateStr + '.json';
    download(dataUri, exportFileDefaultName);
}

function makeID(name, form_of = null) {
    var id = name.replace(" ", "-");

    if (form_of != null)
        id = `${form_of.replace(" ", "-")}-${id}`

    return id;
}

function importFromJSON() {
    console.log(`Importing from JSON...`);

    full_json = null;

    var input = document.createElement('input');
    input.type = 'file';
    input.click();

    input.onchange = e => {
        var file = e.target.files[0];
        var reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = readerEvent => {
            var content = readerEvent.target.result;
            var pokemon_data = JSON.parse(content);

            // if the json does not contain a bulbasaur in the first position or doesn't even have a name key to start with, it is not a valid json file
            if (!pokemon_data[0].hasOwnProperty("name") || pokemon_data[0].name != "Bulbasaur") {
                console.log("Invalid JSON file.");
                return;
            }

            for (var i = 0; i < pokemon_data.length; i++)
                updateCaughtStatusFromLoad(pokemon_data[i]);

            full_json = pokemon_data;
        }
    }
}