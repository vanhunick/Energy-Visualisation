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


//  Margins and width / height for the graph
var margin = { top: 35, right: 85, bottom: 150, left: 50 },
    width = 850 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

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
}

// Blue color scale
var z = d3.scaleOrdinal().range(["#BBDEFB", "#64B5F6", "#1976D2", "#1565C0", "#0D47A1", "#d0743c", "#ff8c00"]);

// Red color scale for negative values
var zRed = d3.scaleOrdinal().range(["#FF7373", "#FF4C4C", "#FF2626", "#B20000", "#D90000", "#d0743c", "#ff8c00"]);

// Green color scale for selected values
var zSelected = d3.scaleOrdinal().range(["#C1FFC1", "#90EE90", "#5BC85B", "#31A231", "#137B13", "#d0743c", "#ff8c00"]);

// Highlights each bar that corrosponds to the EDB. If alreadySelected, nothing should be highlighted therefore the normal scale is applied
function highlight(edb, alreadySelected){ // With spaces
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


// Creates a Grouped bar graph with the data and inserts into div DivID
function createdGroupedBarGraph(data,keys,yLabel, divID){
    var curBarGraph = null;

    // Find the graph if it already exists and needs to be updated
    barGraphs.forEach(function (elem) {
       if(elem.id === divID)curBarGraph = elem;
    });

    // If the graph does not exist create one
    if(curBarGraph === null){
        curBarGraph = new GroupedBarData( d3.scaleBand().rangeRound([0, width]).paddingInner(0.05),d3.scaleBand().padding(0.05),
                                          d3.scaleLinear().rangeRound([height, 0]),d3.axisLeft(),d3.axisBottom(),divID);
        barGraphs.push(curBarGraph);
    }

    // Only add svg if it is not created yet
    if(!curBarGraph.created){
      curBarGraph.svg =  d3.select(divID)
       .append("div")
       .classed("svg-container", true) //container class to make it responsive
       .append("svg")
       .attr("preserveAspectRatio", "xMinYMin meet")
       .attr("viewBox", "0 0 "+ (width + margin.left + margin.right) +" "+ (height + margin.top + margin.bottom) + "")
       .append("g")
       .attr("transform","translate(" + margin.left + "," + margin.top + ")") // moves by a x and y value in this c
       .classed("svg-content-responsive", true);
    }

    // Set the domains
    curBarGraph.x0.domain(data.map(function(d) { return d.edb; }));
    curBarGraph.x1.domain(keys).rangeRound([0, curBarGraph.x0.bandwidth()]);
    curBarGraph.y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return Math.abs(d[key]); }); })]).nice();
    var g = curBarGraph.svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

    if(curBarGraph.created){
        g.append("g")
            .selectAll("g")
            .data(data)
            .attr("transform", function(d) { return "translate(" + curBarGraph.x0(d.edb) + ",0)"; })
            .selectAll("rect")
            .data(function(d) { return keys.map(function(key) { return { neg : d[key] < 0, key: key, value: Math.abs(d[key])}; }); })
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
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);
    } else {
      g.append("g")
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
          .attr("class",function(d){return ""+d.edb.replace(/ /g , "");} ) // Add ebd as the class
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide);
    }

    // Add x axis
    g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(curBarGraph.x0))
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("class", "axis-text")
        .attr("transform", "rotate(55)")
        .style("font-size", "8px")
        .style("text-anchor", "start");

    // Update y axis or create it
    if(curBarGraph.created){
        curBarGraph.svg.select('.yAxis').call(curBarGraph.yAxis);
    } else {
        g.append("g")
            .attr("class", "axis yAxis y-group")
            .call(curBarGraph.yAxis.scale(curBarGraph.y).ticks(null, "s"))
            .append("text")
            .attr("x", 2)
            .attr("y", curBarGraph.y(curBarGraph.y.ticks().pop()) + 0.5)
            .attr("dy", "0.32em")
            .attr("text-anchor", "start")
    }

    curBarGraph.svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (margin.left/2-5) +","+( margin.top+8)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .style("font-size", "10px")
        .attr("class", "unit-text")
        .text(yLabel);

    // Create the legend
    var legend = g.append("g")
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

/**
 * Created by Nicky on 2/02/2017.
 */
var labels = false; // show the text labels beside individual boxplots?

// Margins and graph width / height
var boxMargin = {top: 0, right: 0, bottom: 80, left: 100},
    boxWidth = 700 - boxMargin.left - boxMargin.right,
    boxHeight = 550  - boxMargin.top  - boxMargin.bottom;


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
         .classed("svg-container-box", true) //container class to make it responsive
         .append("svg")
         //responsive SVG needs these 2 attributes and no width and height attr
         .attr("preserveAspectRatio", "xMinYMin meet")
        //  .attr("viewBox", "0 0 600 400")
         .attr("viewBox", "0 0 "+ (boxWidth + boxMargin.left + boxMargin.right) +" "+ (boxHeight + boxMargin.top + boxMargin.bottom) + "")
         .attr("class", "box")
         .append("g") // group allows us to move everything together
         .attr("transform",
             "translate(" + margin.left + "," + margin.top + ")") // moves by a x and y value in this c
         //class to make it responsive
         .classed("svg-content-responsive", true);

    //
    // boxPlotObjects.svg = d3.select(divID).append("svg")
    //         .attr("width", boxWidth + boxMargin.left + boxMargin.right)
    //         .attr("height", boxHeight + boxMargin.top + boxMargin.bottom)
    //         .attr("class", "box")
    //         .append("g")
    //         .attr("transform", "translate(" + boxMargin.left + "," + boxMargin.top + ")");

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
            .attr("r", 1.75)
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
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("font-size", "8px");

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
        .style("font-size", "8px")
        .text("Quarter");

    // Add the y axis unit
    boxPlotObjects.svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ -(boxMargin.left/2-10) +","+( boxMargin.top*2+10)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .style("font-size", "12px")
        .attr("class", "unit-text")
        .text(unit);

    // Add year as the x-axis label
    boxPlotObjects.svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ +(boxWidth/2) +","+( boxMargin.top + 40 + boxHeight)+")")  // text is drawn off the screen top left, move down and out and rotate
        .style("font-size", "12px")
        .attr("class", "unit-text")
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

/**
 * Created by Nicky on 23/01/2017.
 */

 // Internet Explorer Compatability
 if (!String.prototype.includes) {
     String.prototype.includes = function() {
         'use strict';
         return String.prototype.indexOf.apply(this, arguments) !== -1;
     };
 }

 if (!Array.prototype.includes) {
   Object.defineProperty(Array.prototype, "includes", {
     enumerable: false,
     value: function(obj) {
         var newArr = this.filter(function(el) {
           return el == obj;
         });
         return newArr.length > 0;
       }
   });
 }

// Object to hold which company belongs to a specific region
var regions = {
  n : ["Centralines","Counties Power","Eastland Network","Electra","Horizon Energy","Northpower",
       "Powerco","Scanpower","The Lines Company","Top Energy","Unison Networks","Vector Lines",
       "Waipa Networks","WEL Networks","Wellington Electricity"],
  uni : ["Counties Power","Horizon Energy","Northpower","The Lines Company","Top Energy","Vector Lines","Waipa Networks","WEL Networks"],
  eni : ["Centralines","Eastland Network","Scanpower","Unison Networks"],
  swni : ["Electra","Powerco","Wellington Electricity"],
  s : ["Alpine Energy","Aurora Energy","Buller Electricity","Electricity Ashburton","Electricity Invercargill",
       "MainPower NZ","Marlborough Lines","Nelson Electricity","Network Tasman",
       "Network Waitaki","Orion NZ","OtagoNet","The Power Company","Westpower"],
  usi : ["Alpine Energy","Buller Electricity","MainPower NZ","Marlborough Lines","Nelson Electricity","Network Tasman","Orion NZ","Westpower"],
  lsi : ["Aurora Energy","Electricity Ashburton","Electricity Invercargill","Network Waitaki","OtagoNet","The Power Company"],
  nz : ["","","","","","","","","","","","","","","","","","","","","","","","","","","","",""]
};

