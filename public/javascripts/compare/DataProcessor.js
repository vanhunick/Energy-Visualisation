function DataProcessor(){}

// Function that returns a copy of the dataTables objects
DataProcessor.prototype.copyOfDataTables = function(dataTables) {
  var origTables = [dataTables.tableA,dataTables.tableB,dataTables.tableC,dataTables.tableD,dataTables.tableAB,dataTables.tableCD]; // Add tables to array to iterate over them
  var tables = [[],[],[],[],[],[]]; // Empty arras to insert new rows with values copies of the original

  for(var j = 0; j < origTables.length; j++){
      var a = origTables[j]; // Grab the current table with index i
      if(a !== undefined){ // It might not exist due to it not being selected
          for(var i = 0; i < a.length; i++){ // For every row copy all the fields
              tables[j].push({category :a[i].category, description : a[i].description,disc_yr: a[i].disc_yr,edb: a[i].edb,
                  fcast_yr: a[i].fcast_yr,network:a[i].network,note:a[i].note,obs_yr:a[i].obs_yr,p_key: a[i].p_key,sch_ref:a[i].sch_ref,
                  schedule:a[i].schedule,section:a[i].section,sub_category: a[i].sub_category,units:a[i].units,value:a[i].value})
          }
      }
  }
  return new DataTables(tables[0],tables[1],tables[2],tables[3],tables[4],tables[5]); // Return the copy
}


// Checks that if there is a value selected in a row the others must be selected too before searching
DataProcessor.prototype.validateSearchParams = function (selections){
    var returnVal = true;
    selections.forEach(function (elem, i) {
        if(elem.subCategory === "" && validOptions[i]){ // Valid options holds if there is a possible option to choosefrom in the select drop down
            returnVal = false; // There is a possible sub category so it has to be chosen from
        }

        // Checks if one of the selections is empty
        if(elem.section === "" || elem.category === "" || elem.description === ""){
            // Now check if one of the selections is not empty
            if(elem.section !== "" || elem.category !== "" || elem.description !== ""){
                returnVal = false; // A row cannot have one item selected and another empty
            }
        }
    });
    return returnVal;
}

// Takes all rows and filers into corresponding tables
DataProcessor.prototype.filterRowsToTables = function (rows) {
  var aRows = rows.filter(function(e){return matchDBRow(e,lastSearch.aTable);});
  var bRows = rows.filter(function(e){return matchDBRow(e,lastSearch.bTable);});
  var cRows = rows.filter(function(e){return matchDBRow(e,lastSearch.cTable);});
  var dRows = rows.filter(function(e){return matchDBRow(e,lastSearch.dTable);});

  // Set all null values in rows to 0
  aRows.forEach(function(e){if(e.value === null){e.value = 0;}});
  bRows.forEach(function(e){if(e.value === null){e.value = 0;}});
  cRows.forEach(function(e){if(e.value === null){e.value = 0;}});
  dRows.forEach(function(e){if(e.value === null){e.value = 0;}});

  // Create combined tables if possible
  if(aRows.length > 0 && bRows.length > 0){
      var abRows = combineTables(aRows,bRows);
  }

  if(cRows.length > 0 && dRows.length > 0){
      var cdRows = combineTables(cRows,dRows);
  }
  return new DataTables(aRows,bRows,cRows,dRows, abRows, cdRows);
}


DataProcessor.prototype.combineTables = function(table1Rows, table2Rows) {
  var combined = [];
  var at = table1Rows;
  var bt = table2Rows;

  for(var i = 0; i < at.length; i++){
      for(var j = 0; j < bt.length; j++){
          if(at[i].edb === bt[j].edb && at[i].obs_yr === bt[j].obs_yr && at[i].disc_yr === bt[j].disc_yr){
              combined.push({ disc_yr : bt[j].disc_yr ,
                  edb : bt[j].edb,
                  obs_yr : bt[j].obs_yr,
                  value : at[i].value / (bt[j].value === '0' || bt[j].value === 0 ? 1 : bt[j].value), // Divide the value if va if dividing by 0 make it 1
                  section : bt[j].section + "" + bt[j].description + " over ", // Bit of a hack as description is inserted after section, this way both titles are added to table
                  description : at[i].section + " " + at[i].description,
                  unitA : at[i].units,
                  unitB : bt[j].units,
                  unit : at[i].units +" / " +  bt[j].units
              });
              break; // can exit the loop
          }
      }
  }
  return combined;
}

