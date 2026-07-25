export const getWikiSummary = async (comName, sciName) => {
    const headers = new Headers();
    headers.append('User-Agent', 'Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0)');
    headers.append('cookie', 'SameSite=None,SameSite=None,SameSite=None');
    var titles = sciName + "|" + comName.normalize('NFD').replace(/[\u0300-\u036f]/g, '') + " (ave)|" + comName + " (ave) |" + comName;
    // console.log(titles)
    titles = titles.replace(/\s+/g, ' ').trim()
    console.log(titles)
    var pt_url = "https://pt.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(titles);
    const init = {
        method: 'GET',
        headers
    };
    var summary_text = '';

    await fetch(pt_url, init)
        .then((response) => {
            return response.json();
        })
        .then((text) => {
            //console.log(text['extract'])
            summary_text = text['extract']
        })
        .catch((e) => {
            // error in e.message
            console.log(e.message)
        });
    return summary_text
}

export const searchWikiData = async (comName, sciName, enComName = '') => {
    var img_url = "";
    var pageData = null

    var en_url = "https://en.wikipedia.org/w/api.php";
    var pt_url = "https://pt.wikipedia.org/w/api.php";
    var titles = sciName + "|" + comName.normalize('NFD').replace(/[\u0300-\u036f]/g, '') + " (ave)|" + comName + " (ave) |" + comName;
    //var titles = norm_comName + "|" + norm_comName + " (ave)|" + sciName;
    //comName + "|" +
    //var titles = comName + "|" + comName.normalize('NFD').replace(/[\u0300-\u036f]/g, '') + "|" + comName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    //console.log(comName);

    var params = new URLSearchParams({
        action: "query",
        prop: "pageimages|pageprops",
        pithumbsize: "300",
        titles: titles,
        format: "json",
        origin: "*"
    });

    await fetch(`${pt_url}?${params}`)
        .then(response => response.json())
        .then(res => {
            // console.log(res)
            for (var i = 0; i < Object.keys(res.query.pages).length; i++) {
                pageData = res.query.pages[Object.keys(res.query.pages)[i]];
                if (pageData.thumbnail) {
                    img_url = pageData.thumbnail.source
                    //console.log(i, pageData, img_url)
                    if (i > 3)
                        break;
                }
            }
            //console.log(`pt_titles ${titles}`)
        })
        .catch(
            (error) => console.error('Error:', error)
        );
    if (img_url == "") {

        if (enComName == '')
            titles = sciName
        else
            titles = sciName + "|" + replaceSecondOccurrence(enComName, '-', ' ')
        params = new URLSearchParams({
            action: "query",
            prop: "pageimages|pageprops",
            pithumbsize: "300",
            titles: titles,
            format: "json",
            origin: "*"
        });

        await fetch(`${en_url}?${params}`)
            .then(response => response.json())
            .then(data => {
                for (var i = 0; i < Object.keys(data.query.pages).length; i++) {
                    pageData = data.query.pages[Object.keys(data.query.pages)[i]];
                    if (pageData.thumbnail) {
                        img_url = pageData.thumbnail.source
                        // console.log(en_url, i, pageData, img_url)
                    }
                }
                //console.log(`en_titles-${titles}`)
            })
            .catch(
                (error) => console.error('Error:', error)
            );
    }
    if (img_url == "") {

        img_url = 'https://upload.wikimedia.org/wikipedia/commons/8/8e/No_free_image_bird-he.png'
    }
    return img_url;
}
function capitalizeFirstLetter(string) {
    // console.log(string)
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function replaceSecondOccurrence(originalString, search, replace) {
    let count = 0;
    // Use a global regex to find all occurrences
    const regex = new RegExp(search, 'g');

    const newString = originalString.replace(regex, (match) => {
        count++;
        // If it's the second occurrence (count === 2), return the replacement string, 
        // otherwise return the original match
        return (count === 2) ? replace : match;
    });
    // console.log(newString, capitalizeFirstLetter(newString))
    return capitalizeFirstLetter(newString);
}

export function getCoordinates() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            // Pass the resolve and reject functions as the callbacks
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true, timeout: 10000, maximumAge: 0
            });
        } else {
            reject(new Error("Geolocalização não é suportada pelo seu navegador"));
        }
    });
}

export const getCurrentLocation = async () => {
    try {
        const position = await getCoordinates();
        sessionStorage.geolocation = 1;
        sessionStorage.lat = position.coords.latitude.toFixed(5);
        sessionStorage.lng = position.coords.longitude.toFixed(5);
        sessionStorage.gps_accuracy = position.coords.accuracy.toFixed(1);
        console.log("Utils: getCurrentLocation", sessionStorage.lat, sessionStorage.lng, sessionStorage.gps_accuracy);
        // Use the latitude and longitude as needed
    } catch (error) {
        console.error("Utils: Error retrieving location:", error.message);
        sessionStorage.geolocation = 0;
        // Handle the error appropriately in your UI
    }
}