// Holds the currently selected items in the filter rows
var selections = [];

// Format to use for all values displayed
var dpFormat = d3.format(".4r");

// Holds a object that contains the rows of selections that were last searched
var lastSearch = null;
var validOptions = [false,false,false,false]; // Each boolean represents if a sub category should exist in the selection row
var selectedCompany = "";


// Holds the rows for each table separately
var dataTables; // Should never be modified
var copyOfDataTables; // Can be modified to apply CPI

// Three different ones created to hold ids for the divs the data is inserted into. This allows looping over the tables
var selectionDataArray;// Contains the rows, id, title, subtitle amd init for each selection
var selectionTablesArray; // Contains the rows, id, title, subtitle amd init for each table
var combinedSelectionDataArray; // Contains combined rows along with titles and units


// Called when the document is loaded
$(document).ready( function() {
    // Highlight the selected link
    $(".nav-link").removeClass('active');
    $("#benchmarks-link").addClass('active');

    // On click listener for company selector
    $('#company-select').on('change', function(event){
        selectedCompany = $(this).find("option:selected").text();
    });
    $('#search-btn-compare').click(function(){ // Listener to search button
        search2(); // Search encodes the selections into the url and sends to server
    });
    cpiValidationSetup(); // Set up cpi validation rules
});


// Uses the url to find what was searches and asks server for rows relating to that search
function loadFromURL(urlSelections){
    loadInSections(true,urlSelections); // First load in the section rows and set the searched selections

    lastSearch = new Selection(urlSelections[0],urlSelections[1],urlSelections[2],urlSelections[3]); // Set the last search
    // Send array of selected sections to server and the company
    $.post("/compare/search",{company : selectedCompany, selections : JSON.stringify(urlSelections)}, function(data){
        // Queries the db for each of the secions and finds and inserts the sub sections as options
        urlSelections.forEach(function(s){
          setSelectionsFromURL(s);
        });

        dataTables = filterRowsToTables(data.rows); // Filter the rows into their tables
        copyOfDataTables = copyDataTables(dataTables); // Create a copy of data tables
        createDataStructuresWithCopy(copyOfDataTables); // Sets up the data so it can easily be iterated over to create the tables and graphs
        showTables(selectionTablesArray); // Show the tables
        showAllRegularGraphs(selectionDataArray, true); // Show all but combined and vector graphs true indicates it should add titles in
        showAllCombinedGraphs(combinedSelectionDataArray, true); // Show the combined and vector graphs
    });
}

//TODO test and remove html
// Checks that if there is a value selected in a row the others must be selected too before searching
function validateSearchParams(selections){
    var returnVal = true;
    selections.forEach(function (elem, i) {
        if(elem.subCategory === "" && validOptions[i]){ // Valid options holds if there is a possible option to choosefrom in the select drop down
            returnVal = false; // There is a possible sub category so it has to be chosen from
        }

        // Checks if one of the selections is empty
        if(elem.section === "" || elem.category === "" || elem.description === ""){
            // Now check if one of the selections is not empty
            if(elem.section !== "" || elem.category !== "" || elem.description !== ""){
                $('#error-div').append('<h4 style="color : red;">Partial Row Selected</h4>');
                returnVal = false; // A row cannot have one item selected and another empty
            }
        }
    });
    if(returnVal)$('#error-div').html(''); // It is valid so romve error element
    return returnVal;
}

//TODO test
// Returns a copy of the dataTables object
function copyDataTables(dataTables){
    var origTables = [dataTables.tableA,dataTables.tableB,dataTables.tableC,dataTables.tableD,dataTables.tableAB,dataTables.tableCD]; // Add tables to array to iterate over them
    var tables = [[],[],[],[],[],[]]; // Empty arras to insert new rows with values copies of the original

    for(var j = 0; j < origTables.length; j++){
        var a = origTables[j]; // Grab the current table with index i
        if(a !== undefined){ // It might not exist due to it not being selected
            for(var i = 0; i < a.length; i++){ // For every row copy all the fields
                tables[j].push({category :a[i].category, description : a[i].description,disc_yr: a[i].disc_yr,edb: a[i].edb,
                    fcast_yr: a[i].fcast_yr,network:a[i].network,note:a[i].note,obs_yr:a[i].obs_yr,p_key: a[i].p_key,sch_ref:a[i].sch_ref,
                    schedule:a[i].schedule,section:a[i].section,sub_category: a[i].sub_category,units:a[i].units,value:a[i].value})
            }
        }
    }
    return new DataTables(tables[0],tables[1],tables[2],tables[3],tables[4],tables[5]); // Return the copy
}


// Creates the data structures and assigns to the global variables
function createDataStructuresWithCopy(copyOfDataTables){
  selectionDataArray = [];
  selectionTablesArray = [];
  combinedSelectionDataArray = [];

  // An array of true / false values if a table contains values
  var selectedRows = [copyOfDataTables.tableA.length > 0,copyOfDataTables.tableB.length > 0,copyOfDataTables.tableC.length > 0,copyOfDataTables.tableD.length > 0];

  // An array with the tables data
  var tables = [copyOfDataTables.tableA,copyOfDataTables.tableB,copyOfDataTables.tableC,copyOfDataTables.tableD,copyOfDataTables.tableAB,copyOfDataTables.tableCD];

  // Creates the 4 normal tables and the combined tables
  var ids = ['a','b','c','d','ab','cd'];
  for(var i = 0; i < selectedRows.length; i++){
    if(selectedRows[i]){
      var title = tables[i][0].section + ", " + tables[i][0].category;
      var subtitle = tables[i][0].sub_category === null ? tables[i][0].description : tables[i][0].sub_category + ", " + tables[i][0].description;
      selectionTablesArray.push(new SelectedTableData(tables[i],ids[i],title,subtitle, tables[i][0].units)); // TODO add unit for combined
      selectionDataArray.push(new SelectionData(tables[i], title, subtitle ,tables[i][0].units,ids[i]));

      // Check for combined special case
      if(ids[i] === 'a' || ids[i] === 'c'){
        if(selectedRows[i+1]){ // Check that a selections has been made if so create the combined table
          var jump = i === 0 ? 4 : 3;
          var titleJump = tables[i+1][0].section + ", " + tables[i+1][0].category;
          var subTitleJump = tables[i+1][0].sub_category === null ? tables[i+1][0].description : tables[i+1][0].sub_category + ", " + tables[i+1][0].description;
          selectionTablesArray.push(new SelectedTableData(tables[i+jump],ids[i+jump], title + ", " + subtitle, titleJump + ", " + subTitleJump, tables[i+1][0].units));
          combinedSelectionDataArray.push(new SelectionDataCombined(tables[i+jump],tables[i],tables[i+1], title + " " + subtitle, titleJump + " " + subTitleJump,tables[i][0].units,tables[i+1][0].units,ids[i+jump])); // TODO ask how to format titles for combined
        }
      }
    }
  }
}


// Shows the tables on the page givin the data in the selection table array
function showTables(selectionTablesArray){
    selectionTablesArray.forEach(function (tableData) {
        // Add in the title using the id and the tile / subtitle for each table
        $('#title-'+tableData.id).append('<h2 class="title">'+tableData.title+'</h2>').append('<h4 class="subTitle">'+tableData.subTitle+'</h4>');

        insertTable(tableData.rows,'table'+tableData.id);
        insertTotalsTable(tableData.rows, 'table-total'+tableData.id, regions,false); // Creates and inserts the total table
    })
}


