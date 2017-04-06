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
