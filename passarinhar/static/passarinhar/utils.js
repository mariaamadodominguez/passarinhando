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
    return img_url; 
}
