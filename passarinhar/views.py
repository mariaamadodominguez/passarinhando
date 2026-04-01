# Create your views here.
from django.core.files import File
from django.core import serializers
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import Http404, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator
from django.core.files.temp import NamedTemporaryFile
from django.conf import settings
from django.db.models import Q, F
from dbm import error
from .forms import GeoForm, RecentsForm, LocalsForm, SightingForm, SpiceForm
from .models import WUser, Post, Follower, Sighting, Place, Spice, DataZoneSpecie, SpeciesTaxonomy, TabFamily
import folium
import json
import os
import requests
import urllib.request

def fetch_species_taxonomy(species_code):
    api_key = settings.EBIRD_API_KEY
    data=''
    locale = "pt-br"
    url = f"https://api.ebird.org/v2/ref/taxonomy/ebird?species={species_code}&fmt=json&locale={locale}"
    # print(url)
    payload={}
    headers = {
      'X-eBirdApiToken': api_key
    }    
    try:
        response = requests.request("GET", url, headers=headers, data=payload, timeout=5) # timeout to prevent 
        response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
    except Exception as err:
        # Handle any other potential exceptions
        print(f"An unexpected error occurred: {err}")
    else:
        print(f"Success! Response status code for {url} is {response.status_code}")
        # Process the successful response
        # print(response.json())  
        data = response.json()
    return {
        'data': data 
    }

def fetch_hotspots_nearby(lat, lon, dist = 25, region='BR-RJ-049'):
    data = ''
    api_key = settings.EBIRD_API_KEY
    if lat != '':
        url = f"https://api.ebird.org/v2/ref/hotspot/geo?lat={lat}&lng={lon}&fmt=json&dist={dist}"
    else:
        url = f"https://api.ebird.org/v2/ref/hotspot/{region}?fmt=json"
    # print(url)
    payload={}
    headers = {
      'X-eBirdApiToken': api_key
    }    

    try:
        response = requests.request("GET", url, headers=headers, data=payload, timeout=5) # timeout to prevent indefinite waits        
        response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
    except Exception as err:
        # Handle any other potential exceptions
        print(f"An unexpected error occurred: {err}")
    else:
        print(f"Success! Response status code for {url} is {response.status_code}")
        # Process the successful response, e.g., 
        # print(response.json())
        data = response.json()

    return {
        'data': data 
    }


def fetch_recent_nearby_notable_observations(lat, lon, dist = 250, back = 30, detail = 'simple', hotspot = True, sppLocale = "pt-br"):
    api_key = settings.EBIRD_API_KEY
    data = ''
    url = f"https://api.ebird.org/v2/data/obs/geo/recent/notable?lat={lat}&lng={lon}&detail={detail}&back={back}&dist={dist}&hotspot={hotspot}&sppLocale={sppLocale}"
    # print(url)
    payload={}
    headers = {
      'X-eBirdApiToken': api_key
    }    
    try:
        response = requests.request("GET", url, headers=headers, data=payload,timeout=5) # timeout to prevent indefinite waits            
        response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
        # print(api_key, response.text)
    except Exception as err:
        # Handle any other potential exceptions
        print(f"An unexpected error occurred: {err}")
    else:
        print(f"Success! Response status code for {url} is {response.status_code}")
        # Process the successful response, e.g., 
        # print(response.json())    
        data = response.json()
    return {
        'data': data 
    }
    
def fetch_nearest_observations_of_a_species(species_code, lat, lon, dist= 50, back= 30, includeProvisional= True):
    api_key = settings.EBIRD_API_KEY
    data = ''
    url = f"https://api.ebird.org/v2/data/nearest/geo/recent/{species_code}?lat={lat}&lng={lon}&dist={dist}&back={back}&includeProvisional={includeProvisional}"
    #print(url)
    payload={}
    headers = {
      'X-eBirdApiToken': api_key
    }    
    try:
        response = requests.request("GET", url, headers=headers, data=payload, timeout=5) # timeout to prevent indefinite waits           
        response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
        # print(api_key, response.text)
    except Exception as err:
        # Handle any other potential exceptions
        print(f"An unexpected error occurred: {err}")
    else:
        print(f"Success! Response status code for {url} is {response.status_code}")
        # Process the successful response, e.g., 
        # print(response.json())         
        data = response.json()
    return {
        'data': data 
    }

