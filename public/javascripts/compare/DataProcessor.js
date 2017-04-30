var dp = new DataProcessor();

/**
 * Object contains a number of functions to manipulate data from the database
 * */
function DataProcessor(){}


/**
 * Creates of copy of the dataTables object. Copies each table and its values for each row.
 *
 * @param dataTables {Object} contains 6 arrays of rows one for each table. Attribute can be undefined if table does not exist
 * @returns {object} A copy of the dataTables object
 * */
DataProcessor.prototype.copyDataTables = function(dataTables) {
  var origTables = [dataTables.tableA,dataTables.tableB,dataTables.tableC,dataTables.tableD,dataTables.tableAB,dataTables.tableCD]; // Add tables to array to iterate over them
  var tables = [[],[],[],[],[],[]]; // Empty arrays to insert new rows with values that are copies of the original

  // Iterate over the original tables
  for(var j = 0; j < origTables.length; j++){
      var a = origTables[j]; // Grab the current table with index i
      if(a !== undefined){ // It might not exist due to it not being selected by the user
          for(var i = 0; i < a.length; i++){ // For every row copy all the fields
              tables[j].push({category :a[i].category, description : a[i].description,disc_yr: a[i].disc_yr,edb: a[i].edb,
                  fcast_yr: a[i].fcast_yr,network:a[i].network,note:a[i].note,obs_yr:a[i].obs_yr,p_key: a[i].p_key,sch_ref:a[i].sch_ref,
                  schedule:a[i].schedule,section:a[i].section,sub_category: a[i].sub_category,units:a[i].units,value:a[i].value})
          }
      }
  }
  return new DataTables(tables[0],tables[1],tables[2],tables[3],tables[4],tables[5]); // Return the copy
}

DataProcessor.prototype.copyRows = function (rows) {
    var newRows = [];

    rows.forEach(function(r){
      newRows.push({category :r.category, description : r.description,disc_yr: r.disc_yr,edb: r.edb,
          fcast_yr: r.fcast_yr,network: r.network,note:  r.note,obs_yr: r.obs_yr,p_key: r.p_key,sch_ref: r.sch_ref,
          schedule: r.schedule,section: r.section,sub_category: r.sub_category,units: r.units,value: r.value})
    });

    return newRows;
}


/**
 * Creates and object with three arrays that are used to iterate over and add the data to the page. The structure simplifies
 * creation of table, graphs and combined graphs.
 *
 * @param dataTables {Object} contains 6 arrays of rows one for each table. Table array can be empty if table does not exist
 * @returns {object} Data structure
 * */
DataProcessor.prototype.createDataStructuresWithCopy = function (copyOfDataTables){
    var selectionDataArray = []; // Used to create the regular graphs
    var selectionTablesArray = []; // Tables also contains combined data
    var combinedSelectionDataArray = []; // Used to create vector graphs

    // An array of true or false values if a table contains values
    var selectedRows = [copyOfDataTables.tableA.length > 0,copyOfDataTables.tableB.length > 0,copyOfDataTables.tableC.length > 0,copyOfDataTables.tableD.length > 0];

    // An array with the tables data
    var tables = [copyOfDataTables.tableA,copyOfDataTables.tableB,copyOfDataTables.tableC,copyOfDataTables.tableD,copyOfDataTables.tableAB,copyOfDataTables.tableCD];

    // Creates the 4 normal tables and the combined tables
    var ids = ['a','b','c','d','ab','cd']; // The id's line up with the tables array to add an id to each row
    for(var i = 0; i < selectedRows.length; i++){
        if(selectedRows[i]){ // Only go through table if it has rows
            var subtitle = tables[i][0].section + ", " + tables[i][0].category; // Create subtitle with section and category

            // Check if sub category is null if so just use description else also use sub category
            var title = tables[i][0].sub_category === null ? tables[i][0].description : tables[i][0].sub_category + ", " + tables[i][0].description;

            // Add a row along with the id of the table the title, subtitle and unit to both table and selection arrays
            selectionTablesArray.push(new SelectedTableData(tables[i],ids[i],title,subtitle, tables[i][0].units));
            selectionDataArray.push(new SelectionData(tables[i], title, subtitle ,tables[i][0].units,ids[i]));

            // Check for combined special case, if A or C exist it is possible a combined table needs to be created
            if(ids[i] === 'a' || ids[i] === 'c'){
                if(selectedRows[i+1]){ // Check that a selections has been made if so create the combined table
                    var jump = i === 0 ? 4 : 3; // If 0 need to jump to the location of ab table else jump to location of cd table
                    var subTitleJump = tables[i+1][0].section + ", " + tables[i+1][0].category;
                    var titleJump = tables[i+1][0].sub_category === null ? tables[i+1][0].description : tables[i+1][0].sub_category + ", " + tables[i+1][0].description;
                    selectionTablesArray.push(new SelectedTableData(tables[i+jump],ids[i+jump], title + ", " + subtitle, titleJump + ", " + subTitleJump, tables[i+1][0].units));
                    combinedSelectionDataArray.push(new SelectionDataCombined(tables[i+jump],tables[i],tables[i+1], title + " " + subtitle, titleJump + " " + subTitleJump,tables[i][0].units,tables[i+1][0].units,ids[i+jump])); // TODO ask how to format titles for combined
                }
            }
        }
    }
    return new DataStructure(selectionDataArray,selectionTablesArray,combinedSelectionDataArray);
}


