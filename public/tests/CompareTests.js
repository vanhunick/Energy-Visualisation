var assert = chai.assert;

var dp = new DataProcessor();

describe('test test', function() {
	var testDiv = '<div id="test-div"></div>';
	$(document.body).append(testDiv);   
   
  
  	it('should return true when there are more than 5 divs', function() {
  	

    // Div that hold the rows of selections
    var compareDiv = '<div id="compare-div"></div>'

    $('#test-div').append(compareDiv);

	$('#compare-div').text("hi");    

    assert.isTrue($('#compare-div').text() === "hi");
    console.log("Removing")
	$('#test-div').html('');	    
  });
});

describe('Adding a selections row', function() {
	var testDiv = '<div id="test-div"></div>';
	$(document.body).append(testDiv);   
   
  
	var searchData = new Data();

  	it('Contain four selectors', function() {

    // Div that hold the rows of selections
    var compareDiv = '<div id="compare-div"></div>'
    $('#test-div').append(compareDiv);

    addSection(0,searchData);
    
    assert.equal($('#titleRow0').text(), "Make a selection for table A ");

	$('#test-div').html('');	    
  });
});