def fetch_recent_observations_in_a_region(lat, lon, howmany= 1, sort='date', dist= 25,region= "BR-RJ-049", locale= "pt-br"):
    api_key = settings.EBIRD_API_KEY 
    maxResults = howmany
    data = ''
    if lat == '':
        # print('fetch_recent_observations_in_a_region')
        url = f"https://api.ebird.org/v2/data/obs/{region}/recent?sppLocale={locale}&maxResults={str(maxResults)}&detail=full"
    else:
        # print('fetch_recent_observations_in_a_LoC')
        url = f"https://api.ebird.org/v2/data/obs/geo/recent?lat={lat}&lng={lon}&sort={sort}&dist={dist}&sppLocale={locale}&maxResults={str(maxResults)}&detail=full"       
        
    #(url)
    payload={}
    headers = {
      'X-eBirdApiToken': api_key
    }    
    try:
        response = requests.request("GET", url, headers=headers, data=payload, timeout=5) # timeout to prevent indefinite waits        
        response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
        # print(api_key, response.text)
    except Exception as err:
        # Handle any other potential exceptions
        print(f"An unexpected error occurred: {err}")
    else:
        print(f"Success! Response status code for {url} is {response.status_code}")
        # Process the successful response, e.g., 
        # print(response.json())    
        data = response.json()
    return {
        'data': data 
    }

def allplaces(request):    
    error = None
    allplaces = Place.objects.all()
    crntlat = request.session["crnt-lat"]
    crntlon = request.session["crnt-lon"]
        
    if allplaces:
        allplaces = allplaces.order_by("-pk").all()   
        p = Paginator(allplaces, 10)
        page_number = request.GET.get('page')
        page_obj = p.get_page(page_number)
        hotspots_nearby_data = page_obj    
        home_map = show_on_map(crntlat, crntlon, "allplaces", hotspots_nearby_data)
        map_html = home_map._repr_html_()    
    else:
        error = 'Nenhum local registrado!'
        map_html = None
        page_obj = None
    
    return render(request, "passarinhar/places.html", {
        'title':"Locais de Avistamento Registrados",
        "page_name": 'allplaces',        
        'page_obj':page_obj,
        "nearby_map":map_html,
        "error": error
        })
            
def allspices(request):    
    error = None
    page_obj = None
    page_number = request.GET.get('page')
    selected_name = ''
    selected_family = ''
    
    if request.method == 'POST':
        form = SpiceForm(request.POST)
        if form.is_valid():
            selected_name = form.cleaned_data['spice']
            selected_family = form.cleaned_data['family']                  
    else:  
        title = "Especies Registradas"         
        form = SpiceForm()        
           
    if selected_name !='':    
        allspices = Spice.objects.filter(name__icontains=selected_name)            
        title = f"Especies {selected_name}* registradas"
            
    elif selected_family != '':
        
        bird_families = TabFamily.objects.filter(en=selected_family)             
        if bird_families:            
            try:
                taxon = SpeciesTaxonomy.objects.filter(taxon_order__range = (bird_families[0].taxon_order_begin, bird_families[0].taxon_order_end))
            except SpeciesTaxonomy.DoesNotExist:
                # Handle the case where the object doesn't exist
                taxon = None
            #print(taxon)
            allspices = Spice.objects.filter(taxon_order__in=taxon)         
            title = f"Especies de {bird_families[0].pt_BR} registradas"
        else:
            allspices = Spice.objects.all()      
            title = "Todas as especies registradas"
    else:
        allspices = Spice.objects.all()      
        title = "Todas as especies registradas"
    allspices = allspices.order_by("name").all()      
    if allspices:   
        p = Paginator(allspices, 10)        
        page_obj = p.get_page(page_number)     
        print(f'pagenumber {page_number}')   
    else:
        error = 'Sem dados'               
    
    return render(request, "passarinhar/spices.html", {
        'title':title,
        'form': form,
        'page_obj':page_obj,
        "error": error
        })

def addFavourite(request):
    
    data = json.loads(request.body)    
    place_id = data.get('place_id','')
    fav = None
    try:
        place = Place.objects.get(pk=place_id)
        currentUser = WUser.objects.get(pk=request.user.id)
        if place in currentUser.favouritesList.all():    
            fav = False
            currentUser.favouritesList.remove(place) 
        else:
            fav = True
            currentUser.favouritesList.add(place)                
        currentUser.save()

    except WUser.DoesNotExist:
        raise Http404("Place not found.")
    
    return JsonResponse({"userFav": fav})        
          