// Takes all rows and filers into corresponding tables
function filterRowsToTables(rows){
    var aRows = rows.filter(function(e){return matchDBRow(e,lastSearch.aTable);});
    var bRows = rows.filter(function(e){return matchDBRow(e,lastSearch.bTable);});
    var cRows = rows.filter(function(e){return matchDBRow(e,lastSearch.cTable);});
    var dRows = rows.filter(function(e){return matchDBRow(e,lastSearch.dTable);});

    // Set all null values in rows to 0
    aRows.forEach(function(e){if(e.value === null){e.value = 0;}});
    bRows.forEach(function(e){if(e.value === null){e.value = 0;}});
    cRows.forEach(function(e){if(e.value === null){e.value = 0;}});
    dRows.forEach(function(e){if(e.value === null){e.value = 0;}});

    // Create combined tables if possible
    if(aRows.length > 0 && bRows.length > 0){
        var abRows = combineTables(aRows,bRows);
    }

    if(cRows.length > 0 && dRows.length > 0){
        var cdRows = combineTables(cRows,dRows);
    }
    return new DataTables(aRows,bRows,cRows,dRows, abRows, cdRows);
}


// Shows graphs for A,B,C,D
function showAllRegularGraphs(selectionData, addTitles){
    selectionData.forEach(function (selection) {
        // Insert the titles for the graphs
        if(addTitles){
            $('#title-'+selection.id+'-bar').append('<h3 class="title">'+selection.title+'</h3>').append('<h4 class="subTitle">'+selection.subTitle+'</h4>');
            $('#title-'+selection.id+'-box').append('<h3 class="title">'+selection.title+'</h3>').append('<h4 class="subTitle">'+selection.subTitle+'</h4>');
        }

        // Create the data needed for bar grahs and create and insert the graph
        var table1Data = createDataForGroupedGraph(selection.rows);
        createdGroupedBarGraph(table1Data.data, table1Data.keys,selection.unit,"#grouped-bar-"+selection.id);

        // Create the data needed for box plot and create and insert the plot
        createBoxPlot(createDataForBoxPlot(selection.rows), "#boxplot"+selection.id+"-div", selection.unit);
        $('#full-table-'+selection.id+'-div').show();
    });
}


// Shows graphs for A/B, C/D and A/B / C/D
function showAllCombinedGraphs(selectionData, showTitle){
    selectionData.forEach(function(selection){
        // Insert titles
        if(showTitle){
            $('#title-'+selection.id+'-bar').append('<h4 class="combined-title">'+selection.title1+'<br><span class="over">over</span><br>'+selection.title2+'</h4>');
            $('#title-'+selection.id+'-box').append('<h4 class="combined-title">'+selection.title1+' <br><span class="over">over</span><br>'+selection.title2+'</h4>');
            $('#title-'+selection.id+'-vector').append('<h4 class="combined-title">'+selection.title1+'<br><span class="over">over</span><br>'+selection.title2+'</h4>');
        }
        // Create data for bar, box and vector graphs and isert into divs
        var tableABData = createDataForGroupedGraph(selection.rows);
        createdGroupedBarGraph(tableABData.data, tableABData.keys, selection.unit1 + " / " + selection.unit2, "#grouped-bar-"+selection.id);
        createBoxPlot(createDataForBoxPlot(selection.rows), "#boxplot"+selection.id+"-div", selection.unit1 + " / " + selection.unit2);
        createVectorGraph(createDataForVectorGraph(selection.table1Rows,selection.table2Rows),selection.unit1,selection.unit2,"#vector-graph-div-"+selection.id);
        $('#full-table-'+selection.id+'-div').show(); // Show the div now that they have been created
    });

    // Add in A / B over C / D
    if(selectionData.length === 2){
        $('#title-abcd-vec').append('<h4 class="combined-title">'+selectionData[0].title1+' / '+selectionData[0].title2+'</h4>').append('<h4>Over</h4>').append('<h4 class="combined-title">'+selectionData[1].title1+' / '+selectionData[1].title2+'</h4>');
        createVectorGraph(createDataForVectorGraph(selectionData[0].rows,selectionData[1].rows),selectionData[0].unit1 + " / " + selectionData[1].unit1,selectionData[0].unit2 + " / " + selectionData[1].unit2,"#vector-graph-div-abcd");
        $('#vector-full-div-abcd').show();
    }
}


// Combine two tables and return the results
function combineTables(table1Rows, table2Rows){
    var combined = [];
    var at = table1Rows;
    var bt = table2Rows;

    for(var i = 0; i < at.length; i++){
        for(var j = 0; j < bt.length; j++){
            if(at[i].edb === bt[j].edb && at[i].obs_yr === bt[j].obs_yr && at[i].disc_yr === bt[j].disc_yr){
                combined.push({ disc_yr : bt[j].disc_yr ,
                    edb : bt[j].edb,
                    obs_yr : bt[j].obs_yr,
                    value : at[i].value / (bt[j].value === '0' || bt[j].value === 0 ? 1 : bt[j].value), // Divide the value if va if dividing by 0 make it 1
                    section : bt[j].section + "" + bt[j].description + " over ", // Bit of a hack as description is inserted after section, this way both titles are added to table
                    description : at[i].section + " " + at[i].description,
                    unitA : at[i].units,
                    unitB : bt[j].units,
                    unit : at[i].units +" / " +  bt[j].units
                });
                break; // can exit the loop
            }
        }
    }
    return combined;
}

// Hold the original cells before cpi was applied in the for id, value
var noCPICellsTotals = [];

// Creates and inserts a total table for each reqion
function insertTotalsTable(tableRows, id, regions, tableExists){
    var totCells = []; // Hold the totals for each region

    // Empty out the table if it already exists
    if(tableExists){$("#"+id).html('');}

    // First get all the availble years in the rows
    var availableObsYears = [];
    tableRows.forEach(function (elem) {
        if(!availableObsYears.includes(elem.obs_yr))availableObsYears.push(elem.obs_yr);
    });
    availableObsYears.sort(function (a, b) { // Sort the years
        return +a - +b;
    });

    var regionStrings = ["n","uni","eni", "swni", "s", "usi", "lsi"]; // All the regions
    var names = {n : "North Island", uni : "Upper North Island", eni : "Eastern North Island", swni : "South-West North Island", s : "South Island", usi : "Upper South Island", lsi : "Lower South Island", nz : "New Zealand"};
    var totals = {}; // reg : "" , years : []

    // Go through every year
    for(var i = 0; i < availableObsYears.length; i++){
        // Get the rows for the current year
        tableRows.filter(function(e){return e.obs_yr === availableObsYears[i];}).forEach(function(row){

            // Go through each of the regions
            regionStrings.forEach(function(regionString){
                  // If the current row edb is inside the current reqion grab the value from the row and add it in the array for the current year
                  if(regions[regionString].includes(row.edb)){
                      if(totals[regionString] === undefined){
                        totals[regionString] = [+row.value]; // First time this reqion has been found so have to create the property
                      } else {
                        if(i === totals[regionString].length){ // This means we have moved onto a new year so have to create a new slot
                          totals[regionString].push(+row.value);
                        } else {
                            totals[regionString] [i] += + (+row.value); // Still in the first year with a different edb in the same region so just add the values
                        }
                      }
                  }
            });
        });
    }

    var nz = []; // To find the totals of NZ add north and south tegether
    for(var i = 0; i < availableObsYears.length; i++){
      nz.push(totals["n"][i] + totals["s"][i]);
    }
    totals["nz"] = nz; // Add the NZ property to totals // TODO change array at the top

    // Insert Caption for table
    var years = "";
    availableObsYears.forEach(function (year) {
       years += "<th>" + year + "</th>";
    });

    var cellCount = 0; // Used for id
    $("#"+id).append('<tr id="head-row-totals-"'+id+' class="table-row table-head"> <th>Region</th>'+ years + '</tr>');

    for (var property in totals) {
      if (totals.hasOwnProperty(property)) {
        var row= "<tr class='table-row' id=row-tot-"+id+i+">";

        // Insert name in column and assign an id to the row
        row += "<th class='reg-cell'>" + names[property] + "</th>";
        totals[property].forEach(function(value){
          row += "<th id='t-total"+id+""+cellCount+"' origValue='"+ value / regions[property].length +"' class='val-tot-cell'>" + dpFormat(value / regions[property].length) + "</th>";
          totCells.push({id : "#t-total"+id+""+cellCount, value : value / regions[property].length});
          if(!tableExists){
              noCPICells.push({id : "t-total"+id+""+cellCount, value : value / regions[property].length});
          }
          cellCount++;
        });
        $("#"+id).append(row);
      }
    }
    applyGradientCSS(totCells,false);
}


