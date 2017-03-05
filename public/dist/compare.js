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


var dp = new DataProcessor();

function Data(){
  this.rows = []; // All the rows from a search
  this.selections = []; // The selected sections (section, category, sub category, description for each row)
  this.tables = null; // The rows filtered into the separate tables
  this.copyOfTables = null; // tables copied so modifications can be made
  this.validOptions = [false,false,false,false]; // Array to show if a sub category exists for a row true if it does
  this.dpFormat = d3.format(".4r"); // Used to format numbers displayed
}

var searchData; // An instance of the Data object
var dataStructure; // Contains arrays for tables, graphs and combined graphs
var rowSelected = ""; // Holds the id of the currently selected row in the edb table
var totalsRowSelectedID = ""; // Holds the id of the selected row in the totals table
var noCPICells = []; // Hold the original cpi values


// Object to hold which company belongs to a specific region
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


// Called when the document is loaded
$(document).ready( function() {
  // Highlight the selected link
  $(".nav-link").removeClass('active');
  $("#benchmarks-link").addClass('active');
  $('#search-btn-compare').click(function(){ // Listener to search button
    search(); // Search encodes the selections into the url and sends to server
  });
  if($('.cpi-form').length > 0 ){
    cpiValidationSetup(); // Set up cpi validation rules
  }
});


/**
 * The first method that is called when loading the page from a URL with a selection. A selection can contain multiple searches up to 4.
 *
 * @param urlSelections{Object[]} contains the user selections for each row
 * */
function loadFromURL(urlSelections){
  searchData = new Data();
  loadInSections(true,urlSelections); // First load in the section rows and set the searched selections

  // Send array of selected sections to server and the company
  $.post("/compare/search",{company : "", selections : JSON.stringify(urlSelections)}, function(data){
    // Queries the db for each of the secions and finds and inserts the sub sections as options
    var lastSearch = new Selection(urlSelections[0],urlSelections[1],urlSelections[2],urlSelections[3]); // Set the last search
    var dataTables = dp.filterRowsToTables(data.rows, lastSearch); // Filter the rows into their tables
    searchData.rows = data.rows;
    searchData.tables = dataTables;

    searchData.copyOfTables = dp.copyDataTables(dataTables);

    urlSelections.forEach(function(s){
      setSelectionsFromURL(s); // Modifies valid options
    });

    dataStructure = dp.createDataStructuresWithCopy(searchData.copyOfTables); // Sets up the data so it can easily be iterated over to create the tables and graphs

    showTables(dataStructure.selectionTable); // Show the tables
    showAllRegularGraphs(dataStructure.selectionData, true); // Show all but combined and vector graphs true indicates it should add titles in
    showAllCombinedGraphs(dataStructure.combineData, true); // Show the combined and vector graphs
    highlightGraphsOnLoad(dataStructure.selectionTable);
  });
}


/**
 * Highlights the graphs by acting like a user clicked on the first row in each table.
 *
 * @param selectionTables {Object[]} the data for each table
 * */
function highlightGraphsOnLoad(selectionsTables){
  for(var i = 0; i < selectionsTables.length; i++){
    rowClicked("rowtable"+selectionsTables[i].id+"0");
    totalsRowClicked("row-tot-"+selectionsTables[i].id+"0");
    return; // Only need to click on one row to fill out all of them
  }
}


/**
 * Shows the tables on the page giving the data in the selection table array
 *
 * @param selectionTableArray {Object[]} contains all the rows for each table
 * */
function showTables(selectionTablesArray){
  selectionTablesArray.forEach(function (tableData) {
    // Add in the title using the id and the tile / subtitle for each table
    if(tableData.id === 'ab' || tableData.id === 'cd'){
      $('#title-'+tableData.id).append('<h3 class="subTitle">'+tableData.title+'</h3><h3>Over</h3>').append('<h3 class="subTitle">'+tableData.subTitle+'</h3>');
    } else {
      $('#title-'+tableData.id).append('<h2 class="title">'+tableData.title+'</h2>').append('<h4 class="subTitle">'+tableData.subTitle+'</h4>');
    }
    insertTable(tableData.rows,'table'+tableData.id);
    insertTotalsTable(tableData.rows, 'table-total'+tableData.id, regions,false,false); // Creates and inserts the total table
  })
}


/**
 * Shows the bar and boxplot graphs for tables A,B,C, and D.
 *
 * @param selectionData {Object[]} contains all the rows
 * #param addTitles {Boolean} when the table is already displayed and only the data needs to be updated titles should not be added
 * */
