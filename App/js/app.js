// Crear mapa Leaflet
const map = L.map('my-map').setView([48.1500327, 11.5753989], 2);

// Marcador para geolocaclización inversa
let marker;

////                    TODAS LAS KEYS DE LAS API AQUI
// API Key de Geoapify
const APIKeyGeoapify = "AÑADIR AQUI TU CLAVE DE GEOAPIFY";

// Retina requerida para añadir los titulos al mapa
const isRetina = L.Browser.retina;
const baseUrl = "https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey={apiKey}";
const retinaUrl = "https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}@2x.png?apiKey={apiKey}";

// Añadir capa del mapa. Colocar en 15 el maximo del zoom.
L.tileLayer(isRetina ? retinaUrl : baseUrl, {
  attribution: '<a href="https://openmaptiles.org/" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a> contributors',
  apiKey: APIKeyGeoapify,
  maxZoom: 15,
  id: 'osm-bright',
}).addTo(map);

// Añadir controles de zoom arriba a la derecha
map.zoomControl.remove();
L.control.zoom({
  position: 'topright'
}).addTo(map);

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

      document.getElementById("status").textContent = `Dirección encontrada: ${foundAddress.properties.formatted}`;

      marker = L.marker(new L.LatLng(foundAddress.properties.lat, foundAddress.properties.lon)).addTo(map);
    });

}

map.on('click', onMapClick);