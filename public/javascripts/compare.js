/**
 * Created by Nicky on 23/01/2017.
 */


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
  lsi : ["Aurora Energy","Electricity Ashburton","Electricity Invercargill","Network Waitaki","OtagoNet","The Power Company"],
  nz : ["","","","","","","","","","","","","","","","","","","","","","","","","","","","",""]
};

// Holds the currently selected items in the filter rows
var selections = [];

var dpFormat = d3.format(".4r");


// Holds a object that contains the rows of selections that were last searched
var lastSearch = null;
var validOptions = [false,false,false]; // Each boolean represents if a sub category should exist in the selection row
var selectedCompany = "";

// Hold if these tables have been selected
var aSelected = false;
var bSelected = false;
var cSelected = false;
var dSelected = false;

// Holds the rows for each table separately
var dataTables;
var copyOfDataTables;

var selectionDataArray;
var selectionTablesArray;
var combinedSelectionDataArray;

$(document).ready( function() {
    // Highlight the selected link
    $(".nav-link").removeClass('active');
    $("#benchmarks-link").addClass('active');

    // On click listener for company selector
    $('#company-select').on('change', function(event){
        selectedCompany = $(this).find("option:selected").text();
    });
    $('#search-btn-compare').click(function(){ // Listener to search button
        search();
    });
    cpiValidationSetup(); // Set up cpi validation rules
});

// Checks that if there is a value in a selection one must be selected per row
function validateSearchParams(){
    var returnVal = true;

    selections.forEach(function (elem, i) {
        if(elem.subCategory === "" && validOptions[i]){
            returnVal = false; // There is a possible sub category so it has to be chosen from
        }

        if(elem.section === "" || elem.category === "" || elem.description === ""){
            // Now check if one of the selections is not empty
            if(elem.section !== "" || elem.category !== "" || elem.description !== ""){
                $('#error-div').append('<h4 style="color : red;">Partial Row Selected</h4>');
                returnVal = false; // A row cannot have one item selected and another empty
            }
        }
    });
    if(returnVal)$('#error-div').html('');
    return returnVal;
}

// Returns a copy of the dataTables object
function copyDataTables(dataTables){
    var origTables = [dataTables.tableA,dataTables.tableB,dataTables.tableC,dataTables.tableD,dataTables.tableAB,dataTables.tableCD];
    var tables = [[],[],[],[],[],[]];

    for(var j = 0; j < origTables.length; j++){
        var a = origTables[j];
        if(a !== undefined){
            for(var i = 0; i < a.length; i++){
                tables[j].push({category :a[i].category, description : a[i].description,disc_yr: a[i].disc_yr,edb: a[i].edb,
                    fcast_yr: a[i].fcast_yr,network:a[i].network,note:a[i].note,obs_yr:a[i].obs_yr,p_key: a[i].p_key,sch_ref:a[i].sch_ref,
                    schedule:a[i].schedule,section:a[i].section,sub_category: a[i].sub_category,units:a[i].units,value:a[i].value})
            }
        }
    }
    return new DataTables(tables[0],tables[1],tables[2],tables[3],tables[4],tables[5]);
}

