/**
 * Created by Nicky on 23/01/2017.
 */

var numberSections = 1; // The id count for each row

// Holds the currently selected items in the filter rows
var selections = [];


// Adds a new row of filters for section category and sub category
function addSection(){
    $('#compare-div').append('<div class="row">');
    $('#compare-div').append('<div class="col-md-12">');

    // add section selector
    $('#compare-div').append('<select class="selectpicker"  title="Section" id="section-select'+numberSections+'"><option>No data</option> </select>');

    // Push the information for the new row into the selections array
    selections.push({id : numberSections, section : "", category : "", subCategory : ""});


    $("#section-select"+numberSections).on('change', function(event){
        var section = $(this).find("option:selected").text();
        console.log("Section selected")

        // Find all the categories associated with this section
        $.post("/sections/s",{selected : section }, function(data){
            if(data.categories.length > 0){
                var idNumb = event.target.id.charAt(event.target.id.length-1);

                $('#category-select'+idNumb).html(''); // Empty temp options

            }

            // Add the options to the drop down
            for(var i = 0; i < data.categories.length; i++){
                $('#category-select'+idNumb).append('<option>' + data.categories[i] + '</option>');
            }

            // Refresh all drop downs
            $(".selectpicker").selectpicker('refresh');
        });

        addToselection(numberSections,"section",section);
    });

    // add category selector
    $('#compare-div').append('<select class="selectpicker" title="Category" id="category-select'+numberSections+'"> <option>No data</option> </select>');
    $('#category-select'+numberSections).on('change', function(event){
        var category = $(this).find("option:selected").text();

        // Find all sub categories for the currently selected category
        $.post("/sections/sc",{category : category}, function(data){
            var idNumb = event.target.id.charAt(event.target.id.length-1);

            if(data.subCategories.length > 0){
                $('#subsection-select'+idNumb).html(''); // Empty temp options
            }

            // Add sub section options
            for(var i = 0; i < data.subCategories.length; i++){
                $('#subsection-select'+idNumb).append('<option>' + data.subCategories[i] + '</option>');
            }
            $(".selectpicker").selectpicker('refresh');
        });

        addToselection(numberSections,"category", category);
    });

    // add sub category selector
    $('#compare-div').append('<select class="selectpicker" title="Subsection" id="subsection-select'+numberSections+'"><option>No data</option></select>');
    $('#subsection-select'+numberSections).on('change', function(){
        var data = $(this).find("option:selected").text();
        addToselection(numberSections,"subcategory", data);
    });

    numberSections++;
}

function addToselection(id, type, data){
    for(var i = 0; i < selections.length; i++){
        if(selections[i].id === id){
            if(type === "section"){
                selections[i].section = data;
            } else if(type === "category"){
                selections[i].category = data;
            } else if(type === "subcategory"){
                selections[i].subCategory = data;
            }
        }
    }
}



$(document).ready( function() {

    $('#genSection-btn').click(function(){
        addSection();
    });
    // Grab all the sections
    /// Query for all sections
    $.get("/sections/sections", function(data){

        // Create the filters
        addSection();
        addSection();
        addSection();


        // Go through each row and add the section in
        for(var i = 0; i < selections.length; i++){
            console.log("Adding");
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