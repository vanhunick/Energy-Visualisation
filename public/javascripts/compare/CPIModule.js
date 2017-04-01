var CPIModule = (function(){

  // Graph and cache
var $cpiForm = $('#cpi-form');

// set up validation rules
$.validator.setDefaults({
        errorClass : 'help-block',
        highlight: function (element) {$(element).closest('.form-group').addClass('has-error')},
        unhighlight :function (element) {$(element).closest('.form-group').removeClass('has-error')}
    }
);

// Set the rules for each input
var cpiRules = {required : true, number : true, min : 0.1, max : 100};
var messageSet = {
    required : "Please enter a percentage",
    number : "Please enter a valid number",
    min : "Please enter a percentage greater than 0",
    max : "Please enter a percentage less than 100"
};


$cpiForm.validate({
    rules : {Y2012 : cpiRules,Y2013 : cpiRules,Y2014 : cpiRules,Y2015 : cpiRules,Y2016 : cpiRules},
    messages : {Y2012 : messageSet,Y2013 : messageSet,Y2014 : messageSet,Y2015 : messageSet,Y2016 : messageSet}
});

var getCPIValues = function () {
  return  [{year : 2012, value : +$cpiForm.find('#Y2012').val()},
           {year : 2013, value : +$cpiForm.find('#Y2013').val()},
           {year : 2014, value : +$cpiForm.find('#Y2014').val()},
           {year : 2015, value : +$cpiForm.find('#Y2015').val()},
           {year : 2016, value : +$cpiForm.find('#Y2016').val()}]
}

var isValid = function () {
    return $cpiForm.valid();
}


return {
  getCPIValues : getCPIValues,
  isValid : isValid
}

})();