// Uses the url to find what was searches and asks server for rows relating to that search
function loadFromURL(urlSelections){
    loadInSections(true,urlSelections); // First load in the section rows

    lastSearch = new Selection(urlSelections[0],urlSelections[1],urlSelections[2],urlSelections[3]); //TODO copy values
    // Send array of selected sections to server and the company
    $.post("/compare/search",{company : selectedCompany, selections : JSON.stringify(urlSelections)}, function(data){
        setSelectionsFromURL(urlSelections[0]);
        setSelectionsFromURL(urlSelections[1]);
        setSelectionsFromURL(urlSelections[2]);
        setSelectionsFromURL(urlSelections[3]);

        dataTables = filterRowsToTables(data.rows); // Filter the rows into their tables
        copyOfDataTables = copyDataTables(dataTables); // Create a copy of data tables

        selectionDataArray = [];
        selectionTablesArray = [];
        combinedSelectionDataArray = [];

        // An array of true / false values if a table contains values
        var selectedRows = [copyOfDataTables.tableA.length > 0,copyOfDataTables.tableB.length > 0,copyOfDataTables.tableC.length > 0,copyOfDataTables.tableD.length > 0];

        // An array with the tables data
        var tables = [copyOfDataTables.tableA,copyOfDataTables.tableB,copyOfDataTables.tableC,copyOfDataTables.tableD,copyOfDataTables.tableAB,copyOfDataTables.tableCD];

        // Creates the 4 normal tables and the combined tables
        var ids = ['a','b','c','d','ab','cd'];
        for(var i = 0; i < selectedRows.length; i++){
            if(selectedRows[i]){
                var title = tables[i][0].section + ", " + tables[i][0].category;
                var subtitle = tables[i][0].sub_category === null ? tables[i][0].description : tables[i][0].sub_category + ", " + tables[i][0].description;
                selectionTablesArray.push(new SelectedTableData(tables[i],ids[i],title,subtitle, tables[i][0].units)); // TODO add unit for combined
                selectionDataArray.push(new SelectionData(tables[i], title, subtitle ,tables[i][0].units,ids[i]));

                // Check for combined special case
                if(ids[i] === 'a' || ids[i] === 'c'){
                    if(selectedRows[i+1]){ // Check that a selections has been made if so create the combined table
                        var jump = i === 0 ? 4 : 3;
                        var titleJump = tables[i+1][0].section + ", " + tables[i+1][0].category;
                        var subTitleJump = tables[i+1][0].sub_category === null ? tables[i+1][0].description : tables[i+1][0].sub_category + ", " + tables[i+1][0].description;
                        selectionTablesArray.push(new SelectedTableData(tables[i+jump],ids[i+jump], title + ", " + subtitle, titleJump + ", " + subTitleJump));
                        combinedSelectionDataArray.push(new SelectionDataCombined(tables[i+jump],tables[i],tables[i+1], title + " " + subtitle, titleJump + " " + subTitleJump,tables[i][0].units,tables[i+1][0].units,ids[i+jump])); // TODO ask how to format titles for combined
                    }
                }
            }
        }

        showTables(selectionTablesArray); // Show the tables
        showAllRegularGraphs(selectionDataArray, true); // Show all but combined and vector graphs true indicates it should add titles in
        showAllCombinedGraphs(combinedSelectionDataArray, true); // Show the combined and vector graphs

    });
}


function showTables(selectionTablesArray){
    selectionTablesArray.forEach(function (tableData) {
        $('#title-'+tableData.id).append('<h2 class="title">'+tableData.title+'</h2>')
            .append('<h4 class="subTitle">'+tableData.subTitle+'</h4>');

        insertTable(tableData.rows,'table'+tableData.id);
        insertTotalsTable(tableData.rows, 'table-total'+tableData.id, regions);
    })
}

// Takes all rows and filers into corresponding tables
function filterRowsToTables(rows){
    var aRows = rows.filter(function(e){return matchDBRow(e,lastSearch.aTable);});
    var bRows = rows.filter(function(e){return matchDBRow(e,lastSearch.bTable);});
    var cRows = rows.filter(function(e){return matchDBRow(e,lastSearch.cTable);});
    var dRows = rows.filter(function(e){return matchDBRow(e,lastSearch.dTable);});

    // Set all null values in rows to 0
    aRows.forEach(function(e){if(e.value === null){e.value = 0;}});
    bRows.forEach(function(e){if(e.value === null){e.value = 0;}});
    cRows.forEach(function(e){if(e.value === null){e.value = 0;}});
    dRows.forEach(function(e){if(e.value === null){e.value = 0;}});

    // Create combined tables if possible
    if(aRows.length > 0 && bRows.length > 0){
        var abRows = combineTables(aRows,bRows);
    }

    if(cRows.length > 0 && dRows.length > 0){
        var cdRows = combineTables(cRows,dRows);
    }
    return new DataTables(aRows,bRows,cRows,dRows, abRows, cdRows);
}


// Shows graphs for A,B,C,D
function showAllRegularGraphs(selectionData, addTitles){
    selectionData.forEach(function (selection) {

        var negative = false;
        // selection.rows.forEach(function (elem) {
        //     if(elem.value < 0){
        //         negative = true;
        //         return;
        //     }
        // })

        if(negative){
            $('#title-'+selection.id+'-bar').append('<h3 class="title" style="color:red;">Cannot create bar graph with negative numbers</h3>'); // Display error
            $('#full-table-'+selection.id+'-div').show();
            return;
        }

        // Create and insert the grouped bar graph
        if(addTitles){
            $('#title-'+selection.id+'-bar').append('<h2 class="title">'+selection.title+'</h2>')
                .append('<h4 class="subTitle">'+selection.subTitle+'</h4>');
        }

        var table1Data = createDataForGroupedGraph(selection.rows);
        createdGroupedBarGraph(table1Data.data, table1Data.keys,selection.unit,"#grouped-bar-"+selection.id);

        // Create and insert Box and whisker graph
        if(addTitles){
            $('#title-'+selection.id+'-box').append('<h2 class="title">'+selection.title+'</h2>')
                .append('<h4 class="subTitle">'+selection.subTitle+'</h4>');
        }

        createBoxPlot(createDataForBoxPlot(selection.rows), "#boxplot"+selection.id+"-div", selection.unit);
        $('#full-table-'+selection.id+'-div').show();
    });
}

