/**
 * Created by Nicky on 12/01/2017.
 */

var SingleBarModule = (function(){
  /**
   * Shows the bar graph on the screen
   *
   * @param rowID {String} the id of the row to show with the data for the bar graph
   * @param edb {String} the edb of the row
   * @param div {String} the id of the div to put the bar graph in
   * */
  function showBarWithRowElem(rowID, edb, div, headRow, tableID,unit){
    var data = [];

    $(headRow).find('th').each(function (index, element) {
      if(index != 0){ // 0 is not a year
        data.push({category : $(element).text(), value : 0}); // 0 is temp
      }
    });


    $('#'+rowID).find('th').each(function (index, element) {
      if(index != 0){
        data[index-1].value = $(element).text();
      } else {
        title = data[index].value = $(element).text();
      }
    });

    var max = -Infinity;
    $('.cell', tableID).each(function(){ //cell or th
      var val = +$(this).attr("origValue");
      max = val > max ? val : max;
    });

    var min = Infinity;
    $('.cell', tableID).each(function(){ //cell or th
      var val = +$(this).attr("origValue");
      min = val < min ? val : min;
    });
    createBarGraph(div, max,min, data, edb,unit);
  }


  // Specifies the barMargins and barWidth/barHeight of the svg
  var barMargin = { top: 60, right: 20, bottom: 50, left: 50 },
    barWidth = 550 - barMargin.left - barMargin.right,
    barHeight = 500 - barMargin.top - barMargin.bottom;


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
  function createBarGraph(divID, tableMax,tableMin, data, edb, yLabel){
    var barGraph = null;
    singlebarGraphs.forEach(function(barElem){
      if(barElem.id === divID){
        barGraph = barElem;
      }
    });

    if(barGraph === null){
      createNewGraph(divID, tableMax, tableMin, data,edb, yLabel);
    } else {
      updateGraph(barGraph,tableMax,tableMin,data,edb);
    }
  }

  function createNewGraph(divID, tableMax,tableMin, data,edb, yLabel){
    var barGraph = new BarGraph(divID);
    singlebarGraphs.push(barGraph);

    var mixed = (tableMin < 0 && tableMax > 0);
    var max = 0;
    if(!mixed && tableMin < 0){
      max = tableMin; // The top of the graph should be the least number
    } else if(!mixed) {
      max = tableMax;
    }

    if(mixed){
      max = tableMax;
    }

    barGraph.svg = d3.select(divID).append("svg")// Create and add the svg
      .attr("width", barWidth + barMargin.left + barMargin.right)
      .attr("height", barHeight + barMargin.top + barMargin.bottom)
      .append("g") // group allows us to move everything together
      .attr("transform",
        "translate(" + barMargin.left + "," + barMargin.top + ")"); // moves by a x and y value in this case the barMargins

    // Goes through every element in the array and grabs the category (2011,2012,2013 etc)
    barGraph.x.domain(data.map(function(d) { return d.category; }));// The domain represents the min and max values of the data goes through all values and finds max
    barGraph.y.domain([0, max]); // object should contain a value
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
      .attr("fill", function(d) { return  mixed ?  (d.value > 0 ? 'lightgreen' : red) : 'lightgreen';})

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
      .attr("transform", "translate("+ -(barMargin.left/2+10) +","+(barHeight/2 )+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
      .attr("class", "unit-text")
      .text(yLabel);

    // Add year as the x-axis label
    barGraph.svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate("+ +(barWidth/2) +","+( barMargin.top + barHeight -barMargin.bottom + 20 )+")")  // text is drawn off the screen top left, move down and out and rotate
      .attr("class", "unit-text")
      .text("Year");
  }

// We do not need table max and the axis should never be updated for a graph
  function updateGraph(barGraph,tableMax, tableMin, data, edb){
    var mixed = (tableMin < 0 && tableMax > 0);

    barGraph.svg.selectAll(".bar") // None exist yet but will be created with enter
      .data(data) // enter the data array
      .transition()
      .duration(750)
      .attr("y", function(d) { return barGraph.y((mixed ?  Math.abs(d.value) : d.value)); }) // set the y value according to the value
      .attr("height", function(d) { return barHeight - barGraph.y((mixed ?  Math.abs(d.value) : d.value)); }) // set the barHeight
      .attr("fill", function(d) { return  mixed ?  (d.value > 0 ? 'lightgreen' : red) : 'lightgreen';}); // If mixed check if negative or not if not mixed just lightgreen


    barGraph.svg.select("#bar-title").text(edb); // Update the title
  }

  return {
    showBarWithRowElem: showBarWithRowElem,
    createBarGraph : createBarGraph
  }
})();

var GroupedBarModule = (function(){

  //  Margins and width / height for the graph
  var margin = { top: 25, right: 85, bottom: 150, left: 50 },
    width = 850 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  // The array that holds the GroupedBarData objects for every graph on the page
  var barGraphs = [];

  // An object to hold data for each grouped bar graph
  function GroupedBarData(x0, x1,y,yAxis,svg,id){
    this.x0 = x0;
    this.x1 = x1;
    this.y = y;
    this.yAxis = yAxis;
    this.svg = svg;
    this.id = id;
    this.created = false;
    this.g = null;
  }

  // Blue color scale
  var z = d3.scaleOrdinal().range(["#BBDEFB", "#64B5F6", "#1976D2", "#1565C0", "#0D47A1", "#d0743c", "#ff8c00"]);

  // Red color scale for negative values
  var zRed = d3.scaleOrdinal().range(["#FF7373", "#FF4C4C", "#FF2626", "#B20000", "#D90000", "#d0743c", "#ff8c00"]);

  // Green color scale for selected values
  var zSelected = d3.scaleOrdinal().range(["#C1FFC1", "#90EE90", "#5BC85B", "#31A231", "#137B13", "#d0743c", "#ff8c00"]);

  // Highlights each bar that corrosponds to the EDB. If alreadySelected, nothing should be highlighted therefore the normal scale is applied
var highlight = function (edb, alreadySelected) {
    // Before we remove the class we need to apply the correct color scale
    d3.selectAll(".bar-selected").datum(function(d) {return d; })
      .attr("fill", function(d) {return z(d.key); });

    // Select all rectangle with the selected class and remove class
    d3.selectAll(".bar-selected").classed("bar-selected", false);

    if(alreadySelected){return;} // The case where the row is unselected but nothing else is selected

    d3.selectAll("rect."+edb.replace(/ /g , ""))
      .classed("bar-selected", true) // Select all rectangle with the correct EDB and outline bars and add selected class
      .datum(function(d) {return d; }) // Grab the data bound to the elements
      .attr("fill", function(d) {return zSelected(d.key); }); // Apply the green color scale based on the key
}


// Only public function used to place or update a graph on the page
var createdGroupedBarGraph = function (data,keys,yLabel, divID) {
  for(var i = 0; i < barGraphs.length; i++){
    if(barGraphs[i].id === divID){
      updateExistingGraph(data, keys, barGraphs[i], yLabel);
      return;
    }
  }
  createNewGroupedBarGraph(data, keys, yLabel, divID); // No graph exists so make a new one
}


// Creates a brand new grouped bar graph
var createNewGroupedBarGraph = function (data, keys, yLabel, divID) {

    // Create the new graph object
    var curBarGraph = new GroupedBarData(
        d3.scaleBand().rangeRound([0, width]).paddingInner(0.05),
        d3.scaleBand().padding(0.05),
        d3.scaleLinear().rangeRound([height, 0]),
        d3.axisLeft(),
        d3.axisBottom(),
        divID);

   barGraphs.push(curBarGraph);

    // Create and append the svg
    curBarGraph.svg = d3.select(divID)
        .append("div")
        .classed("svg-container-bar", true) //container class to make it responsive
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 "+ (width + margin.left + margin.right) +" "+ (height + margin.top + margin.bottom) + "")
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")") // moves by a x and y value in this c
        .classed("svg-content-responsive-bar", true);

    curBarGraph.x0.domain(data.map(function(d) { return d.edb; }));
    curBarGraph.x1.domain(keys).rangeRound([0, curBarGraph.x0.bandwidth()]);
    curBarGraph.y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return Math.abs(d[key]); }); })]).nice();


    // The format used on the tip values
    var dpFormat = d3.format(".2f");

    // Create the tip that will show up on hover
    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        return "<strong>Value:</strong> <span style='color:lightgreen'>" + dpFormat(d.value) + "</span><br><br><strong>Year:</strong> <span style='color:lightgreen'>" + d.key + "</span>";
    });

    curBarGraph.svg.call(tip);

      curBarGraph.svg.append("g")
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", function(d) { return "translate(" + curBarGraph.x0(d.edb) + ",0)"; })
        .selectAll("rect")
        .data(function(d) { return keys.map(function(key) { return {neg : d[key] < 0,key: key, edb : d.edb, value: Math.abs(d[key])}; }); })
        .enter().append("rect")
        .attr("x", function(d) { return curBarGraph.x1(d.key); })
        .attr("y", function(d) { return curBarGraph.y(d.value); })
        .attr("width", curBarGraph.x1.bandwidth())
        .attr("height", function(d) { return height - curBarGraph.y(d.value); })
        .attr("fill", function(d) { if(d.neg){
          return zRed(d.key);
        }else {
          return z(d.key);
        }})
        .attr("class",function(d){return " "+d.edb.replace(/ /g , "");}) // Add ebd as the class
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    // Add x axis
    curBarGraph.svg.append("g")
      .attr("class", "xAxis axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(curBarGraph.x0))
      .selectAll("text")
      .attr("y", 0)
      .attr("x", 9)
      .attr("dy", ".35em")
      .attr("class", "axis-text-scaled")
      .attr("transform", "rotate(55)")
      .style("text-anchor", "start");

    curBarGraph.svg.append("g")
        .attr("class", "yAxis axis")
        .call(curBarGraph.yAxis.scale(curBarGraph.y))//.ticks(null, "s")
        .append("text")
        .attr("x", 2)
        .attr("y", curBarGraph.y(curBarGraph.y.ticks().pop()) + 0.5)
        .attr("dy", "0.32em")
        .attr("text-anchor", "start")


    curBarGraph.svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate("+ -(margin.left/2-10) +","+(height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
      .attr("class", "unit-text-scaled")
      .text(yLabel);

    // Create the legend
    var legend = curBarGraph.svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 8)
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(keys.slice().reverse())
      .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 10 + ")"; });

    legend.append("rect")
      .attr("x", width - 100)
      .attr("width", 8.5)
      .attr("height", 8.5)
      .attr("fill", z);

    legend.append("text")
      .attr("x", width - 110)
      .attr("y", 4)
      .attr("dy", "0.32em")
      .attr("class", "g-text")
      .style("font-size", "8px")
      .text(function(d) { return d; });

    curBarGraph.created = true; // Set the graph with the ID divID to created
}

