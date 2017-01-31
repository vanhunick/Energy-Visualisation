/**
 * Created by Nicky on 23/01/2017.
 */

var numberSections = 0; // The id count for each row

// Holds the currently selected items in the filter rows
var selections = [];

var lastSearch = null;

var selectedCompany = "";

// Hold if these tables have been selected
var b = false;
var d = false;

// Adds a new row of filters for section category and sub category
function addSection(){
    $('#compare-div').append('<div class="row compare-row" id="row'+numberSections+'">');
    $("#row"+numberSections).append('<div class="col-md-12" id="col'+numberSections+'">');

    // add section selector
    $("#col"+numberSections).append('<select class="selectpicker select-compare"  title="Section" id="section-select'+numberSections+'"></select>');

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
        addToselection(idNumb,"section",section); // Record change in the array of selections
    });

    // add category selector
    $("#col"+numberSections).append('<select class="selectpicker select-compare" title="Category" id="category-select'+numberSections+'"></select>');
    $('#category-select'+numberSections).on('change', function(event){
        var category = $(this).find("option:selected").text();
        var idNumb = event.target.id.charAt(event.target.id.length-1);

        console.log("T " + selections[idNumb].section);

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
        addToselection(idNumb,"category", category);
    });

    // add sub category selector
    $("#col"+numberSections).append('<select class="selectpicker select-compare" title="Subsection" id="subsection-select'+numberSections+'"></select>');
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


        addToselection(idNumb,"subcategory", subCat);
    });

    // add description selector
    $("#col"+numberSections).append('<select class="selectpicker select-compare" title="Description" id="description-select'+numberSections+'"></select>');
    $('#description-select'+numberSections).on('change', function(event){
        var idNumb = event.target.id.charAt(event.target.id.length-1);

        var data = $(this).find("option:selected").text();
        addToselection(idNumb,"description", data);
    });


    numberSections++;
}

function addToselection(id, type, data){

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

    $('#company-select').on('change', function(event){
        console.log(selectedCompany);
        selectedCompany = $(this).find("option:selected").text();
    });

    $('#genSection-btn').click(function(){
        addSection();
    });

    $('#search-btn-compare').click(function(){
        console.log("selected " + selectedCompany);
        lastSearch = new Selection(selections[0],selections[1],selections[2],selections[3]); //TODO copy values
        // Send array of selected sections to server and the company
        $.post("/compare/search",{company : selectedCompany, selections : JSON.stringify(selections)}, function(data){
            insertTables(data.rows);
        });
    });


    // Grab all the sections
    /// Query for all sections
    $.get("/sections/sections", function(data){

        // Create the four filters rows
        addSection();
        addSection();
        addSection();
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
});

function insertTables(rows){
    // First create the table A as it must exist

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
    insertTable(bRows,'#tableB');
    insertTable(cRows,'#tableC');
    insertTable(dRows,'#tableD');
}

// Here every row belongs to the specific table
function insertTable(tableRows,id){

    tableRows.sort(function (a,b) {
        return [a.edb, b.edb].sort()[0] === a.edb ? -1 : 1; // Sort two names and return the first
    });

    var observerd = true;

    console.log(tableRows.length);
    if(tableRows.length === 0)return;
    $(id).append('<caption>' +tableRows[0].section + " " + tableRows[0].description + '</caption>');

    min = tableRows.reduce(function(prev, curr) {
        return prev.disc_yr < curr.disc_yr ? prev : curr;
    }).obs_yr;

    max = tableRows.reduce(function(prev, curr) {
        return prev.disc_yr > curr.disc_yr ? prev : curr;
    }).obs_yr;


    var years = "";

    for(var i = min; i <= max; i++){
        years += "<th>" + i + "</th>";
    }

    $(id).append('<tr id="head-row"> <th>EDB</th>'+ years + '</tr>');

    // An array of companies already processed
    var done = [];
    var cellCount = 0;

    var cellValues = [];

    // Create the rows of data
    for(var i = 0; i < tableRows.length; i++){
        if(!done.includes(tableRows[i].edb)){

            done.push(tableRows[i].edb);

            // Insert name in column and assign an id to the row
            var row = "<tr id=row"+id+i+"><th>" + tableRows[i].edb + "</th>";


            for(var cur = min; cur <=max; cur++){

                // Iterate through all rows finding ones with the current edb
                for(var j = 0; j < tableRows.length; j++){

                    // Check it matches edb and year inserting into
                    if(tableRows[j].edb === tableRows[i].edb && (observerd ? tableRows[j].disc_yr : tableRows[j].fcast_yr) === cur){
                        row += "<th id='t"+id+""+cellCount+"'>" + tableRows[j].value + "</th>";

                        // Save the value and the id of the cell to display percentage
                        cellValues.push({ id : "#t"+id+""+cellCount, value : tableRows[j].value });

                        cellCount++;
                    }
                }
            }

            $(id).append(row + '</tr>');

            // Assing a on click function to each of the rows to generate the bar graph with the row specific data
            //$( "#row"+i+"").click(function(event) {
            //    showBarWithRowElem(this.id);
            //});
        }
    }

}


function matchDBRow(DBRow, selection){
    if(DBRow.section === selection.section && DBRow.category === selection.category && DBRow.sub_category === selection.subCategory && DBRow.description === selection.description){
        return true;
    }
    return false;
}

function Selection(a,b,c,d){
    this.aTable = a;
    this.bTable = b;
    this.cTable = c;
    this.dTable = d;
}