/**
 * Created by Nicky on 2/02/2017.
 */
var labels = true; // show the text labels beside individual boxplots?

var boxMargin = {top: 30, right: 50, bottom: 70, left: 50};
var  boxWidth = 800 - margin.left - margin.right;
var boxHeight = 1000- margin.top - margin.bottom;




function createBoxPlot(dataObject, divID){
    var data = dataObject.data;
    var min = dataObject.min;
    var max = dataObject.max;

    var chart = d3.box()
        .whiskers(iqr(1.5))
        .height(boxHeight)
        .domain([min, max])
        .showLabels(labels);

    var svg = d3.select(divID).append("svg")
        .attr("width", boxWidth + boxMargin.left + boxMargin.right)
        .attr("height", boxHeight + boxMargin.top + boxMargin.bottom)
        .attr("class", "box")
        .append("g")
        .attr("transform", "translate(" + boxMargin.left + "," + boxMargin.top + ")");

    // the x-axis

    // V3
    //var x = d3.scaleOrdinal()
    //    .domain( data.map(function(d) { console.log(d); return d[0] } ) )
    //    .rangeRoundBands([0 , boxWidth], 0.7, 0.3);

    // V4
    var x = d3.scaleBand()
        .rangeRound([0, boxWidth])
        .padding(0.7,0.3);

    x.domain( data.map(function(d) { console.log(d); return d[0] } ) );

    var xAxis = d3.axisBottom(x); // V4

        // V3
        //.scale(x)
        //.orient("bottom");

    // the y-axis
    var y = d3.scaleLinear()
        .domain([min, max])
        .range([boxHeight + boxMargin.top, 0 + boxMargin.top]);

    var yAxis = d3.axisLeft(y); //V4
        //.scale(y)
        //.orient("left");

    // draw the boxplots
    svg.selectAll(".box")
        .data(data)
        .enter().append("g")
        .attr("transform", function(d) { return "translate(" +  x(d[0])  + "," + boxMargin.top + ")"; } )
        .call(chart.width(x.bandwidth())); //V4 Updated


    // add a title
    svg.append("text")
        .attr("x", (boxWidth / 2))
        .attr("y", 0 + (boxMargin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        //.style("text-decoration", "underline")
        .text("Revenue 2012");

    // draw y axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text") // and text1
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("font-size", "16px")
        .text("Revenue in €");

    // draw x axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (boxHeight  + boxMargin.top + 10) + ")")
        .call(xAxis)
        .append("text")             // text label for the x axis
        .attr("x", (boxWidth / 2) )
        .attr("y",  10 )
        .attr("dy", ".71em")
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Quarter");
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