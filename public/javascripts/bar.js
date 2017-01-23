/**
 * Created by Nicky on 12/01/2017.
 */

// Specifies the margins and width/height of the svg
var margin = { top: 60, right: 20, bottom: 30, left: 50 },
    width = 550 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

// set the ranges and scales
var x = d3.scaleBand()
    .range([0, width])
    .padding(0.1);

var y = d3.scaleLinear()
    .range([height, 0])
    .nice();

// The y axis d3 object
var yAxis = d3.axisLeft();

// Boolean for updating or creating the graph
var created = false;

// Grab the div and add new svg with length and width to it then move svg according to margins
var svg = d3.select("#graph-div").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g") // group allows us to move everything together
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")"); // moves by a x and y value in this case the margins

// Create the graph with the title and data
function createBarGraph(title, data){

    // Goes through every element in the array and grabs the category (2011,2012,2013 etc)
    x.domain(data.map(function(d) { return d.category; }));

    // The domain represents the min and max values of the data goes through all values and finds max
    y.domain([0, d3.max(data, function(d) { return d.value; })]); // object should contain a value
    y.nice(); // Rounds up to the nearest whole number

    yAxis.scale(y);


    if(created){
        svg.selectAll(".bar") // None exist yet but will be created with enter
            .data(data) // enter the data array
            .transition()
            .duration(1000)
            .attr("y", function(d) { return y(d.value); }) // set the y value according to the value
            .attr("height", function(d) { return height - y(d.value); }); // set the height
    } else {
        // Next step is to create the rectangles and add to the svg
        svg.selectAll(".bar") // None exist yet but will be created with enter
            .data(data) // enter the data array
            .enter()
            .append("rect") // create the rectangles
            .attr("class", "bar") // add the class attribute
            .attr("x", function(d) { return x(d.category); }) // set the x value
            .attr("width", x.bandwidth()) // set the width of the bar
            .attr("y", function(d) { return y(d.value); }) // set the y value according to the value
            .attr("height", function(d) { return height - y(d.value); }); // set the height
    }


    // If the axis already exists animate it with the new domain
    if(created){
        svg.select(".yAxis")
            .transition()
            .duration(1000)
            .call(yAxis);
    } else{
        //create the x and y axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // add the y Axis
        svg.append("g")
            .attr("class","yAxis")
            .call(yAxis);
    }

    if(created){
        svg.select("#bar-title").text(title); // Update the title
    } else {
        // Add a title
        svg.append("text")
            .attr("x", (width / 2))
            .attr("y", 0 - (margin.top / 2))
            .attr("id","bar-title")
            .attr("text-anchor", "middle")
            .style("font-size", "24px")
            .text(title);
    }
    // Set created to true since it has now been created
    created = true;
}

