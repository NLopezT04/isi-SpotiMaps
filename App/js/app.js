////                    TODAS LAS KEYS DE LAS API AQUI              ////

// API Key de Geoapify
const APIKeyGeoapify = "0b8dffcbecc84716ab11d5ac53f8caf5";
const APIKeyTicketMaster = "NVOQ1LlrFNB0eQ42mesPgp9sBydEnbay";
const APIKeySpotifyClientID = "55086423840c498fb2cd17957284e590";
const APIKeySpotifyClientSecret = "244bc7ee510e46f386a264381459abc8";

////                              CODIGO MAPA                       ////

// Crear mapa Leaflet
const map = L.map('my-map').setView([48.1500327, 11.5753989], 3);

// Retina requerida para añadir los titulos al mapa
const isRetina = L.Browser.retina;
const baseUrl = "https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey={apiKey}";
const retinaUrl = "https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}@2x.png?apiKey={apiKey}";

// Añadir capa del mapa. Colocar en 15 el maximo del zoom.
L.tileLayer(isRetina ? retinaUrl : baseUrl, {
    apiKey: APIKeyGeoapify,
    maxZoom: 15,
    id: 'osm-bright',
}).addTo(map);

// Añadir controles de zoom arriba a la derecha
map.zoomControl.remove();
L.control.zoom({
    position: 'topright'
}).addTo(map);

// Marcador para geolocaclización inversa
const concertsIcon = L.icon({
    iconUrl: `https://api.geoapify.com/v1/icon/?type=awesome&color=%236ac926&icon=music&apiKey=${APIKeyGeoapify}`,
    iconSize: [31, 46],
    iconAnchor: [15.5, 42],
});

const markerIcon = L.icon({
    iconUrl: `https://api.geoapify.com/v1/icon/?type=material&color=%23c92626&size=x-large&iconType=awesome&iconSize=large&textSize=large&apiKey=${APIKeyGeoapify}`,
    iconSize: [31, 46],
    iconAnchor: [15.5, 42],
});

let marker;
let conciertos;

//Función al detectar un click en el mapa
function onMapClick(e) {

    if (marker) {
        marker.remove();
    }

    const reverseGeocodingUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${e.latlng.lat}&lon=${e.latlng.lng}&apiKey=${APIKeyGeoapify}`;

    // Llamada a la API para hacer geolocaclización inversa
    fetch(reverseGeocodingUrl).then(result => result.json())
        .then(featureCollection => {
            if (featureCollection.features.length === 0) {
                document.getElementById("status").textContent = "No se encontro ninguna dirección";
                return;
            }

            const foundAddress = featureCollection.features[0];
            document.getElementById("name").value = foundAddress.properties.name || '';
            document.getElementById("house-number").value = foundAddress.properties.housenumber || '';
            document.getElementById("street").value = foundAddress.properties.street || '';
            document.getElementById("postcode").value = foundAddress.properties.postcode || '';
            document.getElementById("city").value = foundAddress.properties.city || '';
            document.getElementById("state").value = foundAddress.properties.state || '';
            document.getElementById("country").value = foundAddress.properties.country || '';
            document.getElementById("latlng").value = foundAddress.properties.lat + "," + foundAddress.properties.lon;;

            document.getElementById("status").textContent = `Dirección encontrada: ${foundAddress.properties.country}`;

            //Crear marcador en el lugar donde se ha hecho click
            marker = L.marker(new L.LatLng(foundAddress.properties.lat, foundAddress.properties.lon), {
                icon: markerIcon
            }).addTo(map);
            map.setView([foundAddress.properties.lat, foundAddress.properties.lon], 7);
            
            ticketMasterPorPais(foundAddress.properties.country_code);
        });
}

let ticketMasterMarker = [];
function ticketMasterPorPais(CodigoPais) {
 
    for(var i=0; i<ticketMasterMarker.length; i++){
        ticketMasterMarker[i].remove();

    }
    
    categoria = 'Music'
    url = "https://app.ticketmaster.com/discovery/v2/events.json?apikey=" + APIKeyTicketMaster + "&classificationName=Music&countryCode=" + CodigoPais,
        fetch(url).then(result => result.json())
        .then(featureCollection => {
            console.log(featureCollection);
            for (var i = 0; i < featureCollection.page.size; i++) {
                elementid = "Concierto" + i;
                grupo = featureCollection._embedded.events[i].name || '';
                ciudad = featureCollection._embedded.events[i]._embedded.venues[0].city.name || '';
                fecha = featureCollection._embedded.events[i].dates.start.localDate || '';
                hora = featureCollection._embedded.events[i].dates.start.localTime || '';
                urlEntradas = featureCollection._embedded.events[i].url
                
                const token = conseguirToken();
                console.log(token);
                /*
                fetch("https://api.spotify.com/v1/search?q="+grupo+"&type=playlist&offset=0&limit=20", {
                    method: 'GET',
                    headers: {'Authorization' : 'Bearer ' + token}
                })
                .then(result=>result.json())
                .then(dataSpotify => {
                    console.log(dataSpotify)
                    try{
                        urlPlaylist = dataSpotify.playlists.items[0].external_urls.spotify;
                        console.log(urlPlaylist)
                    }catch(error){
                        console.error(error);
                    }
                })
*/
                //console.log(urlPlaylist)
                
                //const urlPlaylist=conseguirURL();
                //console.log(urlPlaylist)


                const zooMarkerPopup = L.popup().setContent(grupo + "<br>" + ciudad + "<br>" + "Fecha: " + fecha + " | Hora: " + hora+ "<br>" + '<a href="'+urlEntradas+'" target=\"_blank\">Entradas concierto</a>'+ "<br>" + '<a href="'+urlEntradas+'" target=\"_blank\">Playlist Spotify</a>');
                ticketMasterMarker[i] = L.marker(new L.LatLng((featureCollection._embedded.events[i]._embedded.venues[0].location.latitude || ''), (featureCollection._embedded.events[i]._embedded.venues[0].location.longitude || '')), {
                    icon: concertsIcon
                }).bindPopup(zooMarkerPopup).addTo(map);
            }
        });
}

// Conseguir token spotify para las busquedas
function conseguirToken(){
    let token;
     fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/x-www-form-urlencoded', 
            'Authorization' : 'Basic ' + btoa(APIKeySpotifyClientID + ':' + APIKeySpotifyClientSecret)
        },
        body: 'grant_type=client_credentials'
    }).then(res=>res.json()).then(rs=> token = rs.access_token)
    console.log(token)
    return token;
}

//Conseguir URL Playlist
function conseguirURL(){
    const token = conseguirToken();
    fetch("https://api.spotify.com/v1/search?q="+grupo+"&type=playlist&offset=0&limit=20", {
        method: 'GET',
        headers: {'Authorization' : 'Bearer ' + token}
    })
    .then(result=>result.json()).then(dataSpotify => console.log(dataSpotify.playlists.items[0].external_urls.spotify))
}



map.on('click', onMapClick);