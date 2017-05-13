// DEPENDENCIES : DataProcessor, GroupedBarGraphModule, VectorGraphModule, BoxPlotModule

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
  var subCategory = this.selection1 === null ? "" : this.selection1.subCategory;
  return this.selection1.description + ", " + this.selection1.category + ", " + subCategory;
}


/**
 * Returns the title of the second selection
 *
 * @return {String} the title of the second selection
 * */
CombinedGraph.prototype.getSelection2Title = function () {
  var subCategory = this.selection2 === null ? "" : this.selection2.subCategory;
  return this.selection2.description + ", " + this.selection2.category + ",  " + subCategory;
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
  var ratioHTML = '<h4>Ratio '+this.id.charAt(0).toUpperCase()+' / '+this.id.charAt(1).toUpperCase() +'</h4>'
  var s1 = '<h4 class="title"><span style="Color: black;">'+this.id.charAt(0).toUpperCase()+': </span>'+this.getSelection1Title()+'</h4>';
  var s2 = '<h4 class="title"><span style="Color: black;">'+this.id.charAt(1).toUpperCase()+': </span>'+this.getSelection2Title()+'</h4>';

  // var titleHTML = '<h4 class="combined-title">'+this.getSelection1Title()+'<br><span class="over">over</span><br>'+this.getSelection2Title()+'</h4>'

  this.$titleBar.append(ratioHTML);
  this.$titleBar.append(s1);
  this.$titleBar.append(s2);

  this.$titleBox.append(ratioHTML);
  this.$titleBox.append(s1);
  this.$titleBox.append(s2);


  this.$titleVector.append(ratioHTML);
  this.$titleVector.append(s1);
  this.$titleVector.append(s2);
}