def favourites(request):    
    error = None
    crntlat = request.session["crnt-lat"]
    crntlon = request.session["crnt-lon"]
    
    # Filter places returned based on favourites:
    user = WUser.objects.filter(id = request.user.id)    
    fav_places = Place.objects.filter(id__in=user.values_list("favouritesList", flat=True))  
    
    # Return all user favourite places in reverse chronologial order
    fav_places = fav_places.order_by("-pk").all()
    if fav_places:    
        p = Paginator(fav_places, 10)
        page_number = request.GET.get('page')
        page_obj = p.get_page(page_number)
    
        hotspots_nearby_data = page_obj        
        home_map = show_on_map(crntlat, crntlon, "favourite", hotspots_nearby_data)
        map_html = home_map._repr_html_()    
    else:
        map_html = None
        page_obj = None
        error = 'Nenhum local registrado como favorito!'

    return render(request, "passarinhar/places.html", {
        'title':"Locais de Avistamento Favoritos",
        "page_name": 'favs',        
        'page_obj':page_obj,
        "hotspots_nearby_data": hotspots_nearby_data,
        "nearby_map":map_html,
        "error": error   
        })          
                    
def fetch_geo_data(city, limit):
    api_key = settings.OPEN_WEATHER_KEY
    url = f'http://api.openweathermap.org/geo/1.0/direct?q=={city}&appid={api_key}&limit={limit}'
    response = requests.get(url)
    data = response.json()
    return {
        'data': data
    }        

def geo_view(request):
    if request.method == 'POST':
        form = GeoForm(request.POST)
        if form.is_valid():
            localidade = form.cleaned_data['localidade']
            limite = int(form.cleaned_data['limite'])
            geo_data = fetch_geo_data(localidade, limite)   
            if len(geo_data['data']) > 0 :
                return render(request, 'passarinhar/geoloc.html', {'title':'Geodata', 'geo_data': geo_data, 'form': form})
            else:
                return render(request, 'passarinhar/geoloc.html', {
                                'title':'Geodata',
                                'error': f'Geodata para {localidade} não encontrada!',
                                'form': form })
    else:
        form = GeoForm()        
    return render(request, 'passarinhar/geoloc.html', {'title':'Geodata', 'form': form})    

def hotspots_nearby_view(request):
    hotspots_nearby_data = None
    error = None
    home_map = None
    map_html = None
    page_obj = None
    form = LocalsForm(request.GET)
    if form.is_valid():
        dist = request.GET['dist']        
        selected_value = form.cleaned_data['tipo_procura']  
        place_object = form.cleaned_data['place']            
                           
        if selected_value == 'L': # local subnational2 code.                                
            latitude = place_object.lat
            longitude = place_object.lon                
        else : # selected_value == 'R''- nearby)  
            latitude = request.session['crnt-lat']
            longitude = request.session['crnt-lon']          

        hotspots_nearby_data = fetch_hotspots_nearby(latitude,longitude, dist)                                

        if len(hotspots_nearby_data['data']) == 0 :
            error = 'Nenhum local encontrado!' 
            hotspots_nearby_data = None
        else:
            hotspots_nearby_data = hotspots_nearby_data['data']
            home_map = show_on_map(latitude, longitude, "hotspot", hotspots_nearby_data)
            map_html = home_map._repr_html_()   
            p = Paginator(hotspots_nearby_data, 10)
            page_number = request.GET.get('page')
            page_obj = p.get_page(page_number)                   
    else:
        form = LocalsForm()      

    return render(request, "passarinhar/locais.html", {
            "title":'Locais de avistamento na região',
            "form": form,
            "error":error,
            "nearby_map":map_html,
            "page_obj":page_obj
        })

