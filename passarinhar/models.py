from django.db import models
from thumbnails.fields import ImageField
# Create your models here.
from django.contrib.auth.models import AbstractUser
from django.db import models


#class User(AbstractUser):        
#    pass


class Place(models.Model):
    place = models.CharField(max_length=100)
    lat = models.DecimalField(max_digits=10, decimal_places=7, default=0)
    lon = models.DecimalField(max_digits=10, decimal_places=7, default=0)
    subnational2Code = models.CharField(max_length=10, blank=True)
    locId = models.CharField(max_length=20, blank=True)
    latestObsDt = models.CharField(max_length=20, blank=True)
    numSpeciesAllTime = models.IntegerField(default=0)
    country= models.CharField(max_length=2, blank=True)
    region = models.CharField(max_length=100, blank=True)
    def __str__(self) -> str:
        return f"{self.place}"   
        
class WUser(AbstractUser):
    favouritesList = models.ManyToManyField(Place, blank=True, related_name="userFavourite")         
    def serialize(self):
        return {
            "user": {self.user.username},
            "favouritesList": [place.place for place in self.favouritesList.all()],
        }
    @property
    def FavouritesList_count(self):
        return self.favouritesList.count()    
   
class Follower(models.Model):
    user = models.ForeignKey(WUser, on_delete=models.CASCADE, blank=True, null=True, related_name="followerUser")
    following = models.ManyToManyField(WUser, blank=True, related_name="following")         
    #favourite_places = models.ManyToManyField(Place, blank=True, related_name="myplaces")         
    
    def serialize(self):
        return {
            "followUser": {self.user.username},
            "following": [user.username for user in self.following.all()],
            #"favourite_places": [place.place for place in self.favourite_places.all()],
        }
    @property
    def following_count(self):
        return self.following.count()
    #@property
    #def favourite_places_count(self):
    #    return self.favourite_places.count()

class Post(models.Model):
    author = models.ForeignKey(WUser, on_delete=models.CASCADE, related_name="author")    
    post_content = models.TextField(blank=True)
    likes = models.ManyToManyField(WUser, blank=True, related_name="likes")         
    timestamp = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def serialize(self):
        return {
            "id": self.id,
            "author": self.author.username,
            "postcontent": self.post_content,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes":      [user.username for user in self.likes.all()],
        }
    def as_dict(self):
        return {"id": "%d" % self.id,
                "author": self.author.username,
                "postcontent": self.post_content,
                "created_at":self.timestamp.strftime('%Y-%m-%d %H:%M'),
                "updated_at":self.updated_at.strftime('%Y-%m-%d %H:%M'),
                "likes":  [user.username for user in self.likes.all()],}

    @property
    def likes_count(self):
        return self.likes.count()
    
class Comment(models.Model):
    author  = models.ForeignKey(WUser, on_delete=models.CASCADE, blank=True, null=True, related_name="commentUser")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, blank=True, null=True, related_name="commentPost")
    comment = models.TextField()
    def serialize(self):
        return f" Comment  {self.post} (by {self.author.username})"    
class TabFamily(models.Model):
    pt_BR = models.CharField(max_length=64, blank=True)
    en = models.CharField(max_length=64, blank=True)
    spp_group_id = models.CharField(max_length=64, blank=True)
    species_code_begin = models.CharField(max_length=64, blank=True)
    species_code_end = models.CharField(max_length=64, blank=True)
    taxon_order_begin = models.FloatField(blank=True)
    taxon_order_end = models.FloatField(blank=True)
    def __str__(self):
        return self.pt_BR

class SpeciesTaxonomy(models.Model):
    taxon_order = models.IntegerField(blank=True)
    species_code = models.CharField(max_length=64, blank=True)
    def __str__(self):
        return self.species_code
    

class DataZoneSpecie(models.Model):
    SIS_ID  = models.CharField(max_length=20, blank=True)
    Sequence = models.CharField(max_length=20, blank=True)
    Family = models.CharField(max_length=64, blank=True)
    Scientific_name = models.CharField(max_length=64, blank=True)
    Common_name = models.CharField(max_length=64, blank=True)
    RL_Category = models.CharField(max_length=20, blank=True)
    PE = models.CharField(max_length=20, blank=True)
    PEW = models.CharField(max_length=20, blank=True)
    Seabird = models.CharField(max_length=20, blank=True)
    Waterbird = models.CharField(max_length=20, blank=True)
    Landbird = models.CharField(max_length=20, blank=True)
    Migratory_status = models.CharField(max_length=20, blank=True)
    Ecosystem_Terrestrial = models.CharField(max_length=20, blank=True)
    Ecosystem_Freshwater = models.CharField(max_length=20, blank=True)
    Ecosystem_Marine = models.CharField(max_length=20, blank=True)
    RL_AOO = models.CharField(max_length=20, blank=True)
    Criteria_met_at_highest_level = models.CharField(max_length=20, blank=True) 
    RL_EOO = models.CharField(max_length=20, blank=True)
    Population_size = models.CharField(max_length=20, blank=True) 
    Population_size_derivation = models.CharField(max_length=20, blank=True)
    Current_population_trend = models.CharField(max_length=20, blank=True) 
    Current_population_trend_derivation = models.CharField(max_length=20, blank=True)
    def __str__(self):
        return self.Scientific_name
class Spice(models.Model):
    name = models.CharField(max_length=64, unique=True)
    spice_code = models.CharField(max_length=20, null=True, blank=True)    
    scientific_name = models.CharField(max_length=64, null=True, blank=True)
    taxon_order = models.ForeignKey(SpeciesTaxonomy, on_delete=models.CASCADE,null=True, blank=True, related_name="spice_taxon_order") 
    DTScientific_name = models.ForeignKey(DataZoneSpecie, on_delete=models.CASCADE,null=True, blank=True, related_name="spice") 
    description = models.TextField(blank=True)
    url_spice_img  = models.URLField(max_length=300, blank=True)
    image = ImageField(upload_to='spice_images/', pregenerated_sizes=["small", "medium"], null=True)
    
    @property
    def imageURL(self):
        try:
            url = self.image.url
        except:
            url = ""
        return url
    def __str__(self) -> str:        
        return f"{self.name} - {self.scientific_name}"   
    def serialize(self):
        return {
            "name": self.name,
            "spice": self.name,
            "family": self.DTScientific_name.Family,
            "RL_Category": self.DTScientific_name.RL_Category,
        } 

    
class Sighting(models.Model):
    birder = models.ForeignKey(WUser, on_delete=models.CASCADE, related_name="owner")
    common_name = models.CharField(max_length=64)
    description = models.TextField(blank=True)
    url_img = models.URLField(blank=True)
    spice = models.ForeignKey(Spice, on_delete=models.CASCADE, blank=True,  null=True, related_name="sighting_spice")    
    place = models.ForeignKey(Place, on_delete=models.CASCADE, blank=True,  null=True, related_name="sighting_place")    
    date_created = models.DateField(auto_now_add=True)
    def __str__(self) -> str:
        return f"{self.common_name} - {self.description}"      
    def serialize(self):
        return {
            "birder": self.birder.username,
            "common_name": self.common_name,
            "description": self.description,
            "url_img": self.url_img,
            "spice": self.spice.name,
            "place": self.place.place,
            "date_created": self.date_created.strftime("%b %d %Y, %I:%M %p"),
        }         
