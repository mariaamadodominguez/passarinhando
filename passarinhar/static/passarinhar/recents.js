import { searchWikiData } from './utils.js';

document.addEventListener('DOMContentLoaded', function () {
    var save_btns = Array.from(document.getElementsByClassName('save-button'));
    save_btns.forEach(_btn => {
        document.getElementById(_btn.id).addEventListener('click', () =>
            saveSpice(_btn.id));
    })

    var bird_imgs = Array.from(document.getElementsByClassName('bird-img'));
    bird_imgs.forEach(_img => {
        displayBirdImg(_img)
    })
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


const displayBirdImg = async (img) => {
    const img_url = await searchWikiData(img.id, img.alt);
    document.getElementById(img.id).src = img_url;
}