/**
 * Creates the Graphs
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
    VectorModule.createVectorGraph(vectorGraphData,this.getUnit2(),this.getUnit1(),this.vectorID);
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

//// Internet Explorer compatibility
//if (!String.prototype.includes) {
//    String.prototype.includes = function() {
//        'use strict';
//        return String.prototype.indexOf.apply(this, arguments) !== -1;
//    };
//}
//
//if (!Array.prototype.includes) {
//    Object.defineProperty(Array.prototype, "includes", {
//        enumerable: false,
//        value: function(obj) {
//            var newArr = this.filter(function(el) {
//                return el == obj;
//            });
//            return newArr.length > 0;
//        }
//    });
//}
//// End Internet explorer compatibility
//
//
//var dp = new DataProcessor();
//
//function Data(){
//    this.rows = []; // All the rows from a search
//    this.tables = null; // The rows filtered into the separate tables
//    this.copyOfTables = null; // tables copied so modifications can be made
//    this.dpFormat = d3.format(".4r"); // Used to format numbers displayed
//}
//
//var searchData; // An instance of the Data object
//var dataStructure; // Contains arrays for tables, graphs and combined graphs
//var rowSelected = ""; // Holds the id of the currently selected row in the edb table
//var totalsRowSelectedID = ""; // Holds the id of the selected row in the totals table
//var noCPICells = []; // Hold the original cpi values
//
//
//// Object to hold which company belongs to a specific region
//var regions = {
//  n : ["Centralines","Counties Power","Eastland Network","Electra","Horizon Energy","Northpower",
//       "Powerco","Scanpower","The Lines Company","Top Energy","Unison Networks","Vector Lines",
//       "Waipa Networks","WEL Networks","Wellington Electricity"],
//  uni : ["Counties Power","Horizon Energy","Northpower","The Lines Company","Top Energy","Vector Lines","Waipa Networks","WEL Networks"],
//  eni : ["Centralines","Eastland Network","Scanpower","Unison Networks"],
//  swni : ["Electra","Powerco","Wellington Electricity"],
//  s : ["Alpine Energy","Aurora Energy","Buller Electricity","Electricity Ashburton","Electricity Invercargill",
//       "MainPower NZ","Marlborough Lines","Nelson Electricity","Network Tasman",
//       "Network Waitaki","Orion NZ","OtagoNet","The Power Company","Westpower"],
//  usi : ["Alpine Energy","Buller Electricity","MainPower NZ","Marlborough Lines","Nelson Electricity","Network Tasman","Orion NZ","Westpower"],
//  lsi : ["Aurora Energy","Electricity Ashburton","Electricity Invercargill","Network Waitaki","OtagoNet","The Power Company"]
//};
//
//
//// Called when the document is loaded
//// $(document).ready( function() {
////     // Highlight the selected link
////     $(".nav-link").removeClass('active');
////     $("#benchmarks-link").addClass('active');
////     $('#search-btn-compare').click(function(){ // Listener to search button
////         search(); // Search encodes the selections into the url and sends to server
////     });
////     if($('.cpi-form').length > 0 ){
////         cpiValidationSetup(); // Set up cpi validation rules
////     }
//// });
//
//
///**
// * The first method that is called when loading the page from a URL with a selection. A selection can contain multiple searches up to 4.
// *
// * @param urlSelections{Object[]} contains the user selections for each row
// * */
//// function loadFromURL(urlSelections){
////     searchData = new Data();
////     selectionRows.init(urlSelections,true);
////
////     // Send array of selected sections to server and the company
////     $.post("/compare/search",{company : "", selections : JSON.stringify(urlSelections)}, function(data){
////         // Queries the db for each of the secions and finds and inserts the sub sections as options
////         var lastSearch = new Selection(urlSelections[0],urlSelections[1],urlSelections[2],urlSelections[3]); // Set the last search
////         var dataTables = dp.filterRowsToTables(data.rows, lastSearch); // Filter the rows into their tables
////         searchData.rows = data.rows;
////         searchData.tables = dataTables;
////
////         searchData.copyOfTables = dp.copyDataTables(dataTables);
////
////         dataStructure = dp.createDataStructuresWithCopy(searchData.copyOfTables); // Sets up the data so it can easily be iterated over to create the tables and graphs
////
////         showTables(dataStructure.selectionTable); // Show the tables
////         showAllRegularGraphs(dataStructure.selectionData, true); // Show all but combined and vector graphs true indicates it should add titles in
////         showAllCombinedGraphs(dataStructure.combineData, true); // Show the combined and vector graphs
////         highlightGraphsOnLoad(dataStructure.selectionTable);
////     });
//// }
//
//
///**
// * Highlights the graphs by acting like a user clicked on the first row in each table.
// *
// * @param selectionTables {Object[]} the data for each table
// * */
//function highlightGraphsOnLoad(selectionsTables){
//    for(var i = 0; i < selectionsTables.length; i++){
//        rowClicked("rowtable"+selectionsTables[i].id+"0");
//        totalsRowClicked("row-tot-"+selectionsTables[i].id+"0");
//        return; // Only need to click on one row to fill out all of them
//    }
//}
//
//
///**
// * Shows the tables on the page giving the data in the selection table array
// *
// * @param selectionTableArray {Object[]} contains all the rows for each table
// * */
//function showTables(selectionTablesArray){
//    selectionTablesArray.forEach(function (tableData) {
//        // Add in the title using the id and the tile / subtitle for each table
//        if(tableData.id === 'ab' || tableData.id === 'cd'){
//          $('#title-'+tableData.id).append('<h4 class="title">'+tableData.title+'</h4>').append('<h4 class="title">'+tableData.subTitle+'</h4>');
//        } else {
//          $('#title-'+tableData.id).append('<h2 class="title">'+tableData.title+'</h2>').append('<h4 class="subTitle">'+tableData.subTitle+'</h4>');
//        }
//        insertTable(tableData.rows,'table'+tableData.id);
//        insertTotalsTable(tableData.rows, 'table-total'+tableData.id, regions,false,false); // Creates and inserts the total table
//    })
//}
//
//
///**
// * Shows the bar and boxplot graphs for tables A,B,C, and D.
// *
// * @param selectionData {Object[]} contains all the rows
// * #param addTitles {Boolean} when the table is already displayed and only the data needs to be updated titles should not be added
// * */
//function showAllRegularGraphs(selectionData, addTitles){
//    selectionData.forEach(function (selection) {
//        // Insert the titles for the graphs
//        if(addTitles){
//            $('#title-'+selection.id+'-bar').append('<h3 class="title">'+selection.title+'</h3>').append('<h4 class="subTitle">'+selection.subTitle+'</h4>');
//            $('#title-'+selection.id+'-box').append('<h3 class="title">'+selection.title+'</h3>').append('<h4 class="subTitle">'+selection.subTitle+'</h4>');
//        }
//
//        // Create the data needed for bar grahs and create and insert the graph
//        var table1Data = dp.createDataForGroupedGraph(selection.rows);
//        createdGroupedBarGraph(table1Data.data, table1Data.keys,selection.unit,"#grouped-bar-"+selection.id);
//
//        // Create the data needed for box plot and create and insert the plot
//        createBoxPlot(dp.createDataForBoxPlot(selection.rows), "#boxplot"+selection.id+"-div", selection.unit);
//        $('#full-table-'+selection.id+'-div').show();
//    });
//}
//
//
///**
// * Shows the bar, box plot, and vector graphs for tables A/B, B/C and A/B / C/D.
// *
// * @param selectionData {Object[]} contains all the rows
// * #param addTitles {Boolean} when the table is already displayed and only the data needs to be updated titles should not be added
// * */
//function showAllCombinedGraphs(selectionData, showTitle){
//    selectionData.forEach(function(selection){
//        // Insert titles
//        if(showTitle){
//            $('#title-'+selection.id+'-bar').append('<h4 class="combined-title">'+selection.title1+'<br><span class="over">over</span><br>'+selection.title2+'</h4>');
//            $('#title-'+selection.id+'-box').append('<h4 class="combined-title">'+selection.title1+' <br><span class="over">over</span><br>'+selection.title2+'</h4>');
//            $('#title-'+selection.id+'-vector').append('<h4 class="combined-title">'+selection.title1+'<br><span class="over">over</span><br>'+selection.title2+'</h4>');
//        }
//        // Create data for bar, box and vector graphs and insert into divs
//        var tableABData = dp.createDataForGroupedGraph(selection.rows);
//        createdGroupedBarGraph(tableABData.data, tableABData.keys, selection.unit1 + " / " + selection.unit2, "#grouped-bar-"+selection.id);
//        createBoxPlot(dp.createDataForBoxPlot(selection.rows), "#boxplot"+selection.id+"-div", selection.unit1 + " / " + selection.unit2);
//        createVectorGraph(dp.createDataForVectorGraph(selection.table1Rows,selection.table2Rows),selection.unit1,selection.unit2,"#vector-graph-div-"+selection.id);
//        $('#full-table-'+selection.id+'-div').show(); // Show the div now that they have been created
//    });
//
//    // Add in A / B over C / D
//    if(selectionData.length === 2){
//        $('#title-abcd-vec').append('<h4 class="combined-title">'+selectionData[0].title1+' / '+selectionData[0].title2+'</h4>').append('<h4>Over</h4>').append('<h4 class="combined-title">'+selectionData[1].title1+' / '+selectionData[1].title2+'</h4>');
//        createVectorGraph(dp.createDataForVectorGraph(selectionData[0].rows,selectionData[1].rows),selectionData[0].unit1 + " / " + selectionData[1].unit1,selectionData[0].unit2 + " / " + selectionData[1].unit2,"#vector-graph-div-abcd");
//        $('#vector-full-div-abcd').show();
//    }
//}
//
//
///**
// * Creates and inserts a total table for each region
// *
// * @param tableRows {Object[]} contains all the rows from the tables
// * @param id {String} the id of the table
// * @param regions {Object} contains a property for each region and which edbs belong to it
// * @param update {Boolean} if the table needs to be updated or created
// * */
//function insertTotalsTable(tableRows, id, regions, tableExists, update){
//    var tableID = (!(id.slice(-2).indexOf("l") > -1) ? id.slice(-2) : id.slice(-1));
//    var names = {n : "North Island", uni : "Upper North Island", eni : "Eastern North Island", swni : "South-West North Island", s : "South Island", usi : "Upper South Island", lsi : "Lower South Island", nz : "New Zealand"};
//    var totCells = []; // Hold the totals for each region
//
//    // First get all the availble years in the rows
//    var availableObsYears = [];
//    tableRows.forEach(function (elem) {
//        if(!availableObsYears.includes(elem.obs_yr))availableObsYears.push(elem.obs_yr);
//    });
//    availableObsYears.sort(function (a, b) { // Sort the years
//        return +a - +b;
//    });
//
//    var totals = dp.createTableTotals(tableRows,regions, availableObsYears);
//
//    // Insert Caption for table
//    var years = "";
//    availableObsYears.forEach(function (year) {
//        years += "<th>" + year + "</th>";
//    });
//
//    var cellCount = 0; // Used for id cells
//    var rowCount = 0; // Used for id rows
//
//    if(update){
//        $("#"+id).html(''); // Clear last table
//    }
//
//    // Used to calculate average or total
//    var numberOfCompanies = 29;
//
//    $("#"+id).append('<tr id="head-row-totals-'+tableID+'" class="table-row table-head"> <th>Region</th>'+ years + '</tr>');
//
//    for (var property in totals) {
//        if (totals.hasOwnProperty(property)) {
//            var row= "<tr class='table-row' id=row-tot-"+tableID+rowCount+">";
//
//            //TODO (Note when updated origValue will be the updated value not the original)
//
//            // Insert name in column and assign an id to the row
//            row += "<th class='reg-cell'>" + names[property] + "</th>";
//            totals[property].forEach(function(value){
//                var avg;
//                if(property === "nz"){
//                    avg = value / numberOfCompanies;
//                } else {
//                    avg = value / regions[property].length;
//                }
//
//                row += "<th id='t-total"+tableID+""+cellCount+"' origValue='"+ avg +"' class='cell'>" + searchData.dpFormat(avg) + "</th>";
//                totCells.push({id : "#t-total"+tableID+""+cellCount, value :avg});
//                if(!tableExists){
//                    noCPICells.push({id : "t-total"+tableID+""+cellCount, value : avg});
//                }
//                cellCount++;
//
//            });
//            $("#"+id).append(row + '</tr>');
//            $("#row-tot-"+tableID+rowCount).click(function() {
//                totalsRowClicked(this.id); // Call the function to highlight the data in all graphs for the edb
//            });
//            rowCount++;
//        }
//    }
//    applyGradientCSS(totCells,false);
//}
//
//
///**
// * Creates and inserts a total table for each region
// *
// * @param tableRows {Object[]} contains all the rows for a particular table
// * @param id {String} the id of the table
// * */
//function insertTable(tableRows,id){
//    // Sorts the EDB names
//    tableRows.sort(function (a,b) {
//        return [a.edb, b.edb].sort()[0] === a.edb ? -1 : 1; // Sort two names and return the first
//    });
//    if(tableRows.length === 0)return; // No data so return
//
//    var availableObsYears = [];
//
//    tableRows.forEach(function (elem) {
//        if(!availableObsYears.includes(elem.obs_yr))availableObsYears.push(elem.obs_yr);
//    });
//    availableObsYears.sort(function (a, b) {
//        return +a - +b;
//    });
//
//    // Create cells for each of the years to use as header
//    var years = "";
//    availableObsYears.forEach(function (year) {
//       years += "<th>" + year + "</th>";
//    });
//
//    $("#"+id).append('<tr id="head-row-'+id+'" class="table-row table-head"> <th>EDB</th>'+ years + '</tr>');
//
//    // An array of companies already processed
//    var done = [];
//    // Year done for edb
//    var yearDone = [];
//    var cellCount = 0; // For the id
//    var cellValues = []; // All the cell values
//    var rowCount = 0;
//    // Create the rows of data
//    for(var i = 0; i < tableRows.length; i++){
//        if(!done.includes(tableRows[i].edb)){
//            done.push(tableRows[i].edb);
//            var row= "<tr class='table-row' id=row"+id+rowCount+">";
//            // Insert name in column and assign an id to the row
//            row += "<th class='edb-cell'>" + tableRows[i].edb + "</th>";
//
//            for(var k = 0; k < availableObsYears.length; k++){
//                // Iterate through all rows finding ones with the current edb
//                for(var j = 0; j < tableRows.length; j++){
//
//                    // Check it matches edb and year inserting into
//                    if(tableRows[j].edb === tableRows[i].edb && tableRows[j].obs_yr === availableObsYears[k] && (!yearDone.includes(tableRows[j].obs_yr))){
//                        yearDone.push(tableRows[j].obs_yr);
//                        row += "<th origValue='"+ tableRows[j].value +"' class='cell "+availableObsYears[k]+"' id='t"+id+""+cellCount+"'>" + searchData.dpFormat(tableRows[j].value) + "</th>";
//                        // Save the value and the id of the cell to display percentage
//                        cellValues.push({ id : "#t"+id+""+cellCount, value : tableRows[j].value });
//                        cellCount++;
//                    }
//                }
//                yearDone = [];
//            }
//            $("#"+id).append(row + '</tr>'); // end and append the row
//
//            // Assing a on click function to each of the rows to generate the bar graph with the row specific data
//            $("#row"+id+rowCount).click(function(event) {
//               rowClicked(this.id); // Call the function to highlight the data in all graphs for the edb
//            });
//            rowCount++;
//        }
//    }
//
//    var percent = true;
//    if(id === "tableab" || "tablcd"){
//        percent = false;
//    } else {
//        percent = tableRows[0].units.includes('%') || tableRows[0].units.includes('portion');
//    }
//    applyGradientCSS(cellValues, percent);
//}
//
//
///**
// * Called when the user clicks on a row in a table
// *
// * @param id {String} The id of the row clicked
// * */
//function rowClicked(id){
//  if(rowSelected === id){// Clicked on the same row so unselect
//    // Remove all selected classes from elements
//    var text = $("#"+id+" .edb-cell").text();
//    highlight(text, true); // highlight and remove highlighting from bar graph
//    $('.table-row').find(".edb-cell:contains('"+text+"')").parent().removeClass("row-selected"); // Selects edb row in all tables
//    d3.selectAll(".line-selected-table").classed("line-selected", false);
//    d3.selectAll(".vec-dot-selected").classed("vec-dot-selected", false);
//    rowSelected = ""; // Nothing is selected
//    return;
//  }
//
//  // Remove the selected class from all rows
//  if(rowSelected !== ""){
//    var text = $("#"+rowSelected+" .edb-cell").text();
//    $('.table-row').find(".edb-cell:contains('"+text+"')").parent().removeClass("row-selected"); // Selects edb row in all tables
//  }
//  var text = $("#"+id+" .edb-cell").text();
//  rowSelected = id; // Set the selected row
//
//  // Get the edb from the selected row
//  var edb = $("#"+id+".edb-cell").text();
//
//  $('.table-row').find(".edb-cell:contains('"+text+"')").parent().addClass("row-selected"); // Selects edb row in all tables
//
//  // Select all lines with the selected class and remove class
//  d3.selectAll(".line-selected-table").classed("line-selected", false);
//  d3.selectAll(".vec-dot-selected").classed("vec-dot-selected", false);
//
//  // Select all rectangle with the correct EDB and outline bars
//  // Also removes the highlight of previous selection
//  highlight(text, false);
//  d3.selectAll("line."+text.replace(/ /g , "")).classed("line-selected-table", true);
//  d3.selectAll(".dot."+text.replace(/ /g , "")).classed("vec-dot-selected", true);
//
//  $('.table-edb').each(function(){
//    var idTable = (!(this.id.slice(-2).indexOf("e") > -1) ? this.id.slice(-2) : this.id.slice(-1));
//    var rowNumb = rowSelected.slice(-1);
//    // Need to account for numbers greater than 10
//    if(!isNaN(rowSelected.slice(-2))){
//      rowNumb = rowSelected.slice(-2);
//    }
//    var unit = "";
//    for(var i = 0; i < dataStructure.selectionTable.length; i++){
//      if(dataStructure.selectionTable[i].id === idTable){
//        unit = dataStructure.selectionTable[i].unit;
//      }
//    }
//    var id = "rowtable"+idTable+rowNumb;
//    showBarWithRowElem(id,text,"#bar-"+idTable,"#head-row-table"+idTable,"#table"+idTable,unit);
//  });
//}
//
//
///**
// * Called when the bar graph generated from a single row in a table needs to be updated
// * */
//function updateTableBarGraph(){
//  $('.table-edb').each(function(){
//    var idTable = (!(this.id.slice(-2).indexOf("e") > -1) ? this.id.slice(-2) : this.id.slice(-1));// Get the id of the table can be a,b,c,d,ab,cd therefore we have to check if it is two characters
//    var rowNumb = rowSelected.slice(-1);// Grab the row number which is the last character if less than the 10th row
//
//    // Need to account for numbers greater than 10
//    if(!isNaN(rowSelected.slice(-2))){
//      rowNumb = rowSelected.slice(-2);
//    }
//
//    var unit = "";
//    for(var i = 0; i < dataStructure.selectionTable.length; i++){
//      if(dataStructure.selectionTable[i].id === idTable){
//        unit = dataStructure.selectionTable[i].unit;
//      }
//    }
//
//    var id = "rowtable"+idTable+rowNumb;
//    var text = $("#"+id+" .edb-cell").text();
//    showBarWithRowElem(id,text,"#bar-"+idTable,"#head-row-table"+idTable,"#table"+idTable,unit);
//    });
//}
//
//
///**
// * Called when the bar graph generated from a single row in a totals table needs to be updated
// * */
//function updateTotalsBarGraph(){
//    $('.table-tot').each(function(){
//        //var idTable = this.id.slice(-1);
//        var idTable = (!(this.id.slice(-2).indexOf("l") > -1) ? this.id.slice(-2) : this.id.slice(-1));
//
//        var unit = "";
//        for(var i = 0; i < dataStructure.selectionTable.length; i++){
//            if(dataStructure.selectionTable[i].id === idTable){
//                unit = dataStructure.selectionTable[i].unit;
//            }
//        }
//
//        var rowNumb = totalsRowSelectedID.slice(-1);
//        var id = "row-tot-"+idTable+rowNumb;
//        var reg = $("#"+id+" .reg-cell").text();
//        showBarWithRowElem(id,reg,"#tot-bar-"+idTable,"#head-row-totals-"+idTable,"#table-total"+idTable,unit);
//    });
//}
//
//
///**
// * Called when the user clicks on a row in a totals table
// *
// * @param id {String} The id of the row clicked
// * */
//function totalsRowClicked (id){
//    var reg = $("#"+id+" .reg-cell").text();
//    if(totalsRowSelectedID === id){// Clicked on the same row so unselect
//        reg = $("#"+totalsRowSelectedID+" .reg-cell").text();
//
//        $('.table-row').find(".reg-cell:contains('"+reg+"')").filter(function() {
//            return $(this).text() === reg;
//        }).parent().removeClass("row-selected"); // Selects edb row in all tables
//        totalsRowSelectedID = "";
//        return;
//    }
//
//    if(totalsRowSelectedID !== ""){
//        var oldReg = $("#"+totalsRowSelectedID+" .reg-cell").text();
//        $('.table-row').find(".reg-cell:contains('"+oldReg+"')").filter(function() {
//            return $(this).text() === oldReg;
//        }).parent().removeClass("row-selected"); // Selects edb row in all tables
//    }
//
//    $('.table-row').find(".reg-cell:contains('"+reg+"')").filter(function() {
//        return $(this).text() === reg;
//    }).parent().addClass("row-selected"); // Selects edb row in all tables
//
//    // if id ends with letter set to id
//    totalsRowSelectedID = id;
//
//    $('.table-tot').each(function(){
//        var idTable = (!(this.id.slice(-2).indexOf("l") > -1) ? this.id.slice(-2) : this.id.slice(-1));
//
//        var unit = "";
//        for(var i = 0; i < dataStructure.selectionTable.length; i++){
//            if(dataStructure.selectionTable[i].id === idTable){
//                unit = dataStructure.selectionTable[i].unit;
//            }
//        }
//        var rowNumb = totalsRowSelectedID.slice(-1);
//        var id = "row-tot-"+idTable+rowNumb;
//        showBarWithRowElem(id,reg,"#tot-bar-"+idTable,"#head-row-totals-"+idTable,"#table-total"+idTable,unit);
//    });
//}
//
//
//
//
//
///**
// * highlights the cell based on the percentage of the max value in the table unless already a percentage
// *
// * @param cellValues {Object[]} value of a cell and the table cell id
// * @param percent {Boolean} if not a percent it should be highlighted based on the percentage of the max value in the cell
// * */
//function applyGradientCSS(cellValues, percent){
//    // Find the max value
//    var maxCellValue = -Infinity;
//    cellValues.forEach(function(elem){
//        maxCellValue = +elem.value > maxCellValue ? +elem.value : maxCellValue;
//    });
//
//    // Apllie css to each cell
//    for(var i = 0; i < cellValues.length; i++){
//        var value = (percent ? value : ((+cellValues[i].value / maxCellValue)*100)); // If percentage metric just use valud
//        $(cellValues[i].id).css({
//                "background" : "-webkit-gradient(linear, left top, right top, color-stop(" + value +"%,#7bbfd6), color-stop(" + value +"%,#FFF))",
//            }
//        );
//    }
//}
//
//var error = false;
//
///**
// * Called when user clicks search, checks if the search is valid if so creates url and searches.
// * */
//function search(){
//  if(!selectionRows.canSearch()){
//    if(!error){
//      $('#error-div').append('<h4 style="color : red;">Partial Row Selected</h4>');
//      error = true;
//    }
//    return; // First check if the selection is valid
//  }
//
//  var rows= {};
//
//  selectionRows.getAllSelectionData().forEach(function(selection){
//    if(selection.section !== ""){
//        rows["s"+selection.id] = selection.section;
//        rows["c"+selection.id] = selection.category;
//        rows["sc"+selection.id] = selection.subCategory;
//        rows["d"+selection.id] = selection.description;
//    }
//  });
//  window.location.replace("compare?" + serialise(rows)); // Replace the url with the selections url
//}
//
//
///**
// * Turns object in url string
// *
// * @param obj {Object} the object to turn into url
// * */
//function serialise(obj) {
//    var str = [];
//    for(var p in obj)
//        if (obj.hasOwnProperty(p)) {
//            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
//        }
//    return str.join("&");
//}
//
//
///**
// * Sets up rules for validating CPI fields. Must be a number 1-100
// * */
//function cpiValidationSetup(){
//    $.validator.setDefaults({
//            errorClass : 'help-block',
//            highlight: function (element) {$(element).closest('.form-group').addClass('has-error')},
//            unhighlight :function (element) {$(element).closest('.form-group').removeClass('has-error')}
//        }
//    );
//    var cpiRules = {required : true, number : true, min : 1, max : 100};
//    var messageSet = {
//        required : "Please enter a percentage",
//        number : "Please enter a valid number",
//        min : "Please enter a percentage greater than 0",
//        max : "Please enter a percentage less than 100"
//    };
//
//    $('#cpi-form').validate({
//        rules : {Y2012 : cpiRules,Y2013 : cpiRules,Y2014 : cpiRules,Y2015 : cpiRules,Y2016 : cpiRules},
//        messages : {Y2012 : messageSet,Y2013 : messageSet,Y2014 : messageSet,Y2015 : messageSet,Y2016 : messageSet}
//    });
//}
//
//
///**
// * Called when the apply button for CPI is clicked, calls a number of functions to add cpi to
// * all graphs and tables where is it applicable.
// * */
//function applyCPI(){
//    if($('#cpi-form').valid()){
//        if(noCPICells.length > 0){
//            revertCPI(); // Reverts cpi before instead of saving values with cpi already applied
//            var copyOfDataTables = dp.copyDataTables(searchData.tables); // Use the original data and create a copy of it
//            dataStructure = dp.createDataStructuresWithCopy(copyOfDataTables);
//        }
//        // CPI for 2012 - 2016
//        var cpiValues = [{year : 2012, value : +$('#Y2012').val()},{year : 2013, value : +$('#Y2013').val()},{year : 2014, value : +$('#Y2014').val()},{year : 2015, value : +$('#Y2015').val()},{year : 2016, value : +$('#Y2016').val()}];
//
//        // Applies CPI to all selected tables
//        dataStructure.selectionTable.forEach(function (table) {
//          if(table.unit.includes('$')){
//            applyCPIToTable('#table'+table.id,cpiValues);
//          }
//        });
//
//        // Go through each table and check if is should have cpi applied if so modify the rows
//        dataStructure.selectionData.forEach(function (table) {
//            if(table.unit.includes('$')){
//                applyCPIToTableRows(table.rows, cpiValues);
//            }
//        });
//
//        // At this point the rows have been updated so we can update the totals table
//        dataStructure.selectionTable.forEach(function (tableData) {
//            insertTotalsTable(tableData.rows, 'table-total'+tableData.id, regions,true, true);
//        });
//
//        showAllRegularGraphs(dataStructure.selectionData, false);
//        showAllCombinedGraphs(dataStructure.combineData, false);
//
//        // Updates the bar graphs for the two tables in all tabs that exist
//        updateTableBarGraph();
//        updateTotalsBarGraph();
//    }
//}
//
//
///**
// * Applies cpi values to the rows by chaning the value in each row with the compounded cpi values
// *
// * @param rows {Object[]} the rows
// * @param cpiValues {Object[]} contains the cpi for each year
// * */
//function applyCPIToTableRows(rows, cpiValues){
//
//    // Find the min and max year from the data
//    var minYear = rows.reduce(function(prev, curr) {
//        return prev.disc_yr < curr.disc_yr ? prev : curr;
//    }).obs_yr;
//
//    var maxYear = rows.reduce(function(prev, curr) {
//        return prev.disc_yr > curr.disc_yr ? prev : curr;
//    }).obs_yr;
//
//    for(var cur = minYear; cur <=maxYear; cur++){ // Go through each possible year
//        rows.forEach(function(elem, index){ // Grab every Row
//            var year = rows[index].obs_yr; // Grab the year of the cell by checking the class
//            var valueOfCell = rows[index].value;
//
//            for(var i = 0; i < cpiValues.length; i++){
//                if(cpiValues[i].year === cur){
//                    if(year <= cur){
//                        valueOfCell = valueOfCell * (1 + (cpiValues[i].value / 100));
//                    }
//                }
//            }
//            rows[index].value = valueOfCell; // CPI Applied value
//        });
//    }
//}
//
//
///**
// * Applies cpi values to the table
// *
// * @param table {String} the id of the div
// * @param cpiValues {Object[]} contains the cpi for each year
// * */
//function applyCPIToTable(table, cpiValues){
//    $('.cell', table).each(function(){ // Backup the values from the cells
//        noCPICells.push({id : $(this).attr('id'), value : $(this).text()});
//    });
//
//    var minYear = Infinity;
//    var maxYear = -Infinity;
//
//    $('.cell', table).each(function(){ //cell or th
//        var year = +$(this).attr("class").split(' ')[1];
//        minYear = year < minYear ? year : minYear;
//        maxYear = year > maxYear ? year : maxYear;
//    });
//
//    for(var cur = minYear; cur <=maxYear; cur++){ // Go through each possible year
//        $('.cell', table).each(function(){ // Grab every cell
//            var year = +$(this).attr("class").split(' ')[1]; // Grab the year of the cell by checking the class
//            var valueOfCell = $(this).attr("origvalue");
//            for(var i = 0; i < cpiValues.length; i++){
//                if(cpiValues[i].year === cur){
//                    if(year <= cur){
//                        valueOfCell = valueOfCell * (1 + (cpiValues[i].value / 100));
//                        valueOfCell = searchData.dpFormat(valueOfCell);
//                    }
//                }
//            }
//            $(this).text(valueOfCell); // CPI Applied value
//        });
//    }
//    applyGradientCSS(noCPICells); // Highlights the cell based on the value compared to the max in the table
//}
//
//
///**
// * Sets the value of cells back to the original value
// * */
//function revertCPI(){
//    noCPICells.forEach(function(e){
//        $('#'+e.id).text(searchData.dpFormat(e.value));
//    });
//    applyGradientCSS(noCPICells);
//}