function showAllRegularGraphs(selectionData, addTitles){
  selectionData.forEach(function (selection) {
    // Insert the titles for the graphs
    if(addTitles){
      $('#title-'+selection.id+'-bar').append('<h3 class="title">'+selection.title+'</h3>').append('<h4 class="subTitle">'+selection.subTitle+'</h4>');
      $('#title-'+selection.id+'-box').append('<h3 class="title">'+selection.title+'</h3>').append('<h4 class="subTitle">'+selection.subTitle+'</h4>');
    }

    // Create the data needed for bar grahs and create and insert the graph
    var table1Data = dp.createDataForGroupedGraph(selection.rows);
    createdGroupedBarGraph(table1Data.data, table1Data.keys,selection.unit,"#grouped-bar-"+selection.id);

    // Create the data needed for box plot and create and insert the plot
    createBoxPlot(dp.createDataForBoxPlot(selection.rows), "#boxplot"+selection.id+"-div", selection.unit);
    $('#full-table-'+selection.id+'-div').show();
  });
}


/**
 * Shows the bar, box plot, and vector graphs for tables A/B, B/C and A/B / C/D.
 *
 * @param selectionData {Object[]} contains all the rows
 * #param addTitles {Boolean} when the table is already displayed and only the data needs to be updated titles should not be added
 * */
function showAllCombinedGraphs(selectionData, showTitle){
  selectionData.forEach(function(selection){
    // Insert titles
    if(showTitle){
      $('#title-'+selection.id+'-bar').append('<h4 class="combined-title">'+selection.title1+'<br><span class="over">over</span><br>'+selection.title2+'</h4>');
      $('#title-'+selection.id+'-box').append('<h4 class="combined-title">'+selection.title1+' <br><span class="over">over</span><br>'+selection.title2+'</h4>');
      $('#title-'+selection.id+'-vector').append('<h4 class="combined-title">'+selection.title1+'<br><span class="over">over</span><br>'+selection.title2+'</h4>');
    }
    // Create data for bar, box and vector graphs and insert into divs
    var tableABData = dp.createDataForGroupedGraph(selection.rows);
    createdGroupedBarGraph(tableABData.data, tableABData.keys, selection.unit1 + " / " + selection.unit2, "#grouped-bar-"+selection.id);
    createBoxPlot(dp.createDataForBoxPlot(selection.rows), "#boxplot"+selection.id+"-div", selection.unit1 + " / " + selection.unit2);
    createVectorGraph(dp.createDataForVectorGraph(selection.table1Rows,selection.table2Rows),selection.unit1,selection.unit2,"#vector-graph-div-"+selection.id);
    $('#full-table-'+selection.id+'-div').show(); // Show the div now that they have been created
  });

  // Add in A / B over C / D
  if(selectionData.length === 2){
    $('#title-abcd-vec').append('<h4 class="combined-title">'+selectionData[0].title1+' / '+selectionData[0].title2+'</h4>').append('<h4>Over</h4>').append('<h4 class="combined-title">'+selectionData[1].title1+' / '+selectionData[1].title2+'</h4>');
    createVectorGraph(dp.createDataForVectorGraph(selectionData[0].rows,selectionData[1].rows),selectionData[0].unit1 + " / " + selectionData[1].unit1,selectionData[0].unit2 + " / " + selectionData[1].unit2,"#vector-graph-div-abcd");
    $('#vector-full-div-abcd').show();
  }
}


/**
 * Creates and inserts a total table for each region
 *
 * @param tableRows {Object[]} contains all the rows from the tables
 * @param id {String} the id of the table
 * @param regions {Object} contains a property for each region and which edbs belong to it
 * @param update {Boolean} if the table needs to be updated or created
 * */