// Here every row belongs to the specific table
function insertTable(tableRows,id){
    var totals = []; // Format reg : "", year : numb

    // Sorts the EDB names
    tableRows.sort(function (a,b) {
        return [a.edb, b.edb].sort()[0] === a.edb ? -1 : 1; // Sort two names and return the first
    });
    if(tableRows.length === 0)return; // No data so return

    var availableObsYears = [];

    tableRows.forEach(function (elem) {
        if(!availableObsYears.includes(elem.obs_yr))availableObsYears.push(elem.obs_yr);
    });
    availableObsYears.sort(function (a, b) {
        return +a - +b;
    });

    var min = tableRows.reduce(function(prev, curr) {
        return prev.obs_yr < curr.obs_yr ? prev : curr;
    }).obs_yr;

    var max = tableRows.reduce(function(prev, curr) {
        return prev.obs_yr > curr.obs_yr ? prev : curr;
    }).obs_yr; //TODO this line might need to be disc_yr

    // Create cells for each of the years to use as header
    var years = "";
    availableObsYears.forEach(function (year) {
       years += "<th>" + year + "</th>";
    });

    $("#"+id).append('<tr id="head-row" class="table-row table-head"> <th>EDB</th>'+ years + '</tr>');

    // An array of companies already processed
    var done = [];
    // Year done for edb
    var yearDone = [];
    var cellCount = 0; // For the id
    var cellValues = []; // All the cell values
    var observerd = true; // observerd or forcast, currently always observed

    // Create the rows of data
    for(var i = 0; i < tableRows.length; i++){
        if(!done.includes(tableRows[i].edb)){
            done.push(tableRows[i].edb);
            var row= "<tr class='table-row' id=row"+id+i+">";
            // Insert name in column and assign an id to the row
            row += "<th class='edb-cell'>" + tableRows[i].edb + "</th>";

            for(var k = 0; k < availableObsYears.length; k++){
                // Iterate through all rows finding ones with the current edb
                for(var j = 0; j < tableRows.length; j++){
                    //if(!yearDone.includes())

                    // Check it matches edb and year inserting into
                    if(tableRows[j].edb === tableRows[i].edb && tableRows[j].obs_yr === availableObsYears[k] && (!yearDone.includes(tableRows[j].obs_yr))){
                        yearDone.push(tableRows[j].obs_yr);
                        row += "<th origValue='"+ tableRows[j].value +"' class='cell "+availableObsYears[k]+"' id='t"+id+""+cellCount+"'>" + dpFormat(tableRows[j].value) + "</th>";
                        // Save the value and the id of the cell to display percentage
                        cellValues.push({ id : "#t"+id+""+cellCount, value : tableRows[j].value });
                        cellCount++;
                    }
                }
                yearDone = [];
            }
            $("#"+id).append(row + '</tr>'); // end and append the row

            // Assing a on click function to each of the rows to generate the bar graph with the row specific data
            $("#row"+id+i).click(function(event) {
               rowClicked(this.id); // Call the function to highlight the data in all graphs for the edb
            });
        }
    }

    //
    var percent = true;
    if(id === "tableab" || "tablcd"){
        percent = false;
    } else {
        percent = tableRows[0].units.includes('%') || tableRows[0].units.includes('portion');
    }
    applyGradientCSS(cellValues, percent);
}

var rowSelected = ""; // Holds the id of the currently selected row

// Called when a row is clicked on a table
function rowClicked(id){
  if(rowSelected === id){// Clicked on the same row so unselect
    // Remove all selected classes from elements
    var text = $("#"+id+" .edb-cell").text();
    highlight(text, true); // highlight and removehighliting from bar graph
    $('.table').find('tr').removeClass('row-selected');
    // d3.selectAll(".bar-selected").classed("bar-selected", false);
    d3.selectAll(".line-selected-table").classed("line-selected", false);
    d3.selectAll(".vec-dot-selected").classed("vec-dot-selected", false);
    rowSelected = ""; // Nothing is selected
    return;
  }
  rowSelected = id; // Set the lelected row

  // Grab the text using the id
  var text = $("#"+id+" .edb-cell").text();
  // Remove the selected class from all rows
  $('.table').find('tr').removeClass('row-selected');

  // Add the row selected class to the only one selected
  $("#"+id).addClass("row-selected");

  // Get the edb from the selected row
  var edb = $("#"+id+".edb-cell").text();

  // Select all lines with the selected class and remove class
  d3.selectAll(".line-selected-table")
  .classed("line-selected", false);

  d3.selectAll(".vec-dot-selected")
  .classed("vec-dot-selected", false);

  // Select all rectangle with the correct EDB and outline bars
  // Also removes the highlight of previous selection
  highlight(text, false);

  d3.selectAll("line."+text.replace(/ /g , ""))
  .classed("line-selected-table", true);

  d3.selectAll(".dot."+text.replace(/ /g , ""))
  .classed("vec-dot-selected", true);
}


// highlights the cell based on the percentage of the max value in the table unless already a percentage
function applyGradientCSS(cellValues, percent){
    // Find the max value
    var maxCellValue = -Infinity;
    cellValues.forEach(function(elem){
        maxCellValue = +elem.value > maxCellValue ? +elem.value : maxCellValue;
    });

    // Apllie css to each cell
    for(var i = 0; i < cellValues.length; i++){
        var value = (percent ? value : ((+cellValues[i].value / maxCellValue)*100)); // If percentage metric just use valud
        $(cellValues[i].id).css({
                "background" : "-webkit-gradient(linear, left top, right top, color-stop(" + value +"%,#7bbfd6), color-stop(" + value +"%,#FFF))",
            }
        );
    }
}


// Returns if a row from the DB matches one of the specified rows by the user
function matchDBRow(DBRow, selection){
    if(DBRow.section === selection.section && DBRow.category === selection.category && DBRow.description === selection.description){
        if(DBRow.sub_category !== null){
            return selection.subCategory === DBRow.sub_category; // Sub cat could be null but would still match
        }
        return true;
    }
    return false;
}


// Creates search parameters and creates url
function search(){
    if(!validateSearchParams(selections))return; // First check if the selection is valid
    var rows = {
        i0 : selections[0].id,s0  : selections[0].section,c0 : selections[0].category,sc0 : selections[0].subCategory,d0 : selections[0].description,
        i1 : selections[1].id,s1  : selections[1].section,c1 : selections[1].category,sc1 : selections[1].subCategory,d1 : selections[1].description,
        i2 : selections[2].id,s2  : selections[2].section,c2 : selections[2].category,sc2 : selections[2].subCategory,d2 : selections[2].description,
        i3 : selections[3].id,s3  : selections[3].section,c3 : selections[3].category,sc3 : selections[3].subCategory,d3 : selections[3].description
    };
    params = serialise(rows); // Escape chracters for url
    window.location.replace("compare?" + params); // Replace the url with the selections url
}

function search2(){
  if(!validateSearchParams(selections))return; // First check if the selection is valid

  var rows= {};

  selections.forEach(function(selection){
    if(selection.section !== ""){
        rows["s"+selection.id] = selection.section;
        rows["c"+selection.id] = selection.category;
        rows["sc"+selection.id] = selection.subCategory;
        rows["d"+selection.id] = selection.description;
    }
  });

  params = serialise(rows); // Escape chracters for url
  window.location.replace("compare?" + params); // Replace the url with the selections url
}