// DEPENDENCIES DataProcessor, Database, Events

// Internet Explorer compatibility
if (!String.prototype.includes) {
    String.prototype.includes = function() {
        'use strict';
        return String.prototype.indexOf.apply(this, arguments) !== -1;
    };
}

if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, "includes", {
        enumerable: false,
        value: function(obj) {
            var newArr = this.filter(function(el) {
                return el == obj;
            });
            return newArr.length > 0;
        }
    });
}
// End Internet explorer compatibility

var CompareModule = (function(){

  // Init the data processor
  var dp = new DataProcessor();

  // Object that holds all the rows for each table along with a copy
  var backup = {};

  // Search error state
  var error = false;

  // Cache dom elements
  var $searchError = $('#error-div');

  /**
   * Turns object in url string
   *
   * @param obj {Object} the object to turn into url
   * */
  var serialise = function (obj) {
    var str = [];
    for(var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
  }


  /**
   * Called when the search button is clicked, checks if a valid search selection is made
   * if so inserts the search into the url to search.
   * */
  var search = function () {
    if (!selectionRows.canSearch()) {
      if (!error) {
        $searchError.append('<h4 style="color : red;">Partial Row Selected</h4>');
        error = true;
      }
      return; // First check if the selection is valid
    }

    var rows= {};
    selectionRows.getAllSelectionData().forEach(function(selection){
      if(selection.section !== ""){
          rows["s"+selection.id] = selection.section;
          rows["c"+selection.id] = selection.category;
          rows["sc"+selection.id] = selection.subCategory;
          rows["d"+selection.id] = selection.description;
      }
    });
    window.location.replace("compare?" + serialise(rows)); // Replace the url with the selections url
  }


  /**
   * Called when the page is loaded with a search in the url, fetches the relevant data from the database
   * using the db module
   * */
  var loadSearchFromURL = function (urlSelections) {
    selectionRows.init(urlSelections,true); // Set ups the selection rows

    Database.getRowsForSearch(urlSelections, function(rows){
      // set the rows tables and create a copy
      backup.selection  = new Selection(urlSelections[0],urlSelections[1],urlSelections[2],urlSelections[3]);
      backup.rows = rows
      backup.sortedRows = dp.filterRowsToTablesAndCopy(rows,backup.selection);

      var combinedData = [];
      backup.sortedRows.forEach(function(t){
        if(t.id === 'a'){
          $('#tab-a').addClass("in active");
        }
        if(t.id === 'ab' || t.id === 'cd'){
          combinedData.push(t);
        }
          $('#full-dash-'+ t.id).show();
      });

      if(combinedData.length === 2){
        showFullVectorGraph(combinedData, urlSelections, [backup.sortedRows[0].rows[0].units,backup.sortedRows[1].rows[0].units,backup.sortedRows[2].rows[0].units,backup.sortedRows[3].rows[0].units ]);
      }

      // Check if both AB and CD exist
      // Emit an event with the data
      events.emit("INIT_DATA", {data : backup.sortedRows});

      // Set default rows selected
      events.emit('ROW_CLICKED',  {rowID: "rowa0", rowNumb: 0, edb: "Alpine Energy"});
      events.emit("TOTAL_ROW_CLICKED", {rowID: "row-tot-a0", region: "South Island"});

    });
  }


  /**
   * Called when the apply cpi button is clicked. First checks
   * if cpi input is valid then copies rows and applies cpi to copy
   * */
  var applyCPI = function() {
    if(CPIModule.isValid() && backup.selection !== undefined){
      var copyOfRows  = dp.copyRows(backup.rows);
      applyCPIToTableRows(copyOfRows,CPIModule.getCPIValues());
      var newData = dp.filterRowsToTablesAndCopy(copyOfRows,backup.selection);

      // Send event to update table and graphs
      events.emit("ROW_UPDATE", {data : newData });
      events.emit("APPLY_CPI", {cpiValues : CPIModule.getCPIValues()});
    }
  }


  /**
   * Applies cpi values to the rows by chaning the value in each row with the compounded cpi values
   *
   * @param rows {Object[]} the rows
   * @param cpiValues {Object[]} contains the cpi for each year
   * */
  var applyCPIToTableRows = function (rows, cpiValues) {
    var applicableRows = rows.filter(function(r){
      return r.units.includes('$');
    });
    if(applicableRows.length === 0){
      return;
    }


    // Find the min and max year from the data
    var minYear = applicableRows.reduce(function(prev, curr) {
      return prev.disc_yr < curr.disc_yr ? prev : curr;
    }).obs_yr;

    var maxYear = applicableRows.reduce(function(prev, curr) {
      return prev.disc_yr > curr.disc_yr ? prev : curr;
    }).obs_yr;

    for(var cur = minYear; cur <=maxYear; cur++){ // Go through each possible year
      applicableRows.forEach(function(elem, index){ // Grab every Row
        var year = applicableRows[index].obs_yr; // Grab the year of the cell by checking the class
        var valueOfCell = applicableRows[index].value;

        for(var i = 0; i < cpiValues.length; i++){
          if(cpiValues[i].year === cur){
            if(year <= cur){
              valueOfCell = valueOfCell * (1 + (cpiValues[i].value / 100));
            }
          }
        }
        applicableRows[index].value = valueOfCell; // CPI Applied value
      });
    }
  }


  // Array with both things in it
  function showFullVectorGraph(data, selections, units) {


        // Grab a title
        var atitle = selections[0].category + ", " + selections[0].subCategory + ", " + selections[0].description;
        var btitle = selections[1].category + ", " + selections[1].subCategory + ", " + selections[1].description;
        var ctitle = selections[2].category + ", " + selections[2].subCategory + ", " + selections[2].description;
        var dtitle = selections[3].category + ", " + selections[3].subCategory + ", " + selections[3].description;

        var ratio = '<h3> Ratio (A / B ) over ( C / D ) </h3>'
        var spanA = '<span class="letter">A: </span>';
        var spanB = '<span class="letter">B: </span>';
        var spanC = '<span class="letter">C: </span>';
        var spanD = '<span class="letter">D: </span>';


        var combineA = '<h4 class="title">'+spanA+' '+ atitle +'</h4>';
        var combineB = '<h4 class="title">'+spanB+' '+ btitle +'</h4>';
        var combineC = '<h4 class="title">'+spanC+' '+ ctitle +'</h4>';
        var combineD = '<h4 class="title">'+spanD+' '+ dtitle +'</h4>';

        $('#title-vector-abcd').append(ratio).append(combineA).append(combineB).append(combineC).append(combineD);

        VectorModule.createVectorGraph(dp.createDataForVectorGraph(data[0].rows,data[1].rows), units[0] + " / " + units[1] ,units[2] + " / " + units[3] ,"#vector-graph-abcd");
        $('#vector-full-abcd').show();
  }


  /**
   * Called when revert cpi is clicked send out events with to
   * notify that cpi needs to be reverted
   * */
  var revertCPI = function () {
    events.emit("ROW_UPDATE", {data : backup.sortedRows });
    events.emit("REVERT_CPI", {cpiValues : ""});
  }


  return {
    loadSearchFromURL : loadSearchFromURL,
    search : search,
    applyCPI : applyCPI,
    revertCPI : revertCPI
  }
})();


$(document).ready( function() {
    // Highlight the selected link
    $(".nav-link").removeClass('active');
    $("#benchmarks-link").addClass('active');
    $('#search-btn-compare').click(function(){ // Listener to search button
        CompareModule.search(); // Search encodes the selections into the url and sends to server
    });
    $('cpi').click(function(){
      CompareModule.applyCPI();
    });
});

var CPIModule = (function(){

  // Graph and cache
var $cpiForm = $('#cpi-form');

// set up validation rules
$.validator.setDefaults({
        errorClass : 'help-block',
        highlight: function (element) {$(element).closest('.form-group').addClass('has-error')},
        unhighlight :function (element) {$(element).closest('.form-group').removeClass('has-error')}
    }
);

// Set the rules for each input
var cpiRules = {required : true, number : true, min : 0.1, max : 100};
var messageSet = {
    required : "Please enter a percentage",
    number : "Please enter a valid number",
    min : "Please enter a percentage greater than 0",
    max : "Please enter a percentage less than 100"
};


$cpiForm.validate({
    rules : {Y2012 : cpiRules,Y2013 : cpiRules,Y2014 : cpiRules,Y2015 : cpiRules,Y2016 : cpiRules},
    messages : {Y2012 : messageSet,Y2013 : messageSet,Y2014 : messageSet,Y2015 : messageSet,Y2016 : messageSet}
});

var getCPIValues = function () {
  return  [{year : 2012, value : +$cpiForm.find('#Y2012').val()},
           {year : 2013, value : +$cpiForm.find('#Y2013').val()},
           {year : 2014, value : +$cpiForm.find('#Y2014').val()},
           {year : 2015, value : +$cpiForm.find('#Y2015').val()},
           {year : 2016, value : +$cpiForm.find('#Y2016').val()}]
}

var isValid = function () {
    return $cpiForm.valid();
}


return {
  getCPIValues : getCPIValues,
  isValid : isValid
}

})();

var dp = new DataProcessor();

/**
 * Object contains a number of functions to manipulate data from the database
 * */
function DataProcessor(){}


/**
 * Creates of copy of the dataTables object. Copies each table and its values for each row.
 *
 * @param dataTables {Object} contains 6 arrays of rows one for each table. Attribute can be undefined if table does not exist
 * @returns {object} A copy of the dataTables object
 * */
DataProcessor.prototype.copyDataTables = function(dataTables) {
  var origTables = [dataTables.tableA,dataTables.tableB,dataTables.tableC,dataTables.tableD,dataTables.tableAB,dataTables.tableCD]; // Add tables to array to iterate over them
  var tables = [[],[],[],[],[],[]]; // Empty arrays to insert new rows with values that are copies of the original

  // Iterate over the original tables
  for(var j = 0; j < origTables.length; j++){
      var a = origTables[j]; // Grab the current table with index i
      if(a !== undefined){ // It might not exist due to it not being selected by the user
          for(var i = 0; i < a.length; i++){ // For every row copy all the fields
              tables[j].push({category :a[i].category, description : a[i].description,disc_yr: a[i].disc_yr,edb: a[i].edb,
                  fcast_yr: a[i].fcast_yr,network:a[i].network,note:a[i].note,obs_yr:a[i].obs_yr,p_key: a[i].p_key,sch_ref:a[i].sch_ref,
                  schedule:a[i].schedule,section:a[i].section,sub_category: a[i].sub_category,units:a[i].units,value:a[i].value})
          }
      }
  }
  return new DataTables(tables[0],tables[1],tables[2],tables[3],tables[4],tables[5]); // Return the copy
}

DataProcessor.prototype.copyRows = function (rows) {
    var newRows = [];
    rows.forEach(function(r){
      newRows.push({value : r.value, category :r.category, description : r.description,disc_yr: r.disc_yr,edb: r.edb,
          fcast_yr: r.fcast_yr,network: r.network,note:  r.note,obs_yr: r.obs_yr,p_key: r.p_key,sch_ref: r.sch_ref,
          schedule: r.schedule,section: r.section,sub_category: r.sub_category,units: r.units})
    });
    return newRows;
}


/**
 * Creates and object with three arrays that are used to iterate over and add the data to the page. The structure simplifies
 * creation of table, graphs and combined graphs.
 *
 * @param dataTables {Object} contains 6 arrays of rows one for each table. Table array can be empty if table does not exist
 * @returns {object} Data structure
 * */
DataProcessor.prototype.createDataStructuresWithCopy = function (copyOfDataTables){
    var selectionDataArray = []; // Used to create the regular graphs
    var selectionTablesArray = []; // Tables also contains combined data
    var combinedSelectionDataArray = []; // Used to create vector graphs

    // An array of true or false values if a table contains values
    var selectedRows = [copyOfDataTables.tableA.length > 0,copyOfDataTables.tableB.length > 0,copyOfDataTables.tableC.length > 0,copyOfDataTables.tableD.length > 0];

    // An array with the tables data
    var tables = [copyOfDataTables.tableA,copyOfDataTables.tableB,copyOfDataTables.tableC,copyOfDataTables.tableD,copyOfDataTables.tableAB,copyOfDataTables.tableCD];

    // Creates the 4 normal tables and the combined tables
    var ids = ['a','b','c','d','ab','cd']; // The id's line up with the tables array to add an id to each row
    for(var i = 0; i < selectedRows.length; i++){
        if(selectedRows[i]){ // Only go through table if it has rows
            var subtitle = tables[i][0].section + ", " + tables[i][0].category; // Create subtitle with section and category

            // Check if sub category is null if so just use description else also use sub category
            var title = tables[i][0].sub_category === null ? tables[i][0].description : tables[i][0].sub_category + ", " + tables[i][0].description;

            // Add a row along with the id of the table the title, subtitle and unit to both table and selection arrays
            selectionTablesArray.push(new SelectedTableData(tables[i],ids[i],title,subtitle, tables[i][0].units));
            selectionDataArray.push(new SelectionData(tables[i], title, subtitle ,tables[i][0].units,ids[i]));

            // Check for combined special case, if A or C exist it is possible a combined table needs to be created
            if(ids[i] === 'a' || ids[i] === 'c'){
                if(selectedRows[i+1]){ // Check that a selections has been made if so create the combined table
                    var jump = i === 0 ? 4 : 3; // If 0 need to jump to the location of ab table else jump to location of cd table
                    var subTitleJump = tables[i+1][0].section + ", " + tables[i+1][0].category;
                    var titleJump = tables[i+1][0].sub_category === null ? tables[i+1][0].description : tables[i+1][0].sub_category + ", " + tables[i+1][0].description;
                    selectionTablesArray.push(new SelectedTableData(tables[i+jump],ids[i+jump], title + ", " + subtitle, titleJump + ", " + subTitleJump, tables[i+1][0].units));
                    combinedSelectionDataArray.push(new SelectionDataCombined(tables[i+jump],tables[i],tables[i+1], title + " " + subtitle, titleJump + " " + subTitleJump,tables[i][0].units,tables[i+1][0].units,ids[i+jump])); // TODO ask how to format titles for combined
                }
            }
        }
    }
    return new DataStructure(selectionDataArray,selectionTablesArray,combinedSelectionDataArray);
}


/**
 * Checks if the selections the user has made are complete. For example if a selection is made for a section in a row the category
 * also has to be chosen along with a description and sub category if it exists.
 *
 * @param selections {Object} the currently selected sections for each row, an array of 4 selection rows
 * @param validOptions {Object} contains if a row has a sub category or not false if no sub category
 * @returns {Boolean} true if a valid search false if not
 * */
DataProcessor.prototype.validateSearchParams = function (selections, validOptions){
    var returnVal = true;
    selections.forEach(function (elem, i) {
        if(elem.subCategory === "" && validOptions[i]){ // Valid options holds if there is a possible option to choosefrom in the select drop down
            returnVal = false; // There is a possible sub category so it has to be chosen from
        }

        // Checks if one of the selections is empty
        if(elem.section === "" || elem.category === "" || elem.description === ""){
            // Now check if one of the selections is not empty
            if(elem.section !== "" || elem.category !== "" || elem.description !== ""){
                returnVal = false; // A row cannot have one item selected and another empty
            }
        }
    });
    return returnVal;
}


/**
 * Checks if a row from the database matches the selection from the user. This is used because the user can make four different
 * selections and the query for the database retuns all the rows for all the sections.
 *
 * @param DBRow {Object} A row from the database contains all the fields
 * @param Selection {Object} contains section, category, sub category and description from a user selection
 * @returns {Boolean} true if a database row belongs to the user selection
 * */
DataProcessor.prototype.matchDBRow = function (DBRow, selection) {
  if(DBRow.section === selection.section && DBRow.category === selection.category && DBRow.description === selection.description){
      if(DBRow.sub_category !== null){
          return selection.subCategory === DBRow.sub_category; // Sub cat could be null but would still match
      }
      return selection.subCategory === ""; // Has to also be empty
  }
  return false;
}


/**
 * Takes rows from database query result and splits into corresponding table. Uses the matchDBRow function to match
 * a row to a selection. Once filtered creates and object containing each table and the rows
 *
 * Also creates the combined tables by using the combineTable function and adds the combined tables to the returned
 * object.
 *
 * Note any null values in the rows are changed to 0
 *
 * @param rows {Object} All the rows from the users selections
 * @param search {Object} object that contains the four different selections the user may have made
 * @returns {Object} An object that contains a property for each table which is an array with the corresponding rows
 * */
DataProcessor.prototype.filterRowsToTables = function (rows, search) {

  // Create four arrays for the different rows that belong to each of the searches
  var aRows = rows.filter(function(e){return dp.matchDBRow(e,search.aTable);});
  var bRows = rows.filter(function(e){return dp.matchDBRow(e,search.bTable);});
  var cRows = rows.filter(function(e){return dp.matchDBRow(e,search.cTable);});
  var dRows = rows.filter(function(e){return dp.matchDBRow(e,search.dTable);});

  // Set all null values in rows to 0
  aRows.forEach(function(e){if(e.value === null){e.value = 0;}});
  bRows.forEach(function(e){if(e.value === null){e.value = 0;}});
  cRows.forEach(function(e){if(e.value === null){e.value = 0;}});
  dRows.forEach(function(e){if(e.value === null){e.value = 0;}});


  var tables = [];
  if(aRows.length > 0){
    tables.push({ id : 'a', rows : aRows, search : search.aTable});
  }

  // Create combined tables if possible
  if(aRows.length > 0 && bRows.length > 0){
      var abRows = dp.combineTables(aRows,bRows);
  }

  if(cRows.length > 0 && dRows.length > 0){
      var cdRows = dp.combineTables(cRows,dRows);
  }

  return new DataTables(aRows,bRows,cRows,dRows, abRows, cdRows);
}



// START NEW
/**
 * Takes rows from database query result and splits into corresponding table. Uses the matchDBRow function to match
 * a row to a selection. Once filtered creates and object containing each table and the rows
 *
 * Also creates the combined tables by using the combineTable function and adds the combined tables to the returned
 * object.
 *
 * Note any null values in the rows are changed to 0
 *
 * @param rows {Object} All the rows from the users selections
 * @param search {Object} object that contains the four different selections the user may have made
 * @returns {Object} An object that contains a property for each table which is an array with the corresponding rows
 * */
DataProcessor.prototype.filterRowsToTablesAndCopy = function (rows, search) {

  // Create four arrays for the different rows that belong to each of the searches
  var aRows = rows.filter(function(e){return dp.matchDBRow(e,search.aTable);});
  var bRows = rows.filter(function(e){return dp.matchDBRow(e,search.bTable);});
  var cRows = rows.filter(function(e){return dp.matchDBRow(e,search.cTable);});
  var dRows = rows.filter(function(e){return dp.matchDBRow(e,search.dTable);});

  // Set all null values in rows to 0
  aRows.forEach(function(e){if(e.value === null){e.value = 0;}});
  bRows.forEach(function(e){if(e.value === null){e.value = 0;}});
  cRows.forEach(function(e){if(e.value === null){e.value = 0;}});
  dRows.forEach(function(e){if(e.value === null){e.value = 0;}});

  // Create combined tables if possible
  if(aRows.length > 0 && bRows.length > 0){
      var abRows = dp.combineTables(aRows,bRows);
  }

  if(cRows.length > 0 && dRows.length > 0){
      var cdRows = dp.combineTables(cRows,dRows);
  }

  var copy = this.copyDataTables(new DataTables(aRows,bRows,cRows,dRows,abRows,cdRows));

  var tables = [];
  if(aRows.length > 0){
    tables.push({ id : 'a', rows : copy.tableA, search : search.aTable, combined : false});
  }

  if(bRows.length > 0){
    tables.push({ id : 'b', rows : copy.tableB, search : search.bTable, combined : false});
  }

  if(cRows.length > 0){
    tables.push({ id : 'c', rows : copy.tableC, search : search.cTable, combined : false});
  }

  if(dRows.length > 0){
    tables.push({ id : 'd', rows : copy.tableD, search : search.dTable, combined : false});
  }



  // Create combined tables if possible
  if(aRows.length > 0 && bRows.length > 0){
      tables.push({ id : 'ab', rows : copy.tableAB, table1Rows : copy.tableA, table2Rows : copy.tableB, search : search.aTable, search2 : search.bTable, combined : true});
  }

  if(cRows.length > 0 && dRows.length > 0){
      var cdRows = dp.combineTables(cRows,dRows);
      tables.push({ id : 'cd', rows : copy.tableCD, table1Rows : copy.tableC, table2Rows : copy.tableD, search : search.cTable, search2 : search.dTable, combined : true});
  }
  return tables;
}
// END NEW



/**
 * Combines the two tables by going through each row and dividing the value of table1 to the corresponding value from
 * a row in table 2
 *
 * Note if table 2 value is 0 it is divided by 1 instead
 *
 * @param table1Rows {Object} An array of rows that belong to one table
 * @param table2Rows {Object} An array of rows that belong to another table
 * @returns {Ojbect[]} An array of rows as a result of combining table1 and table2
 * */
DataProcessor.prototype.combineTables = function(table1Rows, table2Rows) {
  var combined = [];
  var at = table1Rows;
  var bt = table2Rows;

  for(var i = 0; i < at.length; i++){
      for(var j = 0; j < bt.length; j++){
          if(at[i].edb === bt[j].edb && at[i].obs_yr === bt[j].obs_yr && at[i].disc_yr === bt[j].disc_yr){
              combined.push({ disc_yr : bt[j].disc_yr ,
                  edb : bt[j].edb,
                  obs_yr : bt[j].obs_yr,
                  value : at[i].value / (bt[j].value === '0' || bt[j].value === 0 ? 1 : bt[j].value), // Divide the value if va if dividing by 0 make it 1
                  section : bt[j].section + "" + bt[j].description + " over ", // Bit of a hack as description is inserted after section, this way both titles are added to table
                  description : at[i].section + " " + at[i].description,
                  unitA : at[i].units,
                  unitB : bt[j].units,
                  unit : at[i].units +" / " +  bt[j].units
              });
              break; // can exit the loop
          }
      }
  }
  return combined;
}


/**
 * Creates the data from the table rows used by the vector graph. Each entry in the array contains the edb an array of years with the value from
 * table a and table b.
 *
 * @param table1Rows {Object} An array of rows that belong to one table
 * @param table2Rows {Object} An array of rows that belong to another table
 * @returns {Ojbect[]} Data for the vector graph in the form [{ EDB, [ { year1, valueA, valueB }, {year2, valueA, valueB },...]}]
 * */
DataProcessor.prototype.createDataForVectorGraph = function(table1Rows,table2Rows) {
    var at = table1Rows;
    var bt = table2Rows;
    var edbDone = []; // The edbs that have been processed
    var vecData = []; // The final entry in the form { EDB, [ { year1, valueA, valueB }, {year2, valueA, valueB }]}

    var availableObsYears = []; // The years for both table 1 and table 2
    table1Rows.forEach(function (row1) {
        if(!availableObsYears.includes(row1.obs_yr)){
            // Check if the second set of rows also contains the year
            for(var i = 0; i < table2Rows.length; i++){
              if(table2Rows[i].obs_yr === row1.obs_yr){
                  availableObsYears.push(row1.obs_yr);
                  break;
              }
            }
        }
    });

    // Go through every row
    for (var i = 0; i < at.length; i++) {
        // Check if the EDB has already been processed
        if (!edbDone.includes(at[i].edb)) {

            // Grab all the rows for the current edb in both tables
            var edbRowsAt = at.filter(function (d) {
                return d.edb === at[i].edb
            });
            var edbRowsBt = bt.filter(function (d) {
                return d.edb === at[i].edb
            });
            edbDone.push(at[i].edb); // Add year to done so it is not repeated
            var yearsDone = []; // Processed years
            var edbYearArray = [];

            // Iterate through rows in edb
            for (var j = 0; j < edbRowsAt.length; j++) {

                // Check it has not been processed
                if (!yearsDone.includes(edbRowsAt[j].disc_yr) && availableObsYears.includes(edbRowsAt[j].disc_yr)) {
                    yearsDone.push(edbRowsAt[j].disc_yr); // Add to processed

                    // Here we have to rows for a particular year for a particular edb now we can create the entry
                    var yearRowsAt = edbRowsAt.filter(function (d) {
                        return d.disc_yr === edbRowsAt[j].disc_yr
                    });
                    var yearRowsBt = edbRowsBt.filter(function (d) {
                        return d.disc_yr === edbRowsAt[j].disc_yr
                    });

                    if(!(yearRowsAt.length == yearRowsBt.length )){
                        return [];
                    }

                    for (var k = 0; k < yearRowsAt.length; k++) {
                        edbYearArray.push({
                            year: +yearRowsAt[k].disc_yr,
                            valueA: +yearRowsAt[k].value,
                            valueB: +yearRowsBt[k].value
                        });
                    }
                }
            }
            edbYearArray.sort(function (a,b) {
                return a.year - b.year;
            });
            vecData.push({edb: at[i].edb, years: edbYearArray});
        }
    }
    return vecData;
}


/**
 * Creates the data from the table rows which is then used by the box plot.
 *
 * @param tableRows {Object} The rows from the table the box plot is visualising
 * @returns {Ojbect[]} Data for the box plot
 * */
DataProcessor.prototype.createDataForBoxPlot = function (tableRows){
    var yearsDone = []; // Years processed
    var years = []; // Will contain an array of rows for each year

    for(var i = 0; i < tableRows.length; i++){
        if(!yearsDone.includes(tableRows[i].obs_yr)){
            years.push(tableRows.filter(function(e){return e.obs_yr === tableRows[i].obs_yr}));
            yearsDone.push(tableRows[i].obs_yr);
        }
    }

    var data = []; // Each entry will be an array where array[0] = year and array[1] = values for that year
    var sValues = []; // Data for the scatter plot on top of box plot
    var min = Infinity;
    var max = -Infinity;

    for(var i = 0; i < years.length; i++){
        var entry = [];
        entry[0] = ""+years[i][0].obs_yr; // Name of the box plot convert year to string
        var year = ""+years[i][0].obs_yr;
        var values = [];

        for(var j = 0; j < years[i].length; j++){
            var curValue = +years[i][j].value;
            var edb = years[i][j].edb;

            if (curValue > max){
                max = curValue;
            }
            if (curValue < min){
                min = curValue;
            }
            values.push(curValue);
            sValues.push({year : year ,edb : edb, value : curValue});
        }
        entry[1] = values;
        data.push(entry);
    }
    data.sort(function(a,b){
        return a[0] - b[0];
    });
    return {min : min, max : max, data : data, scatterData : sValues};
}


/**
 * Creates the data from the table rows which is then used by the grouped bar graph.
 *
 * @param tows {Object} The rows from the table the bar graph is visualising
 * @returns {Ojbect[]} Data for the bar graph
 * */
DataProcessor.prototype.createDataForGroupedGraph = function(rows){
    var availableObsYears = [];

    rows.forEach(function (elem) {
        if(!availableObsYears.includes(elem.obs_yr))availableObsYears.push(elem.obs_yr);
    });
    availableObsYears.sort(function (a, b) {
        return +a - +b;
    });

    var data = [];
    var edbDone = [];

    for(var i = 0; i < rows.length; i++){
        if(!edbDone.includes(rows[i].edb)){
            edbDone.push(rows[i].edb);

            var entry = { "edb" : rows[i].edb};

            entry[rows[i].obs_yr] = +rows[i].value;
            data.push(entry);
        } else {
            for(var j = 0; j < data.length; j++){
                if(data[j].edb === rows[i].edb){
                    data[j][rows[i].obs_yr] = +rows[i].value;
                }
            }
        }
    }
    return {data : data, keys : availableObsYears};
}


/**
 * Sorts the sections
 *
 * @param rows {Object} data object that contains the sections array
 * */
DataProcessor.prototype.sortSections = function(data) {
  data.sections.sort(function(a,b){
      // First check simple case of number difference
      var i = 0;
      while(!isNaN(a.charAt(i))){i++}
      var numberA = a.substring(0,i); // Gets the number from the section

      i = 0;
      while(!isNaN(b.charAt(i))){i++}
      var numberB = b.substring(0,i);

      if(numberA !== numberB) {
          return numberA - numberB;
      }
      return [a,b].sort()[0] === a ? -1 : 1; // Sort two names and return the first
  });
}


/**
 * Applies a CPI consumer price index percentage to each of the rows values. The cpiValues contains a value for each of the years.
 *
 * The CPI is apploed by starting at the year the value was observed at compounding the cpi values until the last year in the
 * cpiValues object.
 *
 * @param rows {Object} The rows cpi will be applied to
 * @param cpi values {Object} The values to add to each year
 * */
DataProcessor.prototype.applyCPIToTableRows = function(rows, cpiValues){
    // Find the min and max year from the data
    rows.forEach(function(elem, index){ // Grab every Row
        var year = rows[index].obs_yr; // Grab the year of the cell by checking the class
        var valueOfCell = rows[index].value;

        for(var i = 0; i < cpiValues.length; i++){
            if(year <= cpiValues[i].year){
                valueOfCell = valueOfCell * (1 + (cpiValues[i].value / 100));
            }
        }
        rows[index].value = valueOfCell; // CPI Applied value
    });
}


/**
 * Adds in a section, category, sub category, or description to a row in selections. The id is used to
 * work out which row it goes in. The type is used for working out which property to set
 *
 * @param id {Number} the id of the selection row
 * @param type {String} the type of selection section, category etc.
 * @param selections {Object[]} The array of rows to set the selection in
 * */
DataProcessor.prototype.addToSelection = function (id,type,data,selections) {

    for(var i = 0; i < selections.length; i++){
        if(selections[i].id+"" === id+""){ // Convert them both to strings
            if(type === "section"){
                selections[i].section = data;
            } else if(type === "category"){
                selections[i].category = data;
            } else if(type === "subcategory"){
                selections[i].subCategory = data;
            } else if(type === "description"){
                selections[i].description = data;
            }
        }
    }
}


/**
 * Works out the total for each region based on the edb for each row and which region it is part of
 *
 * @param tableRows {Object[]} the rows from a table
 * @param regions {Object[]} An array of regions and which edbs make up that region
 * @param availableYears {Object[]} The years that totals should be created for
 * @returns {Object} contains each region and an array of years along with totals for that year
 * */
DataProcessor.prototype.createTableTotals = function (tableRows, regions, availableObsYears) {
    var regionStrings = ["n","uni","eni", "swni", "s", "usi", "lsi"]; // All the regions
    var totals = {}; // reg : "" , years : []

    // Go through every year
    for(var i = 0; i < availableObsYears.length; i++){
        // Get the rows for the current year
        tableRows.filter(function(e){return e.obs_yr === availableObsYears[i];}).forEach(function(row){

            // Go through each of the regions
            regionStrings.forEach(function(regionString){
                // If the current row edb is inside the current reqion grab the value from the row and add it in the array for the current year
                if(regions[regionString].includes(row.edb)){
                    if(totals[regionString] === undefined){
                        totals[regionString] = [+row.value]; // First time this reqion has been found so have to create the property
                    } else {
                        if(i === totals[regionString].length){ // This means we have moved onto a new year so have to create a new slot
                            totals[regionString].push(+row.value);
                        } else {
                            totals[regionString] [i] += + (+row.value); // Still in the first year with a different edb in the same region so just add the values
                        }
                    }
                }
            });
        });
    }
    var nz = []; // To find the totals of NZ add north and south tegether
    for(var i = 0; i < availableObsYears.length; i++){
        nz.push(totals["n"][i] + totals["s"][i]);
    }
    totals["nz"] = nz; // Add the NZ property to totals
    return totals;
}


/**
 * The data structure object
 *
 * @param selectionsData {Object[]} Used for creating regular graphs
 * @param selectionTable{Object[]} Used for creating the html tables
 * @param combineData {Object[]} Used for the vector graphs
 * */
function DataStructure(selectionData, selectionTable, combineData){
    this.selectionData = selectionData; // Contains the rows, id, title, subtitle amd init for each selection
    this.selectionTable = selectionTable; // Contains the rows, id, title, subtitle amd init for each table
    this.combineData = combineData; // Contains combined rows along with titles and units
}


/**
 * Object for holding the users selections each property contains a
 * section, category, sub category and description. They can be empty strings
 *
 * @param a {Object} A selection
 * @param b {Object} B selection
 * @param c {Object} C selection
 * @param d {Object} D selection
 * */
function Selection(a,b,c,d){
    this.aTable = a;
    this.bTable = b;
    this.cTable = c;
    this.dTable = d;
}


/**
 * Object for holding the rows that belong to each of the table selections.
 * Also contains the combined tables. Each of the arrays could be empty if no
 * selection was made for a table
 *
 * @param tableA {Object[]} A selection
 * @param tableB {Object[]} B selection
 * @param tableC {Object[]} C selection
 * @param tableD {Object[]} D selection
 * @param tableAB {Object[]} AB selection
 * @param tableCD {Object[]} CD selection
 * */
function DataTables(tableA,tableB,tableC,tableD,tableAB,tableCD){
    this.tableA = tableA;
    this.tableB = tableB;
    this.tableC = tableC;
    this.tableD = tableD;
    this.tableAB = tableAB;
    this.tableCD = tableCD;
}


/**
 * Contains data for a particular selection. The rows that belong to the sections and
 * the shared title subtitle and unit.
 * */
function SelectionData(rows,title,subTitle,unit,id){
    this.rows = rows;
    this.title = title;
    this.subTitle = subTitle;
    this.id = id;
    this.unit = unit;
}


/**
 * Contains data for a particular selection. The rows that belong to both tables and the combined rows
 * */
function SelectionDataCombined(rows, table1Rows,table2Rows,title1,title2,unit1,unit2,id){
    this.rows = rows; // Combined rows
    this.title1 = title1;
    this.title2 = title2;
    this.unit1 = unit1;
    this.unit2 = unit2;
    this.id = id;
    this.table1Rows = table1Rows;
    this.table2Rows = table2Rows;
}


/**
 * Contains data for a particular selection. The rows that belong to the sections and
 * the shared title subtitle and unit. Used to generate html tables
 * */
function SelectedTableData(rows,id, title, subTitle, unit){
    this.rows = rows;
    this.id = id;
    this.title = title;
    this.subTitle = subTitle;
    this.unit = unit;
}

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

// Contains information for a row of selections
// Recieves events from selectors when the selection changes and updates it's state
// Send out events when selectors change and other selectors should be notified
function SelectionRowController(id){
    this.idNumb = id;
    this.rowSelections = { id : id, section : "", category : "", subCategory : "", description : "" };

    this.setInitialState = function (rowData) {
      this.rowSelections = rowData;
    }

    this.clear = function () {
      this.rowSelections = { id : this.id, section : "", category : "", subCategory : "", description : "" };
    }

    this.validSelection = function () {
      if(this.rowSelections.section !== "" && this.rowSelections.description === ""){
          return false;
      }
      return true;
    }

    this.initEventListener = function (urlSelections) {
      var id = this.idNumb;
      var urlSelection = urlSelections.filter(function(e){return (e.id === id)})[0];

      this.rowSelections.section = urlSelection.section;
      this.rowSelections.category = urlSelection.category;
      this.rowSelections.subCategory = urlSelection.subCategory;
      this.rowSelections.description = urlSelection.description;
    }

    this.updateSection = function (update) {
        if(update.id === this.idNumb){
          this.rowSelections.category = "";
          this.rowSelections.subCategory = "";
          this.rowSelections.description = "";
          // Set the new selected section
          this.rowSelections.section = update.section;
          events.emit("NEW_SECTION", {id : this.idNumb, selection : this.rowSelections});
        }
    }

    this.updateCategory = function (update) {
        if(update.id === this.idNumb){
          this.rowSelections.subCategory = "";
          this.rowSelections.description = "";

          this.rowSelections.category = update.category;
          events.emit("NEW_CATEGORY", {id : this.idNumb, selection : this.rowSelections});
        }
    }

    this.updateSubCategory = function (update) {
        if(update.id === this.idNumb){
          this.rowSelections.description = "";

          this.rowSelections.subCategory = update.subCategory;
          events.emit("NEW_SUBCATEGORY", {id : this.idNumb, selection : this.rowSelections});
        }
    }

    this.updateDescription = function (update) {
        if(update.id === this.idNumb){
          this.rowSelections.description = update.description;
          events.emit("NEW_DESCRIPTION", {id : this.idNumb, selection : this.rowSelections});
        }
    }

    this.getRowSelection = function () {
        return this.rowSelections;
    }

    // If any of these events call the update function
    events.on("SECTION_CHANGED", this.updateSection.bind(this));
    events.on("CATEGORY_CHANGED", this.updateCategory.bind(this));
    events.on("SUBCATEGORY_CHANGED", this.updateSubCategory.bind(this));
    events.on("DESCRIPTION_CHANGED", this.updateDescription.bind(this));
    events.on("INIT_SELECTIONS", this.initEventListener.bind(this));
}


var selectionRows =  (function(){
    // First create the empty selectiondatarows which are used to store the current selections
    var rowsData = [new SelectionRowController(0),new SelectionRowController(1),new SelectionRowController(2),new SelectionRowController(3)];

    // Next create the object that hold the logic for the selectors

    var selectors = [];
    for(var i = 0; i < 4; i++){
      selectors.push({ s : new SectionSelect(i), c : new CategorySelect(i), sc : new SubCategorySelect(i), d : new DescriptionSelect(i)});
    }

    var getAllSelectionData = function () {
      var selections = [];
      rowsData.forEach(function(r){
        selections.push(r.getRowSelection());
      });
      return selections;
    }


    var canSearch = function () {
        for(var i = 0; i < rowsData.length; i++){
          if(!rowsData[i].validSelection())return false;
        }
        return true;
    }

    /**
     * Loads in options for each selection drop down from a search.
     * When the page is loaded from a search the option for that search need to be inserted
     *
     * @param selection {Object} one row of selections (section, category etc)
     * */
    var setSelectionsFromURL = function(selection){
        // Find all the categories associated with selected section
        Database.getCategoriesFromDatabase(selection.section, function (categories,noResult) {
          if(!noResult){
            addOptionsToSelector('#category-select'+selection.id,categories, selection.category);
          }});

        // Find all the  sub categories associated with selected section and category
        Database.getSubCategoriesFromDatabase(selection.section, selection.category, function (subCategories, noResult) {
          if(!noResult){
            searchData.validOptions[selection.id] = true; // There are options for this row and sub category
            addOptionsToSelector('#subsection-select'+selection.id,subCategories,selection.subCategory);
          }});

        // Find all the  descriptions associated with selected section, category, and subsections
        Database.getDescriptionsFromDatabase(selection.section,selection.category,selection.subCategory, function (descriptions,noResult) {
          if(!noResult){
            addOptionsToSelector('#description-select'+selection.id,descriptions,selection.description);
          }});
    }

    var init = function (urlSelections, withSearch) {
      if(withSearch){
          events.emit("INIT_SELECTIONS", urlSelections);
      } else {
        // Just fill the section selectors with sections
        Database.getSectionsFromDatabase(function(sections){
          var dp = new DataProcessor();
          dp.sortSections({sections : sections}); // TODO fix

          for(var i = 0; i < 4; i++){
            addOptionsToSelector('#section-select'+i,sections,'');
          }
        });
      }
    }



    var clear = function (rowNumber) {
        rowsData[rowNumber].clear();
        $('#description-select'+rowNumber+',#subcategory-select'+rowNumber+',#category-select'+rowNumber).html('');
        $('#section-select'+rowNumber).find("option:selected").removeAttr("selected");
        $(".selectpicker").selectpicker('refresh');
    }


    init([],false);
    return {
      getAllSelectionData : getAllSelectionData,
      setSelectionsFromURL : setSelectionsFromURL,
      init : init,
      clear : clear,
      canSearch : canSearch
    }
})();

// Relies on
// JQUERY
// DataBase
// Events


// Manages a Section dropdown menu
function SectionSelect(idNumb){
    this.idNumb = idNumb;
    this.id = "#section-select"+idNumb; // The element id
    this.$select = $(this.id); // Selectets and caches the element

    // Respoinds to an event that indicates data is avalable for the drop down
    this.initEventListener = function (urlSelections) {
      var id = this.idNumb;
      var passID = this.id;
      var selection = urlSelections.filter(function(e){return e.id === id})[0];

      // Grab section from DB and add to dropdown
      Database.getSectionsFromDatabase(function(sections){
        dp.sortSections({sections : sections});
        addOptionsToSelector(passID,sections,selection.section);
      });
    }


    // When the selector is clicked send out a section changed event
    this.updated = function (event) {
      events.emit("SECTION_CHANGED", {section : this.$select.find("option:selected").text(), id : this.idNumb});
    }

    // Listen to these events
    this.$select.on('change', this.updated.bind(this) );
    events.on("INIT_SELECTIONS", this.initEventListener.bind(this));
}


// Manages a Section dropdown menu
function CategorySelect(idNumb){
  this.idNumb = idNumb;
  this.id = "#category-select"+this.idNumb;
  this.$select = $(this.id);


  // Respoinds to an event that indicates data is avalable for the drop down
  this.initEventListener = function (urlSelections) {
    var id = this.idNumb;
    var selection = urlSelections.filter(function(e){return e.id === id})[0];
    var passID = this.id

    // Grab categories from DB and add to the dropdown
    Database.getCategoriesFromDatabase(selection.section, function (categories, noResult) {
      if(!noResult){
        addOptionsToSelector(passID,categories,selection.category);
      }
    });
  }


  // When the selector is clicked send out a section changed event
  this.updated = function (event) {
    events.emit("CATEGORY_CHANGED", {category : this.$select.find("option:selected").text(), id : this.idNumb});
  }


  // When a section changes this finds the categories required
  this.sectionChangedListener = function (update) {
    if(update.id === this.idNumb){
        this.$select.html(''); // Clear out old options
        var passID = this.id

        Database.getCategoriesFromDatabase(update.selection.section, function (categories, noResult) {
          if(!noResult){
            addOptionsToSelector(passID,categories,""); // Might change this
          }
        });
    }
  }

  // Bind function to respond to update
  this.$select.on('change', this.updated.bind(this));

  // Listen to events we care about
  events.on("NEW_SECTION", this.sectionChangedListener.bind(this));
  events.on("INIT_SELECTIONS", this.initEventListener.bind(this));
}


// Manages a Subcategory dropdown menu
function SubCategorySelect(idNumb){
  this.idNumb = idNumb;
  this.id = "#subcategory-select"+this.idNumb;
  this.$select = $(this.id);


  // Respoinds to an event that indicates data is avalable for the drop down
  this.initEventListener = function (urlSelections) {
    var id = this.idNumb;
    var selection = urlSelections.filter(function(e){return e.id === id})[0];
    var passID = this.id;

    Database.getSubCategoriesFromDatabase(selection.section, selection.category, function (subCategories, noResult) {
      if(!noResult){
        addOptionsToSelector(passID,subCategories,selection.subCategory);
      }
    });
  }


  // Listens to a change in a category
  this.categoryChangedListener = function (update) {
    if(update.id === this.idNumb){
      this.$select.html('');
      var passID = this.id;
      var passIDNumb = this.idNumb;

      Database.getSubCategoriesFromDatabase(update.selection.section,update.selection.category, function (subCategories, noResult) {
        if(!noResult){
          addOptionsToSelector(passID,subCategories,""); // Might change this
        } else {
          events.emit("SUBCATEGORY_CHANGED", {subCategory : "", id : passIDNumb});// BY sending out this event description is notified with empty subCategory
        }
      });
    }
  }


  // When we are updated by the user send out an event
  this.updated = function (event) {
    events.emit("SUBCATEGORY_CHANGED", {subCategory : this.$select.find("option:selected").text(), id : this.idNumb});
  }


  // Bind function to respond to update
  this.$select.on('change', this.updated.bind(this));

  // Listen to events we care about
  events.on("SECTION_CHANGED", clearMyself.bind(this)); // TODO test
  events.on("NEW_CATEGORY", this.categoryChangedListener.bind(this));
  events.on("INIT_SELECTIONS", this.initEventListener.bind(this));
}



// Manages a Subcategory dropdown menu
function DescriptionSelect(id){
  this.idNumb = id;
  this.id = "#description-select"+id;
  this.$select = $(this.id);

  this.updated = function (event) {
    events.emit("DESCRIPTION_CHANGED",  {description : this.$select.find("option:selected").text(), id : this.idNumb});
  }


  //
  this.initEventListener = function (urlSelections) {
    var id = this.idNumb;
    var selection = urlSelections.filter(function(e){return e.id === id})[0];
    var passID = this.id;

    Database.getDescriptionsFromDatabase(selection.section, selection.category, selection.subCategory, function (descriptions, noResult) {
      if(!noResult){
        addOptionsToSelector(passID,descriptions,selection.description);
      }
    });
  }


  //
  this.subCategoryChangedListener = function (update) {
    if(update.id === this.idNumb){
        var passID = this.id;

        Database.getDescriptionsFromDatabase(update.selection.section,update.selection.category,update.selection.subCategory, function(descriptions){
          addOptionsToSelector(passID,descriptions,"");
        });
    }
  }

  // Bind function to respond to events
  this.$select.on('change', this.updated.bind(this));

  // Listen to events from any of the other selections changing on our row
  events.on("SECTION_CHANGED", clearMyself.bind(this)); // TODO test
  events.on("CATEGORY_CHANGED", clearMyself.bind(this));
  events.on("NEW_SUBCATEGORY", this.subCategoryChangedListener.bind(this));
  events.on("INIT_SELECTIONS", this.initEventListener.bind(this));
}

// Clears the options from the select
function clearMyself(update) {
  if(update.id === this.idNumb){
      this.$select.html('');
      this.$select.selectpicker('refresh'); // Refresh the selections
  }
}


/**
 * Adds the drop down options to one of the selectors
 *
 * @param selectorID {String} the id of the drop down
 * @param options {String[]} the options to add
 * @param selectedOption {String} the option that should be set as selected
 * */
function addOptionsToSelector(selectorID, options, selectedOption){
  $(selectorID).html(''); // Empty temp options
  for(var i = 0; i < options.length; i++){
    if(options[i] === null)continue;
    if(options[i] === selectedOption){
      $(selectorID).append('<option selected>' + options[i] + '</option>');
    } else {
      $(selectorID).append('<option>' + options[i] + '</option>');
    }
  }
  $(selectorID).selectpicker('refresh'); // Refresh the selections
}

/**
* Creates a table object
* @param id the id of the table a, b, c, d
* @param rows the rows of data for the table
* @param unit the unit of the data
* @param selection {Object} if not combined else {Object[]} the selection made by the user to find the data
*/
function Table(id, rows, selection, isCombined){
  this.id = id;
  this.isCombined = isCombined;
  this.rows = rows;
  this.unit = rows[0].units;
  this.selection = selection;

  // Create the titles
  this.title = this.getTitle();
  this.subTitle = this.getSubTitle();

  // Used to format numbers displayed
  this.dpFormat = d3.format(".4r");

  // Find the available years
  this.availableYears = this.getAvailableYears();

  // Used to store original cell values
  this.noCPICells = [];

  // Cache DOM elements
  this.$table = $('#table-'+id);
  this.$totalsTable = $('#table-total-'+id);
  this.$title = $('#title-'+id);
}


/**
 * Returns the title for the table
 *
 * @return {String} title
 * */
Table.prototype.getTitle = function () {
  if(this.isCombined){
    var subCategory = this.selection[0] === null ? "" : this.selection[0].subCategory;
    return this.selection[0].category + ", " + subCategory + ", "+ this.selection[0].description;
  } else {
    return (this.subCategory === undefined ? "" : this.selection.subCategory + ", ") + " "+ this.selection.description;
  }
}


/**
 * Returns the subtitle for the table
 *
 * @return {String} subtitle
 * */
Table.prototype.getSubTitle = function () {
  if(this.isCombined){
    var subCategory = this.selection[1] === null ? "" : this.selection[1].subCategory;
    return  this.selection[1].category + ", " + subCategory + ", "+ this.selection[1].description;
  } else {
    return this.selection.section + ", " + this.selection.category;
  }
}


/**
 * Updates the rows and the recalculates total table
 *
 * @param rows the new rows for the table
 * */
Table.prototype.update = function (rows) {
  this.rows = rows;
  this.createTotalsTable(true, "");
}


/**
 * Shows a bar graph with the values from the selected row
 *
 * @param {Object} update the object to hold information about the row clicked
 * */
Table.prototype.totalsRowSelected = function (update) {
  var rowNumb  = update.rowID.charAt(update.rowID.length-1);
  var dataRowID = "row-tot-"+this.id+""+rowNumb;

  SingleBarModule.showBarWithRowElem(dataRowID,update.region,"#bar-total-"+this.id,"#head-row-totals-"+this.id,"#table-total-"+this.id,this.unit);
}


/**
 * Shows a bar graph with the values from the selected row
 *
 * @param {Object} update the object to hold information about the row clicked
 * */
Table.prototype.rowClicked = function (event) {
  var rowNumb = event.rowID.slice(-1);
// Need to account for numbers greater than 10
if(!isNaN(event.rowID.slice(-2))){
  rowNumb = event.rowID.slice(-2);
}
  SingleBarModule.showBarWithRowElem('row'+this.id +''+rowNumb,event.edb,"#bar-"+this.id,"#head-row-"+this.id,"#table-"+this.id,this.unit);
}

/**
 * Returns the years of data in the table
 *
 * @return {String[]} The array of years
 * */
Table.prototype.getAvailableYears = function () {
  availableYears = [];
  var availableYears = [];
  this.rows.forEach(function (elem) {
      if(!availableYears.includes(elem.obs_yr))availableYears.push(elem.obs_yr);
  });
  availableYears.sort(function (a, b) { // Sort the years
      return +a - +b;
  });
  return availableYears;
}


/**
 * Returns if CPI can be applied to the table
 *
 * @return {Boolean} can apply cpi or not
 * */
Table.prototype.canApplyCPI = function () {
  if(this.isCombined)return false;
  return this.unit.includes('$'); // TODO check if this is right later
}


/**
 * Applies CPI to all values in the table
 *
 * @param {Object} Holds percentage of CPI for each year
 * */
Table.prototype.applyCPI = function (cpiValues) {
  if(this.noCPICells.length > 0){
      this.revertCPI();
  }

  var $cachedCells = this.$table.find('.cell');

  // First backup the cpiCells
  var noCPICells = this.noCPICells;
  var id = this.id;
  $cachedCells.each(function(){ // Backup the values from the cells
      noCPICells.push({id : $(this).attr('id'), value : $(this).text()});
  });

  var minYear = Infinity;
  var maxYear = -Infinity;
  $cachedCells.each(function(){ //cell or th
      var year = +$(this).attr("class").split(' ')[1];
      minYear = year < minYear ? year : minYear;
      maxYear = year > maxYear ? year : maxYear;
  });

  var format = this.dpFormat;
      $cachedCells.each(function(){ // Grab every cell
          var year = +$(this).attr("class").split(' ')[1]; // Grab the year of the cell by checking the class
          var valueOfCell = $(this).attr("origvalue");
      for(var cur = minYear; cur <=maxYear; cur++){ // Go through each possible year

        for(var i = 0; i < cpiValues.length; i++){
              if(cpiValues[i].year === cur){
                  if(year <= cur){
                      valueOfCell = valueOfCell * (1 + (cpiValues[i].value / 100));
                      valueOfCell = format(valueOfCell);
                  }
              }
        }
      }
        $(this).text(valueOfCell); // CPI Applied value
      });
}

Table.prototype.revertCPI = function () {
  if(this.noCPICells.length > 0){
    var format = this.dpFormat;
    this.noCPICells.forEach(function(e){
        $('#'+e.id).text(format(e.value));
    });
  }
}

Table.prototype.insertTitles = function() {
  if(this.isCombined){
    var s1 = this.id.charAt(0).toUpperCase();
    var s2 = this.id.charAt(1).toUpperCase();
    this.$title.append('<h3>Ratio analysis '+s1+' / '+s2+'</h4>');
    this.$title.append('<h4 class="title"><span style="color: black;">'+s1+': </span>'+this.title+'</h4><h4 class="title"><span style="color: black;">'+s2+': </span>'+this.subTitle+'</h4>');
  } else {
    this.$title.append('<h2 class="title">'+this.title+'</h2>').append('<h4 class="subTitle">'+this.subTitle+'</h4>');
  }
}



// Only called once to create the table
Table.prototype.create = function () {
  var tableData = this.createTableData (this.rows); // Grab the data in the form we want

  // create the years cells
  var years = "";
  tableData[0].years.forEach(function(y){
    years += "<th>" + y.year + "</th>";
  });

  // Append the head row
  this.$table.append('<tr id="head-row-'+this.id+'" class="table-row table-head"> <th>EDB</th>'+ years + '</tr>');

  // Go through and create a row for each edb
  var cellCount = 0;
  var rowCount =  0;
  var cellValues = []; // All the cell values


  for(var i = 0; i < tableData.length; i++){
    var dataRow = tableData[i];
    var edb = dataRow.edb;
    var years = dataRow.years;
    var row= "<tr class='table-row' id=row"+this.id+rowCount+"><th class='edb-cell'>" + edb + "</th>";// Inserts the cell with the edb name

    for(var j = 0; j < years.length; j++){
      var yearData = years[j];
      row += "<th origValue='"+ yearData.value +"' class='cell "+yearData.year+"' id='t"+this.id+""+cellCount+"'>" + this.dpFormat(yearData.value) + "</th>";
      cellValues.push({ id : "#t"+this.id+""+cellCount, value : yearData.value });
      cellCount++;
    }
    this.$table.append(row + '</tr>');

    $("#row"+this.id+rowCount).click(function(){
      var rowNumb = this.id.slice(-1);
      // Need to account for numbers greater than 10
      if(!isNaN(this.id.slice(-2))){
        rowNumb = this.id.slice(-2);
      }
      var edb = $("#"+this.id+" .edb-cell").text();
      events.emit('ROW_CLICKED', { rowID : this.id, rowNumb : rowNumb, edb : edb});
    });
    rowCount++;
  }
  this.cellValues = cellValues;
}

Table.prototype.createTotalsTable = function(update, selectedTotalRow) {

  var totals = dp.createTableTotals(this.rows, TablesModule.regions, this.availableYears);
  var names = {n : "North Island", uni : "Upper North Island", eni : "Eastern North Island", swni : "South-West North Island", s : "South Island", usi : "Upper South Island", lsi : "Lower South Island", nz : "New Zealand"};

  var totalCells = [];
  // Insert Caption for table
  var years = "";
  this.availableYears.forEach(function (year) {
      years += "<th>" + year + "</th>";
  });

  var cellCount = 0; // Used for id cells
  var rowCount = 0; // Used for id rows

  if(update){
      this.$totalsTable.html(''); // Clear last table
  }

  // Used to calculate average or total
  var numberOfCompanies = 29;

  this.$totalsTable.append('<tr id="head-row-totals-'+this.id+'" class="table-row table-head"> <th>Region</th>'+ years + '</tr>');

  for (var property in totals) {
      if (totals.hasOwnProperty(property)) {
          var row= "<tr class='table-row' id=row-tot-"+this.id+rowCount+">";

          //TODO (Note when updated origValue will be the updated value not the original)

          // Insert name in column and assign an id to the row
          var format = this.dpFormat;
        var cells = this.noCPICells;
          row += "<th class='reg-cell'>" + names[property] + "</th>";
          var passID = this.id;
          totals[property].forEach(function(value){
              var avg;
              if(property === "nz"){
                  avg = value / numberOfCompanies;
              } else {
                  avg = value / TablesModule.regions[property].length;
              }

              row += "<th id='t-total"+passID+""+cellCount+"' origValue='"+ avg +"' class='cell'>" + format(avg) + "</th>";
              totalCells.push({id : "#t-total"+passID+""+cellCount, value :avg});

              // TODO check if better way
              cells.push({id : "t-total"+passID+""+cellCount, value : avg});

              cellCount++;

          });
          this.$totalsTable.append(row + '</tr>');
          $("#row-tot-"+this.id+rowCount).click(function() {
            var reg = $("#"+this.id +" .reg-cell").text();
            events.emit("TOTAL_ROW_CLICKED", {rowID : this.id, region : reg});
          });
          rowCount++;
      }
  }
  if(selectedTotalRow !==""){
      $('#'+selectedTotalRow).addClass("row-selected");
  }
  this.totalCellValues = totalCells;
}




Table.prototype.createTableData = function (rows) {
  // Create array with unique EDBS
  var edbs = {};
  rows.forEach (function(r){
    if(edbs[r.edb] === undefined)edbs[r.edb] = r.edb;
  });

  var data = [];

  // Filter rows by each EDB
  for (var edb in edbs) {
    if (edbs.hasOwnProperty(edb)) {
      var edbYears = rows.filter(function(r){return r.edb === edbs[edb] });

      var years = [];
      edbYears.forEach(function(y){
        years.push({ year : y.obs_yr, value : y.value });
      });

      // Sort years
      years.sort(function(a,b){
        return a.year > b.year;
      })

      data.push({ edb : edbs[edb], years : years});
    }
  }
  return data;
}


// Called when values in the table update
Table.prototype.render = function () {
  this.applyGradientCSS(this.cellValues);
  this.applyGradientCSS(this.totalCellValues);
}


/**
 * highlights the cell based on the percentage of the max value in the table unless already a percentage
 *
 * @param cellValues {Object[]} value of a cell and the table cell id
 * @param percent {Boolean} if not a percent it should be highlighted based on the percentage of the max value in the cell
 * */
Table.prototype.applyGradientCSS = function(cellValues) {
  var percent = false; // TODO fix later
  // Find the max value
  var maxCellValue = -Infinity;
  cellValues.forEach(function(elem){
      maxCellValue = +elem.value > maxCellValue ? +elem.value : maxCellValue;
  });

  // Apllie css to each cell
  for(var i = 0; i < cellValues.length; i++){
      var value = (percent ? value : ((+cellValues[i].value / maxCellValue)*100)); // If percentage metric just use valud
      $(cellValues[i].id).css({
              "background" : "-webkit-gradient(linear, left top, right top, color-stop(" + value +"%,#7bbfd6), color-stop(" + value +"%,#FFF))",
          }
      );
  }
}

var TablesModule = (function(){

  // The EDBs that belong to each region
  var regions = {
    n : ["Centralines","Counties Power","Eastland Network","Electra","Horizon Energy","Northpower",
         "Powerco","Scanpower","The Lines Company","Top Energy","Unison Networks","Vector Lines",
         "Waipa Networks","WEL Networks","Wellington Electricity"],
    uni : ["Counties Power","Horizon Energy","Northpower","The Lines Company","Top Energy","Vector Lines","Waipa Networks","WEL Networks"],
    eni : ["Centralines","Eastland Network","Scanpower","Unison Networks"],
    swni : ["Electra","Powerco","Wellington Electricity"],
    s : ["Alpine Energy","Aurora Energy","Buller Electricity","Electricity Ashburton","Electricity Invercargill",
         "MainPower NZ","Marlborough Lines","Nelson Electricity","Network Tasman",
         "Network Waitaki","Orion NZ","OtagoNet","The Power Company","Westpower"],
    usi : ["Alpine Energy","Buller Electricity","MainPower NZ","Marlborough Lines","Nelson Electricity","Network Tasman","Orion NZ","Westpower"],
    lsi : ["Aurora Energy","Electricity Ashburton","Electricity Invercargill","Network Waitaki","OtagoNet","The Power Company"]
  };

  // The id of the currently selected row in the main table
  var selectedRow = "";

  // The id of the currently selected row in the totals
  var selectedTotalRow = "";

  // Holds the table objects
  var tables = [];


  /**
   * Creates the tables using the table data
   *
   * @param {Object} the object containing the tables data
   * */
  var init = function (update) {
    update.data.forEach (function(tableData){
      if(tableData.combined){
        tables.push(new Table(tableData.id, tableData.rows, [tableData.search, tableData.search2 ], true));
      } else {
        tables.push(new Table(tableData.id,tableData.rows,tableData.search,false));
      }
    });

  // Create each of the tables along with a the totals table
  tables.forEach(function(table){
      table.insertTitles();
      table.create();
      table.createTotalsTable(false, selectedTotalRow);
    });

    // Render each of the tables
    tables.forEach(function(table){table.render();});
  }

  // Called when a row clicked event occours
  var rowClicked = function (update) {
    if(selectedRow === update.rowID){
      $('.table-row').find(".edb-cell:contains('"+update.edb+"')").parent().removeClass("row-selected"); // Selects edb row in all tables
      rowSelected = "";
      return;
    }

    if(selectedRow !== ""){
      var text = $("#"+selectedRow+" .edb-cell").text();
      $('.table-row').find(".edb-cell:contains('"+text+"')").parent().removeClass("row-selected"); // Selects edb row in all tables
    }
    selectedRow = update.rowID;

    $('.table-row').find(".edb-cell:contains('"+update.edb+"')").parent().addClass("row-selected"); // Selects edb row in all tables

    tables.forEach(function(table){
      table.rowClicked(update);
    });
  }

  var totalRowClicked = function (update) {
    var region = update.region;

    if(selectedTotalRow === update.rowID){
      var oldReg = $("#"+update.rowID+" .reg-cell").text();

      $('.table-row').find(".reg-cell:contains('"+region+"')").filter(function() {
          return $(this).text() === region;
      }).parent().removeClass("row-selected"); // Selects edb row in all tables
      selectedTotalRow = "";
      return;
    }

    if(selectedTotalRow !== ""){
        var oldReg = $("#"+selectedTotalRow+" .reg-cell").text();
        $('.table-row').find(".reg-cell:contains('"+oldReg+"')").filter(function() {
            return $(this).text() === oldReg;
        }).parent().removeClass("row-selected"); // Selects edb row in all tables
    }

    $('.table-row').find(".reg-cell:contains('"+region+"')").filter(function() {
        return $(this).text() === region;
    }).parent().addClass("row-selected"); // Selects edb row in all tables

    // if id ends with letter set to id
    selectedTotalRow = update.rowID;

    tables.forEach(function(table){
      table.totalsRowSelected(update);
    });
  }


  var applyCPI = function (update) {
    var cpiValues = update.cpiValues;
    tables.forEach(function(table){
      if(table.canApplyCPI()){
        table.applyCPI(cpiValues);
        table.createTotalsTable(true, selectedTotalRow);
      }
    });

    tables.forEach(function(table){
      table.render();
    });
  }

  var revertCPI = function () {
    tables.forEach(function(table){
      table.revertCPI();
    });

    tables.forEach(function(table){
      table.render();
    });
  }

  var update = function (update) {
    update.data.forEach(function(tableData){
      tables.forEach(function(g){
        if(g.id === tableData.id){
          if(g.isCombined){
            g.update(tableData.rows, tableData.table1Rows, tableData.table2Rows);
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
  events.on("TOTAL_ROW_CLICKED", totalRowClicked);
  events.on("APPLY_CPI", applyCPI);
  events.on("REVERT_CPI", revertCPI); // WHAT?
  events.on("ROW_UPDATE", update);


  return {
    regions : regions
  }
})();