// Returns if a row from the DB matches one of the specified rows by the user
DataProcessor.prototype.matchDBRow = function (DBRow, selection) {
  if(DBRow.section === selection.section && DBRow.category === selection.category && DBRow.description === selection.description){
      if(DBRow.sub_category !== null){
          return selection.subCategory === DBRow.sub_category; // Sub cat could be null but would still match
      }
      return true;
  }
  return false;
}



// table 1 can be A and table two C or table 1 is A / B and table two is
DataProcessor.prototype.createDataForVectorGraph = function(table1Rows,table2Rows) {
    var at = table1Rows;
    var bt = table2Rows;
    var edbDone = []; // The edbs that have been processed
    var vecData = []; // The final entry in the form { EDB, [ { year1, valueA, valueB }, {year2, valueA, valueB }]}

    var availableObsYears = [];
    table1Rows.forEach(function (row1) {
        if(!availableObsYears.includes(row1.obs_yr)){

            // Check if the second set of rows also contains the year
            for(var i = 0; i < table2Rows.length; i++){
              if(table2Rows[i].obs_yr === row1.obs_yr){
                  availableObsYears.push(row1.obs_yr);
                  break;
              }
            }
        }
    });

    // Go through every row
    for (var i = 0; i < at.length; i++) {

        // Check if the EDB has already been processed
        if (!edbDone.includes(at[i].edb)) {

            // Grab all the rows for the current edb in both tables
            var edbRowsAt = at.filter(function (d) {
                return d.edb === at[i].edb
            });
            var edbRowsBt = bt.filter(function (d) {
                return d.edb === at[i].edb
            });

            edbDone.push(at[i].edb); // Add year to done so it is not repeated

            var yearsDone = []; // Processed years
            var edbYearArray = [];

            // Iterate through rows in edb
            for (var j = 0; j < edbRowsAt.length; j++) {

                // Check it has not been processed
                if (!yearsDone.includes(edbRowsAt[j].disc_yr) && availableObsYears.includes(edbRowsAt[j].disc_yr)) {
                    yearsDone.push(edbRowsAt[j].disc_yr); // Add to processed

                    // Here we have to rows for a particular year for a particular edb now we can create the entry
                    var yearRowsAt = edbRowsAt.filter(function (d) {
                        return d.disc_yr === edbRowsAt[j].disc_yr
                    });
                    var yearRowsBt = edbRowsBt.filter(function (d) {
                        return d.disc_yr === edbRowsAt[j].disc_yr
                    });

                    if(!(yearRowsAt.length == yearRowsBt.length )){
                        return [];
                    }

                    for (var k = 0; k < yearRowsAt.length; k++) {
                        edbYearArray.push({
                            year: +yearRowsAt[k].disc_yr,
                            valueA: +yearRowsAt[k].value,
                            valueB: +yearRowsBt[k].value
                        });
                    }
                }
            }
            edbYearArray.sort(function (a,b) {
                return a.year - b.year;
            });
            vecData.push({edb: at[i].edb, years: edbYearArray});
        }
    }
    return vecData;
}