def show_on_map(latitude, longitude, type, nearby, zoom_start=12):
    kw_bird = {"prefix": "fa", "color": "green", "icon": "crow"}
    kw_house = {"prefix": "fa", "color": "blue", "icon": "house"}
    kw = {"color": "blue"}    
    headers = {
    "User-Agent": "PAssarinhar/1.0 (contact: mardomngz@gmail.com)"
    }
    if type == "favourite" or type == "allplaces":
        locName_list = [item.place for item in nearby] 
        lng_list = [item.lon for item in nearby]
        lat_list = [item.lat for item in nearby]        
    else:       
        lng_list = [item['lng'] for item in nearby]
        lat_list = [item['lat'] for item in nearby]
        if type == 'bird':
            locName_list = [item['comName'] for item in nearby] 
            kw = kw_bird
        else: 
            locName_list = [item['locName'] for item in nearby] 
            
        
    home_map = folium.Map(        
        location=[latitude, longitude], 
        zoom_start=zoom_start,
        control_scale=True,
        headers=headers
    )       
    
   # instantiate a feature group for the nearby stations in the dataframe
    nearby_places = folium.map.FeatureGroup()
    for lat, lng, in zip(lat_list, lng_list):
        nearby_places.add_child(
            folium.features.CircleMarker(
                [lat, lng],
                radius=5, # define how big you want the circle markers to be
                color='yellow',
                fill=True,
                fill_color='blue',
                fill_opacity=0.6
            )
        )

    # add pop-up text to each marker on the map        
    home_label = "Sua localização"        
    for lat, lng, label in zip(lat_list, lng_list, locName_list):    
        try:    
            if f"{lat:.7f}" ==f"{latitude:.7f}"  and f"{lng:.7f}" == f"{longitude:.7f}":
                home_label = label                        
        except:
            pass
        
        folium.Marker(
            [lat, lng], 
            popup=label,
            icon=folium.Icon(**kw)
            ).add_to(home_map)
    
    folium.Marker(
        [latitude, longitude], 
        popup=home_label,
        icon=folium.Icon(**kw_house)
        ).add_to(home_map)
    # add places to map
    home_map.add_child(nearby_places)
    return home_map

def get_data_zone_specie(request):
    bird = None
    try:
        if request.headers.get('content-type') == 'application/json':      
            data = json.loads(request.body)    
            DZS_name = data.get('DZS_name','')
            bird_data = DataZoneSpecie.objects.filter(Scientific_name=DZS_name)                    
            bird = [bird for bird in bird_data] # Or use list(queryset)
            bird = serializers.serialize('json', bird_data)
            return JsonResponse({
                'bird':bird
            }, content_type='application/json') 

    except DataZoneSpecie.DoesNotExist:
        # Handle the case where the object doesn't exist                    
        print({f"error": "Record {DZS_name} not found."}, status=404)
        return JsonResponse({'error': 'Nenhuma ave encontrada!'})
    

def bird_of_the_day_view(request):
    try:         
        if request.headers.get('content-type') == 'application/json':      
            data = json.loads(request.body)    
            request.session["crnt-lat"]=data.get('lat','')
            request.session["crnt-lon"]=data.get('lon','')
            howmany = 1  
            recent_observations_data = fetch_recent_observations_in_a_region(
                request.session["crnt-lat"],
                request.session["crnt-lon"],
                howmany,
                dist=50,sort = 'species'          ) 
                
            if len(recent_observations_data['data']) > 0 :     
                # print(recent_observations_data['data'][0]['comName'])
                latlng = recent_observations_data['data']   
                # print(f'latlng{latlng}')                                             
                DZS_name=recent_observations_data['data'][0]['sciName']
                try:
                    bird_data = DataZoneSpecie.objects.filter(Scientific_name=DZS_name)
                    bird = [bird for bird in bird_data] # Or use list(queryset)
                    bird = serializers.serialize('json', bird_data)
                except DataZoneSpecie.DoesNotExist:
                    # Handle the case where the object doesn't exist                    
                    print({f"error": "Record {comName} not found."}, status=404)
                    bird = None                                                                        
        
                home_map = show_on_map(request.session["crnt-lat"], request.session["crnt-lon"], "bird", latlng, zoom_start = 10)
                map_html = home_map._repr_html_() 
                return JsonResponse({
                    'data': recent_observations_data['data'],
                    'debossan_map': map_html,
                    'bird':bird
                    }, content_type='application/json') 
            else:
                return JsonResponse({'error': 'Nenhuma ave encontrada!'})
                               
    except Exception as e:
       return JsonResponse({'error': str(e)})

