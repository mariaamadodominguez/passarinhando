from django import forms
from .models import Spice, Place, DataZoneSpecie
RECENT_CHOICES = [
    ('L', 'Avistamentos num local ou região'),
    ('R', 'Avistamentos nas redondezas'),
    ('N', 'Avistamentos notaveis nas redondezas'),
]
LOCAL_CHOICES = [    
    ('L', 'Procurar local ou região'),
    ('R', 'Procurar nas redondezas'),
]

class NewPostForm(forms.Form):      
    post_content = forms.CharField(widget=forms.Textarea(attrs={'max_length':'120', "rows":"10",'class': 'form-control', 'placeholder': 'Escreve um post'}), label=False)
    

class CommentForm (forms.Form):
    newComment = forms.CharField(widget=forms.Textarea(attrs={'class':'form-control','placeholder': 'Escreve um comentário', "rows":"2"}), label=False)

class GeoForm(forms.Form):
    localidade = forms.CharField(widget=forms.TextInput(attrs={'id':'localidade', 'max_length':'100', 'class':'form-control','placeholder': 'Localidade'}), label=False)    
    limite = forms.FloatField(widget=forms.NumberInput(attrs={'id': 'query_limit', 'step': "1",'class': 'form-control', 'placeholder': 'Limite (5)'}), min_value=1, max_value=5, label=False)


class LocalsForm(forms.Form):
    tipo_procura = forms.ChoiceField(
        label='Tipo de Procura',
        choices=LOCAL_CHOICES,
        widget=forms.RadioSelect,
        help_text="Encontre lugares de destaque de um determinado local ou região, ou próximos a sua localização, dentro de um raio de até 500 quilômetros, a partir de um conjunto de coordenadas."
    )
    dist = forms.FloatField(widget=forms.NumberInput(attrs={'id': 'query_limit', 'step': "1",'class': 'form-control', 'placeholder': 'radio do local atual Km (max 500)'}), required=True, label='', min_value=1, max_value=500)
    place = forms.ModelChoiceField(widget=forms.Select(attrs={'class': 'form-control'}), queryset=  Place.objects.all(), required=False, label='', empty_label="(Selecione o local)")    
    lat = forms.CharField(widget=forms.HiddenInput(attrs={'id':'crnt-lat', 'max_length':'25', 'class':'form-control','label': 'Latitude'}))    
    lon =forms.CharField(widget=forms.HiddenInput(attrs={'id':'crnt-lon', 'max_length':'25', 'class':'form-control','label': 'Longitude'}))    
    

class RecentsForm(forms.Form):
    recent = forms.ChoiceField(
        label='Tipo de Procura',
        choices=RECENT_CHOICES,
        widget=forms.RadioSelect,
        help_text="Obtenha a lista de observações recentes e notáveis ​​(até 30 dias atrás) de aves avistadas em locais dentro de um raio de até 50 quilômetros, a partir de um conjunto de coordenadas fornecido. Observações notáveis ​​podem se referir a espécies raras local ou nacionalmente, ou a aves incomuns por outros motivos, como, por exemplo, aves invernantes de uma espécie que normalmente só visita o local no verão. Os resultados incluem apenas a observação mais recente para cada espécie na região especificada."        
    )
    place = forms.ModelChoiceField(widget=forms.Select(attrs={'class': 'form-control'}), queryset= Place.objects.all(), required=True, label="Selecione o local")
    
    lat = forms.CharField(widget=forms.HiddenInput(attrs={'id':'crnt-lat', 'max_length':'25', 'class':'form-control','label': ''}))    
    lon =forms.CharField(widget=forms.HiddenInput(attrs={'id':'crnt-lon', 'max_length':'25', 'class':'form-control','label': ''}))    
    quantos = forms.FloatField(widget=forms.NumberInput(attrs={'id': 'query_limit', 'step': "1",'class': 'form-control', 'placeholder': 'Quantos'}), label="Quantos" , min_value=1, max_value=30)

class SightingForm(forms.Form):   
    from datetime import datetime, timedelta
    
    name = forms.CharField(widget=forms.TextInput(attrs={'class':'form-control','placeholder': 'Nome da passarinhada'}), label="")
    date_created = forms.DateField(
        initial=datetime.now() ,
        widget=forms.widgets.DateInput(
            attrs={'placeholder': 'Data', 'type': 'text',
                'onfocus': "(this.type='date')", }
        ),
        label="Data")
    spice = forms.ModelChoiceField(widget=forms.Select(attrs={'class': 'form-control'}), queryset= Spice.objects.all(), required=True, label="Selecione a espécie")
    place = forms.ModelChoiceField(widget=forms.Select(attrs={'class': 'form-control'}), queryset= Place.objects.all(), required=True, label="Selecione o local")
    description =  forms.CharField(widget=forms.Textarea(attrs={'max_length':'120', "rows":"4",'class': 'form-control', 'placeholder': 'Descreva o avistamento'}), label='')
  
