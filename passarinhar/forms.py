from django import forms

class NewPostForm(forms.Form):      
    post_content = forms.CharField(widget=forms.Textarea(attrs={'max_length':'120', "rows":"10",'class': 'form-control', 'placeholder': 'Escreve um post'}), label=False)
    

class CommentForm (forms.Form):
    newComment = forms.CharField(widget=forms.Textarea(attrs={'class':'form-control','placeholder': 'Escreve um comentário', "rows":"2"}), label=False)

class RecentsForm(forms.Form):
    lat = forms.CharField(widget=forms.TextInput(attrs={'id':'crnt-lat', 'max_length':'25', 'class':'form-control','placeholder': 'Latitude'}))    
    lon =forms.CharField(widget=forms.TextInput(attrs={'id':'crnt-lon', 'max_length':'25', 'class':'form-control','placeholder': 'Longitude'}))    
    city = forms.CharField(widget=forms.TextInput(attrs={'id':'city', 'max_length':'100', 'class':'form-control','placeholder': 'City'}), required=False)    
    howmany = forms.FloatField(widget=forms.NumberInput(attrs={'id': 'query_limit', 'step': "1",'class': 'form-control', 'placeholder': 'Quantos'}), min_value=1, max_value=30)
