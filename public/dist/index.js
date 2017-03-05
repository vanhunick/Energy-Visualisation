/**
 * Created by Nicky on 15/01/2017.
 */


// Hold the currently selected sections
var section = "";
var category = "";
var subcategory = "";
var company = "";
var description = "";

var descriptionExists = false;
var subExists = false;

$(document).ready( function() {
    // Highlight the selected link
    $(".nav-link").removeClass('active');
    $("#data-link").addClass('active');

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
        $.post("/sections/sc",{category : category,section : section}, function(data){
            if(data.subCategories.length > 0 &&  data.subCategories[0] !== null){
                subExists = true;
                $('#subsection-select').html(''); // Empty temp options
            } else {
                subExists = false; //TODO Check for no data when searching server side or remove No data option
                return;
            }

            // Add sub section options
            for(var i = 0; i < data.subCategories.length; i++){
                $('#subsection-select').append('<option>' + data.subCategories[i] + '</option>');
            }
            $(".selectpicker").selectpicker('refresh');
        });

    });


    // Sub Category select listener
    $('#subsection-select').on('change', function(){
        // Set the sub category
        subcategory = $(this).find("option:selected").text();


        // Find all descriptions for the currently selected sub category
        $.post("/sections/desc",{category : category,section : section, subCategory : subcategory}, function(data){
            if(data.descriptions.length > 0 &&  data.descriptions[0] !== null){
                descriptionExists = true;
                $('#description-select').html(''); // Empty temp options
            } else {
                descriptionExists = false; //TODO Check for no data when searching server side or remove No data option
                return;
            }

            // Add sub section options
            for(var i = 0; i < data.descriptions.length; i++){
                $('#description-select').append('<option>' + data.descriptions[i] + '</option>');
            }
            $(".selectpicker").selectpicker('refresh');
        });
    });


    $('#description-select').on('change', function(){
        // Set the description
        description = $(this).find("option:selected").text();
    });



    $('#company-select').on('change', function(){
        // set the selected company
        company = $(this).find("option:selected").text();
    });

    // Clicked the search button
    $( "#search-btn" ).click(function() {

        //TODO First check if any values null
        if(section === ""){
            $('#error').html("Section not selected");
            return;
        } else if(category === ""){
            $('#error').html("Category not selected");
            return;
        } else if(subcategory === "" && subExists){
            $('#error').html("Sub category not selected");
            return;
        }

        // Send category, section, sub category and company
        $.post("/sections/search",{section : section, category : category, subCategory : subcategory, company : company, description : description}, function(data){
            if(data.rows.length > 0){
                insertDataTable(data.rows);
            } else {
                console.log("No results");
            }
        });
    });
});



var maxTableValue = 0;

// Creates a table with the given rows
function insertDataTable(rows){
    console.log("Inserting table");

    // first create caption title with description
    $('#results-table').append('<caption>' + rows[0].description + '</caption>');
    //TODO check if discovered or observed
    var observerd = false;

    if(rows[0].obs_yr !== null){
        console.log("Observed");
        observerd = true;
    } else if(rows[0].fcast_yr !== null) {
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
    var cellCount = 0;


    var cellValues = [];

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
                        row += "<th id='t"+cellCount+"'>" + rows[j].value + "</th>";

                        // Save the value and the id of the cell to display percentage
                        cellValues.push({ id : "#t"+cellCount, value : rows[j].value });

                        cellCount++;
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


    var max = -Infinity;
    // apllys css to each cell
    for(var i = 0; i < cellValues.length; i++){
      if(+cellValues[i].value > max){max = +cellValues[i].value;}
        $(cellValues[i].id).css({
                "background" : "-webkit-gradient(linear, left top, right top, color-stop(" + cellValues[i].value +"%,#F00), color-stop(" + cellValues[i].value +"%,#FFF))",
            }
        );
    }
    maxTableValue = max;
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

    console.log(maxTableValue);
    createBarGraph("#graph-div", maxTableValue, data);
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


// New potentially for changing the url when search is clicked
