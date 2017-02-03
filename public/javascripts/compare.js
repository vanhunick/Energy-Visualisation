/**
 * Created by Nicky on 23/01/2017.
 */

// Holds the currently selected items in the filter rows
var selections = [];

// Holds a object that contains the rows of selections that were last searched
var lastSearch = null;

var selectedCompany = "";

// Hold if these tables have been selected
var b = false;
var d = false;

// Holds the rows for each table separately
var dataTables;

$(document).ready( function() {
    // Highlight the selected link
    $(".nav-link").removeClass('active');
    $("#benchmarks-link").addClass('active');

    // On click listener for company selector
    $('#company-select').on('change', function(event){
        selectedCompany = $(this).find("option:selected").text();
    });

    $('#search-btn-compare').click(function(){
        search();
    });
    loadInSections(); // Creates the rows for selections
});

// Uses the url to find what was searches and asks server for rows relating to that search
function loadFromURL(selections){
    lastSearch = new Selection(selections[0],selections[1],selections[2],selections[3]); //TODO copy values
    // Send array of selected sections to server and the company
    $.post("/compare/search",{company : selectedCompany, selections : JSON.stringify(selections)}, function(data){
        dataTables = filterRowsToTables(data.rows); // Filter the rows into their tables
        showAll(); // Loads in tables bar graphs and box plots
    });
}

// Takes all rows and filers into corresponding tables
function filterRowsToTables(rows){
    var aRows = rows.filter(function(e){return matchDBRow(e,lastSearch.aTable);});
    var bRows = rows.filter(function(e){return matchDBRow(e,lastSearch.bTable);});
    var cRows = rows.filter(function(e){return matchDBRow(e,lastSearch.cTable);});
    var dRows = rows.filter(function(e){return matchDBRow(e,lastSearch.dTable);});

    return new DataTables(aRows,bRows,cRows,dRows);
}

// Shows all tables bar graphs and box plots
function showAll(){
    createTables(dataTables);
    createBoxPlots(dataTables);
    createGroupedBardGraphs(dataTables);
    createVectorGraph(createDataForVectorGraph(dataTables.tableA,dataTables.tableC));

}

// Create the 4 box plots from the tables data object if they contain rows
function createBoxPlots(tablesData){
    if(tablesData.tableA.length > 0){
        createBoxPlot(createDataForBoxPlot(tablesData.tableA), "#boxplotA-div", tablesData.tableA[0].section + " " +tablesData.tableA[0].description);
    }
    if(tablesData.tableB.length > 0){
        createBoxPlot(createDataForBoxPlot(tablesData.tableB), "#boxplotB-div", tablesData.tableB[0].section + " " + tablesData.tableB[0].description);
    }
    if(tablesData.tableC.length > 0){
        createBoxPlot(createDataForBoxPlot(tablesData.tableC), "#boxplotC-div", tablesData.tableC[0].section + " " + tablesData.tableC[0].description);
    }
    if(tablesData.tableD.length > 0){
        createBoxPlot(createDataForBoxPlot(tablesData.tableD), "#boxplotD-div", tablesData.tableD[0].section + " " + tablesData.tableD[0].description);
    }
}

// Create the 4 grouped bar graphs from the tables data object if they contain rows
function createGroupedBardGraphs(tablesData){
    if(tablesData.tableA.length > 0){
        var table1Data = createDataForGroupedGraph(tablesData.tableA);
        createdGroupedBarGraph(table1Data.data, table1Data.keys,tablesData.tableA[0].section + " " +tablesData.tableA[0].description,tablesData.tableA[0].units,"#grouped-bar-a");
    }
    if(tablesData.tableB.length > 0){
        var table2Data = createDataForGroupedGraph(tablesData.tableB);
        createdGroupedBarGraph(table2Data.data, table1Data.keys, tablesData.tableB[0].section + " " + tablesData.tableB[0].description, tablesData.tableB[0].units, "#grouped-bar-b");
    }
    if(tablesData.tableC.length > 0){
        var table3Data = createDataForGroupedGraph(tablesData.tableC);
        createdGroupedBarGraph(table3Data.data, table1Data.keys, tablesData.tableC[0].section + " " + tablesData.tableC[0].description, tablesData.tableC[0].units, "#grouped-bar-c");
    }
    if(tablesData.tableD.length > 0){
        var table4Data = createDataForGroupedGraph(tablesData.tableD);
        createdGroupedBarGraph(table4Data.data, table1Data.keys, tablesData.tableD[0].section + " " + tablesData.tableD[0].description, tablesData.tableD[0].units, "#grouped-bar-d");
    }
}

