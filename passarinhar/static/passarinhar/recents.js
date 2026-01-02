document.addEventListener('DOMContentLoaded', function() {
    var bird_imgs = Array.from(document.getElementsByClassName('bird-img')) ;    
    var img_url = ""
    // console.log(bird_imgs)   
    bird_imgs.forEach(_img => { 
        // console.log(_img.id)   
        // const pageData = searchWikiData(_img.id)
        url = `https://pt.wikipedia.org/w/api.php?action=query&prop=pageimages|pageprops&format=json&pithumbsize=300&titles=${_img.id}&origin=*`     
        // console.log(url)
        fetch(url)
            .then(response => response.json())
            .then(res => {
                pages = res.query.pages; //
                pageId = Object.keys(pages)[0];
                pageData = pages[pageId];
                // console.log(pageData)
                if (pageData.thumbnail)
                    document.getElementById(_img.id).src =  pageData.thumbnail.source; 
                else {
                    url = `https://pt.wikipedia.org/w/api.php?action=query&prop=pageimages|pageprops&format=json&pithumbsize=300&titles=${_img.alt}&origin=*`     
                    fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        //console.log(data)
                        pageData = data.query.pages[Object.keys(data.query.pages)[0]];
                        if (pageData.thumbnail) {
                            img_url = pageData.thumbnail.source
                            console.log(_img.alt, img_url)
                            document.getElementById(_img.id).src =  img_url;
                        }        
                    })
                } 
        })
        .catch(
            error => console.error('Error:', error)
        );           
      })  
    }
)      