export const getXenoCanto = async (spice_code, scientific_name, limit = 3) => {

    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const url = '/bird_player_view';
    var selector = `player${spice_code}`;
    const targetSelector = document.querySelector(`#${CSS.escape(selector)}`);
    targetSelector.innerHTML = "";

    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken // Include the CSRF token in the headers
        },
        body: JSON.stringify({
            lat: sessionStorage.lat,
            lng: sessionStorage.lng,
            species_code: scientific_name
        })
    })
        .then(response => response.json())
        .then(res => {
            //console.log('res', res)
            const recordings = res.recordings.recordings
            if (recordings) {
                // Switch to HTML5 Native Audio (<audio>)
                for (var i = 0; i < recordings.length && i < limit; i++) {
                    // Create the native audio player using the direct stream link
                    const nativeAudio = document.createElement('audio');
                    nativeAudio.src = recordings[i].file; // Uses the direct audio streaming link from JSON
                    nativeAudio.controls = true;          // Displays native browser Play/Pause/Timeline controls
                    nativeAudio.classList.add('custom-audio-player');

                    if (limit == 1) { // No details, append audio directly to your target selector
                        targetSelector.append(nativeAudio);
                    } else { // include  recording details
                        // 1. Create a wrapper card container
                        const cardContainer = document.createElement('div');
                        cardContainer.classList.add('audio-card');

                        // 2. Create a metadata container box for recording details
                        const metaContainer = document.createElement('div');
                        metaContainer.classList.add('audio-meta-box');
                        // Recordist element
                        const recordistDiv = document.createElement('div');
                        recordistDiv.innerHTML = `👤 <strong>Gravador:</strong> ${recordings[i].rec}`;
                        // Location element
                        const locationDiv = document.createElement('div');
                        locationDiv.innerHTML = `📍 <strong>Local:</strong> ${recordings[i].loc}, ${recordings[i].cnt}`;
                        //type, sex,stage
                        const type_sex_stageDiv = document.createElement('div');
                        type_sex_stageDiv.innerHTML = `<strong>tipo:</strong> ${recordings[i].type}`;
                        if (recordings[i].sex != '') {
                            type_sex_stageDiv.innerHTML += ` <strong>genero:</strong>${recordings[i].sex}`
                        }
                        if (recordings[i].stage != '') {
                            type_sex_stageDiv.innerHTML += `${recordings[i].stage}`
                        }

                        // Source Link element (Opens in a new browser tab)
                        const sourceLink = document.createElement('a');
                        sourceLink.href = `https://xeno-canto.org/${recordings[i].id}`;
                        sourceLink.target = "_blank";
                        sourceLink.rel = "noopener noreferrer";
                        sourceLink.classList.add('xc-source-link');
                        sourceLink.textContent = "Ver gravação original em Xeno-canto ↗";
                        // Assemble metadata items
                        metaContainer.append(recordistDiv);
                        metaContainer.append(locationDiv);
                        metaContainer.append(type_sex_stageDiv);
                        metaContainer.append(sourceLink);

                        // 3. Assemble and append the full card structure
                        cardContainer.append(nativeAudio);
                        cardContainer.append(metaContainer); // Injected below the audio track timeline
                        targetSelector.append(cardContainer);
                    }
                }
            }
        })
}

export const getTaxonomy = async (spice_code) => {
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const url = '/taxonomy_view';
    var selector = `#spice-taxo${spice_code}`;

    document.querySelector(selector).innerHTML = "";
    // console.log('Taxonomy spice_code', selector)
    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken // Include the CSRF token in the headers
        },
        body: JSON.stringify({
            species_code: spice_code
        })
    })
        .then(response => response.json())
        .then(res => {
            const data = res.data
            const pt_BR_family = res.pt_BR_family
            //console.log('Taxon res:', res);
            //console.log('Taxon data:', data);
            //console.log('pt_BR_family:', pt_BR_family);

            const sciName = document.createElement('li');
            var txtSciName = `Nome científico: ${data[0].sciName} `;
            sciName.innerHTML = txtSciName;
            document.querySelector(selector).append(sciName);
            // console.log('Taxon Sciname:', sciName.innerHTML);

            const order = document.createElement('li');
            var txtOrder = `Ordem: ${data[0].taxonOrder} - ${data[0].order}`;
            order.innerHTML = txtOrder;
            // console.log('Taxon order:', order.innerHTML);
            document.querySelector(selector).append(order);

            const family = document.createElement('li');
            var txtFamily = `Familia: ${data[0].familyCode} - ${data[0].familySciName}`;
            family.innerHTML = txtFamily;
            document.querySelector(selector).append(family);

            const family2 = document.createElement('li');
            //var txtFamily2 = data[0].familyComName;
            var txtFamily2 = pt_BR_family;
            family2.innerHTML = txtFamily2;
            document.querySelector(selector).append(family2);

            document.querySelector(selector).style.display = 'block';

        })
        .catch(() => {
            error => console.error('Error:', error)
        });
    return;
}

export const getRLCategory = (rlcat) => {
    var rl = rlcat.innerHTML
    let RL_CATEGORY;
    // console.log('selector', rlcat, 'inner', rl.trim())
    switch (rl.trim()) {
        case 'EX':
            RL_CATEGORY = 'Extincto';
            rlcat.style = "color:red"
        case 'EW':
            RL_CATEGORY = 'Extincto na Natureza'
            rlcat.classList.add('badge-danger');
        case 'CR':
            RL_CATEGORY = "Peligro Crítico";
            rlcat.classList.add('badge-danger');
            break;
        case 'EN':
            RL_CATEGORY = "Peligro";
            rlcat.classList.add("badge-warning")
            break;
        case 'VU':
            RL_CATEGORY = "Vulnerável";
            rlcat.classList.add("badge-warning")
            break;
        case 'NT':
            RL_CATEGORY = "Quase ameaçado";
            rlcat.classList.add("badge-warning")
            break;
        case 'LC':
            RL_CATEGORY = "Pouco preocupante";
            rlcat.classList.add("badge-info")
            break;
        case 'DD':
        default:
            RL_CATEGORY = "Sem dados";
            rlcat.classList.add("badge-dark")
            break;
    }
    rlcat.innerHTML = RL_CATEGORY
    return;
} 