/**
* Creates a table object
* @param id the id of the table a, b, c, d
* @param rows the rows of data for the table
* @param unit the unit of the data
* @param selection {Object} if not combined else {Object[]} the selection made by the user to find the data
*/
function Table(id, rows, selection, isCombined){
  this.id = id;
  this.isCombined = isCombined;
  this.rows = rows;
  this.unit = rows[0].units;
  this.selection = selection;

  // Create the titles
  this.title = this.getTitle();
  this.subTitle = this.getSubTitle();

  // Used to format numbers displayed
  this.dpFormat = d3.format(".4r");

  // Find the available years
  this.availableYears = this.getAvailableYears();

  // Used to store original cell values
  this.noCPICells = [];

  // Cache DOM elements
  this.$table = $('#table-'+id);
  this.$totalsTable = $('#table-total-'+id);
  this.$title = $('#title-'+id);
}


/**
 * Returns the title for the table
 *
 * @return {String} title
 * */
Table.prototype.getTitle = function () {
  if(this.isCombined){
    var subCategory = this.selection[0] === null ? "" : this.selection[0].subCategory;
    return this.selection[0].category + ", " + subCategory + ", "+ this.selection[0].description;
  } else {
    return (this.selection === null ? "" : this.selection.subCategory) + ", "+ this.selection.description;
  }
}


/**
 * Returns the subtitle for the table
 *
 * @return {String} subtitle
 * */
Table.prototype.getSubTitle = function () {
  if(this.isCombined){
    var subCategory = this.selection[1] === null ? "" : this.selection[1].subCategory;
    return  this.selection[1].category + ", " + subCategory + ", "+ this.selection[1].description;
  } else {
    return this.selection.section + ", " + this.selection.category;
  }
}


/**
 * Updates the rows and the recalculates total table
 *
 * @param rows the new rows for the table
 * */
Table.prototype.update = function (rows) {
  this.rows = rows;
  this.createTotalsTable(true, "");
}


/**
 * Shows a bar graph with the values from the selected row
 *
 * @param {Object} update the object to hold information about the row clicked
 * */
Table.prototype.totalsRowSelected = function (update) {
  var rowNumb  = update.rowID.charAt(update.rowID.length-1);
  var dataRowID = "row-tot-"+this.id+""+rowNumb;

  SingleBarModule.showBarWithRowElem(dataRowID,update.region,"#bar-total-"+this.id,"#head-row-totals-"+this.id,"#table-total-"+this.id,this.unit);
}


/**
 * Shows a bar graph with the values from the selected row
 *
 * @param {Object} update the object to hold information about the row clicked
 * */
Table.prototype.rowClicked = function (event) {
  var rowNumb = event.rowID.slice(-1);
// Need to account for numbers greater than 10
if(!isNaN(event.rowID.slice(-2))){
  rowNumb = event.rowID.slice(-2);
}
  SingleBarModule.showBarWithRowElem('row'+this.id +''+rowNumb,event.edb,"#bar-"+this.id,"#head-row-"+this.id,"#table-"+this.id,this.unit);
}

/**
 * Returns the years of data in the table
 *
 * @return {String[]} The array of years
 * */
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


/**
 * Returns if CPI can be applied to the table
 *
 * @return {Boolean} can apply cpi or not
 * */
Table.prototype.canApplyCPI = function () {
  if(this.isCombined)return false;
  return this.unit.includes('$'); // TODO check if this is right later
}


/**
 * Applies CPI to all values in the table
 *
 * @param {Object} Holds percentage of CPI for each year
 * */
Table.prototype.applyCPI = function (cpiValues) {
  if(this.noCPICells.length > 0){
      this.revertCPI();
  }

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
      var year = +$(this).attr("class").split(' ')[1];
      minYear = year < minYear ? year : minYear;
      maxYear = year > maxYear ? year : maxYear;
  });

  var format = this.dpFormat;
      $cachedCells.each(function(){ // Grab every cell
          var year = +$(this).attr("class").split(' ')[1]; // Grab the year of the cell by checking the class
          var valueOfCell = $(this).attr("origvalue");
      for(var cur = minYear; cur <=maxYear; cur++){ // Go through each possible year

        for(var i = 0; i < cpiValues.length; i++){
              if(cpiValues[i].year === cur){
                  if(year <= cur){
                      valueOfCell = valueOfCell * (1 + (cpiValues[i].value / 100));
                      valueOfCell = format(valueOfCell);
                  }
              }
        }
      }
        $(this).text(valueOfCell); // CPI Applied value
      });
}

Table.prototype.revertCPI = function () {
  if(this.noCPICells.length > 0){
    var format = this.dpFormat;
    this.noCPICells.forEach(function(e){
        $('#'+e.id).text(format(e.value));
    });
  }
}

Table.prototype.insertTitles = function() {
  if(this.isCombined){
    var s1 = this.id.charAt(0).toUpperCase();
    var s2 = this.id.charAt(1).toUpperCase();
    this.$title.append('<h3>Ratio analysis '+s1+' / '+s2+'</h4>');
    this.$title.append('<h4 class="title"><span style="color: black;">'+s1+': </span>'+this.title+'</h4><h4 class="title"><span style="color: black;">'+s2+': </span>'+this.subTitle+'</h4>');
  } else {
    this.$title.append('<h2 class="title">'+this.title+'</h2>').append('<h4 class="subTitle">'+this.subTitle+'</h4>');
  }
}



// Only called once to create the table
Table.prototype.create = function () {
  var tableData = this.createTableData (this.rows); // Grab the data in the form we want

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
      row += "<th origValue='"+ yearData.value +"' class='cell "+yearData.year+"' id='t"+this.id+""+cellCount+"'>" + this.dpFormat(yearData.value) + "</th>";
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

Table.prototype.createTotalsTable = function(update, selectedTotalRow) {

  var totals = dp.createTableTotals(this.rows, TablesModule.regions, this.availableYears);
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
          var format = this.dpFormat;
        var cells = this.noCPICells;
          row += "<th class='reg-cell'>" + names[property] + "</th>";
          var passID = this.id;
          totals[property].forEach(function(value){
              var avg;
              if(property === "nz"){
                  avg = value / numberOfCompanies;
              } else {
                  avg = value / TablesModule.regions[property].length;
              }

              row += "<th id='t-total"+passID+""+cellCount+"' origValue='"+ avg +"' class='cell'>" + format(avg) + "</th>";
              totalCells.push({id : "#t-total"+passID+""+cellCount, value :avg});

              // TODO check if better way
              cells.push({id : "t-total"+passID+""+cellCount, value : avg});

              cellCount++;

          });
          this.$totalsTable.append(row + '</tr>');
          $("#row-tot-"+this.id+rowCount).click(function() {
            var reg = $("#"+this.id +" .reg-cell").text();
            events.emit("TOTAL_ROW_CLICKED", {rowID : this.id, region : reg});
          });
          rowCount++;
      }
  }
  if(selectedTotalRow !==""){
      $('#'+selectedTotalRow).addClass("row-selected");
  }
  this.totalCellValues = totalCells;
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

      data.push({ edb : edbs[edb], years : years});
    }
  }
  return data;
}


// Called when values in the table update
Table.prototype.render = function () {
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
