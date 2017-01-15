/**
 * Created by Nicky on 15/01/2017.
 */


$(document).ready( function() {

    // Add listeners to selectors
    $('#section-select').on('change', function(){
        console.log("Text click on selection");
        var selected = $('.selectpicker option:selected').val();
        console.log(selected);
        $.post("/sections",{selected : selected }, function(data){
            if(sections.length > 0){
                $('#category-select').html('<option selected>' + data.categories[0] + '</option>'); // Empty temp options
            }

            for(var i = 1; i < data.categories.length; i++){
                $('#category-select').append('<option>' + data.categories[i] + '</option>').selectpicker('refresh');
            }
            $(".selectpicker").selectpicker('refresh');
        });
    });
});
