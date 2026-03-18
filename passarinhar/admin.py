from django.contrib import admin
class SpiceAdmin(admin.ModelAdmin):
    list_display = ("name", "spice_code")    
class PlaceAdmin(admin.ModelAdmin):
    list_display = ("place", "subnational2Code", "country", "lat", "lon")
class DataZoneSpecieAdmin(admin.ModelAdmin):    
    list_display = ("SIS_ID", "Sequence", "Family", "Scientific_name", "Common_name")
class TabFamilyAdmin(admin.ModelAdmin):
    list_display = ("pt_BR", "en", "spp_group_id")
class SpeciesTaxonomyAdmin(admin.ModelAdmin):
    list_display = ("taxon_order", "species_code")
from .models import Spice, Sighting, Place, WUser, Follower, Post, Comment, DataZoneSpecie, TabFamily, SpeciesTaxonomy

admin.site.register(WUser)
admin.site.register(Follower)
admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(Place, PlaceAdmin)
admin.site.register(Spice, SpiceAdmin)
admin.site.register(Sighting)
admin.site.register(DataZoneSpecie, DataZoneSpecieAdmin)
admin.site.register(TabFamily, TabFamilyAdmin)
admin.site.register(SpeciesTaxonomy, SpeciesTaxonomyAdmin)