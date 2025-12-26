document.addEventListener('DOMContentLoaded', function() {
    // post the request    
    document.querySelector('#follow-btn').onclick = function() {      
      follow_unfollow(this.dataset.profile);
    }  
    function follow_unfollow(following_name) {    
      //Mark as following or unfollowing
      var url = unfollow_url;   
      fetch(url, {
        method: 'POST',
        headers: {"X-CSRFToken":document.querySelector('[name=csrfmiddlewaretoken]').value},
        body: JSON.stringify({
        following_user_name:following_name 
        })
      })  
      .then(response => response.json())
      .then(result => {       
          console.log("result:", result);
          document.querySelector('#prf-followers').innerHTML =  result['followers']; 
          if (result['action'] == 'follows') {
            document.querySelector('#follow-btn').innerHTML = "Unfollow";
            document.querySelector('#follow-btn').value = "Unfollow";  
          }
          else {
            document.querySelector('#follow-btn').innerHTML = "Follow";
            document.querySelector('#follow-btn').value = "Follow";                        
          }             
      })
      .catch(error => {
        console.log('Error:', error);
      }) ;    
    }
  });
