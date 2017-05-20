var GroupedBarModule = (function(){

  //  Margins and width / height for the graph
  var margin = { top: 25, right: 85, bottom: 150, left: 80 },
    width = 1200 - margin.left - margin.right,
    height = 750 - margin.top - margin.bottom;

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

   curBarGraph.svg =  d3.select(divID).append("svg")
             .attr("width", width + margin.left + margin.right)
             .attr("height", height + margin.top + margin.bottom)
             .append("g") // group allows us to move everything together
             .attr("transform","translate(" + margin.left + "," + margin.top + ")"); // moves by a x and y value in this case the margins

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
      .attr("dy", ".40em")
      .attr("class", "axis-text-scaled")
      .attr("transform", "rotate(55)")
      .style("text-anchor", "start");

    curBarGraph.svg.append("g")
        .attr("class", "yAxis axis")
        .call(curBarGraph.yAxis.scale(curBarGraph.y))//.ticks(null, "s")
        .append("text")
        .attr("x", 2)
        .attr("y", curBarGraph.y(curBarGraph.y.ticks().pop()) + 0.5)
        .attr("dy", "0.40em")
        .attr("class", "axis-text-scaled")
        .attr("text-anchor", "start")


    var maxw = 0;
    curBarGraph.svg.select('.yAxis').selectAll('text').each(function(){
      if (this.getBBox().width > maxw) maxw = this.getBBox().width;
    });

    curBarGraph.svg.attr("transform","translate(" + (margin.left+maxw) + "," + margin.top + ")"); // moves by a x and y value in this case the barMargins


    curBarGraph.svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate("+ -(maxw + 20) +","+(height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
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