def taxonomy_view(request):

    try:        
        if request.headers.get('content-type') == 'application/json':      
            data = json.loads(request.body)    
            species_code = data.get('species_code','')
            taxonomy_data = fetch_species_taxonomy(
                species_code
            ) 

            if len(taxonomy_data['data']) > 0 :   
                pt_BR_family = ''
                taxon_order = taxonomy_data['data'][0]['taxonOrder']
                try:
                    bird_families = TabFamily.objects.filter(
                        Q(taxon_order_begin__lte=taxon_order) & 
                        Q(taxon_order_end__gte=taxon_order))
                    if len(bird_families) > 0:
                        pt_BR_family = bird_families[0].pt_BR
                    else:
                        pt_BR_family = ''
                except Exception as e:
                    print(f'error: {e}')

                return JsonResponse({
                    'data': taxonomy_data['data'],
                    'pt_BR_family': pt_BR_family
                    }, content_type='application/json') 
            else:
                return JsonResponse({'error': 'Nenhuma taxonomia encontrada!'})
                               
    except Exception as e:
       return JsonResponse({'error': str(e)})

def spice_map_view(request):
    try:         
        if request.headers.get('content-type') == 'application/json':      
            data = json.loads(request.body)    
            species_code = data.get('species_code','')
            latitude = data.get('lat','')
            longitude = data.get('lon','')    

            nearest_observations_data = fetch_nearest_observations_of_a_species(
                species_code,
                latitude,
                longitude
            ) 
            if len(nearest_observations_data['data']) > 0 :                     
                latlng = nearest_observations_data['data']   
                spice_map = show_on_map(latitude, longitude, "nearest", latlng, zoom_start = 10)
                map_html = spice_map._repr_html_()                 
                return JsonResponse({
                    'data': nearest_observations_data['data'],
                    'spice_map': map_html,
                    }, content_type='application/json') 
            else:
                return JsonResponse({'error': 'Nenhuma observação encontrada!'})
                               
    except Exception as e:
       return JsonResponse({'error': str(e)})

def save_img(name, url_spice_img):      
    try:    
        
        img_temp = NamedTemporaryFile(delete=True)
        req = urllib.request.Request(url_spice_img, headers={'User-Agent': 'MyPythonScript/1.0 (maria.amado.d@gmail.com)'})
        with urllib.request.urlopen(req) as response:
            img_temp.write(response.read())
        # print (f'Imagem url {url_spice_img}')                              
        img_temp.flush()     
                             
        # Create a model instance and save the image        
        instance = Spice.objects.filter(name=name)
        if instance is None:
            print({f"error": "Record {name} not found."}, status=404)
        else:
            upload_dir = os.path.join(settings.MEDIA_ROOT, 'spice_images/')
            if not os.path.exists(upload_dir):
                print('making os.path({upload_dir})')
                os.makedirs(upload_dir, exist_ok=True)
            instance[0].image.save(f"remote_{name}.jpg", File(img_temp), save=True)                               
        # print (f'Image remote_{name}.jpg saved')
    except Exception as e:
       print ({'error': str(e)})

def addNewSpice(request):
    try:
        if request.method == 'POST':
            data = json.loads(request.body)    
            name = data.get('name','')            
            scientific_name = data.get('scientific_name','')
            spice_code = data.get('spice_code','')                
            description = data.get('description','')                                 
            url_spice_img = data.get('url_spice_img','')   

            current = Spice.objects.filter(name=name)
            if current:
                message = 'Passarinho já cadastrado.'                                
            else:
                DZS_name=scientific_name
                try:
                    spice = DataZoneSpecie.objects.get(Scientific_name=DZS_name)
                except DataZoneSpecie.DoesNotExist:
                    # Handle the case where the object doesn't exist
                    spice = None
                
                taxon_spice_code = spice_code
                try:
                    taxon = SpeciesTaxonomy.objects.get(species_code=taxon_spice_code)
                except SpeciesTaxonomy.DoesNotExist:
                    # Handle the case where the object doesn't exist
                    taxon = None

                new_spice = Spice(
                spice_code=spice_code,
                name=name,                
                taxon_order=taxon,
                scientific_name=scientific_name,
                DTScientific_name = spice,
                description=description,
                url_spice_img=url_spice_img
                )
                new_spice.save()
                message = f'Passarinho {name} cadastrado com sucesso.'                                        
                save_img(name, url_spice_img)

    except Exception as e:
        return JsonResponse({'error': str(e)})  

    return JsonResponse({'message': message})
    

