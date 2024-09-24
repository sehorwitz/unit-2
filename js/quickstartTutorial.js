/* Stylesheet by Shannon Horwitz, 2024 */

// Create map layer using map variable and html element with id "map", set the centered extend to central London with a 13 zoom level
var map = L.map('map').setView([51.505, -0.09], 13);

// Create a tile layer using 
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'

// Add the tile layer to the map layer
}).addTo(map);

// Create a variable to add a marker layer at specified coordinates and add the marker layer to the map layer
var marker = L.marker([51.5, -0.09]).addTo(map);

// Create a variable to add a circle layer at specified coordinates, define the color, fill color, opacity, radius
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
// Add the circle layer to the map layer
}).addTo(map);

// Create a variable to add a polygon layer at specified coordinates
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
// Add the polygon layer to the map layer
]).addTo(map);

// Add a pop-up to the marker layer that opens upon initial site visit       
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();

// Add a pop-up to the circle layer
circle.bindPopup("I am a circle.");

// Add a pop-up to the polygon layer
polygon.bindPopup("I am a polygon.");

// Using a popup as a layer and using openOn instead of addTo to 
// automatically close the previously opened pop-up
// Create a variable to add a popup layer to at specified coordinates 
var popup = L.popup()
    // Define the LatLng object
    .setLatLng([51.513, -0.09])
    // Define the content in the pop-up
    .setContent("I am a standalone popup.")
    // Add the pop-up to the map and close the previous one
    .openOn(map);

// Map click function to tell user coordinates selected
// function onMapClick(e) {
//     alert("You clicked the map at " + e.latlng);
// }
// map.on('click', onMapClick);

// Create a function to use a popup instead of an alert to tell the user the coordinates selected when they click on the map
function onMapClick(e) {
    popup
        // Define the LatLng object based on click
        .setLatLng(e.latlng)
        // Define the content in the pop-up
        .setContent("You clicked the map at " + e.latlng.toString())
        // Add the pop-up to the map and close the previous one
        .openOn(map);
}
// When the map is clicked, 
map.on('click', onMapClick);