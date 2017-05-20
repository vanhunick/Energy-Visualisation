// DEPENDENCIES DataProcessor, Database, Events

// Internet Explorer compatibility
if (!String.prototype.includes) {
    String.prototype.includes = function() {
        'use strict';
        return String.prototype.indexOf.apply(this, arguments) !== -1;
    };
}

if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, "includes", {
        enumerable: false,
        value: function(obj) {
            var newArr = this.filter(function(el) {
                return el == obj;
            });
            return newArr.length > 0;
        }
    });
}
// End Internet explorer compatibility

var CompareModule = (function(){

  // Init the data processor
  var dp = new DataProcessor();

  // Object that holds all the rows for each table along with a copy
  var backup = {};

  // Search error state
  var error = false;

  // Cache dom elements
  var $searchError = $('#error-div');

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
      console.log(rows);

      var combinedData = [];
      backup.sortedRows.forEach(function(t){
        if(t.id === 'a'){
          $('#tab-a').addClass("in active");
        }
        if(t.id === 'ab' || t.id === 'cd'){
          combinedData.push(t);
        }
          $('#full-dash-'+ t.id).show();
      });

      if(combinedData.length === 2){
        showFullVectorGraph(combinedData, urlSelections, [backup.sortedRows[0].rows[0].units,backup.sortedRows[1].rows[0].units,backup.sortedRows[2].rows[0].units,backup.sortedRows[3].rows[0].units ]);
      }

      // Check if both AB and CD exist
      // Emit an event with the data
      events.emit("INIT_DATA", {data : backup.sortedRows});

      // Set default rows selected
      events.emit('ROW_CLICKED',  {rowID: "rowa0", rowNumb: 0, edb: "Alpine Energy"});
      events.emit("TOTAL_ROW_CLICKED", {rowID: "row-tot-a0", region: "South Island"});

    });
  }


  /**
   * Called when the apply cpi button is clicked. First checks
   * if cpi input is valid then copies rows and applies cpi to copy
   * */
  var applyCPI = function() {
    if(CPIModule.isValid() && backup.selection !== undefined){
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
    var applicableRows = rows.filter(function(r){
      return r.units.includes('$');
    });
    if(applicableRows.length === 0){
      return;
    }


    // Find the min and max year from the data
    var minYear = applicableRows.reduce(function(prev, curr) {
      return prev.disc_yr < curr.disc_yr ? prev : curr;
    }).obs_yr;

    var maxYear = applicableRows.reduce(function(prev, curr) {
      return prev.disc_yr > curr.disc_yr ? prev : curr;
    }).obs_yr;

    for(var cur = minYear; cur <=maxYear; cur++){ // Go through each possible year
      applicableRows.forEach(function(elem, index){ // Grab every Row
        var year = applicableRows[index].obs_yr; // Grab the year of the cell by checking the class
        var valueOfCell = applicableRows[index].value;

        for(var i = 0; i < cpiValues.length; i++){
          if(cpiValues[i].year === cur){
            if(year <= cur){
              valueOfCell = valueOfCell * (1 + (cpiValues[i].value / 100));
            }
          }
        }
        applicableRows[index].value = valueOfCell; // CPI Applied value
      });
    }
  }


  // Array with both things in it
  function showFullVectorGraph(data, selections, units) {


        // Grab a title
        var atitle = selections[0].category + ", " + selections[0].subCategory + ", " + selections[0].description;
        var btitle = selections[1].category + ", " + selections[1].subCategory + ", " + selections[1].description;
        var ctitle = selections[2].category + ", " + selections[2].subCategory + ", " + selections[2].description;
        var dtitle = selections[3].category + ", " + selections[3].subCategory + ", " + selections[3].description;

        var ratio = '<h3> Ratio (A / B ) over ( C / D ) </h3>'
        var spanA = '<span class="letter">A: </span>';
        var spanB = '<span class="letter">B: </span>';
        var spanC = '<span class="letter">C: </span>';
        var spanD = '<span class="letter">D: </span>';


        var combineA = '<h4 class="title">'+spanA+' '+ atitle +'</h4>';
        var combineB = '<h4 class="title">'+spanB+' '+ btitle +'</h4>';
        var combineC = '<h4 class="title">'+spanC+' '+ ctitle +'</h4>';
        var combineD = '<h4 class="title">'+spanD+' '+ dtitle +'</h4>';

        $('#title-vector-abcd').append(ratio).append(combineA).append(combineB).append(combineC).append(combineD);

        VectorModule.createVectorGraph(dp.createDataForVectorGraph(data[0].rows,data[1].rows), units[0] + " / " + units[1] ,units[2] + " / " + units[3] ,"#vector-graph-abcd");
        $('#vector-full-abcd').show();
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
