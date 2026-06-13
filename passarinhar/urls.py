from django.urls import path

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
    path("geoloc", views.geo_view, name="geo_view"),
    path("foro", views.foro, name="foro"),
    path("mysightings", views.mysightings, name="mysightings"),
    path("allsightings", views.allsightings, name="allsightings"),
    path("favourites", views.favourites, name="favourites"),
    path("allplaces", views.allplaces, name="allplaces"),
    path("allspices", views.allspices, name="allspices"),
    path("<str:lat>/<str:lon>/<str:place>/localrecents", views.localrecents, name="localrecents"),
    path("sighting/<int:sighting_id>", views.sighting, name="sighting"),
    path("edit_sighting/<int:sighting_id>", views.edit_sighting, name="edit_sighting"),
    path("delete_sighting/<int:sighting_id>", views.delete_sighting, name="delete_sighting"),
    path("addNewSighting", views.addNewSighting, name="addNewSighting"),

    # API Routes
    path("addNewPost", views.addNewPost, name="addNewPost"), 
    path("addNewLike", views.addNewLike, name="addNewLike"),
    path("addNewLocal", views.addNewLocal, name="addNewLocal"),
    path("addNewSpice", views.addNewSpice, name="addNewSpice"),
    path("addFavourite", views.addFavourite, name="addFavourite"),
    path("addRemoveFollowing", views.addRemoveFollowing, name='addRemoveFollowing'),    
    path("updPostContent", views.updPostContent, name='updPostContent'),   
    path("birdoftheday", views.bird_of_the_day_view, name="birdoftheday"),
    path("spice_map_view", views.spice_map_view, name="spice_map_view"),
    path("taxonomy_view", views.taxonomy_view, name="taxonomy_view"),
    path("bird_player_view", views.bird_player_view, name="bird_player_view"),
    path("get_data_zone_specie", views.get_data_zone_specie, name="get_data_zone_specie"),
    #path("bird_profile_view", views.bird_profile_view, name="bird_profile_view")
]