def addNewLocal(request):
    if request.method == 'POST':
        data = json.loads(request.body)    
        lat = data.get('lat','0')
        lon = data.get('lon','0')
        current = Place.objects.filter(lat=data.get('lat',''), lon=data.get('lon') )
        if current:
            message = 'Local já registrado!'                                
        else:
            place = data.get('place','')
            latestObsDt = data.get('latestObsDt','')
            numSpeciesAllTime = data.get('numSpeciesAllTime','')
            parts = data.get('subnational2Code','').split('-')
            if len(parts) == 2:
                locId = data.get('locId','')
                subnational2Code = data.get('subnational2Code','')
                country= subnational2Code.split('-')[0]
                region = subnational2Code.split('-')[1]
            else:
                locId = ''
                subnational2Code = ''
                
                country= data.get('locId','')
                region = data.get('subnational2Code','')

            new_local = Place(
                place=place,
                lat=lat,
                lon=lon,
                country=country,
                region=region,
                subnational2Code=subnational2Code,
                locId=locId,
                latestObsDt=latestObsDt,
                numSpeciesAllTime=numSpeciesAllTime,
            )
            new_local.save()    
            message = 'Local salvo com sucesso!'
            # add to favouriteslist
            currentUser = request.user
            currentUser.favouritesList.add(new_local)                
            currentUser.save()
            
    return JsonResponse({"message": message})

def localrecents(request, lat, lon, place):
    recent_observations_data = None
    error = None
    page_number = request.GET.get('page')                      
    max_views = 30   
    if lat != ' ':
        recent_observations_data = fetch_recent_observations_in_a_region(lat, lon, max_views, dist=25, sort='species')
        title = f"Avistamentos recentes perto de {place}"   
    else:
        recent_observations_data = fetch_recent_observations_in_a_region('', lon, max_views, region=lon, sort='species')
        title = f"Avistamentos recentes em {place} (região) {lon}"
    if len(recent_observations_data['data']) == 0 :
        page_obj = None
        error = 'Nenhuma observação recente encontrada!'
    else:
        p = Paginator(recent_observations_data['data'], 10)                
        page_obj = p.get_page(page_number)
    return render(request, "passarinhar/recentes.html", {
            "title":title,
            "error":error,
            "type_page":'local',            
            "page_obj":page_obj
                  })
    
def recent_observations_view(request):
    error = None
    page_obj = None    
    howmany = None
    
    latitude = request.session["crnt-lat"]
    longitude = request.session["crnt-lon"]                
    title = 'Avistamentos recentes na região'
    form = RecentsForm(request.GET)
    print(request.method, form.is_valid())
    if form.is_valid():
        howmany = int(form.cleaned_data['quantos'])
        dist = int(form.cleaned_data['dist'])
        selected_value = form.cleaned_data['tipo_procura']  
        place_object = form.cleaned_data['place']      
        order_type = form.cleaned_data['tipo_ordem']  
          
        if order_type == 'D':
            sort_value ='date'
        else:
            sort_value = 'species'
        if selected_value == 'N':                
            title = f"Avistamentos notáveis perto de {place_object.place}"                 
            recent_observations_data = fetch_recent_nearby_notable_observations(latitude,longitude, dist)
        else :
            if selected_value == 'L': # local 
                title = f"Avistamentos recentes perto de {place_object.place}"
                latitude = place_object.lat
                longitude = place_object.lon                                    
            else:                     # nearby)  
                title = 'Avistamentos recentes na região'                        
            recent_observations_data = fetch_recent_observations_in_a_region(latitude,longitude,howmany, sort_value, dist)                                

        if len(recent_observations_data['data']) == 0 :
            error = 'Nenhuma observação recente encontrada!'           
        else:
            p = Paginator(recent_observations_data['data'], 10)                
            if request.method == 'POST':
                page_obj = p.get_page(1)                
            else:
                page_obj = p.get_page(request.GET.get('page'))                
        return render(request, "passarinhar/recentes.html", {
            "title": title,
            "form": form,
            "error":error,            
            "type_page":'recentes',            
            "page_obj":page_obj
            })
    else:
        return render(request, "passarinhar/recentes.html", {
            "title": 'Avistamentos recentes na região',
            "form": RecentsForm(),
            "error":'',
            "type_page":'recentes',            
            "page_obj":None
            })

