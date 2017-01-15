/**
 * Created by Nicky on 15/01/2017.
 */


var section = "";
var category = "";
var subcategory = "";
var company = "";

$(document).ready( function() {

    // Queries DB and inserts options in selection dropdown
    insertCompanies();

    // Add listeners to selectors
    $('#section-select').on('change', function(){
        section = $(this).find("option:selected").text();
        var selected = $(this).find("option:selected").text();

        $.post("/sections/s",{selected : selected }, function(data){
            if(data.categories.length > 0){
                $('#category-select').html('<option selected>' + data.categories[0] + '</option>'); // Empty temp options
            }

            for(var i = 1; i < data.categories.length; i++){
                $('#category-select').append('<option>' + data.categories[i] + '</option>').selectpicker('refresh');
            }
            $(".selectpicker").selectpicker('refresh');
        });
    });

    // Sets field for selector
    $('#category-select').on('change', function(){
        category = $(this).find("option:selected").text();
    });

    $('#subcategory-select').on('change', function(){
        subcategory = $(this).find("option:selected").text();
    });

    $('#company-select').on('change', function(){
        company = $(this).find("option:selected").text();
    });

    // Clicked the search button
    $( "#search-btn" ).click(function() {

        // First check if any values null

        //TODO subsection
        // Send category, section and company
        $.post("/sections/search",{section : section, category : category, company : company}, function(data){
            if(data.rows.length > 0){
                console.log("insering table")
                insertDataTable(data.rows);
            } else {
                console.log("not inserting table");
            }
        });


    });


});

function insertDataTable(rows){
    // first create caption title with description
    $('#results-table').append('<caption>' + rows[0].description + '</caption>');
    //TODO check if discovered or observed

    // Find the min and max year
    var min = rows.reduce(function(prev, curr) {
        return prev.disc_yr < curr.disc_yr? prev : curr;
    });

    var max = rows.reduce(function(prev, curr) {
        return prev.disc_yr > curr.disc_yr? prev : curr;
    });

    //Create the columns
    var years = "";
    for(var i = min.disc_yr; i <=max.disc_yr; i++){
        years += "<th>" + i + "</th>";
    }

    $('#results-table').append('<tr> <th>EDB</th>'+ years + '</tr>');


    // An array of companies already processed
    var done = [];

    // Create the rows of data
    for(var i = 0; i < rows.length; i++){
        if(!done.includes(rows[i].edb)){

            done.push(rows[i].edb);

            // Insert name in column
            var row = "<tr><th>" + rows[i].edb + "</th>";

            for(var cur = min.disc_yr; cur <=max.disc_yr; cur++){

                // Iterate through all rows finding ones with the current edb
                for(var j = 0; j < rows.length; j++){

                    // Check it matches edb and year inserting into
                    if(rows[j].edb === rows[i].edb && rows[j].disc_yr === cur){
                        row += "<th>" + rows[i].value + "</th>";
                    }
                }
            }

            //console.log("Data Row " + row);
            $('#results-table').append(row + '</tr>');

        }
    }
}

function insertCompanies(){
    $.get("/sections/company", function(data){
        console.log(data);
        if(data.companies.length > 0){
            $('#company-select').html('<option selected>' + data.companies[0] + '</option>'); // Empty temp options
        }

        for(var i = 1; i < data.companies.length; i++){
            $('#company-select').append('<option>' + data.companies[i] + '</option>').selectpicker('refresh');
        }
        $(".selectpicker").selectpicker('refresh');
    });
}