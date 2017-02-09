/**
 * Created by Nicky on 3/02/2017.
 */

var vMargin = {top: 30, right: 20, bottom: 180, left: 70},
    vWidth = 1000 - vMargin.left - vMargin.right,
    vHeight = 800 - vMargin.top - vMargin.bottom;

function createVectorGraph(data,xLabel, yLabel, title, divID){

    var edbs = [];
    data.forEach(function (e) {
        edbs.push(e.edb);
    })


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

    var x = d3.scaleLinear()
        .rangeRound([vWidth, 0]);

    var y = d3.scaleLinear()
    .rangeRound([vHeight, 0]);

    var yAxis = d3.axisLeft();
    var xAvis = d3.axisBottom();

    // Create the svg and append to the div
    var svg = d3.select(divID).append("svg")
        .attr("width", vWidth + vMargin.left + vMargin.right)
        .attr("height", vHeight + vMargin.top + vMargin.bottom)
        .append("g")
        .attr("transform", "translate(" + vMargin.left + "," + vMargin.top + ")"); // moves by a x and y value in this case the margins

    var maxX = d3.max(xValues, function(d) { return d;} );
    var maxY = d3.max(yValues, function(d) { return d;} );


    x.domain([maxX,0]).nice();
    y.domain([0,maxY]).nice();

    xAvis.scale(x);
    yAxis.scale(y);


    svg.append("g")
        .attr("transform", "translate(0," + vHeight + ")")
        .attr("stroke", "#black")
        .call(d3.axisBottom(x));

    // add the y Axis
    svg.append("g")
        .attr("class","yAxis")
        .attr("fill", "black")
        .call(yAxis);


    svg.selectAll(".dotm")
        .data(allValues)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function(d) {return x(d.valueB); })
        .attr("cy", function(d) { return y(d.valueA); })
        .attr("fill", function(d) { return color(d.edb); })
        .on("mouseover", function(d) {

            var xPosition = parseFloat(d3.select(this).attr("cx"));
            var yPosition = parseFloat(d3.select(this).attr("cy"));
             yPosition = yPosition - 10;

            //Create the tooltip label
            svg.append("text")
                .attr("id", "tooltip")
                .attr("x", xPosition)
                .attr("y", yPosition)
                .attr("text-anchor", "middle")
                .attr("font-family", "sans-serif")
                .attr("font-size", "18px")
                .attr("font-weight", "bold")
                .attr("fill", "#64B5F6")
                .text(""+ d.year);

        }).on("mouseout", function() {
        //Remove the tooltip
        d3.select("#tooltip").remove();
    });

    var lines = []; // x,y,x1,y1

    // Next create the lines between them
    for(var i =0; i < data.length; i++){
        for(var j = 0; j < data[i].years.length-1; j++){ // -1 because we add
            lines.push( {end :  data[i].years[j].year  === 2016 || data[i].years[j+1].year === 2016,edb : data[i].edb, x : data[i].years[j].valueB, y : data[i].years[j].valueA , x1 : data[i].years[j+1].valueB , y1 : data[i].years[j+1].valueA});
        } //TODO change 2016 to actual value
    }

    // Build arrow
    svg.append("svg:defs").selectAll("marker")
        .data(["end"])      // Different link/path types can be defined here
        .enter().append("svg:marker")    // This section adds in the arrows
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");


    svg.selectAll(".line")
        .data(lines)
        .enter().append("line")
        .attr("x1",  function(d) {return x(d.x);})
        .attr("y1", function(d) {return y(d.y);})
        .attr("x2", function(d) {return x(d.x1);})
        .attr("y2", function(d) {return y(d.y1);})
        .attr("stroke-width", 2)
        .attr("stroke", function(d) { return color(d.edb);})
        .attr("marker-end", function(d){
            if(d.end){
                return "url(#end)";
            }
        });

    // Add X label
    svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ -(vMargin.left/2 +15) +","+( vMargin.top*2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .style("font-size", "18px")
        .attr("font-family", "sans-serif")
        .attr("class", "unit-text")
        .text(yLabel);

    // Add Y label
    svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ vWidth/2 +","+( vHeight+35) + ")")  // text is drawn off the screen top left, move down and out and rotate
        .style("font-size", "18px")
        .attr("font-family", "sans-serif")
        .attr("class", "unit-text")
        .text(xLabel);

    var xCur = 0;

    var legend = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(edbs)
        .enter().append("g")
        .attr("transform", function(d, i) {

            var y = Math.floor(i / 5) * 20;
            i++;
            var x = i * 160;

            if(i > 5 ){
                x = (i - 5) * 160;
            }

            if(i > 10 ){
                x = (i - 10) * 160;
            }

            if(i > 15 ){
                x = (i - 15) * 160;
            }

            if(i > 20 ){
                x = (i - 20) * 160;
            }

            if(i > 25 ){
                x = (i - 25) * 160;
            }
            x = x -160 + vMargin.left;

            return "translate("+ x +"," + (y +vHeight +vMargin.bottom/3 ) + ")";
        });

    legend.append("rect")
        .attr("x", vMargin.left + 45)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", color);

    legend.append("text")
        .attr("x", vMargin.left + 40)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .attr("class", "g-text")
        .style("font-size", "14px")
        .text(function(d) { return d; });
}