// Shows graphs for A/B, C/D
function showAllCombinedGraphs(selectionData, showTitle){
    selectionData.forEach(function(selection){
        // Insert Bar graph
        if(showTitle){
            $('#title-'+selection.id+'-bar').append('<h4 class="combined-title">'+selection.title1+'<br><span class="over">over</span><br>'+selection.title2+'</h4>');
        }
        var tableABData = createDataForGroupedGraph(selection.rows);
        createdGroupedBarGraph(tableABData.data, tableABData.keys, selection.unit1 + " / " + selection.unit2, "#grouped-bar-"+selection.id);

        // Create and insert combined box plot
        if(showTitle){
            $('#title-'+selection.id+'-box').append('<h4 class="combined-title">'+selection.title1+' <br><span class="over">over</span><br>'+selection.title2+'</h4>');
        }
        createBoxPlot(createDataForBoxPlot(selection.rows), "#boxplot"+selection.id+"-div", selection.unit1 + " / " + selection.unit2);

        if(showTitle){
            $('#title-'+selection.id+'-vector').append('<h4 class="combined-title">'+selection.title1+'<br><span class="over">over</span><br>'+selection.title2+'</h4>');
        }
        createVectorGraph(createDataForVectorGraph(selection.table1Rows,selection.table2Rows),selection.unit1,selection.unit2,"#vector-graph-div-"+selection.id);
        $('#full-table-'+selection.id+'-div').show();
    });

    // Add in A / B over C / D
    if(selectionData.length === 2){
        $('#title-abcd-vec').append('<h4 class="combined-title">'+selectionData[0].title1+' / '+selectionData[0].title2+'</h4>')
            .append('<h4>Over</h4>')
            .append('<h4 class="combined-title">'+selectionData[1].title1+' / '+selectionData[1].title2+'</h4>');

        createVectorGraph(createDataForVectorGraph(selectionData[0].rows,selectionData[1].rows),selectionData[0].unit1 + " / " + selectionData[1].unit1,selectionData[0].unit2 + " / " + selectionData[1].unit2,"#vector-graph-div-abcd");
        $('#vector-full-div-abcd').show();
    }
}

// Combine two tables and return the results
function combineTables(table1Rows, table2Rows){
    var combined = [];
    var at = table1Rows;
    var bt = table2Rows;

    for(var i = 0; i < at.length; i++){
        for(var j = 0; j < bt.length; j++){
            if(at[i].edb === bt[j].edb && at[i].obs_yr === bt[j].obs_yr && at[i].disc_yr === bt[j].disc_yr){
                combined.push({ disc_yr : bt[j].disc_yr ,
                    edb : bt[j].edb,
                    "obs_yr" : bt[j].obs_yr,
                    value : at[i].value / (bt[j].value === '0' || bt[j].value === 0 ? 1 : bt[j].value), // Divide the value if va if dividing by 0 make it 1
                    section : bt[j].section + "" + bt[j].description + " over ", // Bit of a hack as description is inserted after section, this way both titles are added to table
                    description : at[i].section + " " + at[i].description,
                    unitA : at[i].units,
                    unitB : bt[j].units
                });
                break; // can exit the loop
            }
        }
    }
    return combined;
}