function insertTotalsTable(tableRows, id, regions, tableExists, update){
  var tableID = (!(id.slice(-2).indexOf("l") > -1) ? id.slice(-2) : id.slice(-1));
  var names = {n : "North Island", uni : "Upper North Island", eni : "Eastern North Island", swni : "South-West North Island", s : "South Island", usi : "Upper South Island", lsi : "Lower South Island", nz : "New Zealand"};
  var totCells = []; // Hold the totals for each region

  // First get all the availble years in the rows
  var availableObsYears = [];
  tableRows.forEach(function (elem) {
    if(!availableObsYears.includes(elem.obs_yr))availableObsYears.push(elem.obs_yr);
  });
  availableObsYears.sort(function (a, b) { // Sort the years
    return +a - +b;
  });

  var totals = dp.createTableTotals(tableRows,regions, availableObsYears);

  // Insert Caption for table
  var years = "";
  availableObsYears.forEach(function (year) {
    years += "<th>" + year + "</th>";
  });

  var cellCount = 0; // Used for id cells
  var rowCount = 0; // Used for id rows

  if(update){
    $("#"+id).html(''); // Clear last table
  }

  // Used to calculate average or total
  var numberOfCompanies = 29;

  $("#"+id).append('<tr id="head-row-totals-'+tableID+'" class="table-row table-head"> <th>Region</th>'+ years + '</tr>');

  for (var property in totals) {
    if (totals.hasOwnProperty(property)) {
      var row= "<tr class='table-row' id=row-tot-"+tableID+rowCount+">";

      //TODO (Note when updated origValue will be the updated value not the original)

      // Insert name in column and assign an id to the row
      row += "<th class='reg-cell'>" + names[property] + "</th>";
      totals[property].forEach(function(value){
        var avg;
        if(property === "nz"){
          avg = value / numberOfCompanies;
        } else {
          avg = value / regions[property].length;
        }

        row += "<th id='t-total"+tableID+""+cellCount+"' origValue='"+ avg +"' class='cell'>" + searchData.dpFormat(avg) + "</th>";
        totCells.push({id : "#t-total"+tableID+""+cellCount, value :avg});
        if(!tableExists){
          noCPICells.push({id : "t-total"+tableID+""+cellCount, value : avg});
        }
        cellCount++;

      });
      $("#"+id).append(row + '</tr>');
      $("#row-tot-"+tableID+rowCount).click(function() {
        totalsRowClicked(this.id); // Call the function to highlight the data in all graphs for the edb
      });
      rowCount++;
    }
  }
  applyGradientCSS(totCells,false);
}


/**
 * Creates and inserts a total table for each region
 *
 * @param tableRows {Object[]} contains all the rows for a particular table
 * @param id {String} the id of the table
 * */
function insertTable(tableRows,id){
  // Sorts the EDB names
  tableRows.sort(function (a,b) {
    return [a.edb, b.edb].sort()[0] === a.edb ? -1 : 1; // Sort two names and return the first
  });
  if(tableRows.length === 0)return; // No data so return

  var availableObsYears = [];

  tableRows.forEach(function (elem) {
    if(!availableObsYears.includes(elem.obs_yr))availableObsYears.push(elem.obs_yr);
  });
  availableObsYears.sort(function (a, b) {
    return +a - +b;
  });

  // Create cells for each of the years to use as header
  var years = "";
  availableObsYears.forEach(function (year) {
    years += "<th>" + year + "</th>";
  });

  $("#"+id).append('<tr id="head-row-'+id+'" class="table-row table-head"> <th>EDB</th>'+ years + '</tr>');

  // An array of companies already processed
  var done = [];
  // Year done for edb
  var yearDone = [];
  var cellCount = 0; // For the id
  var cellValues = []; // All the cell values
  var rowCount = 0;
  // Create the rows of data
  for(var i = 0; i < tableRows.length; i++){
    if(!done.includes(tableRows[i].edb)){
      done.push(tableRows[i].edb);
      var row= "<tr class='table-row' id=row"+id+rowCount+">";
      // Insert name in column and assign an id to the row
      row += "<th class='edb-cell'>" + tableRows[i].edb + "</th>";

      for(var k = 0; k < availableObsYears.length; k++){
        // Iterate through all rows finding ones with the current edb
        for(var j = 0; j < tableRows.length; j++){

          // Check it matches edb and year inserting into
          if(tableRows[j].edb === tableRows[i].edb && tableRows[j].obs_yr === availableObsYears[k] && (!yearDone.includes(tableRows[j].obs_yr))){
            yearDone.push(tableRows[j].obs_yr);
            row += "<th origValue='"+ tableRows[j].value +"' class='cell "+availableObsYears[k]+"' id='t"+id+""+cellCount+"'>" + searchData.dpFormat(tableRows[j].value) + "</th>";
            // Save the value and the id of the cell to display percentage
            cellValues.push({ id : "#t"+id+""+cellCount, value : tableRows[j].value });
            cellCount++;
          }
        }
        yearDone = [];
      }
      $("#"+id).append(row + '</tr>'); // end and append the row

      // Assing a on click function to each of the rows to generate the bar graph with the row specific data
      $("#row"+id+rowCount).click(function(event) {
        rowClicked(this.id); // Call the function to highlight the data in all graphs for the edb
      });
      rowCount++;
    }
  }

  var percent = true;
  if(id === "tableab" || "tablcd"){
    percent = false;
  } else {
    percent = tableRows[0].units.includes('%') || tableRows[0].units.includes('portion');
  }
  applyGradientCSS(cellValues, percent);
}


