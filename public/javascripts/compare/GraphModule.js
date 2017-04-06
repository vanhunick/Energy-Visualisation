var GraphModule = (function(){

  // Hold onto the graph objects
  var graphs = [];

  // The initialising function for all the graphs
  var init = function (update) {
    update.data.forEach (function(tableData){
      if(tableData.combined){
        graphs.push(new CombinedGraph(tableData.id,tableData.rows,tableData.table1Rows,tableData.table2Rows,  tableData.search, tableData.search2));
      } else {
          graphs.push(new Graphs(tableData.id,tableData.rows,tableData.search));
      }
      graphs.forEach(function(g){g.create();});
    });
  }


  // Called when a row is clicked
  var rowClicked = function (event) {
    if(event.unselect) {
      d3.selectAll(".line-selected-table").classed("line-selected", false);
      d3.selectAll(".vec-dot-selected").classed("vec-dot-selected", false);
      return;
    }

    // var edb = event.edb;
    alreadySelected = false;

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

    // Select all rectangle with the correct EDB and outline bars
    // Also removes the highlight of previous selection
    // highlight(text, false);
    d3.selectAll("line."+event.edb.replace(/ /g , "")).classed("line-selected-table", true);
    d3.selectAll(".dot."+event.edb.replace(/ /g , "")).classed("vec-dot-selected", true);
  }



  var update = function (update) {
    console.log("Updating in graphs")
    update.data.forEach(function(tableData){
      console.log("Updating in graphs table data")
      graphs.forEach(function(g){
        console.log("through graphs")

            if(g.getID() === tableData.id){
                console.log(g.isCombined());
              if(g.isCombined()){
                  g.setRows(tableData.rows, tableData.table1Rows,table2Rows);
              } else {
                  g.update(tableData.rows);
              }
            }
      });
    });
  }

  // Listen to events
  events.on("INIT_DATA", init);
  events.on("ROW_CLICKED", rowClicked);
  events.on("ROW_UPDATE", update);


  return {
    update : update
  }
})();

function CombinedGraph(id, combinedRows, rows1,rows2,selection1,selection2){
  this.id = id;
  this.groupedID = '#grouped-bar'+id;
  this.boxID = '#boxplot-'+id;
  this.vectorID = '#vector-'+id;
  this.rows1 = rows1;
  this.rows2 = rows2;
  this.combinedRows = combinedRows;
  this.selection1 = selection1;
  this.selection2 = selection2;

  this.isCombined = function () {
    return true;
  }

  this.getID = function () {
    return this.id;
  }

  // Chache dom elements
  this.$titleBar = $('#title-bar-'+id);
  this.$titleBox = $('#title-box-'+id);
  this.$titleVector = $('#title-vector-'+id);
}

CombinedGraph.prototype.getTitle = function () {
  return this.selection.description + ", " + this.selection.subCategory;
}

// TODO check if these should be updated like this since they are based on others
CombinedGraph.prototype.applyCPI = function (cpiValues) {
  applyCPIToTableRows(this.rows, cpiValues);
  applyCPIToTableRows(this.rows1, cpiValues);
  applyCPIToTableRows(this.rows2, cpiValues);
  this.create();
}

CombinedGraph.prototype.getSubTitle = function () {
  return this.selection.section + ", " + this.selection.category;
}

CombinedGraph.prototype.getUnit = function () {
  return this.rows1[0].unit + " / " + rows2[0].unit;
}

CombinedGraph.prototype.create = function () {
    // First insert titles

    // Create the grouped bar graph
    var groupedData = dp.createDataForGroupedGraph(this.combinedRows);
    createdGroupedBarGraph(groupedData.data,groupedData.keys,this.unit, this.graphID);

    // Create the box plot graph
    var boxplotData = dp.createDataForBoxPlot(this.combinedRows);
    createBoxPlot(boxplotData, this.boxID, this.unit);

    // Create the vector graph
    var vectorGraphData = dp.createDataForVectorGraph(this.rows1, this.rows2);
    createVectorGraph(vectorGraphData,selection.unit1,selection.unit2,this.vectorID);
}

CombinedGraph.prototype.update = function (rows, rows1,rows2) {
  this.rows = rows;
  this.rows1 = rows1;
  this.rows2 = rows2;
  this.create();
}

function Graphs(id,rows,selection) {
  this.id = id;
  this.groupedID = '#grouped-bar-'+id;
  this.boxID = '#boxplot-'+id;
  this.rows = rows;
  this.selection = selection;
  this.title = this.getTitle();
  this.subTitle = this.getSubTitle();

  this.isCombined = function () {
    return false;
  }

  this.getID = function () {
    return this.id;
  }

  // Cache dom elements
  this.$titleBar = $('#title-bar-'+id);
  this.$titleBox = $('#title-box-'+id);

  this.getUnit = function () {
    return this.combined ? "two units " : "one unit";
  }
  this.unit = this.getUnit();
}

Graphs.prototype.getTitle = function () {
  return this.selection.description + ", " + this.selection.subCategory;
}

Graphs.prototype.getSubTitle = function () {
  return this.selection.section + ", " + this.selection.category;
}

Graphs.prototype.getUnit = function () {
  return this.rows[0].unit;
}

Graphs.prototype.create = function () {
    // First add the titles
    this.$titleBar.append('<h3 class="title">'+this.title+'</h3>').append('<h4 class="subTitle">'+this.subTitle+'</h4>');
    this.$titleBox.append('<h3 class="title">'+this.title+'</h3>').append('<h4 class="subTitle">'+this.subTitle+'</h4>');

    // Create the data for the grouped graph and display it
    var groupedData = dp.createDataForGroupedGraph(this.rows);
    createdGroupedBarGraph(groupedData.data,groupedData.keys,this.unit,this.groupedID);

    // Create the data for boxplot and show the graph
    var boxData = dp.createDataForBoxPlot(this.rows);
    createBoxPlot(boxData, this.boxID, this.unit);
}


Graphs.prototype.applyCPI = function (cpiValues) {
  if(this.canApplyCPI()){
    applyCPIToTableRows(this.row, cpiValues);
    this.create();
  }
}

Graphs.prototype.update = function (rows) {
    this.rows = rows;
    this.create();
}

/**
 * Applies cpi values to the rows by chaning the value in each row with the compounded cpi values
 *
 * @param rows {Object[]} the rows
 * @param cpiValues {Object[]} contains the cpi for each year
 * */
function applyCPIToTableRows(rows, cpiValues){

    // Find the min and max year from the data
    var minYear = rows.reduce(function(prev, curr) {
        return prev.disc_yr < curr.disc_yr ? prev : curr;
    }).obs_yr;

    var maxYear = rows.reduce(function(prev, curr) {
        return prev.disc_yr > curr.disc_yr ? prev : curr;
    }).obs_yr;

    for(var cur = minYear; cur <=maxYear; cur++){ // Go through each possible year
        rows.forEach(function(elem, index){ // Grab every Row
            var year = rows[index].obs_yr; // Grab the year of the cell by checking the class
            var valueOfCell = rows[index].value;

            for(var i = 0; i < cpiValues.length; i++){
                if(cpiValues[i].year === cur){
                    if(year <= cur){
                        valueOfCell = valueOfCell * (1 + (cpiValues[i].value / 100));
                    }
                }
            }
            rows[index].value = valueOfCell; // CPI Applied value
        });
    }
}
