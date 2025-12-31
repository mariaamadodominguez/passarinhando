export function searchWikiData(comName) {            
    //url = 'https://pt.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=japu&pithumbsize=100'
    // url = 'https://pt.wikipedia.org/w/api.php?action=query&prop=pageimages|pageprops&format=json&pithumbsize=300&titles=japu&origin=*'
    console.log(comName)
    const dataName = comName
    // const url = 'https://pt.wikipedia.org/w/api.php?action=query&prop=pageimages|pageprops&format=json&pithumbsize=300&titles=$comName&origin=*'
    const url = `https://pt.wikipedia.org/w/api.php?action=query&prop=pageimages|pageprops&format=json&pithumbsize=300&titles=${dataName}&origin=*`     
    console.log(url)
    fetch(url)
    .then(response => response.json())
    .then(res => {
        const data = res.query.pages
        const pages = res.query.pages; //
        const pageId = Object.keys(pages)[0];
        const pageData = pages[pageId];
        console.log(pageData)
        return (pageData)                
    })
    .catch(
        error => console.error('Error:', error)
    );
}

export function sayBye(user) {
  alert(`Bye, ${user}!`);
}
// You can also export them all at the end like this:
// export { sayHi, sayBye };