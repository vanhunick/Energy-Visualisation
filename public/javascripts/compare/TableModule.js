var TablesModule = (function(){

  // The EDBs that belong to each region
  var regions = {
    n : ["Centralines","Counties Power","Eastland Network","Electra","Horizon Energy","Northpower",
         "Powerco","Scanpower","The Lines Company","Top Energy","Unison Networks","Vector Lines",
         "Waipa Networks","WEL Networks","Wellington Electricity"],
    uni : ["Counties Power","Horizon Energy","Northpower","The Lines Company","Top Energy","Vector Lines","Waipa Networks","WEL Networks"],
    eni : ["Centralines","Eastland Network","Scanpower","Unison Networks"],
    swni : ["Electra","Powerco","Wellington Electricity"],
    s : ["Alpine Energy","Aurora Energy","Buller Electricity","Electricity Ashburton","Electricity Invercargill",
         "MainPower NZ","Marlborough Lines","Nelson Electricity","Network Tasman",
         "Network Waitaki","Orion NZ","OtagoNet","The Power Company","Westpower"],
    usi : ["Alpine Energy","Buller Electricity","MainPower NZ","Marlborough Lines","Nelson Electricity","Network Tasman","Orion NZ","Westpower"],
    lsi : ["Aurora Energy","Electricity Ashburton","Electricity Invercargill","Network Waitaki","OtagoNet","The Power Company"]
  };

  // The id of the currently selected row in the main table
  var selectedRow = "";

  // The id of the currently selected row in the totals
  var selectedTotalRow = "";

  // Holds the table objects
  var tables = [];


  /**
   * Creates the tables using the table data
   *
   * @param {Object} the object containing the tables data
   * */
  var init = function (update) {
    update.data.forEach (function(tableData){
      if(tableData.combined){
        tables.push(new Table(tableData.id, tableData.rows, [tableData.search, tableData.search2 ], true));
      } else {
        tables.push(new Table(tableData.id,tableData.rows,tableData.search,false));
      }
    });

  // Create each of the tables along with a the totals table
  tables.forEach(function(table){
      table.insertTitles();
      table.create();
      table.createTotalsTable(false);
    });

    // Render each of the tables
    tables.forEach(function(table){table.render();});
  }

  // Called when a row clicked event occours
  var rowClicked = function (update) {
    if(selectedRow === update.rowID){
      $('.table-row').find(".edb-cell:contains('"+update.edb+"')").parent().removeClass("row-selected"); // Selects edb row in all tables
      rowSelected = "";
      return;
    }

    if(selectedRow !== ""){
      var text = $("#"+selectedRow+" .edb-cell").text();
      $('.table-row').find(".edb-cell:contains('"+text+"')").parent().removeClass("row-selected"); // Selects edb row in all tables
    }
    selectedRow = update.rowID;

    $('.table-row').find(".edb-cell:contains('"+update.edb+"')").parent().addClass("row-selected"); // Selects edb row in all tables

    tables.forEach(function(table){
      table.rowClicked(update);
    });
  }

  var totalRowClicked = function (update) {
    var region = update.region;

    if(selectedTotalRow === update.rowID){
      var oldReg = $("#"+update.rowID+" .reg-cell").text();

      $('.table-row').find(".reg-cell:contains('"+region+"')").filter(function() {
          return $(this).text() === region;
      }).parent().removeClass("row-selected"); // Selects edb row in all tables
      selectedTotalRow = "";
      return;
    }

    if(selectedTotalRow !== ""){
        var oldReg = $("#"+selectedTotalRow+" .reg-cell").text();
        $('.table-row').find(".reg-cell:contains('"+oldReg+"')").filter(function() {
            return $(this).text() === oldReg;
        }).parent().removeClass("row-selected"); // Selects edb row in all tables
    }

    $('.table-row').find(".reg-cell:contains('"+region+"')").filter(function() {
        return $(this).text() === region;
    }).parent().addClass("row-selected"); // Selects edb row in all tables

    // if id ends with letter set to id
    selectedTotalRow = update.rowID;

    tables.forEach(function(table){
      table.totalsRowSelected(update);
    });
  }


  var applyCPI = function (update) {
    var cpiValues = update.cpiValues;
    tables.forEach(function(table){
      table.applyCPI(cpiValues);
      table.createTotalsTable(true);
    });

    tables.forEach(function(table){
      table.render();
    });
  }

  var update = function (update) {
    update.data.forEach(function(tableData){
      tables.forEach(function(g){
        if(g.id === tableData.id){
          if(g.isCombined){
            g.update(tableData.rows, tableData.table1Rows, tableData.table2Rows);
          } else {
            g.update(tableData.rows);
          }
        }
      });
    });
  }

  // Listen to events
  events.on("INIT_DATA", init);
  events.on("ROW_CLICKED", rowClicked);
  events.on("TOTAL_ROW_CLICKED", totalRowClicked);
  events.on("APPLY_CPI", applyCPI);
  events.on("REVERT_CPI", applyCPI);
  events.on("ROW_UPDATE", update);


  return {
    regions : regions
  }
})();
