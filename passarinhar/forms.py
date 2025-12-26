from django import forms

class NewPostForm(forms.Form):      
    post_content = forms.CharField(widget=forms.Textarea(attrs={'max_length':'120', "rows":"10",'class': 'form-control', 'placeholder': 'Escreve um post'}), label=False)
    

class CommentForm (forms.Form):
    newComment = forms.CharField(widget=forms.Textarea(attrs={'class':'form-control','placeholder': 'Escreve um comentário', "rows":"2"}), label=False)
