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
