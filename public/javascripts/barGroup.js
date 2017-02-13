
var margin = { top: 35, right: 85, bottom: 150, left: 50 }, // Right needs to be big to fit the edb text diagonally
    width = 1200 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;



var barGraphs = [];

function GroupedBarData(x0, x1,y,yAxis,svg,id){
    this.x0 = x0;
    this.x1 = x1;
    this.y = y;
    this.yAxis = yAxis;
    this.svg = svg;
    this.id = id;
    this.created = false;
}


// Blue
var z = d3.scaleOrdinal()
    .range(["#BBDEFB", "#64B5F6", "#1976D2", "#1565C0", "#0D47A1", "#d0743c", "#ff8c00"]);

function createdGroupedBarGraph(data,keys,yLabel, divID){
    var curBarGraph = null;

    barGraphs.forEach(function (elem) {
       if(elem.id === divID)curBarGraph = elem;
    });

    if(curBarGraph === null){
        curBarGraph = new GroupedBarData( d3.scaleBand().rangeRound([0, width]).paddingInner(0.05),
                                          d3.scaleBand().padding(0.05),
                                          d3.scaleLinear().rangeRound([height, 0]),d3.axisLeft(),d3.axisBottom(),divID);
        barGraphs.push(curBarGraph);
    }


    if(!curBarGraph.created){
        curBarGraph.svg =  d3.select(divID).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g") // group allows us to move everything together
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")"); // moves by a x and y value in this case the margins
    }


    curBarGraph.x0.domain(data.map(function(d) { return d.edb; }));
    curBarGraph.x1.domain(keys).rangeRound([0, curBarGraph.x0.bandwidth()]);
    curBarGraph.y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).nice();

    var g = curBarGraph.svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var dpFormat = d3.format(".2f");

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
            .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
            .enter().append("rect")
            .attr("x", function(d) { return curBarGraph.x1(d.key); })
            .attr("y", function(d) { return curBarGraph.y(d.value); })
            .attr("width", curBarGraph.x1.bandwidth())
            .attr("height", function(d) { return height - curBarGraph.y(d.value); })
            .attr("fill", function(d) { return z(d.key); })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);
    }

    g.append("g")
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", function(d) { return "translate(" + curBarGraph.x0(d.edb) + ",0)"; })
        .selectAll("rect")
        .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
        .enter().append("rect")
        .attr("x", function(d) { return curBarGraph.x1(d.key); })
        .attr("y", function(d) { return curBarGraph.y(d.value); })
        .attr("width", curBarGraph.x1.bandwidth())
        .attr("height", function(d) { return height - curBarGraph.y(d.value); })
        .attr("fill", function(d) { return z(d.key); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(curBarGraph.x0))
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .style("font-size", "14px")
        .attr("transform", "rotate(55)")
        .style("text-anchor", "start");

    if(curBarGraph.created){
        curBarGraph.svg.select('.yAxis').call(curBarGraph.yAxis);
    } else {
        g.append("g")
            .attr("class", "axis")
            .attr("class", "yAxis")
            .call(curBarGraph.yAxis.scale(curBarGraph.y).ticks(null, "s"))
            .append("text")
            .attr("x", 2)
            .attr("y", curBarGraph.y(curBarGraph.y.ticks().pop()) + 0.5)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start");
    }

    curBarGraph.svg.append("text")
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

    curBarGraph.created = true;
}
