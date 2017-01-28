$(document).ready( function() {
    // Highlight the selected link
    $(".nav-link").removeClass('active');
    $("#core-link").addClass('active');

    // Set the style of the validation errors
    $.validator.setDefaults({
        errorClass : 'help-block',
            highlight: function (element) {
                $(element)
                    .closest('.form-group')
                    .addClass('has-error')
            },
        unhighlight :function (element) {
            $(element)
            .closest('.form-group')
            .removeClass('has-error')
        }
        }
    );

    var cpiRules = {
        required : true,
        number : true,
        min : 0,
        max : 100
    };

    var messageSet = {
        required : "Please enter a percentage",
        number : "Please enter a valid number",
        min : "Please enter a percentage greater than 0",
        max : "Please enter a percentage less than 100"
    }

    $('#cpi-form').validate({
        rules : {
            Y2012 : cpiRules,
            Y2013 : cpiRules,
            Y2014 : cpiRules,
            Y2015 : cpiRules,
            Y2016 : cpiRules
        },
        messages : {
            Y2012 : messageSet,
            Y2013 : messageSet,
            Y2014 : messageSet,
            Y2015 : messageSet,
            Y2016 : messageSet
        }
    });

});

function applyCPI(){
    console.log("Apply CPI");
    return false;
}