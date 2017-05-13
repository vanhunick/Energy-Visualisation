// DEPENDENCIES : DataProcessor, GroupedBarGraph, boxPlot


/**
 * Graph object to control the graphs for single selections
 *
 * @id the id of the selection
 * @rows {Object[]} the rows for the selection
 * @selection {Object} the details of the selection
 * */
function Graph(id,rows,selection) {
  this.id = id;
  this.groupedID = '#grouped-bar-'+id;
  this.boxID = '#boxplot-'+id;
  this.rows = rows;
  this.selection = selection;
  this.title = this.getTitle();
  this.subTitle = this.getSubTitle();
  this.unit = this.getUnit();

  // Cache dom elements
  this.$titleBar = $('#title-bar-'+id);
  this.$titleBox = $('#title-box-'+id);
}


/**
 * Returns if the object is combined
 *
 * @return {Boolean} combined or not
 * */
Graph.prototype.isCombined = function () {
  return false;
}


/**
 * Returns the unit of the graph
 *
 * @return {String} the unit
 * */
Graph.prototype.getUnit = function () {
  return this.rows[0].units;
}


/**
 * Returns the id of the graph
 *
 * @return {String} the id
 * */
Graph.prototype.getID = function () {
  return this.id;
}


/**
 * Returns the title for the graphs
 *
 * @return {String} the title
 * */
Graph.prototype.getTitle = function () {
  return this.selection.description + ", " + this.selection.subCategory;
}


/**
 * Returns the sub title for the graphs
 *
 * @return {String} the sub title
 * */
Graph.prototype.getSubTitle = function () {
  return this.selection.section + ", " + this.selection.category;
}


/**
 * Returns the unit for the graphs
 *
 * @return {String} the unit
 * */
Graph.prototype.getUnit = function () {
  return this.rows[0].units;
}


/**
 * Inserts the titles for the graphs into the DOM
 * */
Graph.prototype.insertTitles = function () {
  this.$titleBar.append('<h3 class="title">'+this.title+'</h3>').append('<h4 class="subTitle">'+this.subTitle+'</h4>');
  this.$titleBox.append('<h3 class="title">'+this.title+'</h3>').append('<h4 class="subTitle">'+this.subTitle+'</h4>');
}


/**
 * Creates the data using data processor and inserts into DOM
 * */
Graph.prototype.create = function () {

    // Create the data for the grouped graph and display it
    var groupedData = dp.createDataForGroupedGraph(this.rows);
    GroupedBarModule.createdGroupedBarGraph(groupedData.data,groupedData.keys,this.unit,this.groupedID);

    // Create the data for boxplot and show the graph
    var boxData = dp.createDataForBoxPlot(this.rows);
    BoxPlotModule.createBoxPlot(boxData, this.boxID, this.unit);
}


/**
 * Takes the new rows and updates the graphs
 *
 * @param {Object[]} rows the new rows
 * */
Graph.prototype.update = function (rows) {
    this.rows = rows;
    this.create();
}
