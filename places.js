window.onload = () => {
    let method = 'dynamic';

    method = 'static';

    if (method === 'static') {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const places = staticLoadPlaces(position.coords);
                renderPlaces(places);
            },
            (err) => console.error('Error in retrieving position', err),
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 27000,
            }
        );
    }

    if (method !== 'static') {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                dynamicLoadPlaces(position.coords)
                    .then((places) => {
                        renderPlaces(places);
                    });
            },
            (err) => console.error('Error in retrieving position', err),
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 27000,
            }
        );
    }
};

function staticLoadPlaces(position) {
    const userLat = position.latitude;
    const userLng = position.longitude;

    const offset = 0.0001;

    return [
        {
            name: "Nearby Place 1",
            location: {
                lat: userLat + offset, // 1 meter north
                lng: userLng + offset, // 1 meter east
            }
        },
        {
            name: "Nearby Place 2",
            location: {
                lat: userLat - offset, // 1 meter south
                lng: userLng - offset, // 1 meter west
            }
        },{
            name: "Temple",
            location: {
                lat: 11.144568,
                lng: 79.083350,
            }
        },
        {
            name: "Office",
            location: {
                lat: 11.144383,
                lng: 79.083584,
            }
        }
    ];
}

// getting places from REST APIs
function dynamicLoadPlaces(position) {
    let params = {
        radius: 300,    // search places not farther than this value (in meters)
        clientId: 'HZIJGI4COHQ4AI45QXKCDFJWFJ1SFHYDFCCWKPIJDWHLVQVZ',   // add your credentials here
        clientSecret: '',   // add your credentials here
        version: '20300101',    // Foursquare versioning, required but unuseful for this demo
    };

    // CORS Proxy to avoid CORS problems
    let corsProxy = 'https://cors-anywhere.herokuapp.com/';

    // Foursquare API
    let endpoint = `${corsProxy}https://api.foursquare.com/v2/venues/search?intent=checkin
        &ll=${position.latitude},${position.longitude}
        &radius=${params.radius}
        &client_id=${params.clientId}
        &client_secret=${params.clientSecret}
        &limit=15
        &v=${params.version}`;
    return fetch(endpoint)
        .then((res) => {
            return res.json()
                .then((resp) => {
                    return resp.response.venues;
                });
        })
        .catch((err) => {
            console.error('Error with places API', err);
        });
}

function renderPlaces(places) {
    let scene = document.querySelector('a-scene');

    places.forEach((place, index) => {
        const latitude = place.location.lat;
        const longitude = place.location.lng;

        // add place icon
        const icon = document.createElement('a-image');
        icon.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude}`);
        icon.setAttribute('name', place.name);
        icon.setAttribute('src', './map-marker.png');
        icon.setAttribute('location-marker','');
        icon.setAttribute('emitevents','true');
        icon.setAttribute('cursor','rayOrigin: mouse');
        icon.setAttribute('id',`icon-${index}`);
        // for debug purposes, just show in a bigger scale, otherwise I have to personally go on places...
        icon.setAttribute('scale', '3, 3');

        icon.addEventListener('loaded', () => window.dispatchEvent(new CustomEvent('gps-entity-place-loaded')));

        const clickListener = function (ev) {
            console.log("Clicked1");
            ev.stopPropagation();
            ev.preventDefault();

            console.log("Clicked2");
            console.log(place.name);
            const name = ev.target.getAttribute('name');
            const el = ev.detail.intersection && ev.detail.intersection.object.el;
            console.log("details", ev,ev.target,name,el, "end")
            if (el && el === ev.target) {
                const label = document.createElement('span');
                const container = document.createElement('div');
                container.setAttribute('id', 'place-label');
                label.innerText = name;
                container.appendChild(label);
                document.body.appendChild(container);

                setTimeout(() => {
                    container.parentElement.removeChild(container);
                }, 2000);
            }
        };

        icon.addEventListener('click', clickListener);
        icon.addEventListener('tap', clickListener);
        scene.appendChild(icon);
    });
}