function insertTotalsTable(tableRows, id, regions){
  var totCells = [];

    // First get all the availble years in the rows
    var availableObsYears = [];
    tableRows.forEach(function (elem) {
        if(!availableObsYears.includes(elem.obs_yr))availableObsYears.push(elem.obs_yr);
    });
    availableObsYears.sort(function (a, b) {
        return +a - +b;
    });

    var regionStrings = ["n","uni","eni", "swni", "s", "usi", "lsi"];
    var names = {n : "North Island", uni : "Upper North Island", eni : "Eastern North Island", swni : "South-West North Island", s : "South Island", usi : "Upper South Island", lsi : "Lower South Island", nz : "New Zealand"};
    var totals = {}; // reg : "" , years : []

    for(var i = 0; i < availableObsYears.length; i++){
        tableRows.filter(function(e){return e.obs_yr === availableObsYears[i];}).forEach(function(row){
            regionStrings.forEach(function(regionString){
                  if(regions[regionString].includes(row.edb)){
                      if(totals[regionString] === undefined){
                        totals[regionString] = [+row.value];
                      } else {
                        if(i === totals[regionString].length){
                          totals[regionString].push(+row.value);
                        } else {
                            totals[regionString] [i] += + (+row.value);
                        }
                      }
                  }
            });
        });
    }

    var nz = [];

    for(var i = 0; i < availableObsYears.length; i++){
      nz.push(totals["n"][i] + totals["s"][i]);
    }
    totals["nz"] = nz;


    // Insert Caption for table
    var years = "";
    availableObsYears.forEach(function (year) {
       years += "<th>" + year + "</th>";
    });

    var cellCount = 0;

    $("#"+id).append('<tr id="head-row-totals-"'+id+' class="table-row table-head"> <th>Region</th>'+ years + '</tr>');

    for (var property in totals) {
      if (totals.hasOwnProperty(property)) {
        var row= "<tr class='table-row' id=row-tot-"+id+i+">";

        // Insert name in column and assign an id to the row
        row += "<th class='reg-cell'>" + names[property] + "</th>";
        totals[property].forEach(function(value){
          row += "<th id='t-total"+id+""+cellCount+"' origValue='"+value+"' class='val-tot-cell'>" + dpFormat(value / regions[property].length) + "</th>";
          totCells.push({id : "#t-total"+id+""+cellCount, value : value / regions[property].length});
          cellCount++;
        });
        $("#"+id).append(row);
      }
    }
    applyGradientCSS(totCells,false);
}


// Here every row belongs to the specific table
function insertTable(tableRows,id){
    var totals = []; // Format reg : "", year : numb

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

    var min = tableRows.reduce(function(prev, curr) {
        return prev.obs_yr < curr.obs_yr ? prev : curr;
    }).obs_yr;

    var max = tableRows.reduce(function(prev, curr) {
        return prev.obs_yr > curr.obs_yr ? prev : curr;
    }).obs_yr; //TODO this line might need to be disc_yr

    // Create cells for each of the years to use as header
    var years = "";
    availableObsYears.forEach(function (year) {
       years += "<th>" + year + "</th>";
    });

    $("#"+id).append('<tr id="head-row" class="table-row table-head"> <th>EDB</th>'+ years + '</tr>');

    // An array of companies already processed
    var done = [];
    // Year done for edb
    var yearDone = [];

    var cellCount = 0;
    var cellValues = [];
    var observerd = true;



    // Create the rows of data
    for(var i = 0; i < tableRows.length; i++){
        if(!done.includes(tableRows[i].edb)){
            done.push(tableRows[i].edb);

            var row= "<tr class='table-row' id=row"+id+i+">";

            // Insert name in column and assign an id to the row
            row += "<th class='edb-cell'>" + tableRows[i].edb + "</th>";


            for(var k = 0; k < availableObsYears.length; k++){
                // Iterate through all rows finding ones with the current edb
                for(var j = 0; j < tableRows.length; j++){
                    //if(!yearDone.includes())

                    // Check it matches edb and year inserting into
                    if(tableRows[j].edb === tableRows[i].edb && tableRows[j].obs_yr === availableObsYears[k] && (!yearDone.includes(tableRows[j].obs_yr))){
                        yearDone.push(tableRows[j].obs_yr);
                        row += "<th origValue='"+ tableRows[j].value +"' class='cell "+availableObsYears[k]+"' id='t"+id+""+cellCount+"'>" + dpFormat(tableRows[j].value) + "</th>";

                        // Save the value and the id of the cell to display percentage
                        cellValues.push({ id : "#t"+id+""+cellCount, value : tableRows[j].value });
                        cellCount++;
                    }
                }
                yearDone = [];
            }

            $("#"+id).append(row + '</tr>');
            // Here we can check the unit type and highlight appropriately
            // Assing a on click function to each of the rows to generate the bar graph with the row specific data
            $("#row"+id+i).click(function(event) {
               rowClicked(this.id);
            });
        }
    }

    var percent = true;
    if(id === "tableab" || "tablcd"){
        percent = false;
    } else {
        percent = tableRows[0].units.includes('%') || tableRows[0].units.includes('portion');
    }
    applyGradientCSS(cellValues, percent);

    // Now create the average tables
}

