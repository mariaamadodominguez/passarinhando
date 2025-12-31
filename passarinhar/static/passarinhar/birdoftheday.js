import { searchWikiData } from './utils.js'
document.addEventListener('DOMContentLoaded', function () {
    // Function to get CSRF token from cookies
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie('csrftoken'); // Get the CSRF token

    function showBirdofTheDay() {
        const lat = document.querySelector('#crnt-lat').value;
        const lon = document.querySelector('#crnt-lon').value;                 
        // console.log("showBirdofTheDay lat", lat, "lon", lon);
        const payload = {
            "lat": lat,
            "lon": lon,
            "howmany":1
        };
        const url = '/birdoftheday' 
        fetch(url, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken // Include the CSRF token in the headers
            }   ,
            body: JSON.stringify(payload),
        })        
        .then(response => response.json())
        .then(res => {
            const data = res.data
            // console.log('Success res:', res);
            // console.log('Success data:',data[0].sciName);
                                                      
            document.querySelector('#common-name').innerHTML = data[0].comName;           
            document.querySelector('#spiceCode').innerHTML = data[0].speciesCode ;  
            document.querySelector('#sci-name').innerHTML = data[0].sciName;
            document.querySelector('#obs-date').innerHTML = data[0].obsDt ;
            document.querySelector('#loc-name').innerHTML = data[0].locName;
            
            /// 1. Buscar informações na wikipédia
            const pageData = searchWikiData(data[0].comName)
            const title = pageData.title;
            if (pageData,thumbnail){
                const img_url =  pageData.thumbnail.source;
                console.log(`Title: ${title}, img ${img_url}`);
                document.querySelector('#bird-img').src = img_url;
            } else {
                console.log(`Title: ${title}, img ${img_url}`);
                document.querySelector('#title').innerHTML = title;
            }
            // document.querySelector('#title').innerHTML = img_url;
        })          
        .catch(error => {
            console.log('Error:', error)                  
            //document.querySelector('#error-msg').style.display = 'block';
            // document.querySelector('#error-msg').innerHTML= error;      
            pass            
            });   
    }
    
    
    showBirdofTheDay()
})     