// Turns object in url string
function serialise(obj) {
    var str = [];
    for(var p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
}


// table 1 can be A and table two C or table 1 is A / B and table two is
function createDataForVectorGraph(table1Rows,table2Rows) {
    var at = table1Rows;
    var bt = table2Rows;
    var edbDone = []; // The edbs that have been processed
    var vecData = []; // The final entry in the form { EDB, [ { year1, valueA, valueB }, {year2, valueA, valueB }]}

    var availableObsYears = [];
    table1Rows.forEach(function (row1) {
        if(!availableObsYears.includes(row1.obs_yr)){

            // Check if the second set of rows also contains the year
            for(var i = 0; i < table2Rows.length; i++){
              if(table2Rows[i].obs_yr === row1.obs_yr){
                  availableObsYears.push(row1.obs_yr);
                  break;
              }
            }
        }
    });

    // Go through every row
    for (var i = 0; i < at.length; i++) {

        // Check if the EDB has already been processed
        if (!edbDone.includes(at[i].edb)) {

            // Grab all the rows for the current edb in both tables
            var edbRowsAt = at.filter(function (d) {
                return d.edb === at[i].edb
            });
            var edbRowsBt = bt.filter(function (d) {
                return d.edb === at[i].edb
            });

            edbDone.push(at[i].edb); // Add year to done so it is not repeated

            var yearsDone = []; // Processed years
            var edbYearArray = [];

            // Iterate through rows in edb
            for (var j = 0; j < edbRowsAt.length; j++) {

                // Check it has not been processed
                if (!yearsDone.includes(edbRowsAt[j].disc_yr) && availableObsYears.includes(edbRowsAt[j].disc_yr)) {
                    yearsDone.push(edbRowsAt[j].disc_yr); // Add to processed

                    // Here we have to rows for a particular year for a particular edb now we can create the entry
                    var yearRowsAt = edbRowsAt.filter(function (d) {
                        return d.disc_yr === edbRowsAt[j].disc_yr
                    });
                    var yearRowsBt = edbRowsBt.filter(function (d) {
                        return d.disc_yr === edbRowsAt[j].disc_yr
                    });

                    if(!(yearRowsAt.length == yearRowsBt.length )){
                        return [];
                    }

                    for (var k = 0; k < yearRowsAt.length; k++) {
                        edbYearArray.push({
                            year: +yearRowsAt[k].disc_yr,
                            valueA: +yearRowsAt[k].value,
                            valueB: +yearRowsBt[k].value
                        });
                    }
                }
            }
            edbYearArray.sort(function (a,b) {
                return a.year - b.year;
            });
            vecData.push({edb: at[i].edb, years: edbYearArray});
        }
    }
    return vecData;
}


// Creates the data needed to create box plots for one table
function createDataForBoxPlot(tableRows){
    var yearsDone = []; // Years processed
    var years = []; // Will contain an array of rows for each year

    for(var i = 0; i < tableRows.length; i++){
        if(!yearsDone.includes(tableRows[i].obs_yr)){
            years.push(tableRows.filter(function(e){return e.obs_yr === tableRows[i].obs_yr}));
            yearsDone.push(tableRows[i].obs_yr);
        }
    }

    var data = []; // Each entry will be an array where array[0] = year and array[1] = values for that year
    var sValues = []; // Data for the scatter plot on top of box plot
    var min = Infinity;
    var max = -Infinity;

    for(var i = 0; i < years.length; i++){
        var entry = [];
        entry[0] = ""+years[i][0].obs_yr; // Name of the box plot convert year to string
        var year = ""+years[i][0].obs_yr;
        var values = [];

        for(var j = 0; j < years[i].length; j++){
            var curValue = +years[i][j].value;
            var edb = years[i][j].edb;

            if (curValue > max){
                max = curValue;
            }
            if (curValue < min){
                min = curValue;
            }
            values.push(curValue);
            sValues.push({year : year ,edb : edb, value : curValue});
        }
        entry[1] = values;
        data.push(entry);
    }
    data.sort(function(a,b){
        return a[0] - b[0];
    });
    return {min : min, max : max, data : data, scatterData : sValues};
}

// Creates the data for the bar graphs from the rows used in D3
function createDataForGroupedGraph(rows){
    var availableObsYears = [];

    rows.forEach(function (elem) {
        if(!availableObsYears.includes(elem.obs_yr))availableObsYears.push(elem.obs_yr);
    });
    availableObsYears.sort(function (a, b) {
        return +a - +b;
    });

    var data = [];
    var edbDone = [];

    for(var i = 0; i < rows.length; i++){
        if(!edbDone.includes(rows[i].edb)){
            edbDone.push(rows[i].edb);

            var entry = { "edb" : rows[i].edb};

            entry[rows[i].obs_yr] = +rows[i].value;
            data.push(entry);
        } else {
            for(var j = 0; j < data.length; j++){
                if(data[j].edb === rows[i].edb){
                    //var value = +rows[i].value;
                    data[j][rows[i].obs_yr] = +rows[i].value;
                }
            }
        }
    }
    return {data : data, keys : availableObsYears};
}

// Loads in a selection from the user by grabbing the possible sections, categories, sub categories and descriptions from the DB
function setSelectionsFromURL(selection){
    // Find all the categories associated with this section
    $.post("/sections/s",{selected : selection.section }, function(data){
        if(data.categories.length > 0  &&  data.categories[0] !== null){
            $('#category-select'+selection.id).html(''); // Empty temp options
        }
        // Add the options to the drop down
        for(var i = 0; i < data.categories.length; i++){
            if(data.categories[i] === selection.category){
                $('#category-select'+selection.id).append('<option value="' + data.categories[i] + '"selected>' + data.categories[i] + '</option>');
            } else {
                $('#category-select'+selection.id).append('<option value="' + data.categories[i] + '">' + data.categories[i] + '</option>');
            }
        }
        // Refresh all drop downs
        $(".selectpicker").selectpicker('refresh');
    });

    // Find all sub categories for the currently selected category
    $.post("/sections/sc",{section : selection.section, category : selection.category}, function(data){

        if(data.subCategories.length > 0  &&  data.subCategories[0] !== null){
            $('#subsection-select'+selection.id).html(''); // Empty temp options
            validOptions[selection.id] = true; // There are options for this row and sub category
        } else {
            return;
        }

        // Add sub section options
        for(var i = 0; i < data.subCategories.length; i++){
            if(data.subCategories[i] === selection.subCategory){
                $('#subsection-select'+selection.id).append('<option selected>' + data.subCategories[i] + '</option>');
            } else {
                $('#subsection-select'+selection.id).append('<option>' + data.subCategories[i] + '</option>');
            }
        }
        $(".selectpicker").selectpicker('refresh');
    });

    // Grab the descriptions
    $.post("/sections/desc",{category : selection.category,section : selection.section, subCategory : selection.subCategory}, function(data){
        if(data.descriptions.length > 0 &&  data.descriptions[0] !== null){
            $('#description-select'+selection.id).html(''); // Empty temp options
        } else {
            return;
        }
        // Add sub section options
        for(var i = 0; i < data.descriptions.length; i++){
            if(data.descriptions[i] === selection.description){
                $('#description-select'+selection.id).append('<option selected>' + data.descriptions[i] + '</option>');
            } else {
                $('#description-select'+selection.id).append('<option>' + data.descriptions[i] + '</option>');
            }
        }
        $(".selectpicker").selectpicker('refresh');
    });
}


// Sort the sections
function sortSections(data){
    data.sections.sort(function(a,b){
        // First check simple case of number difference
        var i = 0;
        while(!isNaN(a.charAt(i))){i++}
        var numberA = a.substring(0,i); // Gets the number from the section

        i = 0;
        while(!isNaN(b.charAt(i))){i++}
        var numberB = b.substring(0,i);

        if(numberA !== numberB) {
            return numberA - numberB;
        }
        return [a,b].sort()[0] === a ? -1 : 1; // Sort two names and return the first
    });
}


// Loads in sections along with the rows of selection boxes
function loadInSections(fromURL, userSelections){ // if from url false selections is null
    // Grab all the sections
    /// Query for all sections
    $.get("/sections/sections", function(data){
        // Create the four filters rows
        addSection(0);
        addSection(1);
        addSection(2);
        addSection(3);

        if(fromURL){
          for(var i = 0; i < userSelections.length; i++){
              selections[i].description = userSelections[i].description;
              selections[i].category = userSelections[i].category;
              selections[i].section = userSelections[i].section;
              selections[i].subCategory = userSelections[i].subCategory;
            }
        }
        sortSections(data);// Sort the sections

        // Go through each row and add the sections in
        for(var i = 0; i < selections.length; i++){
            for(var j = 0; j < data.sections.length; j++){
                if(fromURL && userSelections[i].section === data.sections[j]){
                    $("#section-select"+selections[i].id+"").append('<option selected>' + data.sections[j] + '</option>');
                    validOptions[selections[i].id] = true;//TODO added
                } else {
                    $("#section-select"+selections[i].id+"").append('<option>' + data.sections[j] + '</option>');
                }
                  // addToSelection(selections[i].id,"section",data.sections[j]); // Record change in the array of selections
            }
            $(".selectpicker").selectpicker('refresh');
        }
    });
}

// Adds a new row of filters for section category and sub category
function addSection(numberSections){
    var table = ['A','B','C','D','E'];

    // Add in a new row div
    $('#compare-div').append('<div class="row" id="titleRow'+numberSections+'"><div class="col-md-12"><h5  class="selection-title">Make a selection for table '+table[numberSections]+'</h5> </div></div>');
    $('#compare-div').append('<div class="row" id="row'+numberSections+'">');
    $("#row"+numberSections).append('<div class="col-md-12 compare-col" id="col'+numberSections+'">');
    $("#col"+numberSections).append('<select data-width="250px" class="selectpicker select-compare"  title="Section" id="section-select'+numberSections+'"></select>');// add section selector with the number section as the dynamic id

    selections.push({id : numberSections, section : "", category : "", subCategory : "", description : ""});// Push the information for the new row into the selections array

    // Add a change listener for when a section is selected
    $("#section-select"+numberSections).on('change', function(event){
        var section = $(this).find("option:selected").text(); // Grab the selection

        var idNumb = event.target.id.charAt(event.target.id.length-1); // Grab the last character of the id that generated the event to work out correct id

        // First empty out all options for sub selections
        $('#category-select'+idNumb).html(''); // Empty temp options
        $('#subsection-select'+idNumb).html(''); // Empty temp options
        $('#description-select'+idNumb).html(''); // Empty temp options
        selections[idNumb] = {id : numberSections, section : "", category : "", subCategory : "", description : ""};
        validOptions[idNumb] = false;

        // Find all the categories associated with this section
        $.post("/sections/s",{selected : section }, function(data){
            if(data.categories.length > 0  &&  data.categories[0] !== null){
                $('#category-select'+idNumb).html(''); // Empty temp options
            } else { // The one special case where category is null

            }
            // Add the options to the drop down
            for(var i = 0; i < data.categories.length; i++){
                if(data.categories[i] === null)continue;
                $('#category-select'+idNumb).append('<option>' + data.categories[i] + '</option>');
            }
            // Refresh all drop downs
            $(".selectpicker").selectpicker('refresh');
        });
        addToSelection(idNumb,"section",section); // Record change in the array of selections
    });

    // add category selector
    $("#col"+numberSections).append('<select data-width="190px" class="selectpicker select-compare" title="Category" id="category-select'+numberSections+'"></select>');
    $('#category-select'+numberSections).on('change', function(event){
        var categoryNew = $(this).find("option:selected").text();

        var idNumb = event.target.id.charAt(event.target.id.length-1);
        $('#description-select'+idNumb).html(''); // Empty temp options

        // Find all sub categories for the currently selected category
        $.post("/sections/sc",{section : selections[idNumb].section, category : categoryNew}, function(data){
            if(data.subCategories.length > 0  &&  data.subCategories[0] !== null){
                $('#subsection-select'+idNumb).html(''); // Empty temp options
                validOptions[idNumb] = true; // There are options for this row and sub category
            } else {
                // Find all descriptions for the currently selected sub category
                $.post("/sections/desc",{category : category ,section : selections[idNumb].section, subCategory : ""}, function(data){
                    if(data.descriptions.length > 0 &&  data.descriptions[0] !== null){
                        $('#description-select'+idNumb).html(''); // Empty temp options
                    } else {
                        return;
                    }
                    // Add sub section options
                    for(var i = 0; i < data.descriptions.length; i++){
                        $('#description-select'+idNumb).append('<option>' + data.descriptions[i] + '</option>');
                    }
                    $(".selectpicker").selectpicker('refresh');
                });
                return;
            }
            // Add sub section options
            for(var i = 0; i < data.subCategories.length; i++){
                $('#subsection-select'+idNumb).append('<option>' + data.subCategories[i] + '</option>');
            }
            $(".selectpicker").selectpicker('refresh');
            $(".selectpicker").selectpicker('refresh');
        });
        addToSelection(idNumb,"category", categoryNew);
        $(".selectpicker").selectpicker('refresh');
    });

    // add sub category selector
    $("#col"+numberSections).append('<select data-width="190px" class="selectpicker select-compare" title="Subsection" id="subsection-select'+numberSections+'"></select>');
    $('#subsection-select'+numberSections).on('change', function(event){
        var idNumb = event.target.id.charAt(event.target.id.length-1);
        var subCat = $(this).find("option:selected").text();

        // Find all descriptions for the currently selected sub category
        $.post("/sections/desc",{category : selections[idNumb].category,section : selections[idNumb].section, subCategory : subCat}, function(data){
            if(data.descriptions.length > 0 &&  data.descriptions[0] !== null){
                $('#description-select'+idNumb).html(''); // Empty temp options
            } else {
                return;
            }

            // Add sub section options
            for(var i = 0; i < data.descriptions.length; i++){
                $('#description-select'+idNumb).append('<option>' + data.descriptions[i] + '</option>');
            }
            $(".selectpicker").selectpicker('refresh');
        });
        addToSelection(idNumb,"subcategory", subCat);
    });

    // add description selector
    $("#col"+numberSections).append('<select data-width="190px" class="selectpicker select-compare" title="Description" id="description-select'+numberSections+'"></select>');
    $('#description-select'+numberSections).on('change', function(event){
        var idNumb = event.target.id.charAt(event.target.id.length-1);
        var data = $(this).find("option:selected").text();
        addToSelection(idNumb,"description", data);
    });

    $("#col"+numberSections).append('<button type="button" id="clear-'+numberSections+'" class="btn btn-danger">Clear</button>').on('click', function(event){
        var idNumb = event.target.id.charAt(event.target.id.length-1);
        clearSelection(idNumb);
    });
}

// Clears a row of selections
function clearSelection(idNumb){
  selections[idNumb] = {id : idNumb, section : "", category : "", subCategory : "", description : ""};
  validOptions[idNumb] = false;
  $('#description-select'+idNumb).html('');
  $('#subsection-select'+idNumb).html('');
  $('#category-select'+idNumb).html('');
  $('#section-select'+idNumb).find("option:selected").removeAttr("selected");
  $(".selectpicker").selectpicker('refresh');
}

// Adds a section, category, sub category, or descriptions to a particular row in selections
function addToSelection(id, type, data){
    for(var i = 0; i < selections.length; i++){
        if(selections[i].id+"" === id+""){ // Convert them both to strings
            if(type === "section"){
                selections[i].section = data;
            } else if(type === "category"){
                selections[i].category = data;
            } else if(type === "subcategory"){
                selections[i].subCategory = data;
            } else if(type === "description"){
                selections[i].description = data;
            }
        }
    }
}


// Set up rules for validating the CPI fields
function cpiValidationSetup(){
    $.validator.setDefaults({
            errorClass : 'help-block',
            highlight: function (element) {
                $(element).closest('.form-group').addClass('has-error')
            },
            unhighlight :function (element) {
                $(element).closest('.form-group').removeClass('has-error')
            }
        }
    );

    var cpiRules = {
        required : true,
        number : true,
        min : 0,
        max : 100
    };

    var messageSet = {
        required : "Please enter a percentage",
        number : "Please enter a valid number",
        min : "Please enter a percentage greater than 0",
        max : "Please enter a percentage less than 100"
    };

    $('#cpi-form').validate({
        rules : {Y2012 : cpiRules,Y2013 : cpiRules,Y2014 : cpiRules,Y2015 : cpiRules,Y2016 : cpiRules
        },
        messages : {Y2012 : messageSet,Y2013 : messageSet,Y2014 : messageSet,Y2015 : messageSet,Y2016 : messageSet}
    });
}

function applyCPI(units){
    if($('#cpi-form').valid()){
        if(noCPICells.length > 0){
            revertCPI(); // Reverts cpi before instead of saving values with cpi already applied
            copyOfDataTables = copyDataTables(dataTables); // Use the original data and create a copy of it
            createDataStructuresWithCopy(copyOfDataTables);
        }
        // CPI for 2012 - 2016
        var cpiValues = [{year : 2012, value : +$('#Y2012').val()},{year : 2013, value : +$('#Y2013').val()},{year : 2014, value : +$('#Y2014').val()},{year : 2015, value : +$('#Y2015').val()},{year : 2016, value : +$('#Y2016').val()}];

        // Applies CPI to all selected tables
        selectionTablesArray.forEach(function (table) {
          if(table.unit.includes('$')){
            applyCPIToTable('#table'+table.id,cpiValues);
          }
        });

        // Go through each table and check if is should have cpi applied if so modify the rows
        selectionDataArray.forEach(function (table) {
            if(table.unit.includes('$')){
                applyCPIToTableRows(table.rows, cpiValues);
            }
        });

        // At this point the rows have been updated so we can update the totals table
        selectionTablesArray.forEach(function (tableData) {
            insertTotalsTable(tableData.rows, 'table-total'+tableData.id, regions,true);
        });

        showAllRegularGraphs(selectionDataArray, false);

        //TODO I think this code is never executed
        // if(aSelected && bSelected){
        //   console.log("A and B selected");
        //     var abRows = combineTables(aRows,bRows);
        //     combinedSelectionDataArray[0].rows = abRows;
        // }
        //
        // //TODO I think this code is never executed
        // if(cSelected && dSelected){
        //     var cdRows = combineTables(dataTables.cRows,dataTables.dRows);
        //     combinedSelectionDataArray[1].rows = cdRows;
        // }
        showAllCombinedGraphs(combinedSelectionDataArray, false);
    }
}

// Applies the CPI to rows of data
function applyCPIToTableRows(rows, cpiValues){
    // Find the min and max year from the data
    var minYear = rows.reduce(function(prev, curr) {
        return prev.disc_yr < curr.disc_yr ? prev : curr;
    }).obs_yr;

    var maxYear = rows.reduce(function(prev, curr) {
        return prev.disc_yr > curr.disc_yr ? prev : curr;
    }).obs_yr;

    for(var cur = minYear; cur <=maxYear; cur++){ // Go through each possible year
        rows.forEach(function(elem, index){ // Grab every Row
            var year = rows[index].obs_yr; // Grab the year of the cell by checking the class

            var valueOfCell = rows[index].value;

            for(var i = 0; i < cpiValues.length; i++){
                if(cpiValues[i].year === cur){
                    if(year <= cur){
                        valueOfCell = valueOfCell * (1 + (cpiValues[i].value / 100));
                    }
                }
            }
            rows[index].value = valueOfCell; // CPI Applied value
        });
    }
}

var noCPICells = []; // Hold the original cpi values

// Applies cpi values to the table with div id table
function applyCPIToTable(table, cpiValues){
    $('.cell', table).each(function(){ // Backup the values from the cells
        noCPICells.push({id : $(this).attr('id'), value : $(this).text()});
    });

    var minYear = Infinity;
    var maxYear = -Infinity;

    $('.cell', table).each(function(){ //cell or th
        var year = +$(this).attr("class").split(' ')[1];
        minYear = year < minYear ? year : minYear;
        maxYear = year > maxYear ? year : maxYear;
    });

    for(var cur = minYear; cur <=maxYear; cur++){ // Go through each possible year
        $('.cell', table).each(function(index){ // Grab every cell
            var year = +$(this).attr("class").split(' ')[1]; // Grab the year of the cell by checking the class
            var valueOfCell = $(this).attr("origvalue");
            for(var i = 0; i < cpiValues.length; i++){
                if(cpiValues[i].year === cur){
                    if(year <= cur){
                        valueOfCell = valueOfCell * (1 + (cpiValues[i].value / 100));
                        valueOfCell = dpFormat(valueOfCell);

                    }
                }
            }
            $(this).text(valueOfCell); // CPI Applied value
        });
    }
    applyGradientCSS(noCPICells); // Highlights the cell based on the value compared to the max in the table
}

function revertCPI(){
    noCPICells.forEach(function(e){
        $('#'+e.id).text(e.value);
    });
    applyGradientCSS(noCPICells);
}

// Object for holder the users selection
function Selection(a,b,c,d){
    this.aTable = a;
    this.bTable = b;
    this.cTable = c;
    this.dTable = d;
}

// Object for holder rows for all tables
function DataTables(tableA,tableB,tableC,tableD,tableAB,tableCD){
    this.tableA = tableA;
    this.tableB = tableB;
    this.tableC = tableC;
    this.tableD = tableD;
    this.tableAB = tableAB;
    this.tableCD = tableCD;
}

// Data object for each section, used for graphs
function SelectionData(rows,title,subTitle,unit,id){
    this.rows = rows;
    this.title = title;
    this.subTitle = subTitle;
    this.id = id;
    this.unit = unit;
}

// Data object for Rows combined
function SelectionDataCombined(rows, table1Rows,table2Rows,title1,title2,unit1,unit2,id){
    this.rows = rows; // Combined rows
    this.title1 = title1;
    this.title2 = title2;
    this.unit1 = unit1;
    this.unit2 = unit2;
    this.id = id;
    this.table1Rows = table1Rows;
    this.table2Rows = table2Rows;
}

// Data object for each table
function SelectedTableData(rows,id, title, subTitle, unit){
    this.rows = rows;
    this.id = id;
    this.title = title;
    this.subTitle = subTitle;
    this.unit = unit;
}

$(document).ready( function() {
    // Highlight the selected link
    $(".nav-link").removeClass('active');
    $("#core-link").addClass('active');

    // Set the style of the validation errors
    $.validator.setDefaults({
        errorClass : 'help-block',
            highlight: function (element) {
                $(element)
                    .closest('.form-group')
                    .addClass('has-error')
            },
        unhighlight :function (element) {
            $(element)
            .closest('.form-group')
            .removeClass('has-error')
        }
        }
    );

    var cpiRules = {
        required : true,
        number : true,
        min : 0,
        max : 100
    };

    var messageSet = {
        required : "Please enter a percentage",
        number : "Please enter a valid number",
        min : "Please enter a percentage greater than 0",
        max : "Please enter a percentage less than 100"
    }

    $('#cpi-form').validate({
        rules : {
            Y2012 : cpiRules,
            Y2013 : cpiRules,
            Y2014 : cpiRules,
            Y2015 : cpiRules,
            Y2016 : cpiRules
        },
        messages : {
            Y2012 : messageSet,
            Y2013 : messageSet,
            Y2014 : messageSet,
            Y2015 : messageSet,
            Y2016 : messageSet
        }
    });

});

function applyCPI(){
    console.log("Apply CPI");
    return false;
}
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

/**
 * Created by Nicky on 15/01/2017.
 */


// Hold the currently selected sections
var section = "";
var category = "";
var subcategory = "";
var company = "";
var description = "";

var descriptionExists = false;
var subExists = false;

$(document).ready( function() {
    // Highlight the selected link
    $(".nav-link").removeClass('active');
    $("#data-link").addClass('active');

    // Queries DB and inserts options in selection dropdown
    insertCompanies();

    // Add listeners to section select called when section is selected
    $('#section-select').on('change', function(){

        // Set the currently selected section
        section = $(this).find("option:selected").text();

        // Find all the categories associated with this section
        $.post("/sections/s",{selected : section }, function(data){
            if(data.categories.length > 0){
                $('#category-select').html(''); // Empty temp options
            }

            // Add the options to the drop down
            for(var i = 0; i < data.categories.length; i++){
                $('#category-select').append('<option>' + data.categories[i] + '</option>');
            }

            // Refresh all drop downs
            $(".selectpicker").selectpicker('refresh');
        });
    });


    // listener for category change
    $('#category-select').on('change', function(){

        // Set the currently selected category
        category = $(this).find("option:selected").text();

        //TODO might have to make sure the section is also the same

        // Find all sub categories for the currently selected category
        $.post("/sections/sc",{category : category,section : section}, function(data){
            if(data.subCategories.length > 0 &&  data.subCategories[0] !== null){
                subExists = true;
                $('#subsection-select').html(''); // Empty temp options
            } else {
                subExists = false; //TODO Check for no data when searching server side or remove No data option
                return;
            }

            // Add sub section options
            for(var i = 0; i < data.subCategories.length; i++){
                $('#subsection-select').append('<option>' + data.subCategories[i] + '</option>');
            }
            $(".selectpicker").selectpicker('refresh');
        });

    });


    // Sub Category select listener
    $('#subsection-select').on('change', function(){
        // Set the sub category
        subcategory = $(this).find("option:selected").text();


        // Find all descriptions for the currently selected sub category
        $.post("/sections/desc",{category : category,section : section, subCategory : subcategory}, function(data){
            if(data.descriptions.length > 0 &&  data.descriptions[0] !== null){
                descriptionExists = true;
                $('#description-select').html(''); // Empty temp options
            } else {
                descriptionExists = false; //TODO Check for no data when searching server side or remove No data option
                return;
            }

            // Add sub section options
            for(var i = 0; i < data.descriptions.length; i++){
                $('#description-select').append('<option>' + data.descriptions[i] + '</option>');
            }
            $(".selectpicker").selectpicker('refresh');
        });
    });


    $('#description-select').on('change', function(){
        // Set the description
        description = $(this).find("option:selected").text();
    });



    $('#company-select').on('change', function(){
        // set the selected company
        company = $(this).find("option:selected").text();
    });

    // Clicked the search button
    $( "#search-btn" ).click(function() {

        //TODO First check if any values null
        if(section === ""){
            $('#error').html("Section not selected");
            return;
        } else if(category === ""){
            $('#error').html("Category not selected");
            return;
        } else if(subcategory === "" && subExists){
            $('#error').html("Sub category not selected");
            return;
        }

        // Send category, section, sub category and company
        $.post("/sections/search",{section : section, category : category, subCategory : subcategory, company : company, description : description}, function(data){
            if(data.rows.length > 0){
                insertDataTable(data.rows);
            } else {
                console.log("No results");
            }
        });
    });
});





// Creates a table with the given rows
function insertDataTable(rows){
    console.log("Inserting table");

    // first create caption title with description
    $('#results-table').append('<caption>' + rows[0].description + '</caption>');
    //TODO check if discovered or observed
    var observerd = false;

    if(rows[0].obs_yr !== null){
        console.log("Observed");
        observerd = true;
    } else if(rows[0].fcast_yr !== null) {
        console.log("Forecast");
    }

    var min = null;
    var max = null;

    if(observerd){
        // Find the min and max year
        min = rows.reduce(function(prev, curr) {
            return prev.disc_yr < curr.disc_yr ? prev : curr;
        }).obs_yr;

        max = rows.reduce(function(prev, curr) {
            return prev.disc_yr > curr.disc_yr ? prev : curr;
        }).obs_yr;
    } else {
        // Find the min and max year
        min = rows.reduce(function(prev, curr) {
            return prev.fcast_yr < curr.fcast_yr ? prev : curr;
        }).fcast_yr;

        max = rows.reduce(function(prev, curr) {
            return prev.fcast_yr > curr.fcast_yr ? prev : curr;
        }).fcast_yr;
    }

    console.log("Min " + min + " Max " + max);


    //// Find the min and max year
    //var min = rows.reduce(function(prev, curr) {
    //    return prev.disc_yr < curr.disc_yr ? prev : curr;
    //});
    //
    //var max = rows.reduce(function(prev, curr) {
    //    return prev.disc_yr > curr.disc_yr ? prev : curr;
    //});

    //Create the columns
    var years = "";

    for(var i = min; i <= max; i++){
        years += "<th>" + i + "</th>";
    }

    $('#results-table').append('<tr id="head-row"> <th>EDB</th>'+ years + '</tr>');


    // An array of companies already processed
    var done = [];
    var cellCount = 0;


    var cellValues = [];

    // Create the rows of data
    for(var i = 0; i < rows.length; i++){
        if(!done.includes(rows[i].edb)){

            done.push(rows[i].edb);

            // Insert name in column and assign an id to the row
            var row = "<tr id=row"+i+"><th>" + rows[i].edb + "</th>";


            for(var cur = min; cur <=max; cur++){

                // Iterate through all rows finding ones with the current edb
                for(var j = 0; j < rows.length; j++){

                    // Check it matches edb and year inserting into
                    if(rows[j].edb === rows[i].edb && (observerd ? rows[j].disc_yr : rows[j].fcast_yr) === cur){
                        row += "<th id='t"+cellCount+"'>" + rows[j].value + "</th>";

                        // Save the value and the id of the cell to display percentage
                        cellValues.push({ id : "#t"+cellCount, value : rows[j].value });

                        cellCount++;
                    }
                }
            }

            $('#results-table').append(row + '</tr>');

            // Assing a on click function to each of the rows to generate the bar graph with the row specific data
            $( "#row"+i+"").click(function(event) {
                showBarWithRowElem(this.id);
            });
        }
    }

    // Apllie css to each cell
    for(var i = 0; i < cellValues.length; i++){
        $(cellValues[i].id).css(
            {
                "background" : "-webkit-gradient(linear, left top, right top, color-stop(" + cellValues[i].value +"%,#F00), color-stop(" + cellValues[i].value +"%,#FFF))",
            }
        );
    }

}

function showBarWithRowElem(rowID){
    var data = [];


    // set the row selected
    $('#results-table').find('tr').removeClass('row-selected');
    $('#'+rowID).addClass('row-selected');


    $('#head-row').find('th').each(function (index, element) {
        if(index != 0){ // 0 is not a year
            data.push({category : $(element).text(), value : 0}); // 0 is temp
        }
    });

    var title = "";

    $('#'+rowID).find('th').each(function (index, element) {
        if(index != 0){
            data[index-1].value = $(element).text();
        } else {
            title = data[index].value = $(element).text();
        }
    });

    createBarGraph(title, data);
}


function insertCompanies(){
    $.get("/sections/company", function(data){
        if(data.companies.length > 0){
            $('#company-select').html('<option selected>' + data.companies[0] + '</option>'); // Empty temp options
        }

        for(var i = 1; i < data.companies.length; i++){
            $('#company-select').append('<option>' + data.companies[i] + '</option>');
        }
        $(".selectpicker").selectpicker('refresh');
    });
}


// New potentially for changing the url when search is clicked


/**
 * Created by Nicky on 3/02/2017.
 */

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
  if(divID.includes('cd') ){
    console.log("CD");
    console.log(data);
  }
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
        .attr("stroke", "#black")
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
            lines.push( {end :  data[i].years[j].year  === 2016 || data[i].years[j+1].year === 2016,edb : data[i].edb, x : data[i].years[j].valueB, y : data[i].years[j].valueA , x1 : data[i].years[j+1].valueB , y1 : data[i].years[j+1].valueA});
        } //TODO change 2016 to actual value
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


    // Add X label
    vectorGraph.svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ -(vMargin.left/2 +15) +","+( vMargin.top*2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .style("font-size", "18px")
        .attr("font-family", "sans-serif")
        .attr("class", "unit-text")
        .text(yLabel);

    // Add Y label
    vectorGraph.svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ vWidth/2 +","+( vHeight+35) + ")")  // text is drawn off the screen top left, move down and out and rotate
        .style("font-size", "18px")
        .attr("font-family", "sans-serif")
        .attr("class", "unit-text")
        .text(xLabel);

    if(!vectorGraph.created){
        var legend = vectorGraph.svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
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
