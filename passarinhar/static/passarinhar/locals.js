document.addEventListener('DOMContentLoaded', () => {

    var save_btns = Array.from(document.getElementsByClassName('save-button'));
    //console.log(save_btns)
    save_btns.forEach(_btn => {
        document.getElementById(_btn.id).addEventListener('click', () =>
            saveLocal(_btn.id));
    })

    // Get all radio buttons in the 'my_choice' group
    const radioButtons = document.querySelectorAll('input[name="tipo_procura"]');
    // console.log('Radio button selected:', radioButtons);
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function () {
            // This code runs immediately when a selection is changed
            console.log('Radio button selected:', this.value);

            const placeField = document.getElementById('id_place');
            const labelSelector = "label[for='id_place']";
            const label = document.querySelector(labelSelector);

            if (this.value === 'L') {
                placeField.style.display = 'block';
                if (label) {
                    label.style.display = "block";
                }
                placeField.required = true
            } else {
                placeField.style.display = 'none';
                if (label) {
                    label.style.display = "none";
                }
                placeField.required = false
            }
            console.log('placeField.style.display:', placeField, placeField.style.display);
        });
    });
    const firstRadio = document.querySelector('input[name="tipo_procura"]');
    if (firstRadio) {
        firstRadio.focus();
        firstRadio.click();
    }

    function saveLocal(local_id) {
        url = '/addNewLocal'
        //console.log(url, local_id); 
        //console.log( document.querySelector(`#name${local_id}`).innerHTML);
        //console.log( document.querySelector(`#locId${local_id}`).innerHTML);
        //console.log(document.querySelector(`#subnational2Code${local_id}`).innerHTML);
        //console.log( document.querySelector(`#lat${local_id}`).innerHTML);
        //console.log( document.querySelector(`#lon${local_id}`).innerHTML);
        //console.log(document.querySelector(`#latestObsDt${local_id}`).innerHTML);
        //console.log( document.querySelector(`#numSpeciesAllTime${local_id}`).innerHTML);

        fetch(url, {
            headers: { "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value },
            method: 'POST',
            body: JSON.stringify({
                place: document.querySelector(`#name${local_id}`).innerHTML,
                lat: document.querySelector(`#lat${local_id}`).innerHTML,
                lon: document.querySelector(`#lon${local_id}`).innerHTML,
                subnational2Code: document.querySelector(`#subnational2Code${local_id}`).innerHTML,
                locId: document.querySelector(`#locId${local_id}`).innerHTML,
                latestObsDt: document.querySelector(`#latestObsDt${local_id}`).innerHTML,
                numSpeciesAllTime: document.querySelector(`#numSpeciesAllTime${local_id}`).innerHTML,
                //country : document.querySelector(`#country${local_id}`).innerHTML,
                //state : document.querySelector(`#state${local_id}`).innerHTML,
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
});
