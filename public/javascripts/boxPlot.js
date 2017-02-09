/**
 * Created by Nicky on 2/02/2017.
 */
var labels = false; // show the text labels beside individual boxplots?

var boxMargin = {top: 30, right: 50, bottom: 100, left: 100};
var  boxWidth = 1000 - boxMargin.left - boxMargin.right;
var boxHeight = 800  - boxMargin.top  - boxMargin.bottom;


function createBoxPlot(dataObject, divID, title, unit){
    var data = dataObject.data;
    var min = dataObject.min;
    var max = dataObject.max;

    var scatterData = dataObject.scatterData;

    // the y-axis
    var y = d3.scaleLinear()
        .domain([min, max]).nice()
        .range([boxHeight + boxMargin.top, 0 + boxMargin.top]);

    var chart = d3.box()
        .whiskers(iqr(1.5))
        .height(boxHeight)
        .domain(y.domain())
        .showLabels(labels);

    var svg = d3.select(divID).append("svg")
        .attr("width", boxWidth + boxMargin.left + boxMargin.right)
        .attr("height", boxHeight + boxMargin.top + boxMargin.bottom)
        .attr("class", "box")
        .append("g")
        .attr("transform", "translate(" + boxMargin.left + "," + boxMargin.top + ")");

    var x = d3.scaleBand()
        .rangeRound([0, boxWidth])
        .padding(0.7,0.3);

    x.domain( data.map(function(d) {return d[0] } ) );

    var xAxis = d3.axisBottom(x); // V4



    var yAxis = d3.axisLeft(y); //V4
        //.scale(y)
        //.orient("left");

    // draw the boxplots
    svg.selectAll(".box")
        .data(data)
        .enter().append("g")
        .attr("transform", function(d) { return "translate(" +  x(d[0])  + "," + boxMargin.top + ")"; } )
        .call(chart.width(x.bandwidth())); //V4 Updated


    // Create the scatter plot over top
    svg.selectAll(".dot")
        .data(scatterData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function(d) { return x(d.year) + whiskBoxWidth/2; })
        .attr("cy", function(d) { return y(d.value); })
        .on("mouseover", function(d) {

            var xPosition = parseFloat(d3.select(this).attr("cx"));
            var yPosition = parseFloat(d3.select(this).attr("cy") + 10);

            //Create the tooltip label
            svg.append("text")
                .attr("id", "tooltip")
                .attr("x", xPosition)
                .attr("y", yPosition - 10)
                .attr("text-anchor", "middle")
                .attr("font-family", "sans-serif")
                .attr("font-size", "18px")
                .attr("font-weight", "bold")
                .attr("fill", "black")
                .text("" + d.edb);

        }).on("mouseout", function() {
        //Remove the tooltip
        d3.select("#tooltip").remove();
    });


    // draw y axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("font-size", "16px");

    // draw x axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (boxHeight + boxMargin.top  + 10) + ")")
        .call(xAxis)
        .append("text")             // text label for the x axis
        .attr("x", (boxWidth / 2) )
        .attr("y",  10 )
        .attr("dy", ".71em")
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Quarter");

    // Add the y axis unit
    svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ -(boxMargin.left/2) +","+( boxMargin.top*2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .style("font-size", "18px")
        .attr("class", "unit-text")
        .text(unit);

    // Add year as the x-axis label
    svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ +(boxWidth/2) +","+( boxMargin.top + 40 + boxHeight)+")")  // text is drawn off the screen top left, move down and out and rotate
        .style("font-size", "18px")
        .attr("class", "unit-text")
        .text("Year");
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