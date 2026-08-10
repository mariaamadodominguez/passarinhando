import { searchWikiData } from './utils.js';
import { getWikiSummary } from './utils.js';
import { getXenoCanto } from './utils.js';
import { getTaxonomy } from './utils.js';
document.addEventListener('DOMContentLoaded', function () {
    var save_btns = Array.from(document.getElementsByClassName('save-button'));
    save_btns.forEach(_btn => {
        //var species_code = document.querySelector(`#speciesCode${_btn.id}`).innerHTML        
        document.getElementById(_btn.id).addEventListener('click', () =>
            saveSpice(_btn.id));
    })

    // taxonomy
    var spice_codes = Array.from(document.getElementsByClassName('spice_code'));
    spice_codes.forEach(async function (_code) { await getTaxonomy(_code.innerHTML.trim()) })

    // sounds
    var bird_imgs = Array.from(document.getElementsByClassName('bird-img'));
    bird_imgs.forEach(async function (_img) {
        //console.log(_img.alt, _img.id);
        _img.src = await searchWikiData(_img.id, _img.alt);
        getXenoCanto(_img.id, _img.alt, 1);
    })

    // summary
    var wiki_btns = Array.from(document.getElementsByClassName('wiki-btn'));
    wiki_btns.forEach(_btn => {
        var comName = _btn.dataset.common.trim();         
        var sciName = _btn.id;
        // console.log(sciName, comName)
        document.getElementById(_btn.id).addEventListener('click', () =>
            displayWikiPopup(sciName, comName));
    })

    // Get all radio buttons in the 'my_choice' group
    const radioButtons = document.querySelectorAll('input[name="tipo_procura"]');
    let placeField = null;
    if (radioButtons) {
        placeField = document.getElementById('id_place');
    }
    // console.log('Radio button selected:', radioButtons);
    radioButtons.forEach(radio => {
        radio.addEventListener('click', function () {
            // This code runs immediately when a selection is changed
            // console.log('Radio button selected:', this.value);
            switch (this.value) {
                case 'L': // Local
                    placeField.style.display = 'block';
                    placeField.required = true;
                    break
                case 'N':  // Notavéis
                    placeField.style.display = 'block';
                    placeField.required = true;
                    break
                case 'R':  // Redondezas
                    placeField.style.display = 'none';
                    placeField.required = false;
                    break
            }

        });
    });

    const procRadio = document.querySelector('input[name="tipo_procura"]');
    if (procRadio && procRadio.checked) {
        if (procRadio.value == 'R') {
            placeField.style.display = 'none';
            placeField.required = false;
        } else {
            placeField.style.display = 'block';
            placeField.required = true;
        }
    }

}
)


const wikiModal = document.getElementById('wikiModal');

// 1. Remove focus right before the modal starts hiding
wikiModal.addEventListener('hide.bs.modal', function () {
    if (document.activeElement && wikiModal.contains(document.activeElement)) {
        document.activeElement.blur();
    }
});

// 2. Safely apply aria-hidden only after the transition completes
wikiModal.addEventListener('hidden.bs.modal', function () {
    wikiModal.setAttribute('aria-hidden', 'true');
});

// 3. Remove aria-hidden when the modal opens again
wikiModal.addEventListener('show.bs.modal', function () {
    wikiModal.removeAttribute('aria-hidden');
});

// Function to handle the popup state
const bootstrapModal = new bootstrap.Modal(wikiModal);

async function displayWikiPopup(sciName, commonName) {
    event.preventDefault(); 
    const textContainer = document.getElementById('wikiModalText');
    const textHeader = document.getElementById('wikiModalLabel');
    // Reset and show loading state
    textContainer.innerText = "Carregando sumário...";
    textHeader.innerText = commonName;
    bootstrapModal.show();
    
    try {
        // Fetch the plain text string
        const plainText = await getWikiSummary(sciName, commonName);
        textContainer.innerText = plainText; 
    } catch (error) {
        textContainer.innerText = "Error carregando sumário. Tente mais tarde.";
    }
}

function saveSpice(spice_id) {
    var url = '/addNewSpice'
    var name = document.querySelector(`#name${spice_id}`).innerHTML;
    var sci_name = document.querySelector(`#name${spice_id}`).dataset.sciname;
    var species_code = document.querySelector(`#speciesCode${spice_id}`).innerHTML
    var species_desc = document.querySelector(`#obsDt${spice_id}`).innerHTML + ' ' + document.querySelector(`#locName${spice_id}`).innerHTML + ' ' + document.querySelector(`#howMany${spice_id}`).innerHTML
    // var sci_name =  document.getElementById(name).dataset.sciname;         
    // console.log(url, name, sci_name, species_code, species_desc);
    var img_src = document.getElementById(name).src;
    // console.log(img_src)
    fetch(url, {
        headers: { "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value },
        method: 'POST',
        body: JSON.stringify({
            name: name,
            spice_code: species_code,
            scientific_name: sci_name,
            description: species_desc,
            url_spice_img: img_src,
        })
    })
        .then((resp) => resp.json())
        .then((result) => {
            document.querySelector('#error-msg').style.display = 'block';
            document.querySelector('#error-msg').innerHTML = result.message;
        })
        .catch(error => {
            document.querySelector('#error-msg').style.display = 'block';
            document.querySelector('#error-msg').innerHTML = error;
            console.log(error);
        });
}