var updateExistingGraph = function (data, keys, curBarGraph, yLabel) {

    curBarGraph.y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return Math.abs(d[key]); }); })]).nice();

    curBarGraph.yAxis.scale(curBarGraph.y);

        /* Y axis */
    curBarGraph.svg.select(".yAxis").remove();
    curBarGraph.svg.append("g")
        .attr("class", "yAxis axis")
        .call(curBarGraph.yAxis);



    // The format used on the tip values
    var dpFormat = d3.format(".2f");

    // Create the tip that will show up on hover
    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        return "<strong>Value:</strong> <span style='color:lightgreen'>" + dpFormat(d.value) + "</span><br><br><strong>Year:</strong> <span style='color:lightgreen'>" + d.key + "</span>";
      });

    curBarGraph.svg.call(tip);

    var selection = curBarGraph.svg.selectAll(".bar").remove();


    curBarGraph.svg.append("g")
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", function(d) { return "translate(" + curBarGraph.x0(d.edb) + ",0)"; })
        .selectAll("rect")
        .data(function(d) { return keys.map(function(key) { return {neg : d[key] < 0,key: key, edb : d.edb, value: Math.abs(d[key])}; }); })
        .enter().append("rect")
        .attr("x", function(d) { return curBarGraph.x1(d.key); })
        .attr("y", function(d) { return curBarGraph.y(d.value); })
        .attr("class","bar")
        .attr("width", curBarGraph.x1.bandwidth())
        .attr("height", function(d) { return height - curBarGraph.y(d.value); })
        .attr("fill", function(d) { if(d.neg){
          return zRed(d.key);
        }else {
          return z(d.key);
        }})
        .attr("class",function(d){return ""+d.edb.replace(/ /g , "");} ) // Add ebd as the class
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

            // Create the legend
    var legend = curBarGraph.svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 8)
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(keys.slice().reverse())
      .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 10 + ")"; });

    legend.append("rect")
      .attr("x", width - 100)
      .attr("width", 8.5)
      .attr("height", 8.5)
      .attr("fill", z);

}
  return {
    highlight : highlight,
    createdGroupedBarGraph : createdGroupedBarGraph
  }
})();

