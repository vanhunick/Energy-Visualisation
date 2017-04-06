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

var TablesModule = (function(){

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





/**
* Creates a table object
* @param id the id of the table a, b, c, d
* @param rows the rows of data for the table
* @param unit the unit of the data
* @param selection the selection made by the user to find the data
*/
function Table(id, rows, unit, selection){
  this.id = id;
  this.rows = rows;
  this.unit = rows[0].units;
  this.selection = selection;
  this.$table = $('#table-'+id);
  this.$totalsTable = $('#table-total-'+id);
  this.$title = $('#title-'+id);
  this.title = "Table title fix later use selection";
  this.subTitle = "Table sub title fix later selection";
  this.dpFormat = d3.format(".4r"); // Used to format numbers displayed
  this.availableYears = this.getAvailableYears();
  this.noCPICells = [];

  // Cache all the dom elemnts we need for the table
  var rowClicked = this.rowClicked;
  // events.on("ROW_CLICKED", rowClicked);
}

Table.prototype.totalsRowSelected = function (update) {
  var id = update.rowID;
  var rowNumber = update.rowNumb;
  var region = update.region;
  showBarWithRowElem(id,region,"#bar-total-"+this.id,"#head-row-totals-"+this.id,"#table-total-"+this.id,this.unit);
}

Table.prototype.getAvailableYears = function () {
  availableYears = [];
  var availableYears = [];
  this.rows.forEach(function (elem) {
      if(!availableYears.includes(elem.obs_yr))availableYears.push(elem.obs_yr);
  });
  availableYears.sort(function (a, b) { // Sort the years
      return +a - +b;
  });
  return availableYears;
}

Table.prototype.canApplyCPI = function () {
  return this.unit.contains('$'); // TODO check if this is right later
}

// Applies CPI to all values in the table
Table.prototype.applyCPI = function (cpiValues) {
  if(this.noCPICells.length > 0){
      this.revertCPI();
  }
  // var $cachedCells = $('#table-'+id).find('.cell');
  var $cachedCells = this.$table.find('.cell');

  // First backup the cpiCells
  var noCPICells = this.noCPICells;
  var id = this.id;
  $cachedCells.each(function(){ // Backup the values from the cells
      noCPICells.push({id : $(this).attr('id'), value : $(this).text()});
  });

  var minYear = Infinity;
  var maxYear = -Infinity;

  $cachedCells.each(function(){ //cell or th
    console.log("Looping ")
      var year = +$(this).attr("class").split(' ')[1];
      minYear = year < minYear ? year : minYear;
      maxYear = year > maxYear ? year : maxYear;
  });

  for(var cur = minYear; cur <=maxYear; cur++){ // Go through each possible year
      $cachedCells.each(function(){ // Grab every cell
          var year = +$(this).attr("class").split(' ')[1]; // Grab the year of the cell by checking the class
          var valueOfCell = $(this).attr("origvalue");
          for(var i = 0; i < cpiValues.length; i++){
              if(cpiValues[i].year === cur){
                  if(year <= cur){
                      valueOfCell = valueOfCell * (1 + (cpiValues[i].value / 100));
                      valueOfCell = valueOfCell;
                      //TODO format
                  }
              }
          }
          $(this).text(valueOfCell); // CPI Applied value
      });
  }
}

Table.prototype.revertCPI = function () {
  if(noCPICells.length > 0){
    noCPICells.forEach(function(e){
        $('#'+e.id).text(e.value);
        // TODO format
    });
  }
}


// Only called once to create the table
Table.prototype.create = function () {
  var tableData = this.createTableData (this.rows); // Grab the data in the form we want

  // First insert the title
  if(this.combined){
    this.$title.append('<h4 class="title">'+this.title+'</h4><h4 class="title">'+this.subTitle+'</h4>');
  } else {
    this.$title.append('<h2 class="title">'+this.title+'</h2><h4 class="subTitle">'+this.subTitle+'</h4>');
  }

  // create the years cells
  var years = "";
  tableData[0].years.forEach(function(y){
    years += "<th>" + y.year + "</th>";
  });

  // Append the head row
  this.$table.append('<tr id="head-row-'+this.id+'" class="table-row table-head"> <th>EDB</th>'+ years + '</tr>');

  // Go through and create a row for each edb
  var cellCount = 0;
  var rowCount =  0;
  var cellValues = []; // All the cell values


  for(var i = 0; i < tableData.length; i++){
    var dataRow = tableData[i];
    var edb = dataRow.edb;
    var years = dataRow.years;
    var row= "<tr class='table-row' id=row"+this.id+rowCount+"><th class='edb-cell'>" + edb + "</th>";// Inserts the cell with the edb name

    for(var j = 0; j < years.length; j++){
      var yearData = years[j];
      row += "<th origValue='"+ yearData.value +"' class='cell "+yearData.year+"' id='t"+this.id+""+cellCount+"'>" + yearData.value + "</th>";
      cellValues.push({ id : "#t"+this.id+""+cellCount, value : yearData.value });
      cellCount++;
    }
    this.$table.append(row + '</tr>');

    $("#row"+this.id+rowCount).click(function(){
      var rowNumb = this.id.slice(-1);
      // Need to account for numbers greater than 10
      if(!isNaN(this.id.slice(-2))){
        rowNumb = this.id.slice(-2);
      }
      var edb = $("#"+this.id+" .edb-cell").text();
      events.emit('ROW_CLICKED', { rowID : this.id, rowNumb : rowNumb, edb : edb});
    });
    rowCount++;
  }
  this.cellValues = cellValues;
}

Table.prototype.createTotalsTable = function(update) {
  var totals = dp.createTableTotals(this.rows,regions, this.availableYears);
  var names = {n : "North Island", uni : "Upper North Island", eni : "Eastern North Island", swni : "South-West North Island", s : "South Island", usi : "Upper South Island", lsi : "Lower South Island", nz : "New Zealand"};

  var totalCells = [];
  // Insert Caption for table
  var years = "";
  this.availableYears.forEach(function (year) {
      years += "<th>" + year + "</th>";
  });

  var cellCount = 0; // Used for id cells
  var rowCount = 0; // Used for id rows

  if(update){
      this.$totalsTable.html(''); // Clear last table
  }

  // Used to calculate average or total
  var numberOfCompanies = 29;

  this.$totalsTable.append('<tr id="head-row-totals-'+this.id+'" class="table-row table-head"> <th>Region</th>'+ years + '</tr>');

  for (var property in totals) {
      if (totals.hasOwnProperty(property)) {
          var row= "<tr class='table-row' id=row-tot-"+this.id+rowCount+">";

          //TODO (Note when updated origValue will be the updated value not the original)

          // Insert name in column and assign an id to the row
          row += "<th class='reg-cell'>" + names[property] + "</th>";
          var passID = this.id;
          totals[property].forEach(function(value){
              var avg;
              if(property === "nz"){
                  avg = value / numberOfCompanies;
              } else {
                  avg = value / regions[property].length;
              }

              row += "<th id='t-total"+passID+""+cellCount+"' origValue='"+ avg +"' class='cell'>" + avg + "</th>";
              totalCells.push({id : "#t-total"+passID+""+cellCount, value :avg});

              // TODO check if better way
              noCPICells.push({id : "t-total"+passID+""+cellCount, value : avg});

              cellCount++;

          });
          this.$totalsTable.append(row + '</tr>');
          $("#row-tot-"+this.id+rowCount).click(function() {
            var reg = $("#"+this.id +" .reg-cell").text();
            console.log("Emitting ", {rowID : this.id, region : reg});
            events.emit("TOTAL_ROW_CLICKED", {rowID : this.id, region : reg});


          });
          rowCount++;
      }
  }
  this.totalCellValues = totalCells;
}

Table.prototype.rowClicked = function (event) {
  var id = event.rowID;
  var rowNumber = event.rowNumb;
  var edb = event.edb;

  showBarWithRowElem(id,edb,"#bar-"+this.id,"#head-row-"+this.id,"#table-"+this.id,this.unit);
}

Table.prototype.createTableData = function (rows) {
  // Create array with unique EDBS
  var edbs = {};
  rows.forEach (function(r){
    if(edbs[r.edb] === undefined)edbs[r.edb] = r.edb;
  });

  var data = [];

  // Filter rows by each EDB
  for (var edb in edbs) {
    if (edbs.hasOwnProperty(edb)) {
      var edbYears = rows.filter(function(r){return r.edb === edbs[edb] });

      var years = [];
      edbYears.forEach(function(y){
        years.push({ year : y.obs_yr, value : y.value });
      });

      // Sort years
      years.sort(function(a,b){
        return a.year > b.year;
      })

      data.push({ edb : edbs[edb], years});
    }
  }
  return data;
}


// Called when values in the table update
Table.prototype.render = function (values) {

  this.applyGradientCSS(this.cellValues);
  this.applyGradientCSS(this.totalCellValues);
}


/**
 * highlights the cell based on the percentage of the max value in the table unless already a percentage
 *
 * @param cellValues {Object[]} value of a cell and the table cell id
 * @param percent {Boolean} if not a percent it should be highlighted based on the percentage of the max value in the cell
 * */
Table.prototype.applyGradientCSS = function(cellValues) {
  var percent = false; // TODO fix later
  // Find the max value
  var maxCellValue = -Infinity;
  cellValues.forEach(function(elem){
      maxCellValue = +elem.value > maxCellValue ? +elem.value : maxCellValue;
  });

  // Apllie css to each cell
  for(var i = 0; i < cellValues.length; i++){
      var value = (percent ? value : ((+cellValues[i].value / maxCellValue)*100)); // If percentage metric just use valud
      $(cellValues[i].id).css({
              "background" : "-webkit-gradient(linear, left top, right top, color-stop(" + value +"%,#7bbfd6), color-stop(" + value +"%,#FFF))",
          }
      );
  }
}
