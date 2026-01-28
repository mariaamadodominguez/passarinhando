import { getCurrentLocation } from './utils.js';
document.addEventListener('DOMContentLoaded', function () {
    console.log("getLocation: sessionStorage.geolocation", sessionStorage.geolocation);
    async function getLocation() {
        if (!sessionStorage.geolocation) {
            await getCurrentLocation();
        }
        console.log("getLocation: sessionStorage.geolocation after getCurrentLocation", sessionStorage.geolocation);
        // console.log("getLocation: sessionStorage.lat", sessionStorage.lat);
        // console.log("getLocation: sessionStorage.lon", sessionStorage.lon);
        const current_latpos = document.getElementById("crnt-lat");
        const current_lonpos = document.getElementById("crnt-lon");
        current_latpos.value = sessionStorage.lat;
        current_lonpos.value = sessionStorage.lon;

    }

    getLocation()

})     