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