/**
 * Called when the user clicks on a row in a table
 *
 * @param id {String} The id of the row clicked
 * */
function rowClicked(id){
  if(rowSelected === id){// Clicked on the same row so unselect
    // Remove all selected classes from elements
    var text = $("#"+id+" .edb-cell").text();
    highlight(text, true); // highlight and remove highlighting from bar graph
    $('.table-row').find(".edb-cell:contains('"+text+"')").parent().removeClass("row-selected"); // Selects edb row in all tables
    d3.selectAll(".line-selected-table").classed("line-selected", false);
    d3.selectAll(".vec-dot-selected").classed("vec-dot-selected", false);
    rowSelected = ""; // Nothing is selected
    return;
  }

  // Remove the selected class from all rows
  if(rowSelected !== ""){
    var text = $("#"+rowSelected+" .edb-cell").text();
    $('.table-row').find(".edb-cell:contains('"+text+"')").parent().removeClass("row-selected"); // Selects edb row in all tables
  }
  var text = $("#"+id+" .edb-cell").text();
  rowSelected = id; // Set the selected row

  // Get the edb from the selected row
  var edb = $("#"+id+".edb-cell").text();

  $('.table-row').find(".edb-cell:contains('"+text+"')").parent().addClass("row-selected"); // Selects edb row in all tables

  // Select all lines with the selected class and remove class
  d3.selectAll(".line-selected-table").classed("line-selected", false);
  d3.selectAll(".vec-dot-selected").classed("vec-dot-selected", false);

  // Select all rectangle with the correct EDB and outline bars
  // Also removes the highlight of previous selection
  highlight(text, false);
  d3.selectAll("line."+text.replace(/ /g , "")).classed("line-selected-table", true);
  d3.selectAll(".dot."+text.replace(/ /g , "")).classed("vec-dot-selected", true);

  $('.table-edb').each(function(){
    var idTable = (!(this.id.slice(-2).indexOf("e") > -1) ? this.id.slice(-2) : this.id.slice(-1));
    var rowNumb = rowSelected.slice(-1);
    // Need to account for numbers greater than 10
    if(!isNaN(rowSelected.slice(-2))){
      rowNumb = rowSelected.slice(-2);
    }
    var unit = "";
    for(var i = 0; i < dataStructure.selectionTable.length; i++){
      if(dataStructure.selectionTable[i].id === idTable){
        unit = dataStructure.selectionTable[i].unit;
      }
    }
    var id = "rowtable"+idTable+rowNumb;
    showBarWithRowElem(id,text,"#bar-"+idTable,"#head-row-table"+idTable,"#table"+idTable,unit);
  });
}


/**
 * Called when the bar graph generated from a single row in a table needs to be updated
 * */
function updateTableBarGraph(){
  $('.table-edb').each(function(){
    var idTable = (!(this.id.slice(-2).indexOf("e") > -1) ? this.id.slice(-2) : this.id.slice(-1));// Get the id of the table can be a,b,c,d,ab,cd therefore we have to check if it is two characters
    var rowNumb = rowSelected.slice(-1);// Grab the row number which is the last character if less than the 10th row

    // Need to account for numbers greater than 10
    if(!isNaN(rowSelected.slice(-2))){
      rowNumb = rowSelected.slice(-2);
    }

    var unit = "";
    for(var i = 0; i < dataStructure.selectionTable.length; i++){
      if(dataStructure.selectionTable[i].id === idTable){
        unit = dataStructure.selectionTable[i].unit;
      }
    }

    var id = "rowtable"+idTable+rowNumb;
    var text = $("#"+id+" .edb-cell").text();
    showBarWithRowElem(id,text,"#bar-"+idTable,"#head-row-table"+idTable,"#table"+idTable,unit);
  });
}


/**
 * Called when the bar graph generated from a single row in a totals table needs to be updated
 * */
function updateTotalsBarGraph(){
  $('.table-tot').each(function(){
    //var idTable = this.id.slice(-1);
    var idTable = (!(this.id.slice(-2).indexOf("l") > -1) ? this.id.slice(-2) : this.id.slice(-1));

    var unit = "";
    for(var i = 0; i < dataStructure.selectionTable.length; i++){
      if(dataStructure.selectionTable[i].id === idTable){
        unit = dataStructure.selectionTable[i].unit;
      }
    }

    var rowNumb = totalsRowSelectedID.slice(-1);
    var id = "row-tot-"+idTable+rowNumb;
    var reg = $("#"+id+" .reg-cell").text();
    showBarWithRowElem(id,reg,"#tot-bar-"+idTable,"#head-row-totals-"+idTable,"#table-total"+idTable,unit);
  });
}


