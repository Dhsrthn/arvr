window.onload = () => {

    document.addEventListener("touchend", (ev) => {
        console.log(ev)
    })

    let method = "dynamic";

    method = "static";

    if (method === "static") {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const places = staticLoadPlaces(position.coords);
                renderPlaces(places);
            },
            (err) => console.error("Error in retrieving position", err),
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 27000,
            }
        );
    }

    if (method !== "static") {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                dynamicLoadPlaces(position.coords).then((places) => {
                    renderPlaces(places);
                });
            },
            (err) => console.error("Error in retrieving position", err),
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
            name: "Nearby Place 2",
            location: {
                lat: userLat - offset, // 1 meter south
                lng: userLng - offset, // 1 meter west
            },
        },
        {
            name: "Nearby Place 1",
            location: {
                lat: userLat + offset, // 1 meter north
                lng: userLng + offset, // 1 meter east
            },
        },

        // {
        //     name: "Temple",
        //     location: {
        //         lat: 11.144568,
        //         lng: 79.08335,
        //     },
        // },
        {
            name: "Office",
            location: {
                lat: 11.144383,
                lng: 79.083584,
            },
        },
    ];
}

// getting places from REST APIs
function dynamicLoadPlaces(position) {
    let params = {
        radius: 300, // search places not farther than this value (in meters)
        clientId: "HZIJGI4COHQ4AI45QXKCDFJWFJ1SFHYDFCCWKPIJDWHLVQVZ", // add your credentials here
        clientSecret: "", // add your credentials here
        version: "20300101", // Foursquare versioning, required but unuseful for this demo
    };

    // CORS Proxy to avoid CORS problems
    let corsProxy = "https://cors-anywhere.herokuapp.com/";

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
            return res.json().then((resp) => {
                return resp.response.venues;
            });
        })
        .catch((err) => {
            console.error("Error with places API", err);
        });
}

function renderPlaces(places) {
    let scene = document.querySelector("a-scene");

    places.forEach((place, index) => {
        const latitude = place.location.lat;
        const longitude = place.location.lng;

        const entity = document.createElement("a-entity");
        entity.setAttribute(
            "gps-entity-place",
            `latitude: ${latitude}; longitude: ${longitude}`
        );
        entity.setAttribute("name", place.name);
        entity.setAttribute("id", `entity-${index}`);
        // entity.setAttribute("emitevents", "true");
        // entity.setAttribute("cursor", "rayOrigin: mouse");

        // add place icon
        const icon = document.createElement("a-image");
        icon.setAttribute(
            "gps-entity-place",
            `latitude: ${latitude}; longitude: ${longitude}`
        );
        icon.setAttribute("name", place.name);
        icon.setAttribute("src", "./map-marker.png");
        icon.setAttribute("emitevents", "true");
        icon.setAttribute("cursor", "rayOrigin: mouse");
        icon.setAttribute("id", `icon-${index}`);
        icon.setAttribute("scale", "2, 2");
        icon.setAttribute("look-at", "[gps-camera]");

        icon.addEventListener("click", (ev) => {
            console.log("Touched")
            ev.stopPropagation();
            ev.preventDefault();
            const name = ev.target.getAttribute("name");
            const el =
                ev.detail.intersection && ev.detail.intersection.object.el;
            if (el && el === ev.target) {
                console.log("Successful click on");
                console.log(name);
                const label = document.createElement("span");
                const container = document.createElement("div");
                container.setAttribute("id", "place-label");
                label.innerText = name;
                container.appendChild(label);
                document.body.appendChild(container);

                setTimeout(() => {
                    container.parentElement.removeChild(container);
                }, 2000);
            }
        });

        const textElement = document.createElement("a-text");
        const textScale = 3;
        textElement.setAttribute("scale", {
            x: textScale,
            y: textScale,
            z: textScale,
        });
        textElement.setAttribute(
            "gps-entity-place",
            `latitude: ${latitude}; longitude: ${longitude}`
        );
        textElement.setAttribute("value", place.name);
        textElement.setAttribute("position", "4,2,2");
        textElement.setAttribute("look-at", "[gps-camera]");

        entity.appendChild(textElement);
        entity.appendChild(icon);
        console.log("TextElement added " + place.name);
        scene.appendChild(entity);

        entity.addEventListener("loaded", () => {
            window.dispatchEvent(new CustomEvent("gps-entity-place-loaded"));
        });

        // icon.addEventListener("click", clickListener);
    });
}