// Creates the data needed to create box plots for one table
DataProcessor.prototype.createDataForBoxPlot = function (tableRows){
    var yearsDone = []; // Years processed
    var years = []; // Will contain an array of rows for each year

    for(var i = 0; i < tableRows.length; i++){
        if(!yearsDone.includes(tableRows[i].obs_yr)){
            years.push(tableRows.filter(function(e){return e.obs_yr === tableRows[i].obs_yr}));
            yearsDone.push(tableRows[i].obs_yr);
        }
    }

    var data = []; // Each entry will be an array where array[0] = year and array[1] = values for that year
    var sValues = []; // Data for the scatter plot on top of box plot
    var min = Infinity;
    var max = -Infinity;

    for(var i = 0; i < years.length; i++){
        var entry = [];
        entry[0] = ""+years[i][0].obs_yr; // Name of the box plot convert year to string
        var year = ""+years[i][0].obs_yr;
        var values = [];

        for(var j = 0; j < years[i].length; j++){
            var curValue = +years[i][j].value;
            var edb = years[i][j].edb;

            if (curValue > max){
                max = curValue;
            }
            if (curValue < min){
                min = curValue;
            }
            values.push(curValue);
            sValues.push({year : year ,edb : edb, value : curValue});
        }
        entry[1] = values;
        data.push(entry);
    }
    data.sort(function(a,b){
        return a[0] - b[0];
    });
    return {min : min, max : max, data : data, scatterData : sValues};
}

// Creates the data for the bar graphs from the rows used in D3
DataProcessor.prototype.createDataForGroupedGraph = function(rows){
    var availableObsYears = [];

    rows.forEach(function (elem) {
        if(!availableObsYears.includes(elem.obs_yr))availableObsYears.push(elem.obs_yr);
    });
    availableObsYears.sort(function (a, b) {
        return +a - +b;
    });

    var data = [];
    var edbDone = [];

    for(var i = 0; i < rows.length; i++){
        if(!edbDone.includes(rows[i].edb)){
            edbDone.push(rows[i].edb);

            var entry = { "edb" : rows[i].edb};

            entry[rows[i].obs_yr] = +rows[i].value;
            data.push(entry);
        } else {
            for(var j = 0; j < data.length; j++){
                if(data[j].edb === rows[i].edb){
                    //var value = +rows[i].value;
                    data[j][rows[i].obs_yr] = +rows[i].value;
                }
            }
        }
    }
    return {data : data, keys : availableObsYears};
}

DataProcessor.prototype.sortSections = function(data) {
  data.sections.sort(function(a,b){
      // First check simple case of number difference
      var i = 0;
      while(!isNaN(a.charAt(i))){i++}
      var numberA = a.substring(0,i); // Gets the number from the section

      i = 0;
      while(!isNaN(b.charAt(i))){i++}
      var numberB = b.substring(0,i);

      if(numberA !== numberB) {
          return numberA - numberB;
      }
      return [a,b].sort()[0] === a ? -1 : 1; // Sort two names and return the first
  });
}


// Applies the CPI to rows of data
DataProcessor.prototype.applyCPIToTableRows = function(rows, cpiValues){
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


// Object for holder the users selection
function Selection(a,b,c,d){
    this.aTable = a;
    this.bTable = b;
    this.cTable = c;
    this.dTable = d;
}

// Object for holder rows for all tables
function DataTables(tableA,tableB,tableC,tableD,tableAB,tableCD){
    this.tableA = tableA;
    this.tableB = tableB;
    this.tableC = tableC;
    this.tableD = tableD;
    this.tableAB = tableAB;
    this.tableCD = tableCD;
}

// Data object for each section, used for graphs
function SelectionData(rows,title,subTitle,unit,id){
    this.rows = rows;
    this.title = title;
    this.subTitle = subTitle;
    this.id = id;
    this.unit = unit;
}

// Data object for Rows combined
function SelectionDataCombined(rows, table1Rows,table2Rows,title1,title2,unit1,unit2,id){
    this.rows = rows; // Combined rows
    this.title1 = title1;
    this.title2 = title2;
    this.unit1 = unit1;
    this.unit2 = unit2;
    this.id = id;
    this.table1Rows = table1Rows;
    this.table2Rows = table2Rows;
}

// Data object for each table
function SelectedTableData(rows,id, title, subTitle, unit){
    this.rows = rows;
    this.id = id;
    this.title = title;
    this.subTitle = subTitle;
    this.unit = unit;
}
