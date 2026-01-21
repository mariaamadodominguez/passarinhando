from django.urls import path

from passarinhar import admin

from . import views
app_name = "passarinhar"  
urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("following", views.following, name="following"),    
    path("<str:username>/profile", views.profile, name="profile"),
    path("recents", views.recent_observations_view, name="recents"),
    path("locals", views.hotspots_nearby_view, name="locals"),
    path("foro", views.foro, name="foro"),
    path("mysightings", views.mysightings, name="mysightings"),
    path("allsightings", views.allsightings, name="allsightings"),
    path("favourites", views.favourites, name="favourites"),
    path("allplaces", views.allplaces, name="allplaces"),
    
    path("<str:lat>/<str:lon>/localrecents", views.localrecents, name="localrecents"),
    path("sighting/<int:sighting_id>", views.sighting, name="sighting"),

    # API Routes
    path("addNewPost", views.addNewPost, name="addNewPost"), 
    path("addNewLike", views.addNewLike, name="addNewLike"),
    path("addNewLocal", views.addNewLocal, name="addNewLocal"),
    path("addFavourite", views.addFavourite, name="addFavourite"),
    path("addRemoveFollowing", views.addRemoveFollowing, name='addRemoveFollowing'),    
    path("updPostContent", views.updPostContent, name='updPostContent'),   
    path("birdoftheday", views.bird_of_the_day_view, name="birdoftheday"),
]