document.addEventListener('DOMContentLoaded', () => {

    var save_btns = Array.from(document.getElementsByClassName('save-button'));
    //console.log(save_btns)
    save_btns.forEach(_btn => {
        document.getElementById(_btn.id).addEventListener('click', () =>
            saveLocal(_btn.id));
    })


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