// Required to line up scatter plot dots
var whiskBoxWidth = 1;

(function() {

// Inspired by http://informationandvisualization.de/blog/box-plot
    d3.box = function() {

        var height = 1,
            duration = 0,
            domain = null,
            value = Number,
            whiskers = boxWhiskers,
            quartiles = boxQuartiles,
            showLabels = true, // whether or not to show text labels
            numBars = 4,
            curBar = 1,
            tickFormat = null;

        // For each small multiple…
        function box(g) {
            g.each(function(data, i) {
                var d = data[1].sort(d3.ascending); // Sorts on of the numbers arrays

                var g = d3.select(this),
                    n = d.length,
                    min = d[0],
                    max = d[n - 1];


                // Compute quartiles. Must return exactly 3 elements.
                var quartileData = d.quartiles = quartiles(d);

                // Compute whiskers. Must return exactly 2 elements, or null.
                var whiskerIndices = whiskers && whiskers.call(this, d, i),
                    whiskerData = whiskerIndices && whiskerIndices.map(function(i) { return d[i]; });

                // Compute outliers. If no whiskers are specified, all data are "outliers".
                // We compute the outliers as indices, so that we can join across transitions!
                var outlierIndices = whiskerIndices
                    ? d3.range(0, whiskerIndices[0]).concat(d3.range(whiskerIndices[1] + 1, n))
                    : d3.range(n);


                // Compute the new x-scale.
                var x1 = d3.scaleLinear()
                    .domain(domain && domain.call(this, d, i) || [min, max])
                    .range([height, 0]);


                // Retrieve the old x-scale, if this is an update.
                var x0 = this.__chart__ || d3.scaleLinear()
                        .domain([0, Infinity])
                        // .domain([0, max])
                        .range(x1.range());

                // Stash the new scale.
                this.__chart__ = x1;

                // Note: the box, median, and box tick elements are fixed in number,
                // so we only have to handle enter and update. In contrast, the outliers
                // and other elements are variable, so we need to exit them! Variable
                // elements also fade in and out.

                // Update center line: the vertical line spanning the whiskers.
                var center = g.selectAll("line.center")
                    .data(whiskerData ? [whiskerData] : []);

                //vertical line
                center.enter().insert("line", "rect")
                    .attr("class", "center")
                    .attr("x1", whiskBoxWidth / 2)
                    .attr("y1", function(d) { return x0(d[0]); })
                    .attr("x2", whiskBoxWidth / 2)
                    .attr("y2", function(d) { return x0(d[1]); })
                    .style("opacity", 1e-6)
                    .transition()
                    .duration(duration)
                    .style("opacity", 1)
                    .attr("y1", function(d) { return x1(d[0]); })
                    .attr("y2", function(d) { return x1(d[1]); });

                center.transition()
                    .duration(duration)
                    .style("opacity", 1)
                    .attr("y1", function(d) { return x1(d[0]); })
                    .attr("y2", function(d) { return x1(d[1]); });

                center.exit().transition()
                    .duration(duration)
                    .style("opacity", 1e-6)
                    .attr("y1", function(d) { return x1(d[0]); })
                    .attr("y2", function(d) { return x1(d[1]); })
                    .remove();

                // Update innerquartile box.
                var box = g.selectAll("rect.box")
                    .data([quartileData]);

                box.enter().append("rect")
                    .attr("class", "box")
                    .attr("x", 0)
                    .attr("y", function(d) {return x0(d[2]); })
                    .attr("width", whiskBoxWidth)
                    .attr("height", function(d) { return x0(d[0]) - x0(d[2]); })
                    .transition()
                    .duration(duration)
                    .attr("y", function(d) { return x1(d[2]); })
                    .attr("height", function(d) { return x1(d[0]) - x1(d[2]); });

                box.transition()
                    .duration(duration)
                    .attr("y", function(d) { return x1(d[2]); })
                    .attr("height", function(d) { return x1(d[0]) - x1(d[2]); });

                // Update median line.
                var medianLine = g.selectAll("line.median")
                    .data([quartileData[1]]);


                medianLine.enter().append("line")
                    .attr("class", "median")
                    .attr("x1", 0)
                    .attr("y1", x0)
                    .attr("x2", whiskBoxWidth)
                    .attr("y2", x0)
                    .transition()
                    .duration(duration)
                    .attr("y1", x1)
                    .attr("y2", x1);

                medianLine.transition()
                    .duration(duration)
                    .attr("y1", x1)
                    .attr("y2", x1);

                // Update whiskers.
                var whisker = g.selectAll("line.whisker")
                    .data(whiskerData || []);


                whisker.enter().insert("line", "circle, text")
                    .attr("class", "whisker")
                    .attr("x1", 0)
                    .attr("y1", x0)
                    .attr("x2", 0 + whiskBoxWidth)
                    .attr("y2", x0)
                    .style("opacity", 1e-6)
                    .transition()
                    .duration(duration)
                    .attr("y1", x1)
                    .attr("y2", x1)
                    .style("opacity", 1);

                whisker.transition()
                    .duration(duration)
                    .attr("y1", x1)
                    .attr("y2", x1)
                    .style("opacity", 1);

                whisker.exit().transition()
                    .duration(duration)
                    .attr("y1", x1)
                    .attr("y2", x1)
                    .style("opacity", 1e-6)
                    .remove();

                // Update outliers.
                var outlier = g.selectAll("circle.outlier")
                    .data(outlierIndices, Number);

                outlier.enter().insert("circle", "text")
                    .attr("class", "outlier")
                    .attr("r", 2)
                    .attr("cx", whiskBoxWidth / 2)
                    .attr("cy", function(i) { return x0(d[i]); })
                    .style("opacity", 1e-6)
                    .transition()
                    .duration(duration)
                    .attr("cy", function(i) { return x1(d[i]); })
                    .style("opacity", 1);

                outlier.transition()
                    .duration(duration)
                    .attr("cy", function(i) { return x1(d[i]); })
                    .style("opacity", 1);

                outlier.exit().transition()
                    .duration(duration)
                    .attr("cy", function(i) { return x1(d[i]); })
                    .style("opacity", 1e-6)
                    .remove();

                // Compute the tick format.
                var format = tickFormat || x1.tickFormat(8);

                // Update box ticks.
                var boxTick = g.selectAll("text.box")
                    .data(quartileData);
                if(showLabels == true) {
                    boxTick.enter().append("text")
                        .attr("class", "box")
                        .attr("dy", ".3em")
                        .attr("dx", function(d, i) { return i & 1 ? 6 : -6 })
                        .attr("x", function(d, i) { return i & 1 ?  + whiskBoxWidth : 0 })
                        .attr("y", x0)
                        .attr("text-anchor", function(d, i) { return i & 1 ? "start" : "end"; })
                        .text(format)
                        .transition()
                        .duration(duration)
                        .attr("y", x1);
                }

                boxTick.transition()
                    .duration(duration)
                    .text(format)
                    .attr("y", x1);

                // Update whisker ticks. These are handled separately from the box
                // ticks because they may or may not exist, and we want don't want
                // to join box ticks pre-transition with whisker ticks post-.
                var whiskerTick = g.selectAll("text.whisker")
                    .data(whiskerData || []);
                if(showLabels == true) {
                    whiskerTick.enter().append("text")
                        .attr("class", "whisker")
                        .attr("dy", ".3em")
                        .attr("dx", 6)
                        .attr("x", whiskBoxWidth)
                        .attr("y", x0)
                        .text(format)
                        .style("opacity", 1e-6)
                        .transition()
                        .duration(duration)
                        .attr("y", x1)
                        .style("opacity", 1);
                }
                whiskerTick.transition()
                    .duration(duration)
                    .text(format)
                    .attr("y", x1)
                    .style("opacity", 1);

                whiskerTick.exit().transition()
                    .duration(duration)
                    .attr("y", x1)
                    .style("opacity", 1e-6)
                    .remove();
            });
            d3.timerFlush();
        }

        box.width = function(x) {
            if (!arguments.length) return whiskBoxWidth;
            whiskBoxWidth = x;
            return box;
        };

        box.height = function(x) {
            if (!arguments.length) return height;
            height = x;
            return box;
        };

        box.tickFormat = function(x) {
            if (!arguments.length) return tickFormat;
            tickFormat = x;
            return box;
        };

        box.duration = function(x) {
            if (!arguments.length) return duration;
            duration = x;
            return box;
        };

        d3.functor = function functor(v) {
            return typeof v === "function" ? v : function() {
                return v;
            };
        };


        box.domain = function(x) {
            if (!arguments.length) return domain;
            domain = x === null ? x : d3.functor(x);
            return box;
        };

        box.value = function(x) {
            if (!arguments.length) return value;
            value = x;
            return box;
        };

        box.whiskers = function(x) {
            if (!arguments.length) return whiskers;
            whiskers = x;
            return box;
        };

        box.showLabels = function(x) {
            if (!arguments.length) return showLabels;
            showLabels = x;
            return box;
        };

        box.quartiles = function(x) {
            if (!arguments.length) return quartiles;
            quartiles = x;
            return box;
        };

        return box;
    };

    function boxWhiskers(d) {
        return [0, d.length - 1];
    }

    function boxQuartiles(d) {
        return [
            d3.quantile(d, .25),
            d3.quantile(d, .5),
            d3.quantile(d, .75)
        ];
    }

})();

