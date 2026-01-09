document.addEventListener('DOMContentLoaded', function () {
    
    function getLocation() {
        // console.log("sessionStorage.geolocation", sessionStorage.geolocation);
        if (sessionStorage.geolocation) {
            showPosition(sessionStorage.lat, sessionStorage.lon);

        } else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(success);
            } else {
                const current_pos = document.getElementById("geoloc");
                current_pos.innerHTML = "Geolocation is not supported by this browser.";
            }
        }
    }
    function success(position) {
        console.log(position);
        sessionStorage.geolocation = 1;
        sessionStorage.lat = position.coords.latitude;
        sessionStorage.lon = position.coords.longitude;
        showPosition(sessionStorage.lat, sessionStorage.lon);
    }

    function showPosition(lat, lon) {
                                                      
        document.querySelector('#crnt-lat').value = lat;
        document.querySelector('#crnt-lon').value = lon;     
          
    }

    getLocation();
    
})     