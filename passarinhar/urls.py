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
    path("<str:lat>/<str:lon>/recents", views.recent_observations_view, name="recents"),
    # API Routes
    path("addNewPost", views.addNewPost, name="addNewPost"), 
    path("addNewLike", views.addNewLike, name="addNewLike"),
    path("addRemoveFollowing", views.addRemoveFollowing, name='addRemoveFollowing'),    
    path("updPostContent", views.updPostContent, name='updPostContent'),    
    
]