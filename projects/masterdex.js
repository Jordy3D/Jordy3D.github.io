// make the header sticky when scrolling
window.onscroll = function () {
    var header = document.querySelector("header");
    var sticky = header.offsetTop;

    if (window.pageYOffset > sticky) {
        header.classList.add("sticky");
    } else {
        header.classList.remove("sticky");
    }
};

// listen to the konami code, up up down down left right left right b a
var konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
var konami_index = 0;
document.addEventListener('keydown', function (e) {
    if (e.keyCode == konami[konami_index]) {
        konami_index++;
        if (konami_index == konami.length) {
            konami_index = 0;
            // clear local storage
            localStorage.clear();
            // reload the page
            location.reload();
        }
    } else {
        konami_index = 0;
    }
});

var full_json = null;

loadJSON();

loadFromStorage();

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
                createBox(i + 1);

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

            return;

            // ====================================
            // ===== CREATE GENDER SECTION =============
            // ==============================================

            
            // count the number of gender forms
            let gender_count = 0;
            for (var i = 0; i < pokemon_count; i++)
            {
                var variants = pokemonVariants(json[i]);
                gender_count += variants.length || 0;
            }

            console.log(`Found ${gender_count} genders...`);

            // add more boxes
            var gender_boxes = Math.ceil(gender_count / 30);
            for (var i = 0; i < gender_boxes; i++)
                createBox(boxes + i + 1);

            boxes += gender_boxes;

            let current_gender = 0;

            for (var i = 0; i < pokemon_count; i++) {
                var variants = pokemonVariants(json[i]);
                if (variants.length > 0) {
                    for (var j = 0; j < variants.length; j++) {
                        current_gender++;
                        current_box = Math.floor((pokemon_count + current_gender + total_padding - 1) / 30) + 1;

                        console.log(`Adding gender variant ${current_gender} - ${variants[j].name} to box ${current_box}`);
                        createDiv(variants[j], current_box, true, json[i].name);
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
                createBox(boxes + i + 1);

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


                        console.log(`Adding forme variant ${current_forme} - ${variants[j].name} to box ${current_box}`);
                        createDiv(variants[j], current_box, true, json[i].name);
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

function pokemonVariants(pokemon, type="gender") {
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
    let pokemon_name = pokemon.name;
    pokemon_name = pokemon_name.replace(" ", "-");

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

function loadFromStorage() {
    // see if all of the divs have been created
    if (full_json == null) {
        setTimeout(loadFromStorage, 100);
        return;
    }

    // load from local storage if it exists
    if (localStorage.getItem("pokemon") != null) {
        pokemon_data = JSON.parse(localStorage.getItem("pokemon"));
        for (var i = 0; i < pokemon_data.length; i++)
            setPokemonCaughtState(pokemon_data[i]);

        full_json = pokemon_data;
    }
}

// create a div for each box
function createBox(box_number) {
    // the box will contain 30 pokemon

    // create the box
    var box = document.createElement("div");
    box.id = "box" + box_number;
    box.className = "box";

    // create the header
    var header = document.createElement("div");
    header.className = "box-header";
    header.innerHTML = "Box " + box_number;
    box.appendChild(header);

    // add event listeners to the header to toggle the box open and closed
    header.addEventListener("click", function () {
        box.classList.toggle("closed");
    });

    document.getElementById("data").appendChild(box);
}

// create a div for each pokemon
function createDiv(pokemon, box_number, is_form = false, form_of = "") {

    if (pokemon == null) {
        // create a blank div
        var div = document.createElement("div");
        div.classList.add("pokemon");
        div.classList.add("blank");
        document.getElementById("box" + box_number).appendChild(div);
        return;
    }

    // the div will contain the pokemon name, dex number, the game it is to be found in, any notes, and a toggle to mark it as caught

    // create the div
    var div = document.createElement("div");
    if (is_form) {
        div.classList.add("form");
        div.classList.add("pokemon");
        div.id = form_of.replace(" ", "-") + "-" + pokemon.name.replace(" ", "-");
    }
    else {
        div.id = pokemon.name.replace(" ", "-");
    }
    div.className = "pokemon";

    var header = document.createElement("div");
    header.classList.add("header");
    div.appendChild(header);

    // create the name
    var name = document.createElement("h2");
    name.classList.add("name");
    if (is_form)
        name.innerHTML = `${form_of} (${pokemon.name})`;
    else
        name.innerHTML = pokemon.name;
    header.appendChild(name);

    // create the dex number
    var dex = document.createElement("p");
    dex.classList.add("dex");
    dex.innerHTML = pokemon.dex_number;
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
        var li = document.createElement("li");
        li.innerHTML = pokemon.requirements[i];
        game.appendChild(li);
    }
    gameSection.appendChild(game);

    // create the notes
    var notes = document.createElement("p");
    notes.classList.add("notes");
    notes.innerHTML = pokemon.notes;
    div.appendChild(notes);

    // if pokemon is an outlier, add the outlier class
    if (pokemon.outlier) {
        div.classList.add("outlier");
    }

    // create the toggle
    div.addEventListener("click", function (event) {
        toggleCaught(pokemon.name);
    });

    div.addEventListener("contextmenu", function (event) {
        event.preventDefault();
        // notes.style.display = notes.style.display == "none" ? "block" : "none";
    });

    // add the div to the box
    document.getElementById("box" + box_number).appendChild(div);
}

function toggleCaught(name) {
    name = name.replace(" ", "-");
    var div = document.getElementById(name);
    div.classList.toggle("caught");

    // toggle the status of the pokemon in the json
    for (var i = 0; i < full_json.length; i++) {
        if (full_json[i].name == name)
            full_json[i].obtained = !full_json[i].obtained;
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
        if (divs[i].id.toLowerCase().includes(filter) || divs[i].getElementsByClassName("notes")[0].innerHTML.toLowerCase().includes(filter) || divs[i].getElementsByClassName("dex")[0].innerHTML.toLowerCase().includes(filter) || divs[i].getElementsByClassName("game")[0].innerHTML.toLowerCase().includes(filter)) {
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

function importFromJSON() {
    console.log(`Importing from JSON...`);

    var input = document.createElement('input');
    input.type = 'file';
    input.click();

    input.onchange = e => {
        var file = e.target.files[0];
        var reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = readerEvent => {
            var content = readerEvent.target.result;
            var json = JSON.parse(content);

            // if the json does not contain a bulbasaur in the first position or doesn't even have a name key to start with, it is not a valid json file
            if (!json[0].hasOwnProperty("name") || json[0].name != "Bulbasaur") {
                console.log("Invalid JSON file.");
                return;
            }

            for (var i = 0; i < json.length; i++)
                setPokemonCaughtState(json[i]);

            full_json = json;
        }
    }
}