export const getWikiSummary = async (comName, sciName, lang = 'pt') => {
    const headers = new Headers();
    headers.append('User-Agent', 'Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0)');
    headers.append('cookie', 'SameSite=None,SameSite=None,SameSite=None');

    var titles = titles = sciName.replace(/\s+/g, ' ').trim()
    console.log(titles)
    var url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(titles)}`;
    const init = {
        method: 'GET',
        headers: headers
    };
    var summary_text = '';
    try {
        let response = await fetch(url, init);

        // Fallback logic: If comName fails (404), try the commonName
        if (!response.ok && response.status === 404) {
            console.log(`Scientific name not found. Trying comName...`);
            const fallbackTitle = encodeURIComponent(`${comName}`);
            //+ "|" + comName.normalize('NFD').replace(/[\u0300-\u036f]/g, '') + " (ave)|" + comName + " (ave) |" + comName;
            const fallbackUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${fallbackTitle}`;
            response = await fetch(fallbackUrl, init);
        }

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const text = await response.json();
        summary_text = text['extract']
        var wiki_url = text['content_urls']['desktop']['page'];
        summary_text += '\nFonte: Wikipedia\n' + wiki_url;

    } catch (error) {
        console.error(`Error fetching Wikipedia summary: ${comName}, ${sciName} ${error.message}`);
        return 'N/I';
    }
    return summary_text
}


export const searchWikiData = async (comName, sciName, enComName = '', lang = 'pt') => {
    const headers = new Headers();
    const titles = sciName != '' ? sciName : `${comName} (ave)`;
    const noFreeThumbUrl = 'https://upload.wikimedia.org/wikipedia/commons/8/8e/No_free_image_bird-he.png';
    const encodedTitle = encodeURIComponent(titles);
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodedTitle}`;
    headers.append('User-Agent', "PassarinharScraperBot/1.0 (mardomngz@gmail.com)");
    headers.append('cookie', 'SameSite=None,SameSite=None,SameSite=None');
    const init = {
        method: 'GET',
        headers: headers
    };

    // console.log(`getWikipediaMainImage lang:${lang} encodedTitle:${encodedTitle}`)
    // console.log(`url:${url}`)

    try {
        let response = await fetch(url, init);

        // Fallback logic: If comName fails (404), try the sciName
        if (!response.ok && response.status === 404) {
            console.log(`Scientific name ${sciName} not found. Trying comName ${comName}...`);
            const fallbackTitle = encodeURIComponent(`${comName}`);
            const fallbackUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${fallbackTitle}`;
            response = await fetch(fallbackUrl, init);
        }

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        // check if a thumbnail exists before reading .source
        if (data.thumbnail && data.thumbnail.source) {
            return data.thumbnail.source;
        } else {
            console.log(`Page found, but it has no thumbnail image.${comName}, ${sciName}`);
            return noFreeThumbUrl;
        }

    } catch (error) {
        console.log(`Error : ${error.message} fetching Wikipedia image ${sciName}${comName}`);
        return noFreeThumbUrl;
    }
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

export const getTaxonomy = async (spice_code, localfamily_lnk) => {
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
            const local_family = res.pt_BR_family

            const sciName = document.createElement('li');
            var txtSciName = `Nome científico: ${data[0].sciName} `;
            sciName.innerHTML = txtSciName;
            document.querySelector(selector).append(sciName);

            const order = document.createElement('li');
            var txtOrder = `Ordem: ${data[0].taxonOrder} - ${data[0].order}`;
            order.innerHTML = txtOrder;
            document.querySelector(selector).append(order);

            const family = document.createElement('li');
            var txtFamily = `Familia: ${data[0].familyCode} `;
            family.innerHTML = txtFamily;
            const url_family = document.createElement('a');
            url_family.id = data[0].familySciName;
            url_family.className = 'wiki-lnk'
            url_family.innerHTML = data[0].familySciName;
            family.insertAdjacentElement("beforeend", url_family);
            document.querySelector(selector).append(family);

            url_family.addEventListener('click', () =>
                displayWikiPopup(local_family, url_family.id));

            const family2 = document.createElement('li');
            console.log("localfamily_lnk", localfamily_lnk)
            if (localfamily_lnk) {
                const url_family2 = document.createElement('a');
                url_family2.href = "/family_spices/" + local_family;
                url_family2.innerHTML = local_family;
                family2.insertAdjacentElement("afterbegin", url_family2);
            } else {
                family2.innerHTML = local_family;
            }
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
/* Modal for wiki data */
var bootstrapModal;
try {
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
    bootstrapModal = new bootstrap.Modal(wikiModal);
} catch (error) {
    // in case there is no wiki modal in page
}

async function displayWikiPopup(familyLocalName, familyName) {
    //event.preventDefault();
    const textContainer = document.getElementById('wikiModalText');
    const textHeader = document.getElementById('wikiModalLabel');
    // Reset and show loading state
    textContainer.innerText = "Carregando sumário...";
    textHeader.innerText = familyName;
    bootstrapModal.show();

    try {
        // Fetch the plain text string
        const plainText = await getWikiSummary(familyLocalName, familyName);
        textContainer.innerText = plainText;

    } catch (error) {
        textContainer.innerText = "Error carregando sumário. Tente mais tarde.";
    }
}