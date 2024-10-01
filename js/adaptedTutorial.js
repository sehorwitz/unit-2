/* Stylesheet by Shannon Horwitz, 2024 */

// Global variables
var map;
var minValue;

// Create function to create map
function createMap(){

    // Create the map and specify display
    map = L.map('map', {
        center: [0, 0],
        zoom: 3
    });

    // Create OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    



    // Add tile layer to the map
    }).addTo(map);

    // Call getData function with map paramteter
    getData(map);
};

// Create the calculate min value function
function calculateMinValue(data){
    
    // Create empty array to store all data values
    var allValues = [];
    
    // Loop through each city
    for(var city of data.features){
        
        // Loop through each year
        for(var year = 1985; year <= 2015; year+=5){
              
            // Get population for current year
              var value = city.properties["Pop_"+ String(year)];
              
              // Add value to array
              allValues.push(value);
        }
    }
    
    // Get minimum value of array
    var minValue = Math.min(...allValues)
    
    
    // Make min variable value available to other functions
    return minValue;
}

// Calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    
    // Constant factor adjusts symbol sizes evenly
    var minRadius = 5;
    
    // Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius
    
    // Make radius variable value available to other functions
    return radius;
};

// Create pointToLayer function with feature, latlng, and attributes parameters
function pointToLayer(feature, latlng, attributes){
    
    // Create attribute value to access first element in attributes array
    var attribute = attributes[0];

    // Create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    // For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    // Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    // Create circle marker layer
    var layer = L.circleMarker(latlng, options);

    // Build popup content string starting with city
    var popupContent = "<p><b>City:</b> " + feature.properties.City + "</p>";

    // Add formatted attribute to popup content string
    var year = attribute.split("_")[1];

    // Add popup content string starting with populations
    popupContent += "<p><b>Population in " + year + ":</b> " + feature.properties[attribute] + " million</p>";

    // Bind the popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius) 
    });

    // Return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

// Create function to add circle markers for point features to the map
function createPropSymbols(data, attributes){
    // Create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

// Create function to update proportional symbols
function updatePropSymbols(attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            if (layer.feature && layer.feature.properties[attribute]){
                // Access feature properties
                var props = layer.feature.properties;
    
                // Update each feature's radius based on new attribute values
                var radius = calcPropRadius(props[attribute]);
                layer.setRadius(radius);
    
                // Add city to popup content string
                var popupContent = "<p><b>City:</b> " + props.City + "</p>";
    
                // Add formatted attribute to panel content string
                var year = attribute.split("_")[1];
                popupContent += "<p><b>Population in " + year + ":</b> " + props[attribute] + " million</p>";
    
                // Update popup content            
                popup = layer.getPopup();            
                popup.setContent(popupContent).update();
            };
        };
    });
};

// Create new sequence controls
function createSequenceControls(attributes){
    
    //Create range input element (slider)
    var slider = "<input class='range-slider' type='range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);
    

    //set slider attributes
    document.querySelector(".range-slider").max = 6;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="reverse"></button>');
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="forward"></button>');
    document.querySelector('#reverse').insertAdjacentHTML('beforeend',"<img src='img/reverse.png'>");
    document.querySelector('#forward').insertAdjacentHTML('beforeend',"<img src='img/forward.png'>")
    

    // document.querySelectorAll('.step').forEach(function(step){
    document.querySelectorAll('.step').forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;
            
            // Increment or decrement depending on button clicked
            if (step.id == 'forward'){
                index++;
                // If past the last attribute, wrap around to first attribute
                index = index > 6 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                //If past the first attribute, wrap around to last attribute
                index = index < 0 ? 6 : index;
            };
            
            // Update slider
            document.querySelector('.range-slider').value = index;
            updatePropSymbols(attributes[index]);
            

        })
        
    })
    
};

// Create function to process data
function processData(data){
    
    // Create an empty array to hold attributes
    var attributes = [];

    // Properties of the first feature in the dataset
    var properties = data.features[0].properties;

    // Push each attribute name into attributes array
    for (var attribute in properties){
        
        // Only take attributes with population values
        if (attribute.indexOf("Pop") > -1){
            attributes.push(attribute);
        };
    };

    // Make attributes variable available to other functions
    return attributes;
};

// Import GeoJSON data
function getData(map){
    
    // Load the data
    fetch("data/MegaCities.geojson")
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            
            // Create an attributes array
            var attributes = processData(json);
            
            // Calculate minimum data value
            minValue = calculateMinValue(json);
            
            // Call function to create proportional symbols
            createPropSymbols(json, attributes);
            createSequenceControls(attributes);
        })
};

document.addEventListener('DOMContentLoaded',createMap)