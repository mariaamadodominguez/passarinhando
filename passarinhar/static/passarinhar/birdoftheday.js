import { searchWikiData } from './utils.js';
import { getCurrentLocation} from './utils.js';
document.addEventListener('DOMContentLoaded', function () {
    async function showBirdofTheDay() {
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;            
        const url = '/birdoftheday';
        document.getElementById(`bird-of-the-day`).style.display = "none";
        await getCurrentLocation();
        console.log('showBirdofTheDay:', sessionStorage.lat, sessionStorage.lon);
        await fetch(url, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken // Include the CSRF token in the headers
            },
            body: JSON.stringify({                
              lat : sessionStorage.lat,
              lon : sessionStorage.lon,
              })
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
            document.querySelector('#loc-name').innerHTML = `${data[0].locName}`;
            displayBirdImg(data[0])
            document.getElementById(`bird-of-the-day`).style.display = "block";                       
        })          
        .catch(() => {
            error => console.error('Error:', error)
        });   
    }
       
    showBirdofTheDay()
})  

const displayBirdImg = async (ebirddata) => {
    const img_url =  await searchWikiData(ebirddata.comName, ebirddata.sciName);
    // console.log(img_url, ebirddata)
    document.getElementById('bird-img').src = img_url;    
}
    