var sessionStoragegeolocation = 0;
export const searchWikiData = async (comName, sciName) => {
    var url = `https://pt.wikipedia.org/w/api.php?action=query&prop=pageimages|pageprops&format=json&pithumbsize=300&titles=${comName}&origin=*`     
    var img_url = "";
    var pageData = null
    await fetch(url)
    .then(response => response.json())
    .then(res => {
        pageData = res.query.pages[Object.keys(res.query.pages)[0]];
        if (pageData.thumbnail){
            img_url = pageData.thumbnail.source
        }                
    })
    .catch(
        (error) => console.error('Error:', error)
    );
    if (img_url == "") {
        url = `https://pt.wikipedia.org/w/api.php?action=query&prop=pageimages|pageprops&format=json&pithumbsize=300&titles=${sciName}&origin=*`                         
        // console.log("Utils.js", url)
        await fetch(url)
        .then(response => response.json())
        .then(data => {
            pageData = data.query.pages[Object.keys(data.query.pages)[0]];
            if (pageData.thumbnail) {
                img_url = pageData.thumbnail.source
            }
        })
    } 
    if (img_url == "")
        img_url = 'https://upload.wikimedia.org/wikipedia/commons/8/8e/No_free_image_bird-he.png'
    console.log("Utils.js img_url", img_url )
    return img_url; e
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
        sessionStoragegeolocation = 1;
        sessionStorage.lat = position.coords.latitude;
        sessionStorage.lon = position.coords.longitude;
        console.log("getCurrentLocation", sessionStorage.lat, sessionStorage.lon);
        // Use the latitude and longitude as needed
    } catch (error) {
        console.error("Error retrieving location:", error.message);
        sessionStoragegeolocation = 0;
        // Handle the error appropriately in your UI
    }
}
