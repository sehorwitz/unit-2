/* Stylesheet by Shannon Horwitz, 2024 */

// Global variables
var map;
// var minValue;
var dataStats = {};

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

// // Create the calculate min value function
// function calculateMinValue(data){
    
//     // Create empty array to store all data values
//     var allValues = [];
    
//     // Loop through each city
//     for(var city of data.features){
        
//         // Loop through each year
//         for(var year = 1985; year <= 2015; year+=5){
              
//             // Get population for current year
//               var value = city.properties["Pop_"+ String(year)];
              
//               // Add value to array
//               allValues.push(value);
//         }
//     }
    
//     // Get minimum value of array
//     var minValue = Math.min(...allValues)
    
    
//     // Make min variable value available to other functions
//     return minValue;
// };

// Create the calculate min value function
function calcStats(data){
    
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
    
    // // Get minimum value of array
    // var minValue = Math.min(...allValues)
    
    
    // // Make min variable value available to other functions
    // return minValue;

        //get min, max, mean stats for our array
        dataStats.min = Math.min(...allValues);
        dataStats.max = Math.max(...allValues);
        //calculate meanValue
        var sum = allValues.reduce(function(a, b){return a+b;});
        dataStats.mean = sum/ allValues.length;

        return dataStats.min
};

// Calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    
    // Constant factor adjusts symbol sizes evenly
    var minRadius = 5;
    
    // Flannery Apperance Compensation formula
    var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius
    
    // Make radius variable value available to other functions
    return radius;
};

// function calcStats(data){
//     //create empty array to store all data values
//     var allValues = [];
//     //loop through each city
//     for(var city of data.features){
//         //loop through each year
//         for(var year = 1985; year <= 2015; year+=5){
//               //get population for current year
//               var value = city.properties["Pop_"+ String(year)];
//               //add value to array
//               allValues.push(value);
//         }
//     }
//     //get min, max, mean stats for our array
//     dataStats.min = Math.min(...allValues);
//     dataStats.max = Math.max(...allValues);
//     //calculate meanValue
//     var sum = allValues.reduce(function(a, b){return a+b;});
//     dataStats.mean = sum/ allValues.length;

// };

// function createPopupContent(properties, attribute){
//     //add city to popup content string
//     var popupContent = "<p><b>City:</b> " + properties.City + "</p>";

//     //add formatted attribute to panel content string
//     var year = attribute.split("_")[1];
//     popupContent += "<p><b>Population in " + year + ":</b> " + properties[attribute] + " million</p>";

//     return popupContent;
// };

