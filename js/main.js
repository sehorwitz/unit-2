/* Stylesheet by Shannon Horwitz, 2024 */

// Create global map variable
var map;

// Create global minimum value variable
var minValue;

// Create function to generate the map
function createMap(){
    // Create the map
    map = L.map('map', {
        center: [37.5, -79.4],
        zoom: 8
    });

    // Add basetile layer to the map
    L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
        minZoom: 0,
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'png'
    }).addTo(map);

    // Call the getData function to import GeoJSON data to the map
    getData();

};

function calculateMinValue(data){
    // Create empty array to store all data values
    var allValues = [];
    // Loop through each County
    for(var inc of data.features){
        // Loop through each year
        for(var year = 2013; year <= 2022; year+=1){
              // Get income value for current year
              var value = inc.properties["Inc_"+ String(year)];
            //   console.log(value)
              // Add value to array
              allValues.push(Number(value));
        }
    }
    // Get minimum value of array excluding header
    var minValue = Math.min(allValues.shift())
    // console.log(minValue)
    return minValue;
}

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //constant factor adjusts symbol sizes evenly
    var minRadius = 7;
    //Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius;
return radius;
};



// // Add circle markers for point features to the map
// function createPropSymbols(data){
//     var attribute = "Inc_2013";

//     // Create marker options
//     var geojsonMarkerOptions = {
//         radius: 8,
//         fillColor: "#ff7800",
//         color: "#000",
//         weight: 1,
//         opacity: 1,
//         fillOpacity: 0.8
//     };

//     // Create a Leaflet GeoJSON layer and add it to the map
//     L.geoJson(data, {
//         pointToLayer: function (feature, latlng) {
            
//             // For each feature, determine its value for the selected attribute
//             var attValue = Number(feature.properties[attribute]);
//             console.log(attValue)

//             // Examine the attribute value to check that it is correct
//             console.log(feature.properties, attValue);

//             // Give each feature's circle marker a radius based on its attribute value
//             geojsonMarkerOptions.radius = calcPropRadius(attValue);

//             //Create circle markers
//             return L.circleMarker(latlng, geojsonMarkerOptions);

//         }
//     }).addTo(map);
// };

// // Create function to retrieve the data and place it on the map
// function getData(){
//     //load the data
//     fetch("data/MedianIncomeVA.geojson")
//         .then(function(response){
//             return response.json();
//         })
//         .then(function(json){
//             // Calculate minimum data value
//             minValue = calculateMinValue(json)
//             // Call funtion to create proportional symbols
//             createPropSymbols(json);
//         })
// };

// document.addEventListener('DOMContentLoaded',createMap)

function pointToLayer(feature, latlng){
    //Determine which attribute to visualize with proportional symbols
    var attribute = "Inc_2013";

    //create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string
    var popupContent = "<p><b>County/Independent City:</b> " + feature.properties.County + "</p><p><b>Median Income in " + attribute.slice(-4) + ": $</b>" + feature.properties[attribute] + "</p>";

    //bind the popup to the circle marker
    // layer.bindPopup(popupContent);
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius) 
    });

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Add circle markers for point features to the map
function createPropSymbols(data, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

//Step 2: Import GeoJSON data
function getData(){
    //load the data
    fetch("data/MedianIncomeVA.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            //calculate minimum data value
            minValue = calculateMinValue(json);
            //call function to create proportional symbols
            createPropSymbols(json);
        })
};

document.addEventListener('DOMContentLoaded',createMap)