/**
 * Checks if the selections the user has made are complete. For example if a selection is made for a section in a row the category
 * also has to be chosen along with a description and sub category if it exists.
 *
 * @param selections {Object} the currently selected sections for each row, an array of 4 selection rows
 * @param validOptions {Object} contains if a row has a sub category or not false if no sub category
 * @returns {Boolean} true if a valid search false if not
 * */
DataProcessor.prototype.validateSearchParams = function (selections, validOptions){
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


/**
 * Checks if a row from the database matches the selection from the user. This is used because the user can make four different
 * selections and the query for the database retuns all the rows for all the sections.
 *
 * @param DBRow {Object} A row from the database contains all the fields
 * @param Selection {Object} contains section, category, sub category and description from a user selection
 * @returns {Boolean} true if a database row belongs to the user selection
 * */
DataProcessor.prototype.matchDBRow = function (DBRow, selection) {
  if(DBRow.section === selection.section && DBRow.category === selection.category && DBRow.description === selection.description){
      if(DBRow.sub_category !== null){
          return selection.subCategory === DBRow.sub_category; // Sub cat could be null but would still match
      }
      return selection.subCategory === ""; // Has to also be empty
  }
  return false;
}


/**
 * Takes rows from database query result and splits into corresponding table. Uses the matchDBRow function to match
 * a row to a selection. Once filtered creates and object containing each table and the rows
 *
 * Also creates the combined tables by using the combineTable function and adds the combined tables to the returned
 * object.
 *
 * Note any null values in the rows are changed to 0
 *
 * @param rows {Object} All the rows from the users selections
 * @param search {Object} object that contains the four different selections the user may have made
 * @returns {Object} An object that contains a property for each table which is an array with the corresponding rows
 * */
DataProcessor.prototype.filterRowsToTables = function (rows, search) {

  // Create four arrays for the different rows that belong to each of the searches
  var aRows = rows.filter(function(e){return dp.matchDBRow(e,search.aTable);});
  var bRows = rows.filter(function(e){return dp.matchDBRow(e,search.bTable);});
  var cRows = rows.filter(function(e){return dp.matchDBRow(e,search.cTable);});
  var dRows = rows.filter(function(e){return dp.matchDBRow(e,search.dTable);});

  // Set all null values in rows to 0
  aRows.forEach(function(e){if(e.value === null){e.value = 0;}});
  bRows.forEach(function(e){if(e.value === null){e.value = 0;}});
  cRows.forEach(function(e){if(e.value === null){e.value = 0;}});
  dRows.forEach(function(e){if(e.value === null){e.value = 0;}});


  var tables = [];
  if(aRows.length > 0){
    tables.push({ id : 'a', rows : aRows, search : search.aTable});
  }

  // Create combined tables if possible
  if(aRows.length > 0 && bRows.length > 0){
      var abRows = dp.combineTables(aRows,bRows);
  }

  if(cRows.length > 0 && dRows.length > 0){
      var cdRows = dp.combineTables(cRows,dRows);
  }

  return new DataTables(aRows,bRows,cRows,dRows, abRows, cdRows);
}



// START NEW
/**
 * Takes rows from database query result and splits into corresponding table. Uses the matchDBRow function to match
 * a row to a selection. Once filtered creates and object containing each table and the rows
 *
 * Also creates the combined tables by using the combineTable function and adds the combined tables to the returned
 * object.
 *
 * Note any null values in the rows are changed to 0
 *
 * @param rows {Object} All the rows from the users selections
 * @param search {Object} object that contains the four different selections the user may have made
 * @returns {Object} An object that contains a property for each table which is an array with the corresponding rows
 * */
DataProcessor.prototype.filterRowsToTablesAndCopy = function (rows, search) {

  // Create four arrays for the different rows that belong to each of the searches
  var aRows = rows.filter(function(e){return dp.matchDBRow(e,search.aTable);});
  var bRows = rows.filter(function(e){return dp.matchDBRow(e,search.bTable);});
  var cRows = rows.filter(function(e){return dp.matchDBRow(e,search.cTable);});
  var dRows = rows.filter(function(e){return dp.matchDBRow(e,search.dTable);});

  // Set all null values in rows to 0
  aRows.forEach(function(e){if(e.value === null){e.value = 0;}});
  bRows.forEach(function(e){if(e.value === null){e.value = 0;}});
  cRows.forEach(function(e){if(e.value === null){e.value = 0;}});
  dRows.forEach(function(e){if(e.value === null){e.value = 0;}});

  // Create combined tables if possible
  if(aRows.length > 0 && bRows.length > 0){
      var abRows = dp.combineTables(aRows,bRows);
  }

  if(cRows.length > 0 && dRows.length > 0){
      var cdRows = dp.combineTables(cRows,dRows);
  }

  var copy = this.copyDataTables(new DataTables(aRows,bRows,cRows,dRows,abRows,cdRows));

  var tables = [];
  if(aRows.length > 0){
    tables.push({ id : 'a', rows : copy.tableA, search : search.aTable, combined : false});
  }

  if(bRows.length > 0){
    tables.push({ id : 'b', rows : copy.tableB, search : search.bTable, combined : false});
  }

  if(cRows.length > 0){
    tables.push({ id : 'c', rows : copy.tableC, search : search.cTable, combined : false});
  }

  if(dRows.length > 0){
    tables.push({ id : 'd', rows : copy.tableD, search : search.dTable, combined : false});
  }



  // Create combined tables if possible
  if(aRows.length > 0 && bRows.length > 0){
      tables.push({ id : 'ab', rows : copy.tableAB, table1Rows : copy.tableA, table2Rows : copy.tableB, search : search.aTable, search2 : search.bTable, combined : true});
  }

  if(cRows.length > 0 && dRows.length > 0){
      var cdRows = dp.combineTables(cRows,dRows);
      tables.push({ id : 'cd', rows : copy.tableCD, table1Rows : copy.tableC, table2Rows : copy.tableD, search : search.cTable, search2 : search.dTable, combined : true});
  }
  return tables;
}
// END NEW



/**
 * Combines the two tables by going through each row and dividing the value of table1 to the corresponding value from
 * a row in table 2
 *
 * Note if table 2 value is 0 it is divided by 1 instead
 *
 * @param table1Rows {Object} An array of rows that belong to one table
 * @param table2Rows {Object} An array of rows that belong to another table
 * @returns {Ojbect[]} An array of rows as a result of combining table1 and table2
 * */
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


/**
 * Creates the data from the table rows used by the vector graph. Each entry in the array contains the edb an array of years with the value from
 * table a and table b.
 *
 * @param table1Rows {Object} An array of rows that belong to one table
 * @param table2Rows {Object} An array of rows that belong to another table
 * @returns {Ojbect[]} Data for the vector graph in the form [{ EDB, [ { year1, valueA, valueB }, {year2, valueA, valueB },...]}]
 * */
DataProcessor.prototype.createDataForVectorGraph = function(table1Rows,table2Rows) {
    var at = table1Rows;
    var bt = table2Rows;
    var edbDone = []; // The edbs that have been processed
    var vecData = []; // The final entry in the form { EDB, [ { year1, valueA, valueB }, {year2, valueA, valueB }]}

    var availableObsYears = []; // The years for both table 1 and table 2
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


/**
 * Creates the data from the table rows which is then used by the box plot.
 *
 * @param tableRows {Object} The rows from the table the box plot is visualising
 * @returns {Ojbect[]} Data for the box plot
 * */
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


/**
 * Creates the data from the table rows which is then used by the grouped bar graph.
 *
 * @param tows {Object} The rows from the table the bar graph is visualising
 * @returns {Ojbect[]} Data for the bar graph
 * */
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
                    data[j][rows[i].obs_yr] = +rows[i].value;
                }
            }
        }
    }
    return {data : data, keys : availableObsYears};
}


