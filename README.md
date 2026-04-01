# Maria Amado Domínguez - Pasarinhando

This is a birdwatching website with information about Debossan, a neighborhood in Nova Friburgo, in the mountains of Rio de Janeiro, Brazil. It focuses on the local birdlife and uses resources from eBird, Xenocanto, Wikipedia, and Wikimedia Commons. The project was built using open-source tools and is not intended for commercial use.

It has the following functionality:

- Easily search for locations working with geographic names and coordinates. Users signed up can save as many places as they want
- Access recent bird observations for any location on Earth, collecting and processing bird observation data from eBird API. Users can filter by distance and number of observations and, if signed up, can save as many bird species as they want.
- Search for hotspots (places with many bird observations) near the user's location and other places already saved. Users signed up can save as many hotspots as they want
- Read our forum and comment on posts. Users signed up can create posts and comment on posts
- Datazone portal provide additional information about the risk status of some species, using the IUCN Red List assessment, based on a set of standardised, data-driven criteria. Data is previosly downloaded from https://datazone.birdlife.org/search as csv files and loaded into the database.

In this project I used **Django** on the back-end and **JavaScript**, **HTML5**, **CSS** on the front-end. **Bootstrap** makes the application mobile-responsive.

- External modules
    - requests 
    - python-dotenv
    - folium Used to create maps with markers and popups. 
    - django-thumbnails

- API endpoints
# eBird
Use eBird's API to recover information about birds and birdwatching locations

  * Doc  
    https://documenter.getpostman.com/view/664302/S1ENwy59  
    https://www.reddit.com/r/Ornithology/comments/14hodrv/web_developer_in_search_of_apis_providing/
  * Api endpoints
    1. recents https://api.ebird.org/v2/data/obs/{{regionCode}}/recent
    2. taxonomy https://api.ebird.org/v2/ref/taxonomy/ebird?species={species_code}&fmt=json&locale={locale}
    3. notable https://api.ebird.org/v2/data/obs/{{regionCode}}/recent/notable
    4. hotspots https://api.ebird.org/v2/ref/hotspot/geo?lat=-22.36&lng=-42.53&fmt=json




# Wikipedia 
Use Wikimedia's API to recover images  

  * Doc  
    https://www.mediawiki.org/w/api.php?action=help&modules=query%2Bpageimages   
    https://www.mediawiki.org/wiki/Wikimedia_REST_API  

  * Api endpoints
    1. en.wikipedia.org|pageterms&piprop=thumbnail&pithumbsize=500&titles=jacuguaçu   
    2. pt.wikipedia.org/w/api.php?action=query&prop=pageimages|pageprops&format=json&pithumbsize=300&titles=japu   
  headers = {'User-Agent': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0)'}  
  * Example  
    1. Search for image information  
    url_imagem = 'File:Example.jpg'  // Substitute by the name of the file  
    name_file_api = url_imagem.split('/')[-1].replace('File:', '') // Get the name of the file for the API (remove the 'File:')  
    params_info = { 'action': 'query', 'prop': 'imageinfo', 'titles': f'File:{name_file_api}', 'format': 'json', 'iiprop': 'url'  
    // Get the URL of the image} 
    response_info = requests.get(f"pt.wikipedia.org", params=params_info) 
    data_info = response_info.json() 
    2. Show the raw data  
    Accessing the image URL (example, may vary depending on the JSON structure) 
    Navigate through the structure to find the actual URL  
    Ex: print(data_info['query']['pages']['-1']['imageinfo'][0]['url']) 

{"batchcomplete":"","query":  
{"pages":{"599489":  
{"pageid":599489,"ns":0,"title":"Penelope",  
"thumbnail":{"source":"https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Penelope_jacquacu01.jpg/60px-Penelope_jacquacu01.jpg","width":50,"height":39},  
"pageimage":"Penelope_jacquacu01.jpg",  
"pageprops":{"displaytitle":"<i>Penelope</i>","page_image_free":"Penelope_jacquacu01.jpg","wikibase_item":"Q1071983"}  
}  }  }  }  



# How to run

## Set up enviromment

    - Django
    - Sqlite
 

## Install

1. Clone the repository using the command git clone [https://github.com/mariaamadodominguez/Passarinhando.git]
2. Create a virtual environment for the project 
    - a. Install the python3-venv package using the command. 
        $ apt install python3.12-venv
        $ mkdir -p ~/.venvs 
    - b. venv will create a virtual Python installation in the .venv
        $ python3 -m venv myvenv
    - c. Activate the virtual env: source myvenv/bin/activate
3. pip install -r requirements.txt. Django, python-dotenv and thumbnails
4. Make and apply migrations by running python manage.py makemigrations and python manage.py migrate.