/**
 * Called when the user clicks on a row in a totals table
 *
 * @param id {String} The id of the row clicked
 * */
function totalsRowClicked (id){
  var reg = $("#"+id+" .reg-cell").text();
  if(totalsRowSelectedID === id){// Clicked on the same row so unselect
    reg = $("#"+totalsRowSelectedID+" .reg-cell").text();

    $('.table-row').find(".reg-cell:contains('"+reg+"')").filter(function() {
      return $(this).text() === reg;
    }).parent().removeClass("row-selected"); // Selects edb row in all tables
    totalsRowSelectedID = "";
    return;
  }

  if(totalsRowSelectedID !== ""){
    var oldReg = $("#"+totalsRowSelectedID+" .reg-cell").text();
    $('.table-row').find(".reg-cell:contains('"+oldReg+"')").filter(function() {
      return $(this).text() === oldReg;
    }).parent().removeClass("row-selected"); // Selects edb row in all tables
  }

  $('.table-row').find(".reg-cell:contains('"+reg+"')").filter(function() {
    return $(this).text() === reg;
  }).parent().addClass("row-selected"); // Selects edb row in all tables

  // if id ends with letter set to id
  totalsRowSelectedID = id;

  $('.table-tot').each(function(){
    var idTable = (!(this.id.slice(-2).indexOf("l") > -1) ? this.id.slice(-2) : this.id.slice(-1));

    var unit = "";
    for(var i = 0; i < dataStructure.selectionTable.length; i++){
      if(dataStructure.selectionTable[i].id === idTable){
        unit = dataStructure.selectionTable[i].unit;
      }
    }
    var rowNumb = totalsRowSelectedID.slice(-1);
    var id = "row-tot-"+idTable+rowNumb;
    showBarWithRowElem(id,reg,"#tot-bar-"+idTable,"#head-row-totals-"+idTable,"#table-total"+idTable,unit);
  });
}


/**
 * Shows the bar graph on the screen
 *
 * @param rowID {String} the id of the row to show with the data for the bar graph
 * @param edb {String} the edb of the row
 * @param div {String} the id of the div to put the bar graph in
 * */
function showBarWithRowElem(rowID, edb, div, headRow, tableID,unit){
  var data = [];

  $(headRow).find('th').each(function (index, element) {
    if(index != 0){ // 0 is not a year
      data.push({category : $(element).text(), value : 0}); // 0 is temp
    }
  });

  $('#'+rowID).find('th').each(function (index, element) {
    if(index != 0){
      data[index-1].value = $(element).text();
    } else {
      title = data[index].value = $(element).text();
    }
  });

  var max = -Infinity;
  $('.cell', tableID).each(function(){ //cell or th
    var val = +$(this).attr("origValue");
    max = val > max ? val : max;
  });

  var min = Infinity;
  $('.cell', tableID).each(function(){ //cell or th
    var val = +$(this).attr("origValue");
    min = val < min ? val : min;
  });
  createBarGraph(div, max,min, data, edb,unit);
}


/**
 * highlights the cell based on the percentage of the max value in the table unless already a percentage
 *
 * @param cellValues {Object[]} value of a cell and the table cell id
 * @param percent {Boolean} if not a percent it should be highlighted based on the percentage of the max value in the cell
 * */