/**
 * Sorts the sections
 *
 * @param rows {Object} data object that contains the sections array
 * */
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


/**
 * Applies a CPI consumer price index percentage to each of the rows values. The cpiValues contains a value for each of the years.
 *
 * The CPI is apploed by starting at the year the value was observed at compounding the cpi values until the last year in the
 * cpiValues object.
 *
 * @param rows {Object} The rows cpi will be applied to
 * @param cpi values {Object} The values to add to each year
 * */
DataProcessor.prototype.applyCPIToTableRows = function(rows, cpiValues){
    // Find the min and max year from the data
    rows.forEach(function(elem, index){ // Grab every Row
        var year = rows[index].obs_yr; // Grab the year of the cell by checking the class
        var valueOfCell = rows[index].value;

        for(var i = 0; i < cpiValues.length; i++){
            if(year <= cpiValues[i].year){
                valueOfCell = valueOfCell * (1 + (cpiValues[i].value / 100));
            }
        }
        rows[index].value = valueOfCell; // CPI Applied value
    });
}


/**
 * Adds in a section, category, sub category, or description to a row in selections. The id is used to
 * work out which row it goes in. The type is used for working out which property to set
 *
 * @param id {Number} the id of the selection row
 * @param type {String} the type of selection section, category etc.
 * @param selections {Object[]} The array of rows to set the selection in
 * */