def mysightings(request):      
    mysightings = Sighting.objects.filter(birder=request.user)
    #print(request.user, mysightings)
    return render(request, "passarinhar/sightings_list.html", {
        "title":f"{request.user} - Meus avistamentos",
        "sightings":mysightings
        })

def allsightings(request):      
    allsightings = Sighting.objects.all()
    # order_by("-date_created").all()
    return render(request, "passarinhar/sightings_list.html", {
        "title":"Todos os avistamentos",
        "sightings": allsightings,
        "form": SightingForm()  
        })

def sighting(request, sighting_id):
    try:
        currentSighting = Sighting.objects.get(id=sighting_id)   
        #print(currentSighting.common_name, currentSighting.url_img)                 
        form = SightingForm(initial={"birdier_name":currentSighting.birder, "name":currentSighting.common_name, "spice":currentSighting.spice, "place":currentSighting.place, "date_created":currentSighting.date_created, "description":currentSighting.description})
        place = [currentSighting.place]
        home_map = show_on_map(place[0].lat, place[0].lon, "favourite", place)      
        map_html = home_map._repr_html_() 
    except Sighting.DoesNotExist:
        raise Http404("Sighting not found.")

    return render(request, "passarinhar/sighting.html", {
        'form': form,
        "home_map": map_html,
        "title":f"{currentSighting.common_name}",
        "sighting": currentSighting,                 
    })

def edit_sighting(request, sighting_id):
    try:
        form = SightingForm(request.POST)      
        currentSighting = Sighting.objects.get(id=sighting_id)   
        #print(currentSighting.birder, currentSighting.common_name, currentSighting.url_img) 
        if form.is_valid():     
            currentSighting.common_name = form.cleaned_data['name']
            currentSighting.spice = form.cleaned_data['spice']
            currentSighting.place = form.cleaned_data['place']
            currentSighting.date_created = form.cleaned_data['date_created']
            currentSighting.description = form.cleaned_data['description']
        currentSighting.save()          
    except Sighting.DoesNotExist:
        raise Http404("Sighting not found.")
    return render(request, "passarinhar/sighting.html", {
        'form': form,
        "title":f"{currentSighting.common_name}",
        "sighting": currentSighting,                 
    })

def addNewSighting(request):
    if request.method == 'POST':
        form = SightingForm(request.POST)
        if form.is_valid():
            spice = form.cleaned_data['spice']
            place = form.cleaned_data['place']
            common_name = form.cleaned_data['name']
            date_created = form.cleaned_data['date_created']
            description = form.cleaned_data['description']
            new_sighting = Sighting(birder=request.user, common_name=common_name, spice=spice, place=place, date_created=date_created, description=description)
            new_sighting.save()
            return HttpResponseRedirect(reverse('passarinhar:allsightings'))
    return HttpResponseRedirect(reverse('passarinhar:allsightings'))

def delete_sighting(request, sighting_id):
    try:
        currentSighting = Sighting.objects.get(id=sighting_id)   
        currentSighting.delete()          
    except Sighting.DoesNotExist:
        raise Http404("Sighting not found.")
    return render(request, "passarinhar/sighting.html", {
        'form': form,
        "title":f"{currentSighting.common_name}",
        "sighting": currentSighting,                 
    })

def index(request):
    if "crnt-lat" not in request.session:
        request.session["crnt-lat"]=''
        request.session["crnt-lon"]=''
        
    return render(request, 'passarinhar/index.html', {
        'title':"Ave do dia",
        "page_name": 'birdotd'
        })      

def foro(request):
    allposts = Post.objects.all()
    
    # Return post in reverse chronologial order
    allposts = allposts.order_by("-timestamp").all()
    
    p = Paginator(allposts, 10)
    page_number = request.GET.get('page')
    page_obj = p.get_page(page_number)
    
    return render(request, "passarinhar/foro.html", {
        'title':"Foro",
        "page_name": 'foro',
        'page_obj':page_obj,
    })
                        
