var sessionStoragegeolocation = 0;
export const searchWikiData = async (comName, sciName) => {
    var img_url = "";
    var pageData = null

    var en_url = "https://en.wikipedia.org/w/api.php";
    var pt_url = "https://pt.wikipedia.org/w/api.php";
    var titles = comName + "|" + comName.normalize('NFD').replace(/[\u0300-\u036f]/g, '') + "|" + comName.normalize('NFD').replace(/[\u0300-\u036f]/g, '') + " (ave)|" + sciName;
    var params = new URLSearchParams({
        action: "query",
        prop: "pageimages|pageprops",
        pithumbsize: "300",
        titles: titles,
        format: "json",
        origin: "*"
    });
    // console.log(titles)
    // console.log(`${pt_url}?${params}`)
    await fetch(`${pt_url}?${params}`)
        .then(response => response.json())
        .then(res => {
            //console.log(res)
            for (var i = 0; i < Object.keys(res.query.pages).length; i++) {
                pageData = res.query.pages[Object.keys(res.query.pages)[i]];
                if (pageData.thumbnail) {
                    img_url = pageData.thumbnail.source
                    //console.log(i, pageData, img_url)
                }
            }

        })
        .catch(
            (error) => console.error('Error:', error)
        );
    if (img_url == "") {
        params = new URLSearchParams({
            action: "query",
            prop: "pageimages|pageprops",
            pithumbsize: "300",
            titles: sciName,
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
                        console.log(en_url, i, pageData, img_url)
                    }
                }
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

function getCoordinates() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            // Pass the resolve and reject functions as the callbacks
            navigator.geolocation.getCurrentPosition(resolve, reject);
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
        // console.log("Utils: getCurrentLocation", sessionStorage.lat, sessionStorage.lon);
        // Use the latitude and longitude as needed
    } catch (error) {
        console.error("Utils: Error retrieving location:", error.message);
        sessionStorage.geolocation = 0;
        // Handle the error appropriately in your UI
    }
}
