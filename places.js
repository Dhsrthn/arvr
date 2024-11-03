// method can be json, api, example
// for example, use static
// for json, parse an array of the given format and call renderPlaces with the array
// for api mode, use dynamic and call dynamicLoadPlaces

//inital method
var method = "sample";

window.onload = () => {
    modeChange(method);
};

function removeAllImagesAndText() {
    const scene = document.querySelector("a-scene");
    scene.querySelectorAll("a-image, a-text").forEach((element) => {
        scene.removeChild(element);
    });
}

function loadPlacesBasedOnMethod() {
    switch (method) {
        case "sample": {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    const places = staticLoadPlaces(position.coords);
                    renderPlaces(places);
                },
                (err) => console.error("Error in retrieving position", err),
                { enableHighAccuracy: true, maximumAge: 0, timeout: 27000 }
            );
            break;
        }
        case "api": {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    dynamicLoadPlaces(position.coords).then((places) => {
                        renderPlaces(places);
                    });
                },
                (err) => console.error("Error in retrieving position", err),
                { enableHighAccuracy: true, maximumAge: 0, timeout: 27000 }
            );
            break;
        }
        case "json": {
            document.getElementById("jsonUpload").click();
            break;
        }
        default: {
            console.error("Invalid method");
        }
    }
}

function modeChange(selectedMethod) {
    method = selectedMethod;
    console.log("Method changed to", method);
    document.querySelectorAll("button.mode-btn").forEach((btn) => {
        btn.disabled = false;
    });
    document.getElementById(`${method}-btn`).disabled = true;

    removeAllImagesAndText();
    loadPlacesBasedOnMethod();
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const places = JSON.parse(e.target.result);
                console.log("Places loaded from JSON", places);
                renderPlaces(places);
            } catch (err) {
                console.error("Error parsing JSON file:", err);
                alert("Invalid JSON file. Please upload a valid JSON file.");
            }
        };
        reader.readAsText(file);
    }
}

function staticLoadPlaces(position) {
    const userLat = position.latitude;
    const userLng = position.longitude;

    // 2 metre approximately
    const offset = 0.0002;

    return [
        {
            name: "Nearby Place 2",
            location: {
                lat: userLat,
                lng: userLng - offset,
            },
            desc: "This is a description for nearby place 2",
        },
        {
            name: "Nearby Place 1",
            location: {
                lat: userLat + offset,
                lng: userLng + offset,
            },
            desc: "This is a description for nearby place 1",
        },
    ];
}

function getDescriptionByName(name, places) {
    const place = places.find((place) => place.name === name);
    return place ? place.desc : "Description not available";
}

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

        icon.addEventListener("loaded", () => {
            window.dispatchEvent(new CustomEvent("gps-entity-place-loaded"));
        });

        icon.addEventListener("mousedown", (ev) => {
            ev.stopPropagation();
            ev.preventDefault();
            const name = ev.target.getAttribute("name");
            const el =
                ev.detail.intersection && ev.detail.intersection.object.el;
            if (el && el === ev.target) {
                const desc = getDescriptionByName(name, places);
                window.alert("Successful click on " + name + "\n" + desc);
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
        textElement.setAttribute("position", "5,2,2");
        textElement.setAttribute("look-at", "[gps-camera]");
        scene.appendChild(icon);
        scene.appendChild(textElement);
    });
}

function closeDialog() {
    document.getElementById("info-dialog").style.display = "none";
}

setTimeout(closeDialog, 10000);
