/* Stylesheet by Shannon Horwitz, 2024 */

// Create and define map variable based on html div with id of map
// Set the zoom level and central coordinate for viewing 
var map = L.map('map').setView([39.75621, -104.99404],5);

// Use Layer to load tile layer
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'

// Add the tile layer to the map
}).addTo(map);


// // Create a GeoJSON feature and add it to the map
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

// Create a GeoJSON layer and add that layer to the map
L.geoJSON(geojsonFeature).addTo(map);

// Create variable to add line features to
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

// Create an empty GeoJSON layer assigned to a variable and add the empty later to the map
// var myLayer = L.geoJSON().addTo(map);

// Add line features defined in myLines variable to the map
// myLayer.addData(myLines);

// Create style variables
var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

// Apply style to GeoJSON features and add them to the map
L.geoJSON(myLines, {
    style: myStyle
// Add GeoJSON layer to the map
}).addTo(map);

// Create variable to assign GeoJSON features
var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

// Add the GeoJSON features to the map, style based off party property
L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
// Add GeoJSON layer to the map
}).addTo(map);

// Set style option to variable
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

// Create GeoJSON layer
L.geoJSON(geojsonFeature, {
    // Create GeoJSON option to generate points using latlng
    pointToLayer: function (feature, latlng) {
        // Create a circle marker object using latlng and style assigned to variable
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
// Add circle marker to the map
}).addTo(map);

// Create function that will determine if there's popupContent
function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

// Create variable for feature
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

// Create GeoJSON layer
L.geoJSON(geojsonFeature, {
    // Create each feature in deveined variable
    onEachFeature: onEachFeature
// Add feature to the map
}).addTo(map);

