import { getRLCategory } from './utils.js';
import { getTaxonomy } from './utils.js';
import { getXenoCanto } from './utils.js';
import { getWikiSummary } from './utils.js';
document.addEventListener('DOMContentLoaded', () => {
    var btns_collection = Array.from(document.getElementsByClassName('btn-detail-info'));
    btns_collection.forEach(_btn => {
        document.getElementById(_btn.id).addEventListener('click', () =>
            showDetails(_btn.id));
    })
    var yesno_collection = Array.from(document.getElementsByClassName('yes-no'));
    yesno_collection.forEach(_yesno => {
        //console.log(_yesno.id, document.getElementById(_yesno.id).innerHTML)
        if (document.getElementById(_yesno.id).innerHTML == 'TRUE') {
            document.getElementById(_yesno.id).innerHTML = 'SIM'
            document.getElementById(_yesno.id).classList.add("badge-info")
        } else {
            document.getElementById(_yesno.id).innerHTML = 'NÃO'
            document.getElementById(_yesno.id).classList.add("badge-danger")
        }
    })


    function showDetails(spice_id) {
        var selector = `#spice-view${spice_id}`
        //var parentselector = `#spice-div${spice_id}`
        // console.log(selector, parentselector, document.querySelector(selector).style.display)

        if (document.querySelector(selector).style.display == 'flex') {
            document.querySelector(selector).style.display = 'none';
            //document.querySelector(parentselector).style.display = 'block';

        } else {
            var rlcat = `#spice-rl${spice_id}`
            document.querySelector(selector).style.display = 'flex';

            //document.querySelector(parentselector).style.display = 'none';
            getRLCategory(document.querySelector(rlcat));
            var spice_name = document.querySelector(`#spice-name${spice_id}`).innerHTML.trim();
            var scientific_name = document.querySelector(`#spice-scientific-name${spice_id}`).innerHTML.trim();
            var spice_code = document.querySelector(`#spice-code${spice_id}`).innerHTML.trim();
            getXenoCanto(spice_code, scientific_name);
            getTaxonomy(spice_code)
            showSpiceMap(spice_code);
            getWikiData(spice_name, scientific_name, spice_id);

        }
    }

    const getWikiData = async (comName, sciName, spice_id) => {
        const wiki_summary = await getWikiSummary(comName, sciName);
        document.getElementById(`wiki-summary-text${spice_id}`).innerText = wiki_summary
    }

    function showSpiceMap(spice_code) {
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const url = '/spice_map_view'
        //console.log('spice_code', spice_code, sessionStorage.lat, sessionStorage.lon)
        var selector = `#spice-map${spice_code}`
        document.querySelector(selector).innerHTML = 'Carregando...'
        //console.log(document.querySelector(selector))
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken // Include the CSRF token in the headers
            },
            body: JSON.stringify({
                lat: sessionStorage.lat,
                lon: sessionStorage.lon,
                species_code: spice_code
            })
        })
            .then(response => response.json())
            .then(res => {
                const data = res.data
                //console.log('Success data:', data);
                if (data != undefined) {
                    document.querySelector(selector).innerHTML = res.spice_map;
                } else {
                    document.querySelector(selector).innerHTML = 'Nenhuma distribuição encontrada para esta espécie';
                    console.log(selector, 'Nenhuma distribuição encontrada para esta espécie');
                }
            })
            .catch(() => {
                error => console.error('Error:', error)
            });
    }
}
);