def following(request):    
    # Filter post returned based on following":
    authors = Follower.objects.filter(user = request.user)
    posts = Post.objects.filter(author__in=authors.values_list("following", flat=True))                

    # Return post in reverse chronologial order
    posts = posts.order_by("-timestamp").all()

    p = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = p.get_page(page_number)

    return render(request, "passarinhar/foro.html", {
        'title':"Seguidos",
        "page_name": 'following',
        'page_obj':page_obj,
        })

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("passarinhar:index"))
        else:
            return render(request, "passarinhar/login.html", {
                "message": "Nome de usuário e/ou senha inválidos."
            })
    else:
        return render(request, "passarinhar/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("passarinhar:index"))

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "passarinhar/register.html", {
                "message": "As senhas devem coincidir."
            })

        # Attempt to create new user
        try:
            user = WUser.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "passarinhar/register.html", {
                "message": "Nome de usuário já em uso."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("passarinhar:index"))
    else:
        return render(request, "passarinhar/register.html")

def profile(request, username):

    try:
        profile = WUser.objects.get(username=username)
    except WUser.DoesNotExist:
        raise Http404("Usuário não encontrado.")
    
    #Display the number of followers the user has, as well as 
    followers = Follower.objects.filter(following = profile).count()
    
    # number of people that the user follows.    
    author = Follower.objects.filter(user = profile)
    #following = Follower.objects.filter(user__in=author.values_list("following", flat=True)).count()    
    following = Follower.objects.filter(following__in=author.values_list("following", flat=True)).count()    
    current_user = request.user
    inFollowingList = Follower.objects.filter(user=current_user.id, following=profile).count()
    if inFollowingList:
        follow_label = "Deixar de seguir"
    else:
        follow_label = "Seguir"
    # pk=listing_id, watchlist=request.user      
    profilePosts = Post.objects.filter(author = profile)
    profilePosts = profilePosts.order_by("-timestamp").all()
    
    p = Paginator(profilePosts, 10)
    page_number = request.GET.get('page')
    page_obj = p.get_page(page_number)

    data = {
        "title": username,
        "page_name": "profile",
        "profile_obj": profile,
        "followers": followers,
        "following": following,
        "page_obj": page_obj,
        "follow_label":follow_label,
    }
    return render(request, "passarinhar/foro.html", data)

def addNewPost(request):
    if request.method == 'POST':
        post = Post(
            author=request.user,
            post_content =  request.POST["postcontent"]
        )
        post.save()    
    return HttpResponseRedirect(reverse("passarinhar:foro"))
    
def addRemoveFollowing(request):
    # For a post request, add/remove following
    data = json.loads(request.body)        
    if request.method == "POST":
        try:                        
            following_user = WUser.objects.get(username=data.get('following_user_name',''))
        except KeyError:
            return JsonResponse({"error": "Requisição inválida: Usuário não encontrado."}, status=404)
        try:            
            currentFollower = Follower.objects.get(user=request.user.id)
            #logged user already following someone
            inFollowingList = Follower.objects.filter(user=request.user.id, following=following_user).count()
            if inFollowingList > 0:                 
                currentFollower.following.remove(following_user) 
                action = 'unfollows'
            else:
                currentFollower.following.add(following_user)                
                action = 'follows'
            currentFollower.save()

        except Follower.DoesNotExist:
            #logged user following someone for the first time
            currentFollower = Follower(
                user = request.user           
            )            
            currentFollower.save()
            currentFollower.following.add(following_user)
            action = 'follows'
        
    followers = Follower.objects.filter(following = following_user).count()        
    return JsonResponse({
        "followers": followers,
        "action":action})      
    
def updPostContent(request):
    # For a post request, update the post content     
    data = json.loads(request.body)    
    if request.method == "POST":        
        current = Post.objects.get(pk=data.get('post_id',''))
        if current is None:
            return JsonResponse({"error": "Post não encontrado."}, status=404)
        new_content = data.get('post_content','')
        current.post_content = new_content
        current.save()            
    return JsonResponse({
        "message": "Post atualizado."})

def addNewLike(request):
    data = json.loads(request.body)    
    post_id = data.get('post_id','')
    currentPost = Post.objects.get(pk=post_id)
    if currentPost is None:
        return JsonResponse({"error": "Post não encontrado."}, status=404)
    # Update likes
    if request.method == "PUT":
        if Post.objects.filter(pk=post_id, likes=request.user):                 
            like = False
            currentPost.likes.remove(request.user)
        else:
            like = True
            currentPost.likes.add(request.user)
        currentPost.save()
    return JsonResponse({
        "likes": currentPost.likes_count,
        "userlike": like})        
