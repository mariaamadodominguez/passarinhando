document.addEventListener('DOMContentLoaded', function() {
    var bird_imgs = Array.from(document.getElementsByClassName('bird-img')) ;    
    var img_url = ""
    console.log(bird_imgs)   
    bird_imgs.forEach(_img => { 
        console.log(_img.id)   
        //const pageData = searchWikiData(_img.id)
        const url = `https://pt.wikipedia.org/w/api.php?action=query&prop=pageimages|pageprops&format=json&pithumbsize=300&titles=${_img.id}&origin=*`     
        console.log(url)
        fetch(url)
            .then(response => response.json())
            .then(res => {
                const pages = res.query.pages; //
                const pageId = Object.keys(pages)[0];
                const pageData = pages[pageId];
                console.log(pageData)
                if (pageData.thumbnail)
                    document.getElementById(_img.id).src =  pageData.thumbnail.source;    

        })
        .catch(
            error => console.error('Error:', error)
            
        );
            
        console.log(img_url)   
        document.getElementById(_img.id).src = img_url 
                 
      })  
    }
)      
