/* Stylesheet by Shannon Horwitz, 2024 */

// Global variables
var map;
var dataStats = {};

// Create function to generate the map
function createMap(){
    
    // Create the map
    map = L.map('map', {
        center: [37.6, -78.7],
        zoom: 7
    });

    // Add basetile layer to the map
    var baseMap = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
        minZoom: 0,
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'png'

    
    
    // Add tile layer to map
    }).addTo(map);

    var Stadia_Outdoors = L.tileLayer('https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.{ext}', {
        minZoom: 0,
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'png'
    }).addTo(map);
    

    // Call the getData function to import GeoJSON data to the map
    getData(map);

    var baseMap = {
        "Dark BaseMap": baseMap
    }

    var Stadia_Outdoors = {
        "Light BaseMap": Stadia_Outdoors
    }

    var layerControl = L.control.layers(baseMap, Stadia_Outdoors).addTo(map);
};

// Create the calculate min value function
function calcStats(data){
    
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
        }
    }
    
    // // Get minimum value of array excluding header
    // var minValue = Math.min(allValues.shift())////
    // // var minValue = Math.min(...allValues)////
    
    // // Make min variable value available to other functions
    // return minValue;

        //get min, max, mean stats for our array
        dataStats.min = Math.min(...allValues);
        // console.log(dataStats.min)
        // dataStats.min = 39328
        dataStats.max = Math.max(...allValues);

        //calculate meanValue
        var sum = allValues.reduce(function(a, b){return a+b;});
        dataStats.mean = sum/ allValues.length;


        return dataStats.min
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    
    // Constant factor adjusts symbol sizes evenly
    var minRadius = 8;
    
    // Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/dataStats.min,0.5715) * minRadius;
    
    // Make radius variable value available to other functions
    return radius;
};

// Create Popup Content function
function PopupContent(properties, attribute){
    this.properties = properties;
    this.attribute = attribute;
    this.year = attribute.split("_")[1];
    this.income = this.properties[attribute];
    this.formatted = "<p><b>County/Independent City:</b> " + this.properties.County + "</p><p><b>Median Income in " + this.year + ":</b> $" + this.income + "</p>";
};

// Create pointToLayer function with feature, latlng, and attributes parameters
function pointToLayer(feature, latlng, attributes){

    // Create attribute value to access first element in attributes array
    var attribute = attributes[0];

    // Create marker options
    var options = {
        fillColor: "#028A0F",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9
    };

    // For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    // Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    // Create circle marker layer
    var layer = L.circleMarker(latlng, options);

    // Create Popup Content variable to access PopupContent function
    var popupContent = new PopupContent(feature.properties, attribute);

    // Bind the popup to the circle marker    
    layer.bindPopup(popupContent.formatted, { 
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
                console.log(radius)

                // Create Popup Content variable to access PopupContent function
                var popupContent = new PopupContent(props, attribute);

                // Update popup with new content    
                popup = layer.getPopup();    
                popup.setContent(popupContent.formatted).update();

                // Set year attribute to variable
                var year = attribute.split("_")[1];
                // Update temporal legend
                document.querySelector("span.year").innerHTML = year;

            };
        };
    });
};

// Create new sequence controls
function createSequenceControls(attributes){   
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },
    
        onAdd: function () {
            // Create the control container div with a particular class name
            var container = L.DomUtil.create('div', 'sequence-control-container');
           
            // Create range input element (slider)
            container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range">')

            // Add skip buttons
            container.insertAdjacentHTML('beforeend', '<button class="step" id="reverse" title="Reverse"><img src="img/reverse.png"></button>'); 
            container.insertAdjacentHTML('beforeend', '<button class="step" id="forward" title="Forward"><img src="img/forward.png"></button>');
    
            // Set slider attributes
            container.querySelector(".range-slider").max = 9;///
            container.querySelector(".range-slider").min = 0;
            container.querySelector(".range-slider").value = 0;
            container.querySelector(".range-slider").step = 1;



            container.querySelectorAll('.step').forEach(function(step){
                step.addEventListener("click", function(){
                    var index = container.querySelector('.range-slider').value;
                    
                    // Increment or decrement depending on button clicked
                    if (step.id == 'forward'){
                        index++;
                        // If past the last attribute, wrap around to first attribute
                        index = index > 9 ? 0 : index;
                    } else if (step.id == 'reverse'){
                        index--;
                        //If past the first attribute, wrap around to last attribute
                        index = index < 0 ? 9 : index;
                    };
                    
                    // Update slider
                    container.querySelector('.range-slider').value = index;
                    updatePropSymbols(attributes[index]);
                })
            })

                // Disable any mouse event listeners for the container
                L.DomEvent.disableClickPropagation(container);
                                
                return container;
                
            }
        });

        map.addControl(new SequenceControl());    // add listeners after adding control

    
    };

function createLegend(attribute){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },


        onAdd: function () {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //PUT YOUR SCRIPT TO CREATE THE TEMPORAL LEGEND HERE
            container.innerHTML = '<h2 class="temporalLegend">Median Income in <span class="year">2013</span></h2>';

            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="180px" height="130px">';

            //array of circle names to base loop on  
            var circles = ["max", "mean", "min"]; 

            //Step 2: loop to add each circle and text to svg string  
            for (var i=0; i<circles.length; i++){  

                //Step 3: assign the r and cy attributes  
                var radius = calcPropRadius(dataStats[circles[i]]);  
                var cy = 50 - radius;  

            //circle string  
            svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#21a81b" fill-opacity="0.8" stroke="#000000" cx="40"/>';  
            ;  


            //evenly space out labels            
            var textY = i * 15 + 15;            

            //text string            
            svg += '<text id="' + circles[i] + '-text" x="75" y="' + textY + '">$ ' + Math.round(dataStats[circles[i]]*100)/100 + '</text>';
        };

        //close svg string
        svg += "</svg>";


        //add attribute legend svg to container
        container.insertAdjacentHTML('beforeend',svg);

            // //add attribute legend svg to container
            // container.innerHTML += svg;

            return container;
        }
        
    });
    // console.log(attribute);
    map.addControl(new LegendControl());
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
            // minValue = calculateMinValue(json);
            minValue = calcStats(json)
            
            // Call function to create proportional symbols
            createPropSymbols(json, attributes);

            // Call funtion to access sequence controls passing in attributes
            createSequenceControls(attributes);

            // Call function to create legend
            createLegend(attributes);
        })

};

document.addEventListener('DOMContentLoaded',createMap)

