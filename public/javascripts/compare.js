/**
 * Created by Nicky on 23/01/2017.
 */

var numberSections = 0; // The id count for each row

// Holds the currently selected items in the filter rows
var selections = [];

// Holds a object that contains the rows of selections that were last searched
var lastSearch = null;

var selectedCompany = "";

// Hold if these tables have been selected
var b = false;
var d = false;

// Adds a new row of filters for section category and sub category
function addSection(){

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
    numberSections++; // Increment the int used for id's
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

    loadInSections();

});


function loadInSections(){
    // Grab all the sections
    /// Query for all sections
    $.get("/sections/sections", function(data){
        // Create the four filters rows
        //$('#compare-div').append('<div class="row"><div class="col-xs-12"><h5>Make a selection for table A</h5></div></div>');
        addSection();
        //$('#compare-div').append('<div class="row"><div class="col-xs-12"><h5>Make a selection for table B</h5></div></div>');
        addSection();
        //$('#compare-div').append('<div class="row"><div class="col-xs-12"><h5>Make a selection for table C</h5></div></div>');
        addSection();
        //$('#compare-div').append('<div class="row"><div class="col-xs-12"><h5>Make a selection for table D</h5></div></div>');
        addSection();

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

            if(data.sections.length > 0){
                //$('#section-select'+selections[i].id).html('<option selected>' + data.sections[0] + '</option>'); // Empty temp options
            }

            for(var j = 0; j < data.sections.length; j++){
                $("#section-select"+selections[i].id+"").append('<option>' + data.sections[j] + '</option>');
            }
            $(".selectpicker").selectpicker('refresh');
        }
    });
}

function loadFromURL(selections){
    lastSearch = new Selection(selections[0],selections[1],selections[2],selections[3]); //TODO copy values
    // Send array of selected sections to server and the company
    $.post("/compare/search",{company : selectedCompany, selections : JSON.stringify(selections)}, function(data){
        insertTables(data.rows);
    });
}


// Receives rows from DB and converts to html tables
function insertTables(rows){
    // Filter the rows for each table based on the selected sections
    var aRows = rows.filter(function(e){
        return matchDBRow(e,lastSearch.aTable);
    });

    var bRows = rows.filter(function(e){
        return matchDBRow(e,lastSearch.bTable);
    });

    var cRows = rows.filter(function(e){
        return matchDBRow(e,lastSearch.cTable);
    });

    var dRows = rows.filter(function(e){
        return matchDBRow(e,lastSearch.dTable);
    });

    insertTable(aRows,'#tableA');
    if(aRows.length !== 0){
        var table1Data = createDataForGroupedGraph(aRows);
        createdGroupedBarGraph(table1Data.data, table1Data.keys,aRows[0].section + " " +aRows[0].description,aRows[0].units,"#grouped-bar-a");

        createBoxPlot(createDataForBoxPlot(aRows), "#boxplot-div")
    }


    insertTable(bRows,'#tableB');
    if(bRows.length !== 0) {
        var table2Data = createDataForGroupedGraph(bRows);
        createdGroupedBarGraph(table2Data.data, table1Data.keys, bRows[0].section + " " + bRows[0].description, bRows[0].units, "#grouped-bar-b");
    }

    insertTable(cRows,'#tableC');
    if(cRows.length !== 0) {
        var table3Data = createDataForGroupedGraph(cRows);
        createdGroupedBarGraph(table3Data.data, table1Data.keys, cRows[0].section + " " + cRows[0].description, cRows[0].units, "#grouped-bar-c");
    }

    insertTable(dRows,'#tableD');
    if(dRows.length !== 0) {
        var table4Data = createDataForGroupedGraph(dRows);
        createdGroupedBarGraph(table4Data.data, table1Data.keys, dRows[0].section + " " + dRows[0].description, dRows[0].units, "#grouped-bar-d");
    }
}