DataProcessor.prototype.addToSelection = function (id,type,data,selections) {

    for(var i = 0; i < selections.length; i++){
        if(selections[i].id+"" === id+""){ // Convert them both to strings
            if(type === "section"){
                selections[i].section = data;
            } else if(type === "category"){
                selections[i].category = data;
            } else if(type === "subcategory"){
                selections[i].subCategory = data;
            } else if(type === "description"){
                selections[i].description = data;
            }
        }
    }
}


/**
 * Works out the total for each region based on the edb for each row and which region it is part of
 *
 * @param tableRows {Object[]} the rows from a table
 * @param regions {Object[]} An array of regions and which edbs make up that region
 * @param availableYears {Object[]} The years that totals should be created for
 * @returns {Object} contains each region and an array of years along with totals for that year
 * */
DataProcessor.prototype.createTableTotals = function (tableRows, regions, availableObsYears) {
    var regionStrings = ["n","uni","eni", "swni", "s", "usi", "lsi"]; // All the regions
    var totals = {}; // reg : "" , years : []

    // Go through every year
    for(var i = 0; i < availableObsYears.length; i++){
        // Get the rows for the current year
        tableRows.filter(function(e){return e.obs_yr === availableObsYears[i];}).forEach(function(row){

            // Go through each of the regions
            regionStrings.forEach(function(regionString){
                // If the current row edb is inside the current reqion grab the value from the row and add it in the array for the current year
                if(regions[regionString].includes(row.edb)){
                    if(totals[regionString] === undefined){
                        totals[regionString] = [+row.value]; // First time this reqion has been found so have to create the property
                    } else {
                        if(i === totals[regionString].length){ // This means we have moved onto a new year so have to create a new slot
                            totals[regionString].push(+row.value);
                        } else {
                            totals[regionString] [i] += + (+row.value); // Still in the first year with a different edb in the same region so just add the values
                        }
                    }
                }
            });
        });
    }
    var nz = []; // To find the totals of NZ add north and south tegether
    for(var i = 0; i < availableObsYears.length; i++){
        nz.push(totals["n"][i] + totals["s"][i]);
    }
    totals["nz"] = nz; // Add the NZ property to totals
    return totals;
}


/**
 * The data structure object
 *
 * @param selectionsData {Object[]} Used for creating regular graphs
 * @param selectionTable{Object[]} Used for creating the html tables
 * @param combineData {Object[]} Used for the vector graphs
 * */
function DataStructure(selectionData, selectionTable, combineData){
    this.selectionData = selectionData; // Contains the rows, id, title, subtitle amd init for each selection
    this.selectionTable = selectionTable; // Contains the rows, id, title, subtitle amd init for each table
    this.combineData = combineData; // Contains combined rows along with titles and units
}


/**
 * Object for holding the users selections each property contains a
 * section, category, sub category and description. They can be empty strings
 *
 * @param a {Object} A selection
 * @param b {Object} B selection
 * @param c {Object} C selection
 * @param d {Object} D selection
 * */
function Selection(a,b,c,d){
    this.aTable = a;
    this.bTable = b;
    this.cTable = c;
    this.dTable = d;
}


/**
 * Object for holding the rows that belong to each of the table selections.
 * Also contains the combined tables. Each of the arrays could be empty if no
 * selection was made for a table
 *
 * @param tableA {Object[]} A selection
 * @param tableB {Object[]} B selection
 * @param tableC {Object[]} C selection
 * @param tableD {Object[]} D selection
 * @param tableAB {Object[]} AB selection
 * @param tableCD {Object[]} CD selection
 * */
function DataTables(tableA,tableB,tableC,tableD,tableAB,tableCD){
    this.tableA = tableA;
    this.tableB = tableB;
    this.tableC = tableC;
    this.tableD = tableD;
    this.tableAB = tableAB;
    this.tableCD = tableCD;
}


/**
 * Contains data for a particular selection. The rows that belong to the sections and
 * the shared title subtitle and unit.
 * */
function SelectionData(rows,title,subTitle,unit,id){
    this.rows = rows;
    this.title = title;
    this.subTitle = subTitle;
    this.id = id;
    this.unit = unit;
}


/**
 * Contains data for a particular selection. The rows that belong to both tables and the combined rows
 * */
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


/**
 * Contains data for a particular selection. The rows that belong to the sections and
 * the shared title subtitle and unit. Used to generate html tables
 * */
function SelectedTableData(rows,id, title, subTitle, unit){
    this.rows = rows;
    this.id = id;
    this.title = title;
    this.subTitle = subTitle;
    this.unit = unit;
}
