from django.contrib import admin

# Register your models here.
from django.contrib import admin
class PostAdmin(admin.ModelAdmin):
    list_display = ("id","author","post_content", "timestamp","updated_at")
class FollowerAdmin(admin.ModelAdmin):
    list_display = ("id","user", "following_count")    
# Register your models here.
from .models import Spice, Sighting, Place, User, Follower, Post, Comment
# Register your models here.
admin.site.register(User)
admin.site.register(Follower, FollowerAdmin)
admin.site.register(Post, PostAdmin)
admin.site.register(Comment)
admin.site.register(Place)
admin.site.register(Spice)
admin.site.register(Sighting)