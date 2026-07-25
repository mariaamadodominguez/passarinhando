import { getCurrentLocation } from './utils.js';
document.addEventListener('DOMContentLoaded', function () {

    async function getLocation() {
        await getCurrentLocation();
        console.log("getLocation: sessionStorage.geolocation after getCurrentLocation", sessionStorage.geolocation);
        console.log("getLocation: sessionStorage.lat", sessionStorage.lat);
        console.log("getLocation: sessionStorage.lng", sessionStorage.lng);
        var coords = Array.from(document.getElementsByClassName('coords'));
        if (coords.length > 0) {
            if (document.getElementById("crnt-lat").innerHTML.length == 0) {
                document.getElementById("crnt-lat").innerHTML = sessionStorage.lat;
                document.getElementById("crnt-lng").innerHTML = sessionStorage.lng;
            }
            document.getElementById("gps-accuracy").textContent = sessionStorage.gps_accuracy;
        }
    }

    if (!sessionStorage.geolocation) {
        getLocation();
    } else {
        var coords = Array.from(document.getElementsByClassName('coords'));
        if (coords.length > 0) {
            if (document.getElementById("crnt-lat").innerHTML.length == 0) {
                document.getElementById("crnt-lat").innerHTML = sessionStorage.lat;
                document.getElementById("crnt-lng").innerHTML = sessionStorage.lng;
            }
            document.getElementById("gps-accuracy").textContent = sessionStorage.gps_accuracy;
        }
    }
})