var BoxPlotModule = (function () {
    var labels = false; // show the text labels beside individual boxplots?

// Margins and graph width / height
    var boxMargin = {top: 25, right: 85, bottom: 150, left:100},
      boxWidth = 850 - boxMargin.left - boxMargin.right,
      boxHeight = 500  - boxMargin.top  - boxMargin.bottom;


// Encapsulate all properties of graph
    var plots = [];

// Object to hold the values for each individual boxplot
    function BoxPlotData(x,y,xAxis,yAxis,svg,chart,created, id){
        this.x = x;
        this.y = y;
        this.xAxis = xAxis;
        this.yAxis = yAxis;
        this.svg = svg;
        this.chart = chart;
        this.created = created;
        this.id = id
    }


// Create a box plot graph with the dataObject and place it in the div with divID unit for the the y - axis
    function createBoxPlot(dataObject,divID,unit){
        var boxPlotObjects = null;
        var data = dataObject.data;
        var min = dataObject.min;
        var max = dataObject.max;
        var scatterData = dataObject.scatterData;

        // Find the plot that needs to be updated or created
        plots.forEach(function (plot) {
            if(plot.id === divID){
                boxPlotObjects = plot;
            }
        });

        // The graph has not been created yet
        if(boxPlotObjects === null){
            var x = d3.scaleBand().rangeRound([0, boxWidth]).padding(0.7,0.3);
            boxPlotObjects = new BoxPlotData(x,null,null,null,null,null,false,divID);
            plots.push(boxPlotObjects);
        } else {
            d3.select(divID+' svg').remove();
        }

        // the y-axis
        boxPlotObjects.y = d3.scaleLinear()
          .domain([min, max]).nice()
          .range([boxHeight + boxMargin.top, 0 + boxMargin.top]);

        boxPlotObjects.chart = d3.box()
          .whiskers(iqr(1.5))
          .height(boxHeight)
          .domain(boxPlotObjects.y.domain())
          .showLabels(labels);

        // Create the responsive SVG
        boxPlotObjects.svg =  d3.select(divID)
          .append("div")
          .classed("svg-container-boxplot", true) //container class to make it responsive
          .append("svg")
          //responsive SVG needs these 2 attributes and no width and height attr
          .attr("preserveAspectRatio", "xMinYMin meet")
          .attr("viewBox", "0 0 " + (boxWidth + boxMargin.left + boxMargin.right) +" "+ (boxHeight + boxMargin.top + boxMargin.bottom) + "") //
          .classed("svg-content-responsive-boxplot", true)
          .attr("class", "box")
          .append("g") // group allows us to move everything together
          .attr("transform",
            "translate(" + boxMargin.left + "," + boxMargin.top + ")"); // moves by a x and y value in this c
          //class to make it responsive

        boxPlotObjects.x.domain( data.map(function(d) {return d[0] } ) );
        boxPlotObjects.xAxis = d3.axisBottom(boxPlotObjects.x);
        boxPlotObjects.yAxis = d3.axisLeft(boxPlotObjects.y);

        boxPlotObjects.svg.selectAll(".box")
          .data(data)
          .enter().append("g")
          .attr("transform", function(d) { return "translate(" +  boxPlotObjects.x(d[0])  + "," + boxMargin.top + ")"; } )
          .call(boxPlotObjects.chart.width(boxPlotObjects.x.bandwidth())); //V4 Updated

        // draw the boxplots
        boxPlotObjects.svg.selectAll(".box")
          .data(data)
          .enter().append("g")
          .attr("transform", function(d) { return "translate(" +  boxPlotObjects.x(d[0])  + "," + boxMargin.top + ")"; } )
          .call(boxPlotObjects.chart.width(boxPlotObjects.x.bandwidth())); //V4 Updated

        // The format to display the values in
        var dpFormat = d3.format(".2f");

        // Create the tip to show up on hover
        var tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function(d) {
              return "<strong>Value:</strong> <span style='color:lightgreen'>" + dpFormat(d.value) + "</span><br><br><strong>EDB:</strong> <span style='color:lightgreen'>" + d.edb + "</span>";
          });
        boxPlotObjects.svg.call(tip);

        // Add the dots for the scaterplot on top of the box and whisker
        boxPlotObjects.svg.selectAll(".dot")
          .data(scatterData)
          .enter().append("circle")
          .attr("class",function(d){return "dot "+d.edb.replace(/ /g , "");})
          .attr("r", 2)
          .attr("cx", function(d) { return boxPlotObjects.x(d.year) + whiskBoxWidth/2; })
          .attr("cy", function(d) { return boxPlotObjects.y(d.value); })
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide);

        // draw y axis
        boxPlotObjects.svg.append("g")
          .attr("class", "y axis")
          .call(boxPlotObjects.yAxis)
          .append("text")
          .attr("transform", "rotate(-90)")
          // .attr("y", 6)
          // .attr("dy", ".71em")
          .style("text-anchor", "end")
          .style("font-size", "12px");

        // draw x axis
        boxPlotObjects.svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + (boxHeight + boxMargin.top  + 10) + ")")
          .call(boxPlotObjects.xAxis)
          .append("text")             // text label for the x axis
          .attr("x", (boxWidth / 2) )
          .attr("y",  10 )
          .attr("dy", ".71em")
          .style("text-anchor", "middle")
          .style("font-size", "12px")
          .text("Quarter");

        // Add the y axis unit
        boxPlotObjects.svg.append("text")
          .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
          .attr("transform", "translate("+ -(boxMargin.left/2-10) +","+(boxHeight/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
          .attr("class", "unit-text-scaled")
          .text(unit);

        // Add year as the x-axis label
        boxPlotObjects.svg.append("text")
          .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
          .attr("transform", "translate("+ +(boxWidth/2) +","+( boxMargin.top + 40 + boxHeight)+")")  // text is drawn off the screen top left, move down and out and rotate
          .attr("class", "unit-text-scaled")
          .text("Year");

        boxPlotObjects.created = true; // Set the plot to created for the ID
    }


// Returns a function to compute the interquartile range.
    function iqr(k) {
        return function(d, i) {
            var q1 = d.quartiles[0],
              q3 = d.quartiles[2],
              iqr = (q3 - q1) * k,
              i = -1,
              j = d.length;
            while (d[++i] < q1 - iqr);
            while (d[--j] > q3 + iqr);
            return [i, j];
        };
    }



    return {
        createBoxPlot : createBoxPlot
    }
})();

