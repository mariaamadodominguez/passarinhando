from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):        
    pass

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

class Follower(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name="followerUser")
    following = models.ManyToManyField(User, blank=True, related_name="following")         
    favourite_places = models.ManyToManyField(Place, blank=True, related_name="myplaces")         
    
    def serialize(self):
        return {
            "followUser": {self.user.username},
            "following": [user.username for user in self.following.all()],
            "favourite_places": [place.place for place in self.favourite_places.all()],
        }
    @property
    def following_count(self):
        return self.following.count()
    @property
    def favourite_places_count(self):
        return self.favourite_places.count()

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="author")    
    post_content = models.TextField(blank=True)
    likes = models.ManyToManyField(User, blank=True, related_name="likes")         
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
    author  = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name="commentUser")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, blank=True, null=True, related_name="commentPost")
    comment = models.TextField()
    def serialize(self):
        return f" Comment  {self.post} (by {self.author.username})"    


class Spice(models.Model):
    spice_code = models.CharField(max_length=20, null=True, blank=True)
    name = models.CharField(max_length=64, unique=True)
    scientific_name = models.CharField(max_length=64, null=True, blank=True)
    description = models.TextField(blank=True)
    url_spice_img  = models.URLField(blank=True)
    def __str__(self) -> str:
        return f"{self.name} - {self.scientific_name}"   
    
class Sighting(models.Model):
    birder = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owner")
    common_name = models.CharField(max_length=64, unique=True)
    description = models.TextField(blank=True)
    url_img = models.URLField(blank=True)
    spice = models.ForeignKey(Spice, on_delete=models.CASCADE, blank=True,  null=True, related_name="spiceCode")    
    place = models.ForeignKey(Place, on_delete=models.CASCADE, blank=True,  null=True, related_name="placeCode")    
    date_created = models.DateField(auto_now_add=True)
    def __str__(self) -> str:
        return f"{self.common_name} - {self.description}"            