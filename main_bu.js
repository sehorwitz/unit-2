/* Stylesheet by Shannon Horwitz, 2024 */

// Global variables
var map;
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
    
    // Add tile layer to map
    }).addTo(map);

    // Call the getData function to import GeoJSON data to the map
    getData(map);
};

// Create the calculate min value function
function calculateMinValue(data){
    
    // Create empty array to store all data values
    var allValues = [];
    
    // Loop through each County
    for(var inc of data.features){
        
        // Loop through each year
        for(var year = 2013; year <= 2022; year+=1){
              
            // Get income value for current year
              var value = inc.properties["Inc_"+ String(year)];
              
              // Add value to array
              allValues.push(Number(value));////
            //   allValues.push(value);
        }
    }
    
    // Get minimum value of array excluding header
    var minValue = Math.min(allValues.shift())////
    // var minValue = Math.min(...allValues)////
    
    // Make min variable value available to other functions
    return minValue;
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    
    // Constant factor adjusts symbol sizes evenly
    var minRadius = 8;
    
    // Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius;
    
    // Make radius variable value available to other functions
    return radius;
};


// Create pointToLayer function with feature, latlng, and attributes parameters
function pointToLayer(feature, latlng, attributes){

    // Create attribute value to access first element in attributes array
    var attribute = attributes[0];

    //create marker options
    var options = {
        fillColor: "#028A0F",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);
    // console.log(attValue)

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string
    var popupContent = "<p><b>County/Independent City:</b> " + feature.properties.County + "</p>";
    

    // Add formatted attribute to popup content string
    var year = attribute.split("_")[1];
    
    popupContent += "<p><b>Median Income in " + year + ": $</b>" + feature.properties[attribute] + "</p>";

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
    // console.log(attributes)
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

// Create function to update proportional symbols
function updatePropSymbols(attribute){
    // console.log(attribute)
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            if (layer.feature && layer.feature.properties[attribute]){
                // Access feature properties
                var props = layer.feature.properties;
                // Update each feature's radius based on new attribute values
                var radius = calcPropRadius(props[attribute]);
                layer.setRadius(radius);
    
                // Add city to popup content string
                var popupContent = "<p><b>County/Independent City:</b> " + props.County + "</p>";
    
                // Add formatted attribute to panel content string
                var year = attribute.split("_")[1];
                // console.log(year)
                popupContent += "<p><b>Median Income in " + year + ": $</b>" + props[attribute] + "</p>";
                // console.log(props[attribute]);

                // Update popup content            
                popup = layer.getPopup();            
                popup.setContent(popupContent).update();
            };
        };
    });
};

// Create new sequence controls
function createSequenceControls(attributes){
    
    // Create range input element (slider)
    var slider = "<input class='range-slider' type='range'></input>";

    // Insert the slider into the side panel
    document.querySelector("#panel").insertAdjacentHTML('beforeend', slider);
    
    // Set slider attributes
    document.querySelector(".range-slider").max = 9;///
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;

    // Create buttons on the panel identifying one as reverse and one as forward
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="reverse"></button>');
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="forward"></button>');

    // Replace button content with images
    document.querySelector('#reverse').insertAdjacentHTML('beforeend',"<img src='img/reverse.png'>");
    document.querySelector('#forward').insertAdjacentHTML('beforeend',"<img src='img/forward.png'>");

    // Create listener for range slider
    document.querySelectorAll('.range-slider').forEach(function(){
        
        // Create input listener for slider
        document.addEventListener("click", function(){

            // Get the index value
            var index = document.querySelector('.range-slider').value;
            
            // Call function using defined index value
            updatePropSymbols(attributes[index]);
        });
    });

    // Creat listener for buttons
    document.querySelectorAll('.step').forEach(function(step){

        // Create input listener for button clicks
        step.addEventListener("click", function(){

            // Get the index value of the slider
            var index = document.querySelector('.range-slider').value;
            
            // Increment or decrement depending on button clicked
            if (step.id == 'forward'){
                index++;
                
                // If past the last attribute, wrap around to first attribute
                index = index > 9 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                
                // If past the first attribute, wrap around to last attribute
                index = index < 0 ? 9 : index;
            };
            
            // Update slider
            document.querySelector('.range-slider').value = index;

            // Call function using defined index value
            updatePropSymbols(attributes[index]);
            

        });
        
    });
    
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
        if (attribute.indexOf("Inc") > -1){
            attributes.push(attribute);
        };
    };

    // Make attributes variable available to other functions
    return attributes;
};

// Import GeoJSON data
function getData(){
    
    // Load the data
    fetch("data/MedianIncomeVA.geojson")
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

            // Call funtion to access sequence controls passing in attributes
            createSequenceControls(attributes);
        });
};

document.addEventListener('DOMContentLoaded',createMap)