var rowSelected = "";

function rowClicked(id){
  if(rowSelected === id){// Clicked on the same row so unselect
    // Remove all selected classes from elements
    var text = $("#"+id+" .edb-cell").text();
    highlight(text, true);
    $('.table').find('tr').removeClass('row-selected');
    // d3.selectAll(".bar-selected").classed("bar-selected", false);
    d3.selectAll(".line-selected-table").classed("line-selected", false);
    d3.selectAll(".vec-dot-selected").classed("vec-dot-selected", false);

    rowSelected = ""; // Nothing is selected
    return;
  }

  rowSelected = id;

  var text = $("#"+id+" .edb-cell").text();

  $('.table').find('tr').removeClass('row-selected');


  // $("#"+id).attr("class","row-selected");
  $("#"+id).addClass("row-selected");

  var edb = $("#"+id+".edb-cell").text();

// Select all lines with the selected class and remove class
  d3.selectAll(".line-selected-table")
  .classed("line-selected", false);

  d3.selectAll(".vec-dot-selected")
  .classed("vec-dot-selected", false);

  // Select all rectangle with the correct EDB and outline bars
  // Also removes the highlight of previous selection
  highlight(text, false);

  d3.selectAll("line."+text.replace(/ /g , ""))
  .classed("line-selected-table", true);

  d3.selectAll(".dot."+text.replace(/ /g , ""))
  .classed("vec-dot-selected", true);
}

function applyGradientCSS(cellValues, percent){

    var maxCellValue = -Infinity;
    cellValues.forEach(function(elem){
        maxCellValue = +elem.value > maxCellValue ? +elem.value : maxCellValue;
    });

    // Apllie css to each cell
    for(var i = 0; i < cellValues.length; i++){
        var value = (percent ? value : ((+cellValues[i].value / maxCellValue)*100)); // If percentage metric just use valud

        $(cellValues[i].id).css({
                "background" : "-webkit-gradient(linear, left top, right top, color-stop(" + value +"%,#64B5F6), color-stop(" + value +"%,#FFF))",
            }
        );
    }
}

// Returns if a row from the DB matches one of the specified rows by the user
function matchDBRow(DBRow, selection){
    if(DBRow.section === selection.section && DBRow.category === selection.category && DBRow.description === selection.description){
        if(DBRow.sub_category !== null){
            return selection.subCategory === DBRow.sub_category; // Sub cat could be null but would still match
        }
        return true;
    }
    return false;
}

// Creates search parameters and creates url
function search(){
    if(!validateSearchParams())return;

    var rows = {
        i0 : selections[0].id,s0  : selections[0].section,c0 : selections[0].category,sc0 : selections[0].subCategory,d0 : selections[0].description,
        i1 : selections[1].id,s1  : selections[1].section,c1 : selections[1].category,sc1 : selections[1].subCategory,d1 : selections[1].description,
        i2 : selections[2].id,s2  : selections[2].section,c2 : selections[2].category,sc2 : selections[2].subCategory,d2 : selections[2].description,
        i3 : selections[3].id,s3  : selections[3].section,c3 : selections[3].category,sc3 : selections[3].subCategory,d3 : selections[3].description
    };

    params = serialise(rows);
    window.location.replace("compare?" + params);
}

// Turns object in url string
function serialise(obj) {
    var str = [];
    for(var p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
}

// table 1 can be A and table two C or table 1 is A / B and table two is
function createDataForVectorGraph(table1Rows,table2Rows) {
    var at = table1Rows;
    var bt = table2Rows;
    var edbDone = []; // The edbs that have been processed
    var vecData = []; // The final entry in the form { EDB, [ { year1, valueA, valueB }, {year2, valueA, valueB }]}

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
                if (!yearsDone.includes(edbRowsAt[j].disc_yr)) {
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

// Creates the data needed to create box plots for one table
function createDataForBoxPlot(tableRows){
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

// Creates the data for the bar graphs from the rows used in D3
function createDataForGroupedGraph(rows){
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
                    //var value = +rows[i].value;
                    data[j][rows[i].obs_yr] = +rows[i].value;
                }
            }
        }
    }

    var keys = availableObsYears;
    //for(var i = 0; i <= max; i++){
    //    keys.push(""+availableObsYears[i]);
    //}
    return {data : data, keys : keys};
}


