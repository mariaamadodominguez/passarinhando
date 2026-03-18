from django import forms
from .models import Spice, Place, DataZoneSpecie, TabFamily

ORDER_CHOICES = [
    ('D', 'Por data'),
    ('E', 'Por taxonomia'),
]

RECENT_CHOICES = [
    ('R', 'Avistamentos nas redondezas'),    
    ('L', 'Avistamentos num local ou região'),
    ('N', 'Avistamentos notaveis'),
]
LOCAL_CHOICES = [    
    ('L', 'Procurar local ou região'),
    ('R', 'Procurar nas redondezas'),
]

class NewPostForm(forms.Form):      
    post_content = forms.CharField(widget=forms.Textarea(attrs={'max_length':'120', "rows":"10",'class': 'form-control', 'placeholder': 'Escreva um post'}), label=False)
    

class CommentForm (forms.Form):
    newComment = forms.CharField(widget=forms.Textarea(attrs={'class':'form-control','placeholder': 'Escreve um comentário', "rows":"2"}), label=False)

class GeoForm(forms.Form):
    localidade = forms.CharField(widget=forms.TextInput(attrs={'id':'localidade', 'max_length':'100', 'class':'form-control','placeholder': 'Localidade'}), label=False)    
    limite = forms.FloatField(widget=forms.NumberInput(attrs={'id': 'query_limit', 'step': "1",'class': 'form-control', 'placeholder': 'Limite (5)'}), min_value=1, max_value=5, label=False)


class LocalsForm(forms.Form):
    tipo_procura = forms.ChoiceField(
        label='',
        choices=LOCAL_CHOICES,
        widget=forms.RadioSelect,
        help_text="Encontre lugares de destaque de um determinado local ou região, ou próximos a sua localização, dentro de um raio de até 50 quilômetros, a partir de um conjunto de coordenadas."
    )
    place = forms.ModelChoiceField(widget=forms.Select(attrs={'class': 'form-control'}), queryset=  Place.objects.all(), required=False, label='', empty_label="(Selecione o local)")    
    dist = forms.FloatField(widget=forms.NumberInput(attrs={'id': 'distance', 'step': "1",'class': 'form-control', 'placeholder': 'radio do local atual Km (max 50)'}), required=True, label='', min_value=1, max_value=50)    
    
class RecentsForm(forms.Form):
    tipo_procura = forms.ChoiceField(       
        label='',
        choices=RECENT_CHOICES,
        widget=forms.RadioSelect,
        help_text="Obtenha a lista de observações recentes e notáveis ​​(até 30 dias atrás) de aves avistadas em locais dentro de um raio de até 50 quilômetros, a partir de um conjunto de coordenadas fornecido. Observações notáveis ​​podem se referir a espécies raras local ou nacionalmente, ou a aves incomuns por outros motivos, como, por exemplo, aves invernantes de uma espécie que normalmente só visita o local no verão. Os resultados incluem apenas a observação mais recente para cada espécie na região especificada"        
    )
    tipo_ordem = forms.ChoiceField(        
        label='',
        choices=ORDER_CHOICES,
        widget=forms.RadioSelect,
        help_text='Ordene as observações por taxonomia ou por data, da mais recente para a mais antiga'
    )
    quantos = forms.FloatField(widget=forms.NumberInput(attrs={'id': 'query_limit', 'step': "1",'class': 'form-control', 'placeholder': 'Número de observações (máx.1000)'}), label='', min_value=1, max_value=1000)
    dist = forms.FloatField(widget=forms.NumberInput(attrs={'id': 'dist', 'step': "1",'class': 'form-control', 'placeholder': 'Radio do local Km (max 50)'}), required=True, label='', min_value=1, max_value=50)    
    place = forms.ModelChoiceField(widget=forms.Select(attrs={'class': 'form-control'}), queryset= Place.objects.all(), required=False, label='', empty_label="(Selecione o local)")

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
    spice = forms.ModelChoiceField(widget=forms.Select(attrs={'class': 'form-control'}), queryset= Spice.objects.all(), required=True, label='', empty_label="(Selecione a espécie)")
    place = forms.ModelChoiceField(widget=forms.Select(attrs={'class': 'form-control'}), queryset= Place.objects.all(), required=True, label='', empty_label="(Selecione o local)")
    description =  forms.CharField(widget=forms.Textarea(attrs={'max_length':'120', "rows":"4",'class': 'form-control', 'placeholder': 'Descreva o avistamento'}), label='')
  
class SpiceForm(forms.Form):    
    spice =  forms.CharField(widget=forms.TextInput(attrs={'max_length':'64','class':'form-control','placeholder': 'Espécie'}), label="", required=False )    
    #unique_families = DataZoneSpecie.objects.values_list('Family').distinct()    
    #family = forms.ModelChoiceField(widget=forms.Select(attrs={'class': 'form-control'}), queryset=unique_families, )        
    family = forms.ChoiceField(
        widget=forms.Select(attrs={'class': 'form-control'}),  
        label="Família",      
        required=False,        # Makes field optional
        choices=[], # Initialize with empty choices        
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Set the choices dynamically in the constructor
        qs = TabFamily.objects.values_list('en', 'pt_BR').distinct()
        qs = list(qs)
        qs.insert(0, ('', '---'))
        self.fields['family'].choices = qs
        #self.fields['family'].choices.insert(0, ('', '---'))