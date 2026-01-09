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
    path("foro", views.foro, name="foro"),
    
    # API Routes
    path("addNewPost", views.addNewPost, name="addNewPost"), 
    path("addNewLike", views.addNewLike, name="addNewLike"),
    path("addRemoveFollowing", views.addRemoveFollowing, name='addRemoveFollowing'),    
    path("updPostContent", views.updPostContent, name='updPostContent'),   
    path("birdoftheday", views.bird_of_the_day_view, name="birdoftheday"),
    path("showOnMap", views.show_on_map, name="showOnMap"),
]