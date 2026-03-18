import { searchWikiData } from './utils.js';

document.addEventListener('DOMContentLoaded', function () {
    var save_btns = Array.from(document.getElementsByClassName('save-button'));
    save_btns.forEach(_btn => {
        document.getElementById(_btn.id).addEventListener('click', () =>
            saveSpice(_btn.id));
    })
    var bird_imgs = Array.from(document.getElementsByClassName('bird-img'));
    bird_imgs.forEach(_img => {
        displayBirdImg(_img);
    })

    const placeField = document.getElementById('id_place');

    // Get all radio buttons in the 'my_choice' group
    const radioButtons = document.querySelectorAll('input[name="tipo_procura"]');
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
    if (procRadio) {
        if (procRadio.checked) {
            if (procRadio.value == 'R') {
                placeField.style.display = 'none';
                placeField.required = false;
            } else {
                placeField.style.display = 'block';
                placeField.required = true;
            }
        } else {
            procRadio.click();
            procRadio.focus();
        }
    }
    const orderRadio = document.querySelector('input[name="tipo_ordem"]');
    if (orderRadio && !orderRadio.checked) {
        orderRadio.click();
    }
}
)

const displayBirdImg = async (img) => {

    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const url = '/get_data_zone_specie';
    var enCommon_name = '';
    const sciName = img.alt;
    const ptCommon_name = img.id;
    var bird;
    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken // Include the CSRF token in the headers
        },
        body: JSON.stringify({
            DZS_name: sciName
        })
    })
        .then(response => response.json())
        .then(res => {
            bird = res.bird
            //console.log('DSZ data:', bird);
        })
        .catch(() => {
            error => console.error('Error:', error)
        });
    // console.log('bird', bird);

    if (bird)
        for (const item of JSON.parse(bird)) {
            enCommon_name = item.fields.Common_name;
        }

    const img_url = await searchWikiData(ptCommon_name, sciName, enCommon_name);
    document.getElementById(img.id).src = img_url;
}

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
            console.log(result);
            document.querySelector('#error-msg').style.display = 'block';
            document.querySelector('#error-msg').innerHTML = result.message;
        })
        .catch(error => {
            document.querySelector('#error-msg').style.display = 'block';
            document.querySelector('#error-msg').innerHTML = error;
            console.log(error);
        });
}

