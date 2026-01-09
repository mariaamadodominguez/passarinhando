# Create your views here.
import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import Http404, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from .models import User, Post, Follower
from django.core.paginator import Paginator
from django.conf import settings
#from django.contrib.gis.geoip2 import GeoIP2
from .forms import RecentsForm, LocalsForm
import requests
import folium

def fetch_hotspots_nearby(lat, lon, dist = 25):
    api_key = settings.EBIRD_API_KEY
    
    url = f"https://api.ebird.org/v2/ref/hotspot/geo?lat={lat}&lng={lon}&fmt=json&dist={dist}"
    print(url)
    payload={}
    headers = {
      'X-eBirdApiToken': api_key
    }    
    response = requests.request("GET", url, headers=headers, data=payload)    
    # print(api_key, response.text)    
    data = response.json()
    return {
        'data': data 
    }

def fetch_recent_observations_in_a_region(lat, lon, howmany = 1):
    api_key = settings.EBIRD_API_KEY
    locale = "pt-br"
    region = "BR-RJ-049"
    maxResults = howmany
    if lat == '':
        print('fetch_recent_observations_in_a_region')
        url = f"https://api.ebird.org/v2/data/obs/{region}/recent?sppLocale={locale}&maxResults={str(maxResults)}"
    else:
        print('fetch_recent_observations_in_a_LoC')
        url = f"https://api.ebird.org/v2/data/obs/geo/recent?lat={lat}&lng={lon}&sppLocale={locale}&maxResults={str(maxResults)}&detail=full"       
        
    print(url)
    payload={}
    headers = {
      'X-eBirdApiToken': api_key
    }    
    response = requests.request("GET", url, headers=headers, data=payload)    
    # print(api_key, response.text)
    
    data = response.json()
    return {
        'data': data 
    }

def hotspots_nearby_view(request):
    print(f"hotspots_nearby_view {request.method}")
    hotspots_nearby_data = None
    error = None
    if request.method == 'POST':
        form = LocalsForm(request.POST)
        if form.is_valid():
            latitude = request.POST["lat"]
            longitude = request.POST["lon"]
            dist = request.POST['dist']        
            hotspots_nearby_data = fetch_hotspots_nearby(
                latitude,longitude,dist)                        
            print(f"hotspots_nearby {latitude},{longitude},{dist}")
            
            if len(hotspots_nearby_data['data']) == 0 :
                error = 'Nenhum local encontrado!'           
        else:  
            pass
    else:
        form = LocalsForm(initial={"dist":5})      
    return render(request, "passarinhar/locais.html", {
            "title":'Locais de avistamento na região',
            "form": form,
            "error":error,
            "hotspots_nearby_data": hotspots_nearby_data
                  })

def show_on_map(request):
    # For a post request, add/remove following
    data = json.loads(request.body)        
    if request.method == "POST":
        home_lat = data.get('lat', '')
        home_lon = data.get('lon', '')
        near_by = data.get('near_by', '')
        home_map = folium.Map(location=[home_lat, home_lon], zoom_start=8)
    
    # instantiate a feature group for the nearby stations in the dataframe
    nearby_places = folium.map.FeatureGroup()

    # loop through the 20 stations nearby and add each to the feature group
    for lat, lng, in zip(near_by.lat, near_by.lng):
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
    latitudes = list(near_by.lat)
    longitudes = list(near_by.lng)
    labels = list(near_by.locName)

    for lat, lng, label in zip(latitudes, longitudes, labels):
        folium.Marker([lat, lng], popup=label).add_to(home_map)
    # add places to map
    home_map.add_child(nearby_places)
    context = {"nearby_map":home_map}
    return render(request, "passarinhar/locais.html",context)

def bird_of_the_day_view(request):
    try:         
        if request.headers.get('content-type') == 'application/json':        
            latitude = ''
            longitude = 'lon'     
            howmany = 1  
            recent_observations_data = fetch_recent_observations_in_a_region(
                latitude,
                longitude,
                howmany
            ) 
            if len(recent_observations_data['data']) > 0 :            
                return JsonResponse({
                    'data': recent_observations_data['data']})        
        else:
            return JsonResponse({'error': 'Nenhum passaro encontrado!'})
                       
    except Exception as e:
       return JsonResponse({'error': str(e)})
            
def recent_observations_view(request):
    print(f"recent_observations_view {request.method}")
    recent_observations_data = None
    error = None
    if request.method == 'POST':
        form = RecentsForm(request.POST)
        if form.is_valid():
            latitude = request.POST["lat"]
            longitude = request.POST["lon"]
            howmany = request.POST['howmany']        
            recent_observations_data = fetch_recent_observations_in_a_region(
                latitude,longitude,howmany)                        
            print(f"recent_observations_view {latitude},{longitude},{howmany}")
            
            if len(recent_observations_data['data']) > 0 :
                recent_observations_data = recent_observations_data
            else:
                error = 'Nenhuma observação recente encontrada!'           
        else:  
            pass

    form = RecentsForm(initial={"howmany":5})      
    return render(request, "passarinhar/recentes.html", {
            "title":'Avistamentos recentes na região',
            "form": form,
            "error":error,
            "recent_observations_data": recent_observations_data
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
        #'posts':allposts,
        'page_obj':page_obj,
    })
    
def index(request):
    
    return render(request, 'passarinhar/index.html', {
        'title':"Passarinho do dia",
        "page_name": 'passarinho'
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
        #'posts':posts,        
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
            user = User.objects.create_user(username, email, password)
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
        profile = User.objects.get(username=username)
    except User.DoesNotExist:
        raise Http404("Usuário não encontrado.")
    
    #Display the number of followers the user has, as well as 
    followers = Follower.objects.filter(following = profile).count()
    
    # number of people that the user follows.    
    author = Follower.objects.filter(user = profile)
    following = Follower.objects.filter(user__in=author.values_list("following", flat=True)).count()    

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
        #"posts": profilePosts,
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
            following_user = User.objects.get(username=data.get('following_user_name',''))
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

