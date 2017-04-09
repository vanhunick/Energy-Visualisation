// DEPENDENCIES : DataProcessor, GroupedBarGraph

/**
 * Object that handles logic for updating and creating all of the graphs on the dashboard across the tabs
 *
 * @param id {String} the id of the selection
 * @param combinedRows {Object[]} the result of rows1 divided by rows2
 * @param rows1 {Object[]} the rows for the first selection
 * @param rows2 {Object[]} the rows for the selection selection
 * @param selection1 {Object} the first search
 * @param selection2 {Object} the second search
 * */
function CombinedGraph(id, combinedRows, rows1,rows2,selection1,selection2){
  this.id = id;
  this.groupedID = '#grouped-bar-'+id;
  this.boxID = '#boxplot-'+id;
  this.vectorID = '#vector-graph-'+id;
  this.rows1 = rows1;
  this.rows2 = rows2;
  this.combinedRows = combinedRows;
  this.selection1 = selection1;
  this.selection2 = selection2;
  this.unit = this.getUnit();


  // Cache dom elements
  this.$titleBar = $('#title-bar-'+id);
  this.$titleBox = $('#title-box-'+id);
  this.$titleVector = $('#title-vector-'+id);
}


/**
 * Returns if the the object is combined or not
 *
 * @return {Boolean} true if combined
 * */
CombinedGraph.prototype.isCombined = function() {
  return true;
}


/**
 * Returns the id of the combined graphs
 *
 * @return {String} the id of the combined graphs
 * */
CombinedGraph.prototype.getID = function () {
  return this.id;
}


/**
 * Returns the title of the first selection
 *
 * @return {String} the title of the first selection
 * */
CombinedGraph.prototype.getSelection1Title = function () {
   var selection1Title = this.selection1.description + ", " + this.selection1.category;


  return selection1Title;
}


/**
 * Returns the title of the second selection
 *
 * @return {String} the title of the second selection
 * */
CombinedGraph.prototype.getSelection2Title = function () {
  var selection2Title = this.selection2.description + ", " + this.selection2.category;

  return selection2Title;
}


/**
 * Returns the unit for the combined graph
 *
 * @return {String} the combined units for the selections
 * */
CombinedGraph.prototype.getUnit = function () {
  return this.rows1[0].units + " / " + this.rows2[0].units;
}

/**
 * Returns the unit for the first selection
 *
 * @return {String} the unit for the selections
 * */
CombinedGraph.prototype.getUnit1 = function () {
  return this.rows1[0].units;
}

/**
 * Returns the unit for the second selection
 *
 * @return {String} the unit for the selections
 * */
CombinedGraph.prototype.getUnit2 = function () {
  return this.rows2[0].units;
}




/**
 * Inserts the titles for the graphs into the DOM elements
 * */
CombinedGraph.prototype.insertTitles = function () {
  var titleHTML = '<h4 class="combined-title">'+this.getSelection1Title()+'<br><span class="over">over</span><br>'+this.getSelection2Title()+'</h4>'

  this.$titleBar.append(titleHTML);
  this.$titleBox.append(titleHTML);
  this.$titleVector.append(titleHTML);
}


/**
 * Creates the Graphs
 *
 * @param rows the new combined rows
 * @param the new rows for the first selection
 * @param rows2 the new rows for the second selection
 * */
CombinedGraph.prototype.create = function () {
    // Create the grouped bar graph
    var groupedData = dp.createDataForGroupedGraph(this.combinedRows);
    GroupedBarModule.createdGroupedBarGraph(groupedData.data,groupedData.keys,this.unit, this.groupedID);

    // Create the box plot graph
    var boxplotData = dp.createDataForBoxPlot(this.combinedRows);
    BoxPlotModule.createBoxPlot(boxplotData, this.boxID, this.unit);

    // Create the vector graph
    var vectorGraphData = dp.createDataForVectorGraph(this.rows1, this.rows2);
    VectorModule.createVectorGraph(vectorGraphData,this.getUnit2(),this.getUnit2(),this.vectorID);
}

/**
 * Called when the rows are updated by CPI
 *
 * @param rows the new combined rows
 * @param the new rows for the first selection
 * @param rows2 the new rows for the second selection
 * */
CombinedGraph.prototype.update = function (rows, rows1,rows2) {
  this.rows = rows;
  this.rows1 = rows1;
  this.rows2 = rows2;
  this.create();
}
