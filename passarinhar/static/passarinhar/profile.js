document.addEventListener('DOMContentLoaded', function () {
  // post the request    
  document.querySelector('#follow-btn').onclick = function () {
    follow_unfollow(this.dataset.profile);
  }
  function follow_unfollow(following_name) {
    //Mark as following or unfollowing
    var url = unfollow_url;
    fetch(url, {
      method: 'POST',
      headers: { "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value },
      body: JSON.stringify({
        following_user_name: following_name
      })
    })
      .then(response => response.json())
      .then(result => {
        console.log("result:", result);
        document.querySelector('#prf-followers').innerHTML = "Seguidores: " + result['followers'];
        if (result['action'] == 'follows') {
          document.querySelector('#follow-btn').innerHTML = "Deixar de seguir";
          document.querySelector('#follow-btn').value = "Deixar de seguir";
        }
        else {
          document.querySelector('#follow-btn').innerHTML = "Seguir";
          document.querySelector('#follow-btn').value = "Seguir";
        }
      })
      .catch(error => {
        console.log('Error:', error);
      });
  }
});
