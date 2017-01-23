/**
 * Created by Nicky on 15/01/2017.
 */


// Hold the currently selected sections
var section = "";
var category = "";
var subcategory = "";
var company = "";

$(document).ready( function() {

    // Queries DB and inserts options in selection dropdown
    insertCompanies();

    // Add listeners to section select called when section is selected
    $('#section-select').on('change', function(){

        // Set the currently selected section
        section = $(this).find("option:selected").text();

        // Find all the categories associated with this section
        $.post("/sections/s",{selected : section }, function(data){
            if(data.categories.length > 0){
                $('#category-select').html(''); // Empty temp options
            }

            // Add the options to the drop down
            for(var i = 0; i < data.categories.length; i++){
                $('#category-select').append('<option>' + data.categories[i] + '</option>');
            }

            // Refresh all drop downs
            $(".selectpicker").selectpicker('refresh');
        });
    });


    // listener for category change
    $('#category-select').on('change', function(){

        // Set the currently selected category
        category = $(this).find("option:selected").text();

        //TODO might have to make sure the section is also the same

        // Find all sub categories for the currently selected category
        $.post("/sections/sc",{category : category}, function(data){
            if(data.subCategories.length > 0){
                $('#subsection-select').html(''); // Empty temp options
            }

            // Add sub section options
            for(var i = 0; i < data.subCategories.length; i++){
                $('#subsection-select').append('<option>' + data.subCategories[i] + '</option>');
            }
            $(".selectpicker").selectpicker('refresh');
        });

    });

    $('#subsection-select').on('change', function(){
        // Set the sub category
        subcategory = $(this).find("option:selected").text();

    });

    $('#company-select').on('change', function(){
        // set the selected company
        company = $(this).find("option:selected").text();
    });

    // Clicked the search button
    $( "#search-btn" ).click(function() {

        //TODO First check if any values null

        // Send category, section, sub category and company
        $.post("/sections/search",{section : section, category : category, subCategory : subcategory, company : company}, function(data){
            if(data.rows.length > 0){
                insertDataTable(data.rows);
            } else {
                console.log("No results");
            }
        });
    });
});





// Creates a table with the given rows
function insertDataTable(rows){

    // first create caption title with description
    $('#results-table').append('<caption>' + rows[0].description + '</caption>');
    //TODO check if discovered or observed
    var observerd = false;

    if(rows[0].obs_yr !== ""){
        console.log("Observed");
        observerd = true;
    } else if(rows[0].fcast_yr !== "") {
        console.log("Forecast");
    }

    var min = null;
    var max = null;

    if(observerd){
        // Find the min and max year
        min = rows.reduce(function(prev, curr) {
            return prev.disc_yr < curr.disc_yr ? prev : curr;
        }).obs_yr;

        max = rows.reduce(function(prev, curr) {
            return prev.disc_yr > curr.disc_yr ? prev : curr;
        }).obs_yr;
    } else {
        // Find the min and max year
        min = rows.reduce(function(prev, curr) {
            return prev.fcast_yr < curr.fcast_yr ? prev : curr;
        }).fcast_yr;

        max = rows.reduce(function(prev, curr) {
            return prev.fcast_yr > curr.fcast_yr ? prev : curr;
        }).fcast_yr;
    }

    console.log("Min " + min + " Max " + max);


    //// Find the min and max year
    //var min = rows.reduce(function(prev, curr) {
    //    return prev.disc_yr < curr.disc_yr ? prev : curr;
    //});
    //
    //var max = rows.reduce(function(prev, curr) {
    //    return prev.disc_yr > curr.disc_yr ? prev : curr;
    //});

    //Create the columns
    var years = "";

    for(var i = min; i <= max; i++){
        years += "<th>" + i + "</th>";
    }

    $('#results-table').append('<tr id="head-row"> <th>EDB</th>'+ years + '</tr>');


    // An array of companies already processed
    var done = [];

    // Create the rows of data
    for(var i = 0; i < rows.length; i++){
        if(!done.includes(rows[i].edb)){

            done.push(rows[i].edb);

            // Insert name in column and assign an id to the row
            var row = "<tr id=row"+i+"><th>" + rows[i].edb + "</th>";

            for(var cur = min; cur <=max; cur++){

                // Iterate through all rows finding ones with the current edb
                for(var j = 0; j < rows.length; j++){

                    // Check it matches edb and year inserting into
                    if(rows[j].edb === rows[i].edb && (observerd ? rows[j].disc_yr : rows[j].fcast_yr) === cur){
                        row += "<th>" + rows[j].value + "</th>";
                    }
                }
            }

            $('#results-table').append(row + '</tr>');

            // Assing a on click function to each of the rows to generate the bar graph with the row specific data
            $( "#row"+i+"").click(function(event) {
                showBarWithRowElem(this.id);
            });
        }
    }
}

function showBarWithRowElem(rowID){
    var data = [];


    // set the row selected
    $('#results-table').find('tr').removeClass('row-selected');
    $('#'+rowID).addClass('row-selected');


    $('#head-row').find('th').each(function (index, element) {
        if(index != 0){ // 0 is not a year
            data.push({category : $(element).text(), value : 0}); // 0 is temp
        }
    });

    var title = "";

    $('#'+rowID).find('th').each(function (index, element) {
        if(index != 0){
            data[index-1].value = $(element).text();
        } else {
            title = data[index].value = $(element).text();
        }
    });

    createBarGraph(title, data);
}


function insertCompanies(){
    $.get("/sections/company", function(data){
        if(data.companies.length > 0){
            $('#company-select').html('<option selected>' + data.companies[0] + '</option>'); // Empty temp options
        }

        for(var i = 1; i < data.companies.length; i++){
            $('#company-select').append('<option>' + data.companies[i] + '</option>');
        }
        $(".selectpicker").selectpicker('refresh');
    });
}