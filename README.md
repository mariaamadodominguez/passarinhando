# eBird
Usa eBird's API para recuperar informações de passarinhos e locais de avistamento

  * APIKey   
    o88vlfn3ppah  
  * Doc  
    https://documenter.getpostman.com/view/664302/S1ENwy59  
    https://www.reddit.com/r/Ornithology/comments/14hodrv/web_developer_in_search_of_apis_providing/

    recents https://api.ebird.org/v2/data/obs/{{regionCode}}/recent
    notáveis https://api.ebird.org/v2/data/obs/{{regionCode}}/recent/notable
    hotspots https://api.ebird.org/v2/ref/hotspot/geo?lat=-22.36&lng=-42.53&fmt=json

# Wikipedia 
Usa Wikimedia's API pora recuperar as images  
  * Doc  
    https://www.mediawiki.org/w/api.php?action=help&modules=query%2Bpageimages   
    https://www.mediawiki.org/wiki/Wikimedia_REST_API  

  * Exemplo  
  en.wikipedia.org|pageterms&piprop=thumbnail&pithumbsize=500&titles=jacuguaçu   
 
import requests   
url = 'https://pt.wikipedia.org/w/api.php?action=query&prop=pageimages|pageprops&format=json&pithumbsize=300&titles=japu'   
headers = {'User-Agent': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0)'}  
req = requests.get(url, headers=headers)  
print(req.status_code)   
print(req.headers)   
print(req.text)  

import requests 
1. Buscar informações da imagem  
url_imagem = 'File:Exemplo.jpg'  // Substitua pelo nome do arquivo  
nome_arquivo_api = url_imagem.split('/')[-1].replace('File:', '') // Obter o nome do arquivo para a API (remove o 'File:')  
params_info = { 'action': 'query', 'prop': 'imageinfo', 'titles': f'File:{nome_arquivo_api}', 'format': 'json', 'iiprop': 'url'  
// Pede a URL da imagem} 
resposta_info = requests.get(f"pt.wikipedia.org", params=params_info) 
dados_info = resposta_info.json() 
print("--- Informações da Imagem ---") 
print(dados_info)  
2. Mostrar os dados brutos  
Acessando a URL da imagem (exemplo, pode variar dependendo da estrutura JSON) 
Navegar pela estrutura para encontrar a URL real  
Ex: print(dados_info['query']['pages']['-1']['imageinfo'][0]['url']) 


{"batchcomplete":"","query":  
{"pages":{"599489":  
{"pageid":599489,"ns":0,"title":"Penelope",  
"thumbnail":{"source":"https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Penelope_jacquacu01.jpg/60px-Penelope_jacquacu01.jpg","width":50,"height":39},  
"pageimage":"Penelope_jacquacu01.jpg",  
"pageprops":{"displaytitle":"<i>Penelope</i>","page_image_free":"Penelope_jacquacu01.jpg","wikibase_item":"Q1071983"}  
}  
}  
}  
}  

pip install django-thumbnails
from thumbnails.fields import ImageField

class spice(models.Model):
    ...
    image = ImageField(upload_to='spice_images/', pregenerated_sizes=["small", "medium"])

https://datazone.birdlife.org/search
Important Bird and Biodiversity Areas (IBAs) and Key Biodiversity Areas (KBAs) are sites identified as being internationally significant for the conservation of birds and other biodiversity, based on a set of standardised, data-driven criteria.

https://datazone.birdlife.org/site/factsheet/20213-regi%C3%A3o-serrana-do-rio-de-janeiro
https://datazone.birdlife.org/species/factsheet/giant-antshrike-batara-cinerea#Taxonomy
https://birdsoftheworld.org/bow/species/giaant2/cur/introduction?login
https://icons.getbootstrap.com/

# folium



LOAD DATA LOCAL INFILE '/path/to/your_file.csv'
INTO TABLE your_table
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
LOAD DATA LOCAL INFILE '/home/maria/CS50/species-filter-results.csv'
 
 .import --skip 1 -v /home/maria/CS50/species_group.csv  passarinhar_tabfamily