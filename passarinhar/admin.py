from django.contrib import admin
class PostAdmin(admin.ModelAdmin):
    list_display = ("id","author","post_content", "timestamp","updated_at")
class FollowerAdmin(admin.ModelAdmin):
    list_display = ("id","user", "following_count")    
from .models import Spice, Sighting, Place, WUser, Follower, Post, Comment

admin.site.register(WUser)
admin.site.register(Follower, FollowerAdmin)
admin.site.register(Post, PostAdmin)
admin.site.register(Comment)
admin.site.register(Place)
admin.site.register(Spice)
admin.site.register(Sighting)