// Here every row belongs to the specific table
function insertTable(tableRows,id){

    // Sorts the EDB names
    tableRows.sort(function (a,b) {
        return [a.edb, b.edb].sort()[0] === a.edb ? -1 : 1; // Sort two names and return the first
    });

    var observerd = true;


    if(tableRows.length === 0)return; // No data so return

    // Add the title to the table
    $(id).append('<caption>' +tableRows[0].section + " " + tableRows[0].description + '</caption>');

    // Find the min and max year from the data
    min = tableRows.reduce(function(prev, curr) {
        return prev.disc_yr < curr.disc_yr ? prev : curr;
    }).obs_yr;

    max = tableRows.reduce(function(prev, curr) {
        return prev.disc_yr > curr.disc_yr ? prev : curr;
    }).obs_yr;


    // Create cells for each of the years to use as header
    var years = "";
    for(var i = min; i <= max; i++){
        years += "<th>" + i + "</th>";
    }

    // If it is the first table add edb column else leave it out
    //if(id === "#tableA"){
    //    $(id).append('<tr id="head-row" class="table-row"> <th>EDB</th>'+ years + '</tr>');
    //} else {
    //    $(id).append('<tr id="head-row" class="table-row">'+ years + '</tr>');
    //}

    $(id).append('<tr id="head-row" class="table-row"> <th>EDB</th>'+ years + '</tr>');

    // An array of companies already processed
    var done = [];
    var cellCount = 0;

    var cellValues = [];

    // Create the rows of data
    for(var i = 0; i < tableRows.length; i++){
        if(!done.includes(tableRows[i].edb)){

            done.push(tableRows[i].edb);

            var row= "<tr class='table-row' id=row"+id+i+">";

            // Insert name in column and assign an id to the row

            // Only add edb for the first table in this case tableA
            //if(id === "#tableA"){
                row += "<th>" + tableRows[i].edb + "</th>";
            //}

            for(var cur = min; cur <=max; cur++){
                // Iterate through all rows finding ones with the current edb
                for(var j = 0; j < tableRows.length; j++){

                    // Check it matches edb and year inserting into
                    if(tableRows[j].edb === tableRows[i].edb && (observerd ? tableRows[j].disc_yr : tableRows[j].fcast_yr) === cur){
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


function search(){

    var rows = {
        id0 : selections[0].id,
        section0  : selections[0].section,
        category0 : selections[0].category,
        subCategory0 : selections[0].subCategory,
        description0 : selections[0].description,
        id1 : selections[1].id,
        section1  : selections[1].section,
        category1 : selections[1].category,
        subCategory1 : selections[1].subCategory,
        description1 : selections[1].description,
        id2 : selections[2].id,
        section2  : selections[2].section,
        category2 : selections[2].category,
        subCategory2 : selections[2].subCategory,
        description2 : selections[2].description,
        id3 : selections[3].id,
        section3  : selections[3].section,
        category3 : selections[3].category,
        subCategory3 : selections[3].subCategory,
        description3 : selections[3].description
    };

    params = serialise(rows);
    window.location.replace("compare?" + params);
}


function serialise(obj) {
    var str = [];
    for(var p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
}

function createDataForBoxPlot(tableRows){


    var yearsDone = [];

    var years = []; // Will contain an array of rows for each year

    for(var i = 0; i < tableRows.length; i++){
        if(!yearsDone.includes(tableRows[i].obs_yr)){
            years.push(tableRows.filter(function(e){return e.obs_yr === tableRows[i].obs_yr}));
            yearsDone.push(tableRows[i].obs_yr);
        }
    }

    var data = []; // Each entry will be an array where array[0] = year and array[1] = values for that year

    var min = Infinity;
    var max = -Infinity;

    for(var i = 0; i < years.length; i++){
        var entry = [];

        entry[0] = ""+years[i][0].obs_yr; // Name of the box plot convert year to string

        var values = [];
        for(var j = 0; j < years[i].length; j++){
            var curValue = +years[i][j].value;
            curValue = Math.floor(curValue);

            if (curValue > max){
                max = curValue;
            }
            if (curValue < min){
                min = curValue;
            }
            values.push(curValue);
        }
        entry[1] = values;
        data.push(entry);
    }

    return {min : min, max : max, data : data};
}


// Makes sure the correct rows are selected before searching
function validateSelections(){
    // First


}


function createDerivedTables(aData,bData,cData,dData){
        // First create A / B
        for(var i = 0; i < aData.length; i++){

        }
}


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

// Object for holder the users selection
function Selection(a,b,c,d){
    this.aTable = a;
    this.bTable = b;
    this.cTable = c;
    this.dTable = d;
}