function setSelectionsFromURL(selection){
    // Find all the categories associated with this section
    $.post("/sections/s",{selected : selection.section }, function(data){
        if(data.categories.length > 0  &&  data.categories[0] !== null){
            $('#category-select'+selection.id).html(''); // Empty temp options
        }
        // Add the options to the drop down
        for(var i = 0; i < data.categories.length; i++){
            if(data.categories[i] === selection.category){
                $('#category-select'+selection.id).append('<option value="' + data.categories[i] + '"selected> ' + data.categories[i] + '</option>');
            } else {
                $('#category-select'+selection.id).append('<option value="' + data.categories[i] + '"> ' + data.categories[i] + '</option>');
            }

        }
        // Refresh all drop downs
        $(".selectpicker").selectpicker('refresh');
    });

    // Find all sub categories for the currently selected category
    $.post("/sections/sc",{section : selection.section, category : selection.category}, function(data){

        if(data.subCategories.length > 0  &&  data.subCategories[0] !== null){
            $('#subsection-select'+selection.id).html(''); // Empty temp options

            validOptions[selection.id] = true; // There are options for this row and sub category
        } else {
            return;
        }

        // Add sub section options
        for(var i = 0; i < data.subCategories.length; i++){
            if(data.subCategories[i] === selection.subCategory){
                $('#subsection-select'+selection.id).append('<option selected>' + data.subCategories[i] + '</option>');
            } else {
                $('#subsection-select'+selection.id).append('<option>' + data.subCategories[i] + '</option>');
            }
        }
        $(".selectpicker").selectpicker('refresh');
    });

    // Grab the descriptions
    $.post("/sections/desc",{category : selection.category,section : selection.section, subCategory : selection.subCategory}, function(data){
        if(data.descriptions.length > 0 &&  data.descriptions[0] !== null){
            $('#description-select'+selection.id).html(''); // Empty temp options
        } else {
            return;
        }
        // Add sub section options
        for(var i = 0; i < data.descriptions.length; i++){
            if(data.descriptions[i] === selection.description){
                $('#description-select'+selection.id).append('<option selected>' + data.descriptions[i] + '</option>');
            } else {
                $('#description-select'+selection.id).append('<option>' + data.descriptions[i] + '</option>');
            }
        }
        $(".selectpicker").selectpicker('refresh');
    });
}

