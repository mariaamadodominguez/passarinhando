document.addEventListener('DOMContentLoaded', function () {
  var fav_btns = Array.from(document.getElementsByClassName('fav-button'));
  fav_btns.forEach(_btn => {
    console.log(_btn.id, _btn.dataset.id)
    document.getElementById(_btn.id).addEventListener('click', () =>
      addFavourite(_btn.dataset.id));
  })

  function addFavourite(place_id) {
    url = '/addFavourite';
    console.log("addFavourite", place_id)
    fetch(url, {
      method: "PUT",
      headers: { "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value },
      body: JSON.stringify({ place_id: place_id, })
    })
      .then((resp) => resp.json())
      .then((result) => {
        if (result['userFav'])
          document.querySelector(`#fav-icon${place_id}`).style = "color:red";
        else
          document.querySelector(`#fav-icon${place_id}`).style = "color:gray"
      })
      .catch(error => {
        console.log(error);
        document.querySelector('#error-msg').style.display = 'block';
        document.querySelector('#error-msg').innerHTML = error;
      });
  }

}) 
