/**
 * Created by Nicky on 23/01/2017.
 */

var numberSections = 1; // The id count for each row

// Holds the currently selected items in the filter rows
var selections = [];

var selectedCompany = "";

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
            if(data.categories.length > 0){
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

        // Find all sub categories for the currently selected category
        $.post("/sections/sc",{category : category}, function(data){

            if(data.subCategories.length > 0){
                $('#subsection-select'+idNumb).html(''); // Empty temp options
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

        var data = $(this).find("option:selected").text();
        addToselection(idNumb,"subcategory", data);
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
        // Send array of selected sections to server and the company
        console.log(selections);
        $.post("/compare/search",{company : selectedCompany, selections : JSON.stringify(selections)}, function(data){

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
                $('#section-select'+selections[i].id).html('<option selected>' + data.sections[0] + '</option>'); // Empty temp options
            }

            for(var j = 0; j < data.sections.length; j++){
                $("#section-select"+selections[i].id+"").append('<option>' + data.sections[j] + '</option>');
            }
            $(".selectpicker").selectpicker('refresh');
        }
    });
});