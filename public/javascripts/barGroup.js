
var margin = { top: 35, right: 85, bottom: 150, left: 50 }, // Right needs to be big to fit the edb text diagonally
    width = 1200 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

var x0 = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.05);

var x1 = d3.scaleBand()
    .padding(0.05);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);


// Blue
var z = d3.scaleOrdinal()
    .range(["#BBDEFB", "#64B5F6", "#1976D2", "#1565C0", "#0D47A1", "#d0743c", "#ff8c00"]);

function createdGroupedBarGraph(data,keys,title, yLabel, divID){

    // Grab the div and add new svg with length and width to it then move svg according to margins
    var svg = d3.select(divID).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g") // group allows us to move everything together
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")"); // moves by a x and y value in this case the margins

    x0.domain(data.map(function(d) { return d.edb; }));
    x1.domain(keys).rangeRound([0, x0.bandwidth()]);
    y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).nice();

    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    g.append("g")
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", function(d) { return "translate(" + x0(d.edb) + ",0)"; })
        .selectAll("rect")
        .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
        .enter().append("rect")
        .attr("x", function(d) { return x1(d.key); })
        .attr("y", function(d) { return y(d.value); })
        .attr("width", x1.bandwidth())
        .attr("height", function(d) { return height - y(d.value); })
        .attr("fill", function(d) { return z(d.key); });

    g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .style("font-size", "14px")
        .attr("transform", "rotate(55)")
        .style("text-anchor", "start");

    g.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y).ticks(null, "s"))
        .append("text")
        .attr("x", 2)
        .attr("y", y(y.ticks().pop()) + 0.5)
        .attr("dy", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start");

    svg.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (margin.left/2-35) +","+( margin.top*2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .style("font-size", "18px")
        .attr("class", "unit-text")
        .text(yLabel);


    var legend = g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys.slice().reverse())
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 100)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", z);

    legend.append("text")
        .attr("x", width - 120)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .attr("class", "g-text")
        .style("font-size", "14px")
        .text(function(d) { return d; });

    // Add a title


    //svg.append("text")
    //    .attr("x", (width / 2))
    //    .attr("y", 0 - (margin.top / 2))
    //    .attr("text-anchor", "middle")
    //    .attr("class", "g-text")
    //    .style("font-size", "24px")
    //    .text(title);
}



