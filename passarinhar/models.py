from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):        
    pass

class Follower(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, related_name="followerUser")
    following = models.ManyToManyField(User, blank=True, related_name="following")         
    def serialize(self):
        return {
            "followUser": {self.user.username},
            "following": [user.username for user in self.following.all()],
        }
    @property
    def following_count(self):
        return self.following.count()
    
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
            #"timestamp": self.timestamp,
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
