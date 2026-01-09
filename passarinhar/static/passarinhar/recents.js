import { searchWikiData } from './utils.js';

document.addEventListener('DOMContentLoaded', function(){
    var bird_imgs = Array.from(document.getElementsByClassName('bird-img')) ;    
    bird_imgs.forEach(_img => {
        displayBirdImg(_img)           
      })  
    }
)        
        
const displayBirdImg = async (img) => {
    const img_url =  await searchWikiData(img.id, img.alt);
    document.getElementById(img.id).src = img_url;    
}
