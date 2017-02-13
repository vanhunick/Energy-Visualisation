/**
 * Created by Nicky on 2/02/2017.
 */
var labels = false; // show the text labels beside individual boxplots?

var boxMargin = {top: 30, right: 50, bottom: 100, left: 100};
var  boxWidth = 1000 - boxMargin.left - boxMargin.right;
var boxHeight = 800  - boxMargin.top  - boxMargin.bottom;


// Encapsulate all properties of graph
var plots = [];

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


function createBoxPlot(dataObject, divID, title, unit){
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
        boxPlotObjects = new BoxPlotData( x,null,null,null,null,null,false,divID);
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

        var dpFormat = d3.format(".2f");


        var tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function(d) {
            return "<strong>Value:</strong> <span style='color:lightgreen'>" + dpFormat(d.value) + "</span><br><br><strong>EDB:</strong> <span style='color:lightgreen'>" + d.edb + "</span>";
          });

          boxPlotObjects.svg.call(tip);


    boxPlotObjects.svg.selectAll(".dot")
            .data(scatterData)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("r", 3.5)
            .attr("cx", function(d) { return boxPlotObjects.x(d.year) + whiskBoxWidth/2; })
            .attr("cy", function(d) { return boxPlotObjects.y(d.value); })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

            // .on("mouseover", function(d) {
            //
            //     var xPosition = parseFloat(d3.select(this).attr("cx"));
            //     var yPosition = parseFloat(d3.select(this).attr("cy") + 10);
            //
            //     //Create the tooltip label
            //     boxPlotObjects.svg.append("text")
            //         .attr("id", "tooltip")
            //         .attr("x", xPosition)
            //         .attr("y", yPosition - 20)
            //         .attr("text-anchor", "middle")
            //         .attr("font-family", "sans-serif")
            //         .attr("font-size", "18px")
            //         .attr("font-weight", "bold")
            //         .attr("fill", "black")
            //         .text("" + d.edb);
            //
            // }).on("mouseout", function() {
            // //Remove the tooltip
            // d3.select("#tooltip").remove();
        // });

    // Create the scatter plot over top



    // draw y axis
    boxPlotObjects.svg.append("g")
        .attr("class", "y axis")
        .call(boxPlotObjects.yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("font-size", "16px");

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
        .style("font-size", "16px")
        .text("Quarter");

    // Add the y axis unit
    boxPlotObjects.svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ -(boxMargin.left/2) +","+( boxMargin.top*2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .style("font-size", "18px")
        .attr("class", "unit-text")
        .text(unit);

    // Add year as the x-axis label
    boxPlotObjects.svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ +(boxWidth/2) +","+( boxMargin.top + 40 + boxHeight)+")")  // text is drawn off the screen top left, move down and out and rotate
        .style("font-size", "18px")
        .attr("class", "unit-text")
        .text("Year");

    boxPlotObjects.created = true;
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
