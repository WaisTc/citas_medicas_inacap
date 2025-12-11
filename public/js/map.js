// mapa.js
function initMap() {
  // Coordenadas de ejemplo (Molina, Región del Maule)
  const molina = { lat: -34.978053999395065, lng: -71.21332954065231 };

  // Crear el mapa
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: molina,
  });

  // Agregar un marcador
  new google.maps.Marker({
    position: molina,
    map: map,
    title: "Molina, Región del Maule",
  });
}