// d3.tip
// Copyright (c) 2013 Justin Palmer
// ES6 / D3 v4 Adaption Copyright (c) 2016 Constantin Gavrilete
// Removal of ES6 for D3 v4 Adaption Copyright (c) 2016 David Gotz
//
// Tooltips for d3.js SVG visualizations

d3.functor = function functor(v) {
  return typeof v === "function" ? v : function() {
    return v;
  };
};

d3.tip = function() {

  var direction = d3_tip_direction,
      offset    = d3_tip_offset,
      html      = d3_tip_html,
      node      = initNode(),
      svg       = null,
      point     = null,
      target    = null

  function tip(vis) {
    svg = getSVGNode(vis)
    point = svg.createSVGPoint()
    document.body.appendChild(node)
  }

  // Public - show the tooltip on the screen
  //
  // Returns a tip
  tip.show = function() {
    var args = Array.prototype.slice.call(arguments)
    if(args[args.length - 1] instanceof SVGElement) target = args.pop()

    var content = html.apply(this, args),
        poffset = offset.apply(this, args),
        dir     = direction.apply(this, args),
        nodel   = getNodeEl(),
        i       = directions.length,
        coords,
        scrollTop  = document.documentElement.scrollTop || document.body.scrollTop,
        scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft

    nodel.html(content)
      .style('position', 'absolute')
      .style('opacity', 1)
      .style('pointer-events', 'all')

    while(i--) nodel.classed(directions[i], false)
    coords = direction_callbacks[dir].apply(this)
    nodel.classed(dir, true)
      .style('top', (coords.top +  poffset[0]) + scrollTop + 'px')
      .style('left', (coords.left + poffset[1]) + scrollLeft + 'px')

    return tip
  }

  // Public - hide the tooltip
  //
  // Returns a tip
  tip.hide = function() {
    var nodel = getNodeEl()
    nodel
      .style('opacity', 0)
      .style('pointer-events', 'none')
    return tip
  }

  // Public: Proxy attr calls to the d3 tip container.  Sets or gets attribute value.
  //
  // n - name of the attribute
  // v - value of the attribute
  //
  // Returns tip or attribute value
  tip.attr = function(n, v) {
    if (arguments.length < 2 && typeof n === 'string') {
      return getNodeEl().attr(n)
    } else {
      var args =  Array.prototype.slice.call(arguments)
      d3.selection.prototype.attr.apply(getNodeEl(), args)
    }

    return tip
  }

  // Public: Proxy style calls to the d3 tip container.  Sets or gets a style value.
  //
  // n - name of the property
  // v - value of the property
  //
  // Returns tip or style property value
  tip.style = function(n, v) {
    // debugger;
    if (arguments.length < 2 && typeof n === 'string') {
      return getNodeEl().style(n)
    } else {
      var args = Array.prototype.slice.call(arguments);
      if (args.length === 1) {
        var styles = args[0];
        Object.keys(styles).forEach(function(key) {
          return d3.selection.prototype.style.apply(getNodeEl(), [key, styles[key]]);
        });
      }
    }

    return tip
  }

  // Public: Set or get the direction of the tooltip
  //
  // v - One of n(north), s(south), e(east), or w(west), nw(northwest),
  //     sw(southwest), ne(northeast) or se(southeast)
  //
  // Returns tip or direction
  tip.direction = function(v) {
    if (!arguments.length) return direction
    direction = v == null ? v : d3.functor(v)

    return tip
  }

  // Public: Sets or gets the offset of the tip
  //
  // v - Array of [x, y] offset
  //
  // Returns offset or
  tip.offset = function(v) {
    if (!arguments.length) return offset
    offset = v == null ? v : d3.functor(v)

    return tip
  }

  // Public: sets or gets the html value of the tooltip
  //
  // v - String value of the tip
  //
  // Returns html value or tip
  tip.html = function(v) {
    if (!arguments.length) return html
    html = v == null ? v : d3.functor(v)

    return tip
  }

  // Public: destroys the tooltip and removes it from the DOM
  //
  // Returns a tip
  tip.destroy = function() {
    if(node) {
      getNodeEl().remove();
      node = null;
    }
    return tip;
  }

  function d3_tip_direction() { return 'n' }
  function d3_tip_offset() { return [0, 0] }
  function d3_tip_html() { return ' ' }

  var direction_callbacks = {
    n:  direction_n,
    s:  direction_s,
    e:  direction_e,
    w:  direction_w,
    nw: direction_nw,
    ne: direction_ne,
    sw: direction_sw,
    se: direction_se
  };

  var directions = Object.keys(direction_callbacks);

  function direction_n() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.n.y - node.offsetHeight,
      left: bbox.n.x - node.offsetWidth / 2
    }
  }

  function direction_s() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.s.y,
      left: bbox.s.x - node.offsetWidth / 2
    }
  }

  function direction_e() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.e.y - node.offsetHeight / 2,
      left: bbox.e.x
    }
  }

  function direction_w() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.w.y - node.offsetHeight / 2,
      left: bbox.w.x - node.offsetWidth
    }
  }

  function direction_nw() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.nw.y - node.offsetHeight,
      left: bbox.nw.x - node.offsetWidth
    }
  }

  function direction_ne() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.ne.y - node.offsetHeight,
      left: bbox.ne.x
    }
  }

  function direction_sw() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.sw.y,
      left: bbox.sw.x - node.offsetWidth
    }
  }

  function direction_se() {
    var bbox = getScreenBBox()
    return {
      top:  bbox.se.y,
      left: bbox.e.x
    }
  }

  function initNode() {
    var node = d3.select(document.createElement('div'))
    node
      .style('position', 'absolute')
      .style('top', 0)
      .style('opacity', 0)
      .style('pointer-events', 'none')
      .style('box-sizing', 'border-box')

    return node.node()
  }

  function getSVGNode(el) {
    el = el.node()
    if(el.tagName.toLowerCase() === 'svg')
      return el

    return el.ownerSVGElement
  }

  function getNodeEl() {
    if(node === null) {
      node = initNode();
      // re-add node to DOM
      document.body.appendChild(node);
    };
    return d3.select(node);
  }

  // Private - gets the screen coordinates of a shape
  //
  // Given a shape on the screen, will return an SVGPoint for the directions
  // n(north), s(south), e(east), w(west), ne(northeast), se(southeast), nw(northwest),
  // sw(southwest).
  //
  //    +-+-+
  //    |   |
  //    +   +
  //    |   |
  //    +-+-+
  //
  // Returns an Object {n, s, e, w, nw, sw, ne, se}
  function getScreenBBox() {
    var targetel   = target || d3.event.target;

    while ('undefined' === typeof targetel.getScreenCTM && 'undefined' === targetel.parentNode) {
        targetel = targetel.parentNode;
    }

    var bbox       = {},
        matrix     = targetel.getScreenCTM(),
        tbbox      = targetel.getBBox(),
        width      = tbbox.width,
        height     = tbbox.height,
        x          = tbbox.x,
        y          = tbbox.y

    point.x = x
    point.y = y
    bbox.nw = point.matrixTransform(matrix)
    point.x += width
    bbox.ne = point.matrixTransform(matrix)
    point.y += height
    bbox.se = point.matrixTransform(matrix)
    point.x -= width
    bbox.sw = point.matrixTransform(matrix)
    point.y -= height / 2
    bbox.w  = point.matrixTransform(matrix)
    point.x += width
    bbox.e = point.matrixTransform(matrix)
    point.x -= width / 2
    point.y -= height / 2
    bbox.n = point.matrixTransform(matrix)
    point.y += height
    bbox.s = point.matrixTransform(matrix)

    return bbox
  }

  return tip
};

