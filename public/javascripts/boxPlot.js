/**
 * Created by Nicky on 2/02/2017.
 */
var labels = false; // show the text labels beside individual boxplots?

var boxMargin = {top: 30, right: 50, bottom: 70, left: 50};
var  boxWidth = 500 - margin.left - margin.right;
var boxHeight = 600- margin.top - margin.bottom;




function createBoxPlot(dataObject, divID, title){
    var data = dataObject.data;
    var min = dataObject.min;
    var max = dataObject.max;

    var scatterData = dataObject.scatterData;

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

    var x = d3.scaleBand()
        .rangeRound([0, boxWidth])
        .padding(0.7,0.3);

    x.domain( data.map(function(d) {return d[0] } ) );

    var xAxis = d3.axisBottom(x); // V4

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


    // Create the scatter plot over top
    svg.selectAll(".dot")
        .data(scatterData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function(d) { return x(d.year) + 12.50; })
        .attr("cy", function(d) { return y(d.value); })
        .on("mouseover", function(d) {

            //Get this bar's x/y values, then augment for the tooltip


            var xPosition = parseFloat(d3.select(this).attr("cx"));
            var yPosition = parseFloat(d3.select(this).attr("cy") + 10);

            //xPosition = d3.event.pageX + 10;
            //yPosition = d3.event.pageY + 10;


            //Create the tooltip label
            svg.append("text")
                .attr("id", "tooltip")
                .attr("x", xPosition)
                .attr("y", yPosition - 10)
                .attr("text-anchor", "middle")
                .attr("font-family", "sans-serif")
                .attr("font-size", "14px")
                .attr("font-weight", "bold")
                .attr("fill", "steelblue")
                .text("" + d.edb);

        }).on("mouseout", function() {
        //Remove the tooltip
        d3.select("#tooltip").remove();
    });

    // Create the scatter plot over top
    //svg.selectAll("text")
    //    .data(scatterData)
    //    .enter()
    //    .append("text")
    //    .text(function(d) {
    //        return d.edb;
    //    })
    //    .attr("x", function(d) {
    //        return x(d.year);  // Returns scaled location of x
    //    })
    //    .attr("y", function(d) {
    //        return y(d.value) - 10;  // Returns scaled circle y
    //    })
    //    .attr("font_family", "sans-serif")  // Font type
    //    .attr("font-size", "11px")  // Font size
    //    .attr("fill", "darkgreen");   // Font color


    // add a title
    svg.append("text")
        .attr("x", (boxWidth / 2))
        .attr("y", 0 + (boxMargin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        //.style("text-decoration", "underline")
        .text(title);

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