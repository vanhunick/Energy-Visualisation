/**
 * Created by Nicky on 12/01/2017.
 */
var margin = { top: 60, right: 20, bottom: 30, left: 50 },
    width = 550 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

// set the ranges
var x = d3.scaleBand()
    .range([0, width])
    .padding(0.1);

var y = d3.scaleLinear()
    .range([height, 0])
    .nice();

var yAxis = d3.axisLeft();


var created = false;
var svg = d3.select("#graph-div").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g") // group allows us to move everything together
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")"); // moves by a x and y value in this case the margins

function createBarGraph(title, data){

    // Add the graph to the graph div
    // append the svg object to the body of the page
    // append a 'group' element to 'svg'
    // moves the 'group' element to the top left margin

    // Scale the range of the data in the domains
    // Goes through every element in the array and grabs the category (2011,2012,2013 etc)
    x.domain(data.map(function(d) { return d.category; }));

    // The domain represents the min and max values of the data goes through all values and finds max
    y.domain([0, d3.max(data, function(d) { return d.value; })]); // object should contain a value
    y.nice();
    if(created){
        svg.selectAll(".bar") // None exist yet but will be created with enter
            .data(data) // enter the data array
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

    yAxis.scale(y);

    if(created){
        svg.select(".yAxis")
            .transition()
            .duration(1000)
            .call(yAxis);
    } else{

        // Now create the x and y axis
        // add the x Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // add the y Axis
        svg.append("g")
            .attr("class","yAxis")
            .call(yAxis);
    }

    if(created){
        svg.select("#bar-title").text(title);
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

    created = true;
}