var Database = (function(){


  /**
   *  Grabs all the sections from the database
   *
   *  @callback should take (Object[], Boolean) array contains categories boolean is true if no results false if there is a result
   * */
  function getSectionsFromDatabase(callback){
    $.get("/sections/sections", function(data){
        if(data.sections.length > 0){
          callback(data.sections, false);
        } else {
          callback(sections, true);
        }
    });
  }

  /**
   *  Grabs all the categories for a specific section
   *
   *  @param section {String} The section to look for distinct categories in
   *  @callback should take (Object[], Boolean) array contains categories boolean is true if no results false if there is a result
   * */
  function getCategoriesFromDatabase(section, callback){
    // Find all the categories associated with this section
    $.post("/sections/s",{selected : section }, function(data){
      if(data.categories.length > 0  &&  data.categories[0] !== null){
        callback(data.categories, false);
      } else { // The one special case where category is null
        callback([], true); // No result
      }});
  }


  /**
   * Grabs all sub categories for a specific section and category
   *
   * @param section {String} The section to look for distinct categories in
   * @param category {String} The category to look for distinct sub categories in
   * @param callback {function} The function to call once the query has a result
   * */
  function getSubCategoriesFromDatabase(section, category, callback){
    $.post("/sections/sc",{section : section, category : category}, function(data){
      if(data.subCategories.length > 0  &&  data.subCategories[0] !== null){
        callback(data.subCategories, false); // There is a result
      } else {
        callback([], true); // No results
      }
    });
  }


  /**
   * Grabs all description for a specific section, category and sub category if sub category
   * is not an empty string.
   *
   * @param section {String} The section to look for distinct categories in
   * @param category {String} The category to look for distinct sub categories in
   * @param subCategory {String} The sub category to look for distinct sub categories in
   * @param callback {function} The function to call once the query has a result
   * */
  function getDescriptionsFromDatabase(section,category,subCategory,callback){
    // Find all descriptions for the currently selected sub category
    $.post("/sections/desc",{category : category,section : section, subCategory : subCategory}, function(data){
      if(data.descriptions.length > 0 &&  data.descriptions[0] !== null){
        callback(data.descriptions, false);
      } else {
        callback(data.descriptions, true);
      }});
  }


  /**
   * Returns all of the rows associated with the selected sections, categories, subCategories
   * and descriptions for multiple rows.
   *
   * @param selections {Object} Contains all the selections the user made
   * @param callback {function} The function to call once the query has a result
   * */
  function getRowsForSearch(selections, callback) {
    $.post("/compare/search",{company : "", selections : JSON.stringify(selections)}, function(data){
      callback(data.rows);
    });

  }

  return {
      getCategoriesFromDatabase : getCategoriesFromDatabase,
      getSubCategoriesFromDatabase : getSubCategoriesFromDatabase,
      getDescriptionsFromDatabase : getDescriptionsFromDatabase,
      getSectionsFromDatabase : getSectionsFromDatabase,
      getRowsForSearch : getRowsForSearch
  }
})();