function PopupContent(properties, attribute){
    this.properties = properties;
    this.attribute = attribute;
    this.year = attribute.split("_")[1];
    this.population = this.properties[attribute];
    this.formatted = "<p><b>City:</b> " + this.properties.City + "</p><p><b>Population in " + this.year + ":</b> " + this.population + " million</p>";
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

    // // Build popup content string starting with city
    // var popupContent = "<p><b>City:</b> " + feature.properties.City + "</p>";

    // // Add formatted attribute to popup content string
    // var year = attribute.split("_")[1];

    // // Add popup content string starting with populations
    // popupContent += "<p><b>Population in " + year + ":</b> " + feature.properties[attribute] + " million</p>";

    // // Bind the popup to the circle marker
    // layer.bindPopup(popupContent, {
    //     offset: new L.Point(0,-options.radius) 
    // });


//     var popupContent = createPopupContent(feature.properties, attribute);
//     //bind the popup to the circle marker    
//     layer.bindPopup(popupContent, {offset: new L.Point(0,-options.radius)});

    var popupContent = new PopupContent(feature.properties, attribute);

    //change the formatting
    popupContent.formatted = "<h2>" + popupContent.population + " million</h2>";

    // //create another popup based on the first
    // var popupContent2 = Object.create(popupContent);

    // //change the formatting of popup 2
    // popupContent2.formatted = "<h2>" + popupContent.population + " million</h2>";

    // //add popup to circle marker    
    // layer.bindPopup(popupContent2.formatted);

    // console.log(popupContent.formatted); //original popup content

    //bind the popup to the circle marker    
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
    
                // // Add city to popup content string
                // var popupContent = "<p><b>City:</b> " + props.City + "</p>";
    
                // // Add formatted attribute to panel content string
                // var year = attribute.split("_")[1];
                // popupContent += "<p><b>Population in " + year + ":</b> " + props[attribute] + " million</p>";
    
                // // Update popup content            
                // popup = layer.getPopup();            
                // popup.setContent(popupContent).update();


                // var popupContent = createPopupContent(props, attribute);    
                // //update popup with new content    
                // popup = layer.getPopup();    
                // popup.setContent(popupContent).update();

                // Set popup content to variable
                var popupContent = new PopupContent(props, attribute);

                //update popup with new content    
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

// // Create new sequence controls
// function createSequenceControls(attributes){
    
//     //Create range input element (slider)
//     var slider = "<input class='range-slider' type='range'></input>";
//     document.querySelector("#panel").insertAdjacentHTML('beforeend',slider);
    

//     // Set slider attributes
//     document.querySelector(".range-slider").max = 6;
//     document.querySelector(".range-slider").min = 0;
//     document.querySelector(".range-slider").value = 0;
//     document.querySelector(".range-slider").step = 1;
//     document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="reverse"></button>');
//     document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="forward"></button>');
//     document.querySelector('#reverse').insertAdjacentHTML('beforeend',"<img src='img/reverse.png'>");
//     document.querySelector('#forward').insertAdjacentHTML('beforeend',"<img src='img/forward.png'>")
    

//     document.querySelectorAll('.step').forEach(function(step){
//         step.addEventListener("click", function(){
//             var index = document.querySelector('.range-slider').value;
            
//             // Increment or decrement depending on button clicked
//             if (step.id == 'forward'){
//                 index++;
//                 // If past the last attribute, wrap around to first attribute
//                 index = index > 6 ? 0 : index;
//             } else if (step.id == 'reverse'){
//                 index--;
//                 //If past the first attribute, wrap around to last attribute
//                 index = index < 0 ? 6 : index;
//             };
            
//             // Update slider
//             document.querySelector('.range-slider').value = index;
//             updatePropSymbols(attributes[index]);
            

//         })
        
//     })
    
// };



//Create new sequence controls
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

            // ... initialize other DOM elements
            container.querySelector(".range-slider").max = 6;
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
                        index = index > 6 ? 0 : index;
                    } else if (step.id == 'reverse'){
                        index--;
                        //If past the first attribute, wrap around to last attribute
                        index = index < 0 ? 6 : index;
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
            container.innerHTML = '<p class="temporalLegend">Population in <span class="year">1980</span></p>';

            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="160px" height="130px">';

            //array of circle names to base loop on  
            var circles = ["max", "mean", "min"]; 

            //Step 2: loop to add each circle and text to svg string  
            for (var i=0; i<circles.length; i++){  

                //Step 3: assign the r and cy attributes  
                var radius = calcPropRadius(dataStats[circles[i]]);  
                var cy = 40 - radius;  

            //circle string  
            svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#F47821" fill-opacity="0.8" stroke="#000000" cx="45"/>';  
            ;  

            //evenly space out labels            
            var textY = i * 15 + 15;            

            //text string            
            svg += '<text id="' + circles[i] + '-text" x="70" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + " million" + '</text>';
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
            // minValue = calculateMinValue(json);
            minValue = calcStats(json);
            
            // Call function to create proportional symbols
            createPropSymbols(json, attributes);
            createSequenceControls(attributes);
            createLegend(attributes);
            // calcStats(response);
        })
};

document.addEventListener('DOMContentLoaded',createMap)