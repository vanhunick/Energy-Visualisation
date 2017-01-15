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


            // create table
            for(var i = 0; i < data.rows.length; i++){

            }

        });


    });


});

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