// Receives rows from DB and converts to html tables
function createTables(tablesData){
    insertTable(tablesData.tableA,'#tableA');
    insertTable(tablesData.tableB,'#tableB');
    insertTable(tablesData.tableC,'#tableC');
    insertTable(tablesData.tableD,'#tableD');
    insertTableOverTable(true,tablesData);
    insertTableOverTable(false,tablesData);
}

function insertTableOverTable(ab,tablesData){
    var combined = []; // Contain object with edb disc_yr value

    var at = ab ? tablesData.tableA : tablesData.tableC;
    var bt = ab ? tablesData.tableB : tablesData.tableD;

    for(var i = 0; i < at.length; i++){
        for(var j = 0; j < bt.length; j++){
            if(at[i].edb === bt[j].edb && at[i].obs_yr === bt[j].obs_yr && at[i].disc_yr === bt[j].disc_yr){
                combined.push({ disc_yr : bt[j].disc_yr ,edb : bt[j].edb, "obs_yr" : bt[j].obs_yr, value : at[i].value / bt[j].value});// Divide the values
                break; // can exit the loop
            }
        }

    }

    insertTable(combined, ab ? "#tableAB" : "#tableCD");
}


// Here every row belongs to the specific table
function insertTable(tableRows,id){
    // Sorts the EDB names
    tableRows.sort(function (a,b) {
        return [a.edb, b.edb].sort()[0] === a.edb ? -1 : 1; // Sort two names and return the first
    });

    if(tableRows.length === 0)return; // No data so return

    // Add the title to the table
    $(id).append('<caption>' +tableRows[0].section + " " + tableRows[0].description + '</caption>');

    // Find the min and max year from the data
    var min = tableRows.reduce(function(prev, curr) {
        return prev.disc_yr < curr.disc_yr ? prev : curr;
    }).obs_yr;

    var max = tableRows.reduce(function(prev, curr) {
        return prev.disc_yr > curr.disc_yr ? prev : curr;
    }).obs_yr; //TODO this line might need to be disc_yr

    // Create cells for each of the years to use as header
    var years = "";
    for(var i = min; i <= max; i++){
        years += "<th>" + i + "</th>";
    }

    $(id).append('<tr id="head-row" class="table-row"> <th>EDB</th>'+ years + '</tr>');

    // An array of companies already processed
    var done = [];
    var cellCount = 0;
    var cellValues = [];

    var observerd = true;

    // Create the rows of data
    for(var i = 0; i < tableRows.length; i++){
        if(!done.includes(tableRows[i].edb)){
            done.push(tableRows[i].edb);

            var row= "<tr class='table-row' id=row"+id+i+">";

            // Insert name in column and assign an id to the row
            row += "<th>" + tableRows[i].edb + "</th>";


            for(var cur = min; cur <=max; cur++){
                // Iterate through all rows finding ones with the current edb
                for(var j = 0; j < tableRows.length; j++){

                    // Check it matches edb and year inserting into
                    if(tableRows[j].edb === tableRows[i].edb && tableRows[j].disc_yr === cur){
                        row += "<th class='cell' id='t"+id+""+cellCount+"'>" + tableRows[j].value + "</th>";

                        // Save the value and the id of the cell to display percentage
                        cellValues.push({ id : "#t"+id+""+cellCount, value : tableRows[j].value });
                        cellCount++;
                    }
                }
            }

            $(id).append(row + '</tr>');
            // Here we can check the unit type and highlight appropriately
            // Assing a on click function to each of the rows to generate the bar graph with the row specific data
            //$( "#row"+i+"").click(function(event) {
            //    showBarWithRowElem(this.id);
            //});
        }
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
    var rows = {
        i0 : selections[0].id,
        s0  : selections[0].section,
        c0 : selections[0].category,
        sc0 : selections[0].subCategory,
        d0 : selections[0].description,
        i1 : selections[1].id,
        s1  : selections[1].section,
        c1 : selections[1].category,
        sc1 : selections[1].subCategory,
        d1 : selections[1].description,
        i2 : selections[2].id,
        s2  : selections[2].section,
        c2 : selections[2].category,
        sc2 : selections[2].subCategory,
        d2 : selections[2].description,
        i3 : selections[3].id,
        s3  : selections[3].section,
        c3 : selections[3].category,
        sc3 : selections[3].subCategory,
        d3 : selections[3].description
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
    return {min : min, max : max, data : data, scatterData : sValues};
}

// Creates the data for the bar graphs from the rows used in D3
function createDataForGroupedGraph(rows){
    var data = [];
    // includes
    var edbDone = [];

    // Find the min and max year from the data
    var min = rows.reduce(function(prev, curr) {
        return prev.disc_yr < curr.disc_yr ? prev : curr;
    }).obs_yr;

    var max = rows.reduce(function(prev, curr) {
        return prev.disc_yr > curr.disc_yr ? prev : curr;
    }).obs_yr;

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

    var keys = [];

    for(var i = min; i <= max; i++){
        keys.push(""+i);
    }
    return {data : data, keys : keys};
}

// Loads in sections along with the rows of selection boxes
function loadInSections(){
    // Grab all the sections
    /// Query for all sections
    $.get("/sections/sections", function(data){
        // Create the four filters rows

        addSection(0);
        addSection(1);
        addSection(2);
        addSection(3);

        // Sort the sections
        data.sections.sort(function(a,b){
            // First check simple case of number difference
            var i = 0;
            while(!isNaN(a.charAt(i))){
                i++
            }
            var numberA = a.substring(0,i); // Gets the number from the section

            i = 0;
            while(!isNaN(b.charAt(i))){
                i++
            }

            var numberB = b.substring(0,i);

            if(numberA !== numberB) {
                return numberA - numberB;
            }
            return [a,b].sort()[0] === a ? -1 : 1; // Sort two names and return the first
        });

        // Go through each row and add the sections in
        for(var i = 0; i < selections.length; i++){
            for(var j = 0; j < data.sections.length; j++){
                $("#section-select"+selections[i].id+"").append('<option>' + data.sections[j] + '</option>');
            }
            $(".selectpicker").selectpicker('refresh');
        }
    });
}

// Adds a new row of filters for section category and sub category
function addSection(numberSections){

    // Add in a new row div
    $('#compare-div').append('<div class="col-xs-3 compare-col" id="Ocol'+numberSections+'">');

    $("#Ocol"+numberSections).append('<div class="row"><h5>Make a selection for table A</h5></div>');


    // Add in a new col div
    $("#Ocol"+numberSections).append('<div class="row" id="col'+numberSections+'">');

    // add section selector with the number section as the dynamic id
    $("#col"+numberSections).append('<select data-width="120px" class="selectpicker select-compare"  title="Section" id="section-select'+numberSections+'"></select>');

    // Push the information for the new row into the selections array
    selections.push({id : numberSections, section : "", category : "", subCategory : "", description : ""});

    // Add a change listener for when a section is selected
    $("#section-select"+numberSections).on('change', function(event){
        var section = $(this).find("option:selected").text(); // Grab the selection
        var idNumb = event.target.id.charAt(event.target.id.length-1); // Grab the last character of the id that generated the event to work out correct id

        // Find all the categories associated with this section
        $.post("/sections/s",{selected : section }, function(data){
            if(data.categories.length > 0  &&  data.categories[0] !== null){
                $('#category-select'+idNumb).html(''); // Empty temp options
            }

            // Add the options to the drop down
            for(var i = 0; i < data.categories.length; i++){
                $('#category-select'+idNumb).append('<option>' + data.categories[i] + '</option>');
            }

            // Refresh all drop downs
            $(".selectpicker").selectpicker('refresh');
        });
        addToSelection(idNumb,"section",section); // Record change in the array of selections
    });

    // add category selector
    $("#col"+numberSections).append('<select data-width="120px" class="selectpicker select-compare" title="Category" id="category-select'+numberSections+'"></select>');
    $('#category-select'+numberSections).on('change', function(event){
        var category = $(this).find("option:selected").text();
        var idNumb = event.target.id.charAt(event.target.id.length-1);

        // Find all sub categories for the currently selected category
        $.post("/sections/sc",{section : selections[idNumb].section, category : category}, function(data){

            if(data.subCategories.length > 0  &&  data.subCategories[0] !== null){
                $('#subsection-select'+idNumb).html(''); // Empty temp options
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
    $("#col"+numberSections).append('<select data-width="120px" class="selectpicker select-compare" title="Subsection" id="subsection-select'+numberSections+'"></select>');
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
    $("#col"+numberSections).append('<select data-width="120px" class="selectpicker select-compare" title="Description" id="description-select'+numberSections+'"></select>');
    $('#description-select'+numberSections).on('change', function(event){
        var idNumb = event.target.id.charAt(event.target.id.length-1);

        var data = $(this).find("option:selected").text();
        addToSelection(idNumb,"description", data);
    });
    //numberSections++; // Increment the int used for id's
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

// Object for holder the users selection
function Selection(a,b,c,d){
    this.aTable = a;
    this.bTable = b;
    this.cTable = c;
    this.dTable = d;
}

// Object for holder rows for each table
function DataTables(tableA,tableB,tableC,tableD){
    this.tableA = tableA;
    this.tableB = tableB;
    this.tableC = tableC;
    this.tableD = tableD;
}