function applyGradientCSS(cellValues, percent){
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

var error = false;

/**
 * Called when user clicks search, checks if the search is valid if so creates url and searches.
 * */
function search(){
  if(!dp.validateSearchParams(searchData.selections,searchData.validOptions)){
    if(!error){
      $('#error-div').append('<h4 style="color : red;">Partial Row Selected</h4>');
      error = true;
    }
    return; // First check if the selection is valid
  }

  var rows= {};
  searchData.selections.forEach(function(selection){
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
 * Turns object in url string
 *
 * @param obj {Object} the object to turn into url
 * */
function serialise(obj) {
  var str = [];
  for(var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}


/**
 * Loads in options for each selection drop down from a search.
 * When the page is loaded from a search the option for that search need to be inserted
 *
 * @param selection {Object} one row of selections (section, category etc)
 * */
function setSelectionsFromURL(selection){
  // Find all the categories associated with selected section
  getCategoriesFromDatabase(selection.section, function (categories,noResult) {
    if(!noResult){
      addOptionsToSelector('#category-select'+selection.id,categories, selection.category);
    }});

  // Find all the  sub categories associated with selected section and category
  getSubCategoriesFromDatabase(selection.section, selection.category, function (subCategories, noResult) {
    if(!noResult){
      searchData.validOptions[selection.id] = true; // There are options for this row and sub category
      addOptionsToSelector('#subsection-select'+selection.id,subCategories,selection.subCategory);
    }});

  // Find all the  descriptions associated with selected section, category, and subsections
  getDescriptionsFromDatabase(selection.section,selection.category,selection.subCategory, function (descriptions,noResult) {
    if(!noResult){
      addOptionsToSelector('#description-select'+selection.id,descriptions,selection.description);
    }});
}


/**
 * Loads in the sections along with creating the rows of drop down selection boxes.
 * Also sets previously selected searches.
 *
 * @param fromURL {Boolean} if it is called with a query or not
 * @param userSelections {Object[]} The search from the user (section, category, sub category, and description for each selected row)
 * */
function loadInSections(fromURL, userSelections){ // if from url false selections is null
  if(!fromURL){
    searchData = new Data([],[],[]); // Need to add empty array to put selections in
  }
  // Grab all the sections
  /// Query for all sections
  $.get("/sections/sections", function(data){
    // Create the four filters rows
    addSection(0,searchData);
    addSection(1,searchData);
    addSection(2,searchData);
    addSection(3,searchData);

    if(fromURL){
      for(var i = 0; i < userSelections.length; i++){
        searchData.selections[i].description = userSelections[i].description;
        searchData.selections[i].category = userSelections[i].category;
        searchData.selections[i].section = userSelections[i].section;
        searchData.selections[i].subCategory = userSelections[i].subCategory;
      }
    }
    dp.sortSections(data); // Sort the sections

    searchData.selections.forEach(function (selection, i) {
      addOptionsToSelector("#section-select"+selection.id,data.sections,fromURL ? userSelections[i].section : "");
    });
  });
}


/**
 *  Grabs all the categories for a specific section
 *
 *  @param section {String} The section to look for distinct categories in
 *  @callback should take (Object[], Boolean) array contains categories boolean is true if no results false if there is a result
 * */
function getCategoriesFromDatabase(section, callback){
  // Find all the categories associated with this section
  $.post("/sections/s",{selected : section }, function(data){
    if(data.categories.length > 0  &&  data.categories[0] !== null){
      callback(data.categories, false);
    } else { // The one special case where category is null
      callback([], true); // No result
    }});
}


/**
 * Grabs all sub categories for a specific section and category
 *
 * @param section {String} The section to look for distinct categories in
 * @param category {String} The category to look for distinct sub categories in
 * @param callback {function} The function to call once the query has a result
 * */
function getSubCategoriesFromDatabase(section, category, callback){
  $.post("/sections/sc",{section : section, category : category}, function(data){
    if(data.subCategories.length > 0  &&  data.subCategories[0] !== null){
      callback(data.subCategories, false); // There is a result
    } else {
      callback([], true); // No results
    }
  });
}


/**
 * Grabs all description for a specific section, category and sub category if sub category
 * is not an empty string.
 *
 * @param section {String} The section to look for distinct categories in
 * @param category {String} The category to look for distinct sub categories in
 * @param subCategory {String} The sub category to look for distinct sub categories in
 * @param callback {function} The function to call once the query has a result
 * */
function getDescriptionsFromDatabase(section,category,subCategory,callback){
  // Find all descriptions for the currently selected sub category
  $.post("/sections/desc",{category : category,section : section, subCategory : subCategory}, function(data){
    if(data.descriptions.length > 0 &&  data.descriptions[0] !== null){
      callback(data.descriptions, false);
    } else {
      callback(data.descriptions, true);
    }});
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
  $(".selectpicker").selectpicker('refresh'); // Refresh the selections
}


/**
 * Adds a row of selectors to the page to allow the user to choose a section, category, sub category and description. Also adds
 * function to respond to a selection being made. For example when a section is chosen a query is made to the database to find all categories within
 * the sections
 *
 * @param numberOfSections {Number} Each selector has an id which includes the number of the row therefore this should be passed in to create a unique id
 * @param searchData {Object} This holds the selections array which represents what the user has already choosen in any of the rows
 * */
function addSection(numberSections,searchData){
  var table = ['A','B','C','D','E'];

  // Add in a new row div
  $('#compare-div').append('<div class="row" id="titleRow'+numberSections+'"><div class="col-md-12"><h5  class="selection-title">Make a selection for table '+table[numberSections]+'</h5> </div></div>');
  $('#compare-div').append('<div class="row" id="row'+numberSections+'">');
  $("#row"+numberSections).append('<div class="col-md-12 compare-col" id="col'+numberSections+'">');
  $("#col"+numberSections).append('<button type="button" id="clear-'+numberSections+'" class="btn btn-danger">Clear</button>').on('click', function(event){
    var idNumb = event.target.id.charAt(event.target.id.length-1);
    clearSelection(idNumb);
  });
  $("#col"+numberSections).append('<select data-width="250px" class="selectpicker select-compare"  title="Section" id="section-select'+numberSections+'"></select>');// add section selector with the number section as the dynamic id
  searchData.selections.push({id : numberSections, section : "", category : "", subCategory : "", description : ""});// Push the information for the new row into the selections array

  // Add a change listener for when a section is selected
  $("#section-select"+numberSections).on('change', function(event){
    var section = $(this).find("option:selected").text(); // Grab the selection
    var idNumb = event.target.id.charAt(event.target.id.length-1); // Grab the last character of the id that generated the event to work out correct id

    // First empty out all options for sub selections
    $('#category-select'+idNumb+',#subsection-select'+idNumb+',#description-select'+idNumb).html(''); // Empty temp options

    searchData.selections[idNumb] = {id : numberSections, section : "", category : "", subCategory : "", description : ""};
    searchData.validOptions[idNumb] = false;

    getCategoriesFromDatabase(section, function (sections, noResult) {
      if(!noResult){
        addOptionsToSelector('#category-select'+idNumb,sections,"");
      }
    });
    dp.addToSelection(+idNumb,"section",section, searchData.selections); // Record change in the array of selections
  });

  // add category selector
  $("#col"+numberSections).append('<select data-width="190px" class="selectpicker select-compare" title="Category" id="category-select'+numberSections+'"></select>');
  $('#category-select'+numberSections).on('change', function(event){
    var categoryNew = $(this).find("option:selected").text();
    var idNumb = +(event.target.id.charAt(event.target.id.length-1));

    $('#description-select'+idNumb).html(''); // Empty temp options

    getSubCategoriesFromDatabase(searchData.selections[idNumb].section, categoryNew, function (subCategories, noResults) { // Find all subcategories for a section and category
      if(!noResults){
        addOptionsToSelector('#subsection-select'+idNumb,subCategories,"");
      } else { // Find descriptions for section and category
        getDescriptionsFromDatabase(searchData.selections[idNumb].section,categoryNew,"", function (descriptions,noResult) {
          if(!noResult){
            addOptionsToSelector('#description-select'+idNumb,descriptions,"");
          }
        });
      }
    });
    dp.addToSelection(idNumb,"category", categoryNew, searchData.selections);
  });

  // add sub category selector
  $("#col"+numberSections).append('<select data-width="190px" class="selectpicker select-compare" title="Subsection" id="subsection-select'+numberSections+'"></select>');
  $('#subsection-select'+numberSections).on('change', function(event){
    var idNumb = event.target.id.charAt(event.target.id.length-1);
    var subCat = $(this).find("option:selected").text();

    getDescriptionsFromDatabase(searchData.selections[idNumb].section,searchData.selections[idNumb].category,subCat, function (descriptions,noResult) {
      if(!noResult){
        addOptionsToSelector('#description-select'+idNumb,descriptions,"");
      }
    });
    dp.addToSelection(idNumb,"subcategory", subCat, searchData.selections);
  });

  // add description selector
  $("#col"+numberSections).append('<select data-width="190px" class="selectpicker select-compare" title="Description" id="description-select'+numberSections+'"></select>');
  $('#description-select'+numberSections).on('change', function(event){
    var idNumb = event.target.id.charAt(event.target.id.length-1);
    var data = $(this).find("option:selected").text();
    dp.addToSelection(+idNumb,"description", data, searchData.selections);
  });
}


/**
 * Clears a row of selections
 *
 * @param idNumb {Number} the id of the row
 * */
function clearSelection(idNumb){
  searchData.selections[idNumb] = {id : idNumb, section : "", category : "", subCategory : "", description : ""};
  searchData.validOptions[idNumb] = false;
  $('#description-select'+idNumb+',#subsection-select'+idNumb+',#category-select'+idNumb).html('');
  $('#section-select'+idNumb).find("option:selected").removeAttr("selected");
  $(".selectpicker").selectpicker('refresh');
}


/**
 * Sets up rules for validating CPI fields. Must be a number 1-100
 * */
function cpiValidationSetup(){
  $.validator.setDefaults({
      errorClass : 'help-block',
      highlight: function (element) {$(element).closest('.form-group').addClass('has-error')},
      unhighlight :function (element) {$(element).closest('.form-group').removeClass('has-error')}
    }
  );
  var cpiRules = {required : true, number : true, min : 1, max : 100};
  var messageSet = {
    required : "Please enter a percentage",
    number : "Please enter a valid number",
    min : "Please enter a percentage greater than 0",
    max : "Please enter a percentage less than 100"
  };

  $('#cpi-form').validate({
    rules : {Y2012 : cpiRules,Y2013 : cpiRules,Y2014 : cpiRules,Y2015 : cpiRules,Y2016 : cpiRules},
    messages : {Y2012 : messageSet,Y2013 : messageSet,Y2014 : messageSet,Y2015 : messageSet,Y2016 : messageSet}
  });
}


/**
 * Called when the apply button for CPI is clicked, calls a number of functions to add cpi to
 * all graphs and tables where is it applicable.
 * */
function applyCPI(){
  if($('#cpi-form').valid()){
    if(noCPICells.length > 0){
      revertCPI(); // Reverts cpi before instead of saving values with cpi already applied
      var copyOfDataTables = dp.copyDataTables(searchData.tables); // Use the original data and create a copy of it
      dataStructure = dp.createDataStructuresWithCopy(copyOfDataTables);
    }
    // CPI for 2012 - 2016
    var cpiValues = [{year : 2012, value : +$('#Y2012').val()},{year : 2013, value : +$('#Y2013').val()},{year : 2014, value : +$('#Y2014').val()},{year : 2015, value : +$('#Y2015').val()},{year : 2016, value : +$('#Y2016').val()}];

    // Applies CPI to all selected tables
    dataStructure.selectionTable.forEach(function (table) {
      if(table.unit.includes('$')){
        applyCPIToTable('#table'+table.id,cpiValues);
      }
    });

    // Go through each table and check if is should have cpi applied if so modify the rows
    dataStructure.selectionData.forEach(function (table) {
      if(table.unit.includes('$')){
        applyCPIToTableRows(table.rows, cpiValues);
      }
    });

    // At this point the rows have been updated so we can update the totals table
    dataStructure.selectionTable.forEach(function (tableData) {
      insertTotalsTable(tableData.rows, 'table-total'+tableData.id, regions,true, true);
    });

    showAllRegularGraphs(dataStructure.selectionData, false);
    showAllCombinedGraphs(dataStructure.combineData, false);

    // Updates the bar graphs for the two tables in all tabs that exist
    updateTableBarGraph();
    updateTotalsBarGraph();
  }
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


/**
 * Applies cpi values to the table
 *
 * @param table {String} the id of the div
 * @param cpiValues {Object[]} contains the cpi for each year
 * */
function applyCPIToTable(table, cpiValues){
  $('.cell', table).each(function(){ // Backup the values from the cells
    noCPICells.push({id : $(this).attr('id'), value : $(this).text()});
  });

  var minYear = Infinity;
  var maxYear = -Infinity;

  $('.cell', table).each(function(){ //cell or th
    var year = +$(this).attr("class").split(' ')[1];
    minYear = year < minYear ? year : minYear;
    maxYear = year > maxYear ? year : maxYear;
  });

  for(var cur = minYear; cur <=maxYear; cur++){ // Go through each possible year
    $('.cell', table).each(function(){ // Grab every cell
      var year = +$(this).attr("class").split(' ')[1]; // Grab the year of the cell by checking the class
      var valueOfCell = $(this).attr("origvalue");
      for(var i = 0; i < cpiValues.length; i++){
        if(cpiValues[i].year === cur){
          if(year <= cur){
            valueOfCell = valueOfCell * (1 + (cpiValues[i].value / 100));
            valueOfCell = searchData.dpFormat(valueOfCell);
          }
        }
      }
      $(this).text(valueOfCell); // CPI Applied value
    });
  }
  applyGradientCSS(noCPICells); // Highlights the cell based on the value compared to the max in the table
}


/**
 * Sets the value of cells back to the original value
 * */
function revertCPI(){
  noCPICells.forEach(function(e){
    $('#'+e.id).text(searchData.dpFormat(e.value));
  });
  applyGradientCSS(noCPICells);
}
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

    // Create combined tables if possible
    if(aRows.length > 0 && bRows.length > 0){
        var abRows = dp.combineTables(aRows,bRows);
    }

    if(cRows.length > 0 && dRows.length > 0){
        var cdRows = dp.combineTables(cRows,dRows);
    }
    return new DataTables(aRows,bRows,cRows,dRows, abRows, cdRows);
}


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