// DEPENDENCIES DataProcessor, Database, Events


var CompareModule = (function(){

  // Init the other stuff required
  var dp = new DataProcessor();

  // Object that holds all the rows for each table along with a copy
  var backup = {};

  // Search error state
  var error = false;

  // Cache dom elements
  var $searchError = $('error-div');


  /**
   * Turns object in url string
   *
   * @param obj {Object} the object to turn into url
   * */
  var serialise = function (obj) {
    var str = [];
    for(var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
  }


  /**
   * Called when the search button is clicked, checks if a valid search selection is made
   * if so inserts the search into the url to search.
   * */
  var search = function () {
    if (!selectionRows.canSearch()) {
      if (!error) {
        $searchError.append('<h4 style="color : red;">Partial Row Selected</h4>');
        error = true;
      }
      return; // First check if the selection is valid
    }

    var rows= {};
    selectionRows.getAllSelectionData().forEach(function(selection){
      if(selection.section !== ""){
          rows["s"+selection.id] = selection.section;
          rows["c"+selection.id] = selection.category;
          rows["sc"+selection.id] = selection.subCategory;
          rows["d"+selection.id] = selection.description;
      }
    });
    window.location.replace("compare?" + serialise(rows)); // Replace the url with the selections url
  }


  /**
   * Called when the page is loaded with a search in the url, fetches the relevant data from the database
   * using the db module
   * */
  var loadSearchFromURL = function (urlSelections) {
    selectionRows.init(urlSelections,true); // Set ups the selection rows

    Database.getRowsForSearch(urlSelections, function(rows){
      // set the rows tables and create a copy
      backup.selection  = new Selection(urlSelections[0],urlSelections[1],urlSelections[2],urlSelections[3]);
      backup.rows = rows
      backup.sortedRows = dp.filterRowsToTablesAndCopy(rows,backup.selection);

      backup.sortedRows.forEach(function(t){
        $('#full-dash-'+ t.id).show();
      });

      // Emit an event with the data
      events.emit("INIT_DATA", {data : backup.sortedRows});
    });
  }


  /**
   * Called when the apply cpi button is clicked. First checks
   * if cpi input is valid then copies rows and applies cpi to copy
   * */
  var applyCPI = function() {
    if(CPIModule.isValid()){
      var copyOfRows  = dp.copyRows(backup.rows);
      applyCPIToTableRows(copyOfRows,CPIModule.getCPIValues());
      var newData = dp.filterRowsToTablesAndCopy(copyOfRows,backup.selection);

      // Send event to update table and graphs
      events.emit("ROW_UPDATE", {data : newData });
      events.emit("APPLY_CPI", {cpiValues : CPIModule.getCPIValues()});
    }
  }


  /**
   * Applies cpi values to the rows by chaning the value in each row with the compounded cpi values
   *
   * @param rows {Object[]} the rows
   * @param cpiValues {Object[]} contains the cpi for each year
   * */
  var applyCPIToTableRows = function (rows, cpiValues) {
    // Find the min and max year from the data
    var minYear = rows.reduce(function(prev, curr) {
      return prev.disc_yr < curr.disc_yr ? prev : curr;
    }).obs_yr;

    var maxYear = rows.reduce(function(prev, curr) {
      return prev.disc_yr > curr.disc_yr ? prev : curr;
    }).obs_yr;

    for(var cur = minYear; cur <=maxYear; cur++){ // Go through each possible year
      rows.forEach(function(elem, index){ // Grab every Row
        var year = rows[index].obs_yr; // Grab the year of the cell by checking the class
        var valueOfCell = rows[index].value;

        for(var i = 0; i < cpiValues.length; i++){
          if(cpiValues[i].year === cur){
            if(year <= cur){
              valueOfCell = valueOfCell * (1 + (cpiValues[i].value / 100));
            }
          }
        }
        rows[index].value = valueOfCell; // CPI Applied value
      });
    }
  }


  /**
   * Called when revert cpi is clicked send out events with to
   * notify that cpi needs to be reverted
   * */
  var revertCPI = function () {
    events.emit("ROW_UPDATE", {data : backup.sortedRows });
    events.emit("REVERT_CPI", {cpiValues : ""});
  }


  return {
    loadSearchFromURL : loadSearchFromURL,
    search : search,
    applyCPI : applyCPI,
    revertCPI : revertCPI
  }
})();


$(document).ready( function() {
    // Highlight the selected link
    $(".nav-link").removeClass('active');
    $("#benchmarks-link").addClass('active');
    $('#search-btn-compare').click(function(){ // Listener to search button
        CompareModule.search(); // Search encodes the selections into the url and sends to server
    });
    $('cpi').click(function(){
      CompareModule.applyCPI();
    });
});
