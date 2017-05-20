var BoxPlotModule = (function () {
    var labels = false; // show the text labels beside individual boxplots?

// Margins and graph width / height
var boxMargin = {top: 30, right: 50, bottom: 100, left: 50},
     boxWidth = 1200 - boxMargin.left - boxMargin.right,
     boxHeight = 700  - boxMargin.top  - boxMargin.bottom;


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


    boxPlotObjects.svg = d3.select(divID).append("svg")
             .attr("width", boxWidth + boxMargin.left + boxMargin.right)
             .attr("height", boxHeight + boxMargin.top + boxMargin.bottom)
             .attr("class", "box")
             .append("g")
             .attr("transform", "translate(" + boxMargin.left + "," + boxMargin.top + ")");

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
          .attr("r", 4)
          .attr("cx", function(d) { return boxPlotObjects.x(d.year) + whiskBoxWidth/2; })
          .attr("cy", function(d) { return boxPlotObjects.y(d.value); })
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide);

        // draw y axis
        boxPlotObjects.svg.append("g")
          .attr("class", "yAxis y axis")
          .call(boxPlotObjects.yAxis)
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("class", "axis-text-scaled")
          .style("text-anchor", "end");

        var maxw = 0;
        boxPlotObjects.svg.select('.yAxis').selectAll('text').each(function(){
          if (this.getBBox().width > maxw) maxw = this.getBBox().width;
        });

        boxPlotObjects.svg.attr("transform","translate(" + ( boxMargin.left+maxw) + "," + boxMargin.top + ")"); // moves by a x and y value in this case the barMargins


        // draw x axis
        boxPlotObjects.svg.append("g")
          .attr("class", "xAxis axis")
          .attr("transform", "translate(0," + (boxHeight + boxMargin.top  + 10) + ")")
          .call(boxPlotObjects.xAxis)          
          .append("text")
          .attr("class", "axis-text-scaled")
          .style("text-anchor", "end");

        // Add the y axis unit
        boxPlotObjects.svg.append("text")
          .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
          .attr("transform", "translate("+ -(maxw + 20) +","+(boxHeight/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
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
