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
        var img_url = "";
        // console.log("showBirdofTheDay lat", lat, "lon", lon);
        const payload = {
            "lat": lat,
            "lon": lon,
            "howmany":1
        };
        const url = '/birdoftheday';
        
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
            var url = `https://pt.wikipedia.org/w/api.php?action=query&prop=pageimages|pageprops&format=json&pithumbsize=300&titles=${data[0].comName}&origin=*`     
            // console.log(url)
            fetch(url)
            .then(response => response.json())
            .then(res => {
                pageData = res.query.pages[Object.keys(res.query.pages)[0]];
                if (pageData.thumbnail){
                    img_url = pageData.thumbnail.source
            fetch(url)
                    console.log(url , img_url)
                    document.getElementById('bird-img').src =  img_url;
                } else {
                    url = `https://pt.wikipedia.org/w/api.php?action=query&prop=pageimages|pageprops&format=json&pithumbsize=300&titles=${data[0].sciName}&origin=*`     
                    fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        //console.log(data)
                        pageData = data.query.pages[Object.keys(data.query.pages)[0]];
                        if (pageData.thumbnail) {
                            img_url = pageData.thumbnail.source
                            console.log(url, img_url)
                            document.getElementById('bird-img').src =  img_url;
                        }        
                    })
                } 
                
            })
            .catch(
                (error) => console.error('Error:', error)
            );            
        })          
        .catch(() => {
            error => console.error('Error:', error)
        });   
    }
    
    
    showBirdofTheDay()
})     