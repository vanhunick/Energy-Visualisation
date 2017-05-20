// DEPENDENCIES : Graph, CombinedGraph

var GraphModule = (function(){

  // Holds the graph objects
  var graphs = [];

  // Blue color scale
  var z = d3.scaleOrdinal().range(["#BBDEFB", "#64B5F6", "#1976D2", "#1565C0", "#0D47A1", "#d0743c", "#ff8c00"]);

  // Red color scale for negative values
  var zRed = d3.scaleOrdinal().range(["#FF7373", "#FF4C4C", "#FF2626", "#B20000", "#D90000", "#d0743c", "#ff8c00"]);

  // Green color scale for selected values
  var zSelected = d3.scaleOrdinal().range(["#C1FFC1", "#90EE90", "#5BC85B", "#31A231", "#137B13", "#d0743c", "#ff8c00"]);

  /**
   * Initialises all of the graphs on the page.
   *
   * @param {Object}  update, contains all of the data for each of the graphs
   * */
  var init = function (update) {

    // Create the graphs
    update.data.forEach (function(tableData){
      if(tableData.combined){
        graphs.push(new CombinedGraph(tableData.id,tableData.rows,tableData.table1Rows,tableData.table2Rows,  tableData.search, tableData.search2));
      } else {
        graphs.push(new Graph(tableData.id,tableData.rows,tableData.search));
      }
    });
    // Insert the titles and create the graphs
    graphs.forEach(function(g){
      g.insertTitles();
      g.create();
    });
  }


  /**
   * Update all the graphs with the new rows
   *
   * @param {Object}  update, contains all of the data for each of the graphs
   * */
  var update = function (update) {
    update.data.forEach(function(tableData){
      graphs.forEach(function(g){
        if(g.getID() === tableData.id){
          if(g.isCombined()){
            g.update(tableData.rows, tableData.table1Rows, tableData.table2Rows);
          } else {
            g.update(tableData.rows);
          }
        }
      });
    });
  }


  /**
   * Called when a row is clicked
   *
   * @param {Object}  event, contains the EDB
   * */
  var rowClicked = function (event) {
    if(event.unselect) {
      d3.selectAll(".line-selected-table").classed("line-selected", false);
      d3.selectAll(".vec-dot-selected").classed("vec-dot-selected", false);
      return;
    }

    alreadySelected = false; // TODO fix

    // Before we remove the class we need to apply the correct color scale
    d3.selectAll(".bar-selected").datum(function(d) {return d; })
    .attr("fill", function(d) {return z(d.key); });

    // Select all rectangle with the selected class and remove class
    d3.selectAll(".bar-selected").classed("bar-selected", false);

    if(alreadySelected){return;} // The case where the row is unselected but nothing else is selected

    d3.selectAll("rect."+event.edb.replace(/ /g , ""))
    .classed("bar-selected", true) // Select all rectangle with the correct EDB and outline bars and add selected class
    .datum(function(d) {return d; }) // Grab the data bound to the elements
    .attr("fill", function(d) {return zSelected(d.key); }); // Apply the green color scale based on the key

    // Select all lines with the selected class and remove class
    d3.selectAll(".line-selected-table").classed("line-selected", false);
    d3.selectAll(".vec-dot-selected").classed("vec-dot-selected", false);


    d3.selectAll("line."+event.edb.replace(/ /g , "")).classed("line-selected-table", true);
    d3.selectAll(".dot."+event.edb.replace(/ /g , "")).classed("vec-dot-selected", true);
  }


  // Listen to events
  events.on("INIT_DATA", init);
  events.on("ROW_CLICKED", rowClicked);
  events.on("ROW_UPDATE", update);

  return {
    update : update
  }
})();