// Sort the sections
function sortSections(data){
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

// Loads in sections along with the rows of selection boxes
function loadInSections(fromURL, userSelections){ // if from url false selections is null
    // Grab all the sections
    /// Query for all sections
    $.get("/sections/sections", function(data){
        // Create the four filters rows
        addSection(0);
        addSection(1);
        addSection(2);
        addSection(3);

        if(fromURL){
            for(var i = 0; i < userSelections.length; i++){
                selections[i].description = userSelections[i].description;
                selections[i].category = userSelections[i].category;
                selections[i].section = userSelections[i].section;
                selections[i].subCategory = userSelections[i].subCategory;
            }
        }
        sortSections(data);// Sort the sections

        // Go through each row and add the sections in
        for(var i = 0; i < selections.length; i++){
            for(var j = 0; j < data.sections.length; j++){
                if(fromURL && userSelections[i].section === data.sections[j]){
                    $("#section-select"+selections[i].id+"").append('<option selected>' + data.sections[j] + '</option>');
                } else {
                    $("#section-select"+selections[i].id+"").append('<option>' + data.sections[j] + '</option>');
                }
            }
            $(".selectpicker").selectpicker('refresh');
        }
    });
}

// Adds a new row of filters for section category and sub category
function addSection(numberSections){
    var table = ['A','B','C','D','E'];

    // Add in a new row div
    $('#compare-div').append('<div class="row" id="titleRow'+numberSections+'"><div class="col-md-12"><h5  class="selection-title">Make a selection for table '+table[numberSections]+'</h5> </div></div>');
    $('#compare-div').append('<div class="row" id="row'+numberSections+'">');
    $("#row"+numberSections).append('<div class="col-md-12 compare-col" id="col'+numberSections+'">');
    $("#col"+numberSections).append('<select data-width="250px" class="selectpicker select-compare"  title="Section" id="section-select'+numberSections+'"></select>');// add section selector with the number section as the dynamic id

    selections.push({id : numberSections, section : "", category : "", subCategory : "", description : ""});// Push the information for the new row into the selections array

    // Add a change listener for when a section is selected
    $("#section-select"+numberSections).on('change', function(event){
        var section = $(this).find("option:selected").text(); // Grab the selection
        var idNumb = event.target.id.charAt(event.target.id.length-1); // Grab the last character of the id that generated the event to work out correct id

        // First empty out all options for sub selections
        $('#category-select'+idNumb).html(''); // Empty temp options
        $('#subsection-select'+idNumb).html(''); // Empty temp options
        $('#description-select'+idNumb).html(''); // Empty temp options
        selections[idNumb] = {id : numberSections, section : "", category : "", subCategory : "", description : ""};
        validOptions[idNumb] = false;

        // Find all the categories associated with this section
        $.post("/sections/s",{selected : section }, function(data){
            if(data.categories.length > 0  &&  data.categories[0] !== null){
                $('#category-select'+idNumb).html(''); // Empty temp options
            } else { // The one special case where category is null

            }
            // Add the options to the drop down
            for(var i = 0; i < data.categories.length; i++){
                if(data.categories[i] === null)continue;
                $('#category-select'+idNumb).append('<option>' + data.categories[i] + '</option>');
            }
            // Refresh all drop downs
            $(".selectpicker").selectpicker('refresh');
        });
        addToSelection(idNumb,"section",section); // Record change in the array of selections
    });

    // add category selector
    $("#col"+numberSections).append('<select data-width="190px" class="selectpicker select-compare" title="Category" id="category-select'+numberSections+'"></select>');
    $('#category-select'+numberSections).on('change', function(event){
        var category = $(this).find("option:selected").text();
        var idNumb = event.target.id.charAt(event.target.id.length-1);
        $('#description-select'+idNumb).html(''); // Empty temp options

        // Find all sub categories for the currently selected category
        $.post("/sections/sc",{section : selections[idNumb].section, category : category}, function(data){
            if(data.subCategories.length > 0  &&  data.subCategories[0] !== null){
                $('#subsection-select'+idNumb).html(''); // Empty temp options
                validOptions[idNumb] = true; // There are options for this row and sub category
            } else { //TODO could split into individual functions
                // Find all descriptions for the currently selected sub category
                $.post("/sections/desc",{category : selections[idNumb].category,section : selections[idNumb].section, subCategory : ""}, function(data){
                    if(data.descriptions.length > 0 &&  data.descriptions[0] !== null){
                        $('#description-select'+idNumb).html(''); // Empty temp options
                    } else {
                        return;
                    }
                    // Add sub section options
                    for(var i = 0; i < data.descriptions.length; i++){
                        $('#description-select'+idNumb).append('<option>' + data.descriptions[i] + '</option>');
                    }
                    $(".selectpicker").selectpicker('refresh');
                });
                return;
            }
            // Add sub section options
            for(var i = 0; i < data.subCategories.length; i++){
                $('#subsection-select'+idNumb).append('<option>' + data.subCategories[i] + '</option>');
            }
            $(".selectpicker").selectpicker('refresh');
        });
        addToSelection(idNumb,"category", category);
    });

    // add sub category selector
    $("#col"+numberSections).append('<select data-width="190px" class="selectpicker select-compare" title="Subsection" id="subsection-select'+numberSections+'"></select>');
    $('#subsection-select'+numberSections).on('change', function(event){
        var idNumb = event.target.id.charAt(event.target.id.length-1);
        var subCat = $(this).find("option:selected").text();

        // Find all descriptions for the currently selected sub category
        $.post("/sections/desc",{category : selections[idNumb].category,section : selections[idNumb].section, subCategory : subCat}, function(data){
            if(data.descriptions.length > 0 &&  data.descriptions[0] !== null){
                $('#description-select'+idNumb).html(''); // Empty temp options
            } else {
                return;
            }

            // Add sub section options
            for(var i = 0; i < data.descriptions.length; i++){
                $('#description-select'+idNumb).append('<option>' + data.descriptions[i] + '</option>');
            }
            $(".selectpicker").selectpicker('refresh');
        });
        addToSelection(idNumb,"subcategory", subCat);
    });

    // add description selector
    $("#col"+numberSections).append('<select data-width="190px" class="selectpicker select-compare" title="Description" id="description-select'+numberSections+'"></select>');
    $('#description-select'+numberSections).on('change', function(event){
        var idNumb = event.target.id.charAt(event.target.id.length-1);
        var data = $(this).find("option:selected").text();
        addToSelection(idNumb,"description", data);
    });
}

// Adds a section, category, sub category, or descriptions to a particular row in selections
function addToSelection(id, type, data){
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



// Set up rules for validating the CPI fields
function cpiValidationSetup(){
    $.validator.setDefaults({
            errorClass : 'help-block',
            highlight: function (element) {
                $(element).closest('.form-group').addClass('has-error')
            },
            unhighlight :function (element) {
                $(element).closest('.form-group').removeClass('has-error')
            }
        }
    );

    var cpiRules = {
        required : true,
        number : true,
        min : 0,
        max : 100
    };

    var messageSet = {
        required : "Please enter a percentage",
        number : "Please enter a valid number",
        min : "Please enter a percentage greater than 0",
        max : "Please enter a percentage less than 100"
    };

    $('#cpi-form').validate({
        rules : {
            Y2012 : cpiRules,
            Y2013 : cpiRules,
            Y2014 : cpiRules,
            Y2015 : cpiRules,
            Y2016 : cpiRules
        },
        messages : {
            Y2012 : messageSet,
            Y2013 : messageSet,
            Y2014 : messageSet,
            Y2015 : messageSet,
            Y2016 : messageSet
        }
    });
}


function applyCPI(units){
    if($('#cpi-form').valid()){
        if(noCPICells.length > 0){
            revertCPI(); // Reverts cpi before instead of saving values with cpi already applied
            copyOfDataTables = copyDataTables(dataTables); // Use the original data and create a copy of it
        }
        // CPI for 2012 - 2016
        var cpiValues = [{year : 2012, value : +$('#Y2012').val()},{year : 2013, value : +$('#Y2013').val()},{year : 2014, value : +$('#Y2014').val()},{year : 2015, value : +$('#Y2015').val()},{year : 2016, value : +$('#Y2016').val()}];


        // Applies CPI to all selected tables
        selectionTablesArray.forEach(function (table) {
          if(table.unit.includes('$')){
            applyCPIToTable('#table'+table.id,cpiValues);
          }
        });


        // Go through each table and check if is should have cpi applied if so modify the rows
        selectionDataArray.forEach(function (table) {
            if(table.unit.includes('$')){
                applyCPIToTableRows(table.rows, cpiValues);
            }
        });

        showAllRegularGraphs(selectionDataArray, false);

        //TODO check it works
        if(aSelected && bSelected){
            var abRows = combineTables(aRows,bRows);
            combinedSelectionDataArray[0].rows = abRows;


        }

        if(cSelected && dSelected){
            var cdRows = combineTables(dataTables.cRows,dataTables.dRows);
            combinedSelectionDataArray[1].rows = cdRows;
        }

        showAllCombinedGraphs(combinedSelectionDataArray, false);

    }
}

// Applies the CPI to rows of data
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

var noCPICells = []; // Hold the original cpi values

// Applies cpi values to the table with div id table
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
        $('.cell', table).each(function(index){ // Grab every cell
            var year = +$(this).attr("class").split(' ')[1]; // Grab the year of the cell by checking the class

            var valueOfCell = $(this).attr("origValue");

            for(var i = 0; i < cpiValues.length; i++){
                if(cpiValues[i].year === cur){
                    if(year <= cur){
                        valueOfCell = valueOfCell * (1 + (cpiValues[i].value / 100));
                        valueOfCell = dpFormat(valueOfCell);

                    }
                }
            }
            $(this).text(valueOfCell); // CPI Applied value
        });
    }
    applyGradientCSS(noCPICells); // Highlights the cell based on the value compared to the max in the table
}

function revertCPI(){
    noCPICells.forEach(function(e){
        $('#'+e.id).text(e.value);
    });
    applyGradientCSS(noCPICells);
}

// Object for holder the users selection
function Selection(a,b,c,d){
    this.aTable = a;
    this.bTable = b;
    this.cTable = c;
    this.dTable = d;
}

// Object for holder rows for each table
function DataTables(tableA,tableB,tableC,tableD,tableAB,tableCD){
    this.tableA = tableA;
    this.tableB = tableB;
    this.tableC = tableC;
    this.tableD = tableD;
    this.tableAB = tableAB;
    this.tableCD = tableCD;
}

function SelectionData(rows,title,subTitle,unit,id){
    this.rows = rows;
    this.title = title;
    this.subTitle = subTitle;
    this.id = id;
    this.unit = unit;
}

// Rows are combined
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

function SelectedTableData(rows,id, title, subTitle, unit){
    this.rows = rows;
    this.id = id;
    this.title = title;
    this.subTitle = subTitle;
    this.unit = unit;
}