var events = {
  events: {},
  on: function (eventName, fn) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(fn);
  },
  off: function(eventName, fn) {
    if (this.events[eventName]) {
      for (var i = 0; i < this.events[eventName].length; i++) {
        if (this.events[eventName][i] === fn) {
          this.events[eventName].splice(i, 1);
          break;
        }
      };
    }
  },
  emit: function (eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(function(fn) {
        fn(data);
      });
    }
  }
};

var VectorModule = (function(){
  var vMargin = {top: 30, right: 20, bottom: 180, left: 70},
    vWidth = 1000 - vMargin.left - vMargin.right,
    vHeight = 800 - vMargin.top - vMargin.bottom;


  var vectorGraphs = [];

  function VectorGraphData(id){
    this.id = id;
    this.created = false;
    this.xAxis = d3.axisBottom();
    this.yAxis = d3.axisLeft();
    this.x = d3.scaleLinear().rangeRound([vWidth, 0]);
    this.y =  d3.scaleLinear().rangeRound([vHeight, 0]);
    this.svg = null;
  }

  function createVectorGraph(data,xLabel, yLabel, divID){
    var vectorGraph = null;

    vectorGraphs.forEach(function (elem) {
      if (elem.id === divID){vectorGraph = elem;}
    });

    if(vectorGraph === null){
      vectorGraph = new VectorGraphData(divID);
      vectorGraphs.push(vectorGraph);
    }

    // Find all EDB'
    var edbs = [];
    data.forEach(function (e) {
      edbs.push(e.edb);
    });

    var color = d3.scaleOrdinal().domain(edbs)
      .range(["#e69a61", "#9817ff", "#18c61a", "#33b4ff", "#c9167e", "#297853", "#d7011b", "#7456c7", "#7e6276", "#afb113", "#fd879c", "#fb78fa", "#24c373", "#45bbc5", "#766b21", "#abad93", "#c19ce3", "#fd8f11", "#2f56ff", "#307a11", "#b3483c", "#0d7396", "#94b665", "#9d4d91", "#b807c8", "#086cbf", "#a2abc5", "#a35702", "#d3084b"]);

    var allValues =[];
    data.forEach(function (e) {
      e.years.forEach(function (e1){
        e1["edb"] = e.edb;
        allValues.push(e1);
      });
    });

    var xValues = [];
    allValues.forEach(function (e){ xValues.push(e.valueB);});

    var yValues = [];
    allValues.forEach(function (e){ yValues.push(e.valueA);});

    // Create the svg and append to the div
    if(!vectorGraph.created){
      vectorGraph.svg = d3.select(divID).append("svg")
        .attr("width", vWidth + vMargin.left + vMargin.right)
        .attr("height", vHeight + vMargin.top + vMargin.bottom)
        .append("g")
        .attr("transform", "translate(" + vMargin.left + "," + vMargin.top + ")"); // moves by a x and y value in this case the margins
    }


    // Find max values
    var maxX = d3.max(xValues, function(d) { return d;} );
    var maxY = d3.max(yValues, function(d) { return d;} );

    // Set the domain for x and y
    vectorGraph.x.domain([maxX,0]).nice();
    vectorGraph.y.domain([0,maxY]).nice();


    if(vectorGraph.created){
      vectorGraph.svg.select('.yAxis').call(vectorGraph.yAxis);
      vectorGraph.svg.select('.xAxis').call(vectorGraph.xAxis);
    } else {
      vectorGraph.xAxis.scale(vectorGraph.x);
      vectorGraph.yAxis.scale(vectorGraph.y);
    }

    vectorGraph.svg.append("g")
      .attr("class","xAxis")
      .attr("transform", "translate(0," + vHeight + ")")
      .call(vectorGraph.xAxis.scale(vectorGraph.x));
    var dpFormat = d3.format(".2f");

    // add the y Axis
    vectorGraph.svg.append("g")
      .attr("class","yAxis")
      .attr("fill", "black")
      .call(vectorGraph.yAxis);

    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        return "<strong>EDB:</strong> <span style='color:lightgreen'>" + d.edb + "</span><br><br><strong>Year:</strong> <span style='color:lightgreen'>" + d.year + "</span><br><br><strong>Value:</strong> <span style='color:lightgreen'>[" + dpFormat(d.valueA)	 + ", " + dpFormat(d.valueB) +"]</span>";
      });
    vectorGraph.svg.call(tip);

    if(vectorGraph.created){
      vectorGraph.svg.selectAll(".dotm")
        .data(allValues)
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function(d) {return vectorGraph.x(d.valueB); })
        .attr("cy", function(d) { return vectorGraph.y(d.valueA); })
        .attr("fill", function(d) { return color(d.edb); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);
    } else {
      vectorGraph.svg.selectAll(".dotm")
        .data(allValues)
        .enter().append("circle")
        .attr("class", "dotm")
        .attr("r", 3.5)
        .attr("cx", function(d) {return vectorGraph.x(d.valueB); })
        .attr("cy", function(d) { return vectorGraph.y(d.valueA); })
        .attr("fill", function(d) { return color(d.edb); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);
    }

    var lines = []; // x,y,x1,y1

    // Next create the lines between them
    for(var i =0; i < data.length; i++){
      for(var j = 0; j < data[i].years.length-1; j++){ // -1 because we add
        lines.push( {end :  true,edb : data[i].edb, x : data[i].years[j].valueB, y : data[i].years[j].valueA , x1 : data[i].years[j+1].valueB , y1 : data[i].years[j+1].valueA});
      }
    }

    // Build arrow
    if(!vectorGraph.created){
      vectorGraph.svg.append("svg:defs").selectAll("marker")
        .data(lines)
        .enter().append("svg:marker")
        .attr("id", function(d){
          if(d.end){
            return "end"+d.edb.replace(/ /g , "");
          }
        })
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 9)
        .attr("refY", -0.5)
        .attr("markerWidth", 9)
        .attr("markerHeight", 9)
        .attr("markerUnits","userSpaceOnUse")
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5")
        .style("fill", function(d){ return color(d.edb);});
    }

    if(vectorGraph.created){
      vectorGraph.svg.selectAll(".line")
        .data(lines)
        .attr("x1",  function(d) {return x(d.x);})
        .attr("y1", function(d) {return y(d.y);})
        .attr("x2", function(d) {return x(d.x1);})
        .attr("y2", function(d) {return y(d.y1);})
        .attr("stroke-width", 2)
        .attr("class",function(d){return ""+d.edb.replace(/ /g , "");} ) // Add ebd as the class
        .attr("stroke", function(d) { return color(d.edb);})
        .attr("marker-end", function(d){
          if(d.end){
            return "url(#end"+d.edb.replace(/ /g , "") +")";
          }
        });
    } else {
      vectorGraph.svg.selectAll(".line")
        .data(lines)
        .enter().append("line")
        .attr("x1",  function(d) {return vectorGraph.x(d.x);})
        .attr("y1", function(d) {return vectorGraph.y(d.y);})
        .attr("x2", function(d) {return vectorGraph.x(d.x1);})
        .attr("y2", function(d) {return vectorGraph.y(d.y1);})
        .attr("stroke-width", 2)
        .attr("class",function(d){return ""+d.edb.replace(/ /g , "");} ) // Add ebd as the class
        .attr("stroke", function(d) { return color(d.edb);})
        .attr("marker-end", function(d){
          if(d.end){
            return "url(#end"+d.edb.replace(/ /g , "")+")";
          }
        });
    }


    var xMetricLabel = "";
    var yMetricLabel = "";
    if(divID.includes("abcd")){
      xMetricLabel = "C / D";
      yMetricLabel = "A / B";
    } else if(divID.includes("ab")){
      xMetricLabel = "B";
      yMetricLabel = "A"
    } else if(divID.includes("cd")) {
      xMetricLabel = "D";
      yMetricLabel = "C";
    }

    // Add Y label
    vectorGraph.svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate("+ -(vMargin.left/2) +","+ ( +vHeight/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
      .attr("class", "unit-text")
      .text(yMetricLabel + "     (" + yLabel + ")");

    // Add X label
    vectorGraph.svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate("+ (vWidth/2) +","+ +(vHeight + vMargin.bottom/4) + ")")  // text is drawn off the screen top left, move down and out and rotate
      .attr("class", "unit-text")
      .text(xMetricLabel+ "     (" + xLabel + ")");


    if(!vectorGraph.created){
      var legend = vectorGraph.svg.append("g")
        .attr('class', 'vector-key-text')
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(edbs)
        .enter().append("g")
        .append("svg:a")
        .attr("transform", function(d, i) {
          var y = Math.floor(i / 5) * 20;
          var x = (i - (Math.floor((i / 5)) * 5)) * 160;
          x = x + vMargin.left;
          return "translate("+ x +"," + (y +vHeight +vMargin.bottom/3 ) + ")";
        })
        .on('mouseover', function(d){
          vectorGraph.svg.selectAll('line.'+d.replace(/ /g , ""))
            .classed("line-selected", true);
        }).
        on('mouseout', function(d){
          vectorGraph.svg.selectAll('line.'+d.replace(/ /g , ""))
            .classed("line-selected", false);
        });

      legend.append("circle")
        .attr("cx", vMargin.left + 55)
        .attr("cy", 9.5)
        .attr("r", 7.5)
        // .attr("height", 19)
        .attr("fill", color);

      legend.append("text")
        .attr("x", vMargin.left + 40)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .attr("class", "g-text")
        .style("font-size", "14px")
        .text(function(d) { return d; });
    }
    vectorGraph.created = true;
  }

  return {
    createVectorGraph : createVectorGraph
  }
})();

