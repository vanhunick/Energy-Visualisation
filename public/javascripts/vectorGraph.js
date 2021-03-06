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
      .attr("class", "unit-text-scaled")
      .text(yMetricLabel + "     (" + yLabel + ")");

    // Add X label
    vectorGraph.svg.append("text")
      .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
      .attr("transform", "translate("+ (vWidth/2) +","+ +(vHeight + vMargin.bottom/4) + ")")  // text is drawn off the screen top left, move down and out and rotate
      .attr("class", "unit-text-scaled")
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

