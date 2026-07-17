import { searchWikiData } from './utils.js';
import { getXenoCanto } from './utils.js';
import { getTaxonomy } from './utils.js';
document.addEventListener('DOMContentLoaded', function () {
    var save_btns = Array.from(document.getElementsByClassName('save-button'));
    save_btns.forEach(_btn => {
        //var species_code = document.querySelector(`#speciesCode${_btn.id}`).innerHTML        
        document.getElementById(_btn.id).addEventListener('click', () =>
            saveSpice(_btn.id));
    })

    var spice_codes = Array.from(document.getElementsByClassName('spice_code'));
    spice_codes.forEach(async function (_code) { await getTaxonomy(_code.innerHTML.trim()) })

    var bird_imgs = Array.from(document.getElementsByClassName('bird-img'));
    bird_imgs.forEach(async function (_img) {
        //console.log(_img.alt, _img.id);
        _img.src = await searchWikiData(_img.id, _img.alt);
        getXenoCanto(_img.id, _img.alt, 1);
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

function saveSpice(spice_id) {
    var url = '/addNewSpice'
    var name = document.querySelector(`#name${spice_id}`).innerHTML;
    var species_code = document.querySelector(`#speciesCode${spice_id}`).innerHTML
    //console.log(url, name, species_code);
    var img_src = document.getElementById(name).src;
    //console.log(img_src)
    fetch(url, {
        headers: { "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value },
        method: 'POST',
        body: JSON.stringify({
            name: name,
            spice_code: species_code,
            scientific_name: document.querySelector(`#sciName${spice_id}`).innerHTML,
            description: document.querySelector(`#obsDt${spice_id}`).innerHTML + ' ' + document.querySelector(`#locName${spice_id}`).innerHTML + ' ' + document.querySelector(`#howMany${spice_id}`).innerHTML,
            url_spice_img: img_src,
        })
    }
    )
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