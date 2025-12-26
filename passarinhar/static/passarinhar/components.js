document.addEventListener('DOMContentLoaded', function () {

  var btns_collection = Array.from(document.getElementsByClassName('edit'));
  btns_collection.forEach(_btn => {
    document.getElementById(_btn.id).onclick = function () {
      var divs_collection = Array.from(document.getElementsByClassName('editdiv'));
      divs_collection.forEach(_div => {
        if (_div.dataset.id == this.dataset.id) {
          document.querySelector(`#updt-btn${this.dataset.id}`).addEventListener('click', () =>
            updt_content(_div.dataset.id));
          document.querySelector(`#close-btn${this.dataset.id}`).addEventListener('click', () =>
            hide_textarea(_div.dataset.id));
          document.getElementById(_div.id).style.display = "block";
          document.getElementById(`content${this.dataset.id}`).focus();
          document.getElementById(this.dataset.id).style.display = "none";

        }
      })
    }
  })

  function hide_textarea(updtd_post_id) {
    //  show div and hide text area  
    document.getElementById(`edit-sec${updtd_post_id}`).style.display = "none";
    document.getElementById(updtd_post_id).style.display = "block";
  }

  function updt_content(updtd_post_id) {
    url = update_url;
    const _content = document.getElementById(`content${updtd_post_id}`).value;
    fetch(url, {
      method: 'POST',
      headers: { "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value },
      body: JSON.stringify({
        post_id: updtd_post_id,
        post_content: _content,
      })
    })
      .then(response => response.json())
      .then(result => {
        hide_textarea(updtd_post_id);
      })
      .catch(error => {
        console.log(error);
        document.querySelector('#error-msg').style.display = 'block';
        document.querySelector('#error-msg').innerHTML = error;

      });
    // Stop form from submitting
    return false;
  }

  var like_btns = Array.from(document.getElementsByClassName('like-button'));
  like_btns.forEach(_btn => {
    document.getElementById(_btn.id).addEventListener('click', () =>
      addLikeUnlike(_btn.dataset.id));
  })

  function addLikeUnlike(post_id) {
    url = like_url;
    fetch(url, {
      method: "PUT",
      headers: { "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value },
      body: JSON.stringify({ post_id: post_id, })
    })
      .then((resp) => resp.json())
      .then((result) => {
        document.querySelector(`#like_count${post_id}`).innerHTML = result['likes'];
        if (result['userlike'])
          document.querySelector(`#like-icon${post_id}`).style = "color:red";
        else
          document.querySelector(`#like-icon${post_id}`).style = "color:black"
      })
      .catch(error => {
        console.log(error);
        document.querySelector('#error-msg').style.display = 'block';
        document.querySelector('#error-msg').innerHTML = error;
      });
  }


})     