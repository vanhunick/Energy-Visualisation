var TablesModule = (function(){

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

  var selectedRow = "";
  var selectedTotalRow = "";

  // Holds the table objects
  var tables = [];
  var dp = new DataProcessor();

  // Creates the tables using the table data
  var init = function (update) {
    update.data.forEach (function(tableData){
      tables.push(new Table(tableData.id,tableData.rows,tableData.search));
    });

  // Create each of the tables along with a the totals table
  tables.forEach(function(table){
      table.create();
      table.createTotalsTable(false);
    });

    // Render each of the tables
    tables.forEach(function(table){table.render();});
  }

  // Called when a row clicked event occours
  var rowClicked = function (update) {
    if(this.selectedRow === update.rowID){
      $('.table-row').find(".edb-cell:contains('"+update.edb+"')").parent().removeClass("row-selected"); // Selects edb row in all tables
      this.rowSelected = "";
      return;
    }

    if(this.selectedRow !== ""){
      var text = $("#"+this.selectedRow+" .edb-cell").text();
      $('.table-row').find(".edb-cell:contains('"+text+"')").parent().removeClass("row-selected"); // Selects edb row in all tables
    }
    this.selectedRow = update.rowID;

    $('.table-row').find(".edb-cell:contains('"+update.edb+"')").parent().addClass("row-selected"); // Selects edb row in all tables

    tables.forEach(function(table){
      table.rowClicked(update);
    });
  }

  var totalRowClicked = function (update) {
    var region = update.region;

    if(this.selectedTotalRow === update.rowID){
      var oldReg = $("#"+update.rowID+" .reg-cell").text();

      $('.table-row').find(".reg-cell:contains('"+reg+"')").filter(function() {
          return $(this).text() === reg;
      }).parent().removeClass("row-selected"); // Selects edb row in all tables
      this.selectedTotalRow = "";
      return;
    }

    if(this.selectedTotalRow !== ""){
        var oldReg = $("#"+this.selectedTotalRow+" .reg-cell").text();
        $('.table-row').find(".reg-cell:contains('"+oldReg+"')").filter(function() {
            return $(this).text() === oldReg;
        }).parent().removeClass("row-selected"); // Selects edb row in all tables
    }

    $('.table-row').find(".reg-cell:contains('"+region+"')").filter(function() {
        return $(this).text() === region;
    }).parent().addClass("row-selected"); // Selects edb row in all tables

    // if id ends with letter set to id
    this.selectedTotalRow = update.rowID;

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

  // Listen to events
  events.on("INIT_DATA", init);
  events.on("ROW_CLICKED", rowClicked);
  events.on("TOTAL_ROW_CLICKED", totalRowClicked);
  events.on("APPLY_CPI", applyCPI);
  events.on("REVERT_CPI", applyCPI);

  return {

  }
})();
