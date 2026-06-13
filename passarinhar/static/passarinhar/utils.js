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
function getCoordinates() {
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
        sessionStorage.lat = position.coords.latitude;
        sessionStorage.lon = position.coords.longitude;
        console.log("Utils: getCurrentLocation", sessionStorage.lat, sessionStorage.lon);
        // Use the latitude and longitude as needed
    } catch (error) {
        console.error("Utils: Error retrieving location:", error.message);
        sessionStorage.geolocation = 0;
        // Handle the error appropriately in your UI
    }
}

export const getXenoCanto = async (spice_code, scientific_name) => {
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const url = '/bird_player_view';
    var selector = `#player${spice_code}`;
    console.log(selector, spice_code, scientific_name)
    document.querySelector(selector).innerHTML = "";
    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken // Include the CSRF token in the headers
        },
        body: JSON.stringify({
            lat: sessionStorage.lat,
            lon: sessionStorage.lon,
            species_code: scientific_name
        })
    })
        .then(response => response.json())
        .then(res => {
            //console.log('res', res)
            const recordings = res.recordings.recordings
            if (recordings)
                for (var i = 0; i < recordings.length && i < 3; i++) {
                    //console.log('recordings', recordings[i].file)
                    const xenoframe = document.createElement('iframe');
                    xenoframe.src = `https://xeno-canto.org/${recordings[i].id}/embed?simple=1`;
                    xenoframe.style.border = "none";
                    xenoframe.style.overflow = "hidden";
                    document.querySelector(selector).append(xenoframe);
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