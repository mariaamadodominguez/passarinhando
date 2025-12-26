document.addEventListener('DOMContentLoaded', function () {
    function getLocation() {
        console.log('Geolocation is supported by this browser?');
        console.log("sessionStorage.geolocation", sessionStorage.geolocation);
        if (sessionStorage.geolocation) {
            console.log("getLocation sessionStorage.lat", sessionStorage.lat);
            console.log("getLocation sessionStorage.lon", sessionStorage.lon);
            showPosition(sessionStorage.lat, sessionStorage.lon);

        } else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(success);
            } else {
                const current_pos = document.getElementById("crnt-geo");
                console.log(current_pos);
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
        console.log("showPosition lat", lat);
        console.log("showPosition lon", lon);
        document.querySelector('#crnt-lat').innerHTML = lat;
        document.querySelector('#crnt-lon').innerHTML = lon;
    }
    getLocation();
})     