import { searchWikiData } from './utils.js';
import { getCurrentLocation } from './utils.js';
import { getRLCategory } from './utils.js';

document.addEventListener('DOMContentLoaded', function () {
    async function showBirdofTheDay() {
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const url = '/birdoftheday';
        document.getElementById(`bird-of-the-day`).style.display = "none";
        await getCurrentLocation();
        //

        console.log('showBirdofTheDay:', sessionStorage.lat, sessionStorage.lon);
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken // Include the CSRF token in the headers
            },
            body: JSON.stringify({
                lat: sessionStorage.lat,
                lon: sessionStorage.lon,
            })
        })
            .then(response => response.json())
            .then(res => {
                const data = res.data
                const bird = res.bird
                console.log('Success res:', res);
                console.log('Success data:', data[0].sciName);
                document.querySelector('#common-name').innerHTML = data[0].comName;
                document.querySelector('#spiceCode').innerHTML = data[0].speciesCode;
                document.querySelector('#sci-name').innerHTML = data[0].sciName;
                document.querySelector('#obs-date').innerHTML = data[0].obsDt;
                document.querySelector('#loc-name').innerHTML = data[0].locName + '-' + data[0].locId;

                //console.log('document.querySelector(`#spice-rl`).innerHTML ', document.querySelector(`#spice-rl`).innerHTML)
                //console.log('bird', bird)
                var LC;
                for (const item of JSON.parse(bird)) {
                    //console.log(item.fields);
                    //console.log(item.fields.RL_Category)
                    LC = item.fields.RL_Category
                }
                //console.log(LC);
                document.querySelector(`#spice-rl`).innerHTML = LC;
                getRLCategory(document.querySelector(`#spice-rl`));

                displayBirdImg(data[0])
                document.getElementById(`bird-of-the-day`).style.display = "block";

                document.getElementById(`debossan`).innerHTML = res.debossan_map;

            })
            .catch(() => {
                error => console.error('Error:', error)
            });
    }

    showBirdofTheDay()
})

const displayBirdImg = async (ebirddata) => {
    const img_url = await searchWikiData(ebirddata.comName, ebirddata.sciName);
    //console.log(img_url, ebirddata)
    document.getElementById('bird-img').src = img_url;
}
