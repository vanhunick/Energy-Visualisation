/**
 * Created by Nicky on 12/01/2017.
 */

// Specifies the barMargins and barWidth/barHeight of the svg
var barMargin = { top: 60, right: 20, bottom: 50, left: 50 },
    barWidth = 450 - barMargin.left - barMargin.right,
    barHeight = 400 - barMargin.top - barMargin.bottom;


var singlebarGraphs = [];

function BarGraph(id){
    this.id = id;
    this.x = d3.scaleBand().range([0, barWidth]).padding(0.5);
    this.y = d3.scaleLinear().range([barHeight, 0]).nice();
    this.yAxis = d3.axisLeft();
    this.xAxis = d3.axisBottom();
    this.created = false;
    this.svg = null;
}

var red = '#FF2626'

// If the bargraph does not exists creates a new one and places it in the div else updates already existing graph
function createBarGraph(divID, tableMax, data, edb, yLabel){
  var barGraph = null;
  singlebarGraphs.forEach(function(barElem){
    if(barElem.id === divID){
      barGraph = barElem;
    }
  });

  if(barGraph === null){
    createNewGraph(divID, tableMax, data,edb, yLabel);
  } else {
    updateGraph(barGraph, data,edb);
  }
}

function createNewGraph(divID, tableMax, data,edb, yLabel){
  var barGraph = new BarGraph(divID);
  singlebarGraphs.push(barGraph);
console.log(data)
  var positive = false;
  var negative = false;
  data.forEach(function(d){
    console.log(d.value);
    if(d.value >= 0)positive = true;
    else negative = true;
  });
  var mixed = (positive && negative);
  mixed = true;
  console.log(mixed)


  barGraph.svg = d3.select(divID).append("svg")// Create and add the svg
      .attr("width", barWidth + barMargin.left + barMargin.right)
      .attr("height", barHeight + barMargin.top + barMargin.bottom)
      .append("g") // group allows us to move everything together
      .attr("transform",
          "translate(" + barMargin.left + "," + barMargin.top + ")"); // moves by a x and y value in this case the barMargins

    // Goes through every element in the array and grabs the category (2011,2012,2013 etc)
    barGraph.x.domain(data.map(function(d) { return d.category; }));// The domain represents the min and max values of the data goes through all values and finds max
    barGraph.y.domain([0, tableMax]); // object should contain a value
    barGraph.y.nice(); // Rounds up to the nearest whole number
    barGraph.yAxis.scale(barGraph.y);

    // Next step is to create the rectangles and add to the svg
  barGraph.svg.selectAll(".bar") // None exist yet but will be created with enter
        .data(data) // enter the data array
        .enter()
        .append("rect") // create the rectangles
        .attr("class", "bar single-bar") // add the class attribute
        .attr("x", function(d) { return barGraph.x(d.category); }) // set the x value
        .attr("width", barGraph.x.bandwidth()) // set the barWidth of the bar
        .attr("y", function(d) { return barGraph.y(mixed ?  Math.abs(d.value) : d.value); }) // set the y value according to the value
        .attr("height", function(d) { return barHeight - barGraph.y((mixed ?  Math.abs(d.value) : d.value)); }) // set the barHeight
        .attr("fill", function(d) { return d.value > 0 ? 'lightgreen' : red;})

        //create the x and y axis
  barGraph.svg.append("g")
    .attr("transform", "translate(0," + barHeight + ")")
    .call(barGraph.xAxis.scale(barGraph.x));

  // add the y Axis
  barGraph.svg.append("g").attr("class","yAxis").call(barGraph.yAxis);
        barGraph.created = true;


  // Add a title
  barGraph.svg.append("text")
      .attr("x", (barWidth / 2))
      .attr("y", 0 - (barMargin.top / 2))
      .attr("id","bar-title")
      .attr("text-anchor", "middle")
      .style("font-size", "24px")
      .text(edb);

    barGraph.svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ -(barMargin.left/2+10) +","+( barMargin.top-50)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .style("font-size", "16px")
        .attr("class", "unit-text")
        .text(yLabel);

    // Add year as the x-axis label
    barGraph.svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ +(barWidth/2) +","+( barMargin.top + barHeight -barMargin.bottom + 20 )+")")  // text is drawn off the screen top left, move down and out and rotate
        .style("font-size", "16px")
        .attr("class", "unit-text")
        .text("Year");
}

// We do not need table max and the axis should never be updated for a graph
function updateGraph(barGraph, data, edb){
  var positive = false;
  var negative = false;
  data.forEach(function(d){
    if(d.value >= 0)positive = true;
    else negative = true;
  });
  var mixed = (positive && negative);

  barGraph.svg.selectAll(".bar") // None exist yet but will be created with enter
      .data(data) // enter the data array
      .transition()
      .duration(750)
      .attr("y", function(d) { return barGraph.y((mixed ?  Math.abs(d.value) : d.value)); }) // set the y value according to the value
      .attr("height", function(d) { return barHeight - barGraph.y((mixed ?  Math.abs(d.value) : d.value)); }) // set the barHeight
      .attr("fill", function(d) { return d.value > 0 ? 'lightgreen' : red;})


  barGraph.svg.select("#bar-title").text(edb); // Update the title
}
