/**
 * Created by Nicky on 23/01/2017.
 */

// Holds the currently selected items in the filter rows
var selections = [];

// Holds a object that contains the rows of selections that were last searched
var lastSearch = null;
var validOptions = [false,false,false]; // Each boolean represents if a sub category should exist in the selection row
var selectedCompany = "";

// Hold if these tables have been selected
var aSelected = false;
var bSelected = false;
var cSelected = false;
var dSelected = false;

// Holds the rows for each table separately
var dataTables;

var copyOfDataTables;
var titles;

$(document).ready( function() {
    // Highlight the selected link
    $(".nav-link").removeClass('active');
    $("#benchmarks-link").addClass('active');

    // On click listener for company selector
    $('#company-select').on('change', function(event){
        selectedCompany = $(this).find("option:selected").text();
    });
    $('#search-btn-compare').click(function(){ // Listener to search button
        search();
    });
    cpiValidationSetup(); // Set up cpi validation rules
});

// Checks that if there is a value in a selection one must be selected per row
function validateSearchParams(){
    var returnVal = true;

    selections.forEach(function (elem, i) {
        if(elem.subCategory === "" && validOptions[i]){
            returnVal = false; // There is a possible sub category so it has to be chosen from
        }

        // Check if one of the selections is empty
        if(elem.section === "" || elem.category === "" || elem.description === ""){
            // Now check if one of the selections is not empty
            if(elem.section !== "" || elem.category !== "" || elem.description !== ""){
                $('#error-div').append('<h4 style="color : red;">Partial Row Selected</h4>');
                returnVal = false; // A row cannot have one item selected and another empty
            }
        }
    });
    if(returnVal)$('#error-div').html('');
    return returnVal;
}

function copyDataTables(dataTables){
    var tableAData = [];
    var tableBData = [];
    var tableCData = [];
    var tableDData = [];

    var a = dataTables.tableA;
    for(var i = 0; i < a.length; i++){
        tableAData.push({category :a[i].category, description : a[i].description,disc_yr: a[i].disc_yr,edb: a[i].edb,
        fcast_yr: a[i].fcast_yr,network:a[i].network,note:a[i].note,obs_yr:a[i].obs_yr,p_key: a[i].p_key,sch_ref:a[i].sch_ref,
        schedule:a[i].schedule,section:a[i].section,sub_category: a[i].sub_category,units:a[i].units,value:a[i].value})
    }

    var b = dataTables.tableB;
    for(var i = 0; i < dataTables.tableB.length; i++){
        tableBData.push({category :b[i].category, description : b[i].description,disc_yr: b[i].disc_yr,edb: b[i].edb,
            fcast_yr: b[i].fcast_yr,network:b[i].network,note:b[i].note,obs_yr:b[i].obs_yr,p_key: b[i].p_key,sch_ref:b[i].sch_ref,
            schedule:b[i].schedule,section:b[i].section,sub_category: b[i].sub_category,units:b[i].units,value:b[i].value})
    }

    var c = dataTables.tableC;
    for(var i = 0; i < dataTables.tableC.length; i++){
        tableCData.push({category :c[i].category, description : c[i].description,disc_yr: c[i].disc_yr,edb: c[i].edb,
            fcast_yr: c[i].fcast_yr,network:c[i].network,note:c[i].note,obs_yr:c[i].obs_yr,p_key: c[i].p_key,sch_ref:c[i].sch_ref,
            schedule:c[i].schedule,section:c[i].section,sub_category: c[i].sub_category,units:c[i].units,value:c[i].value})
    }

    var d = dataTables.tableD;
    for(var i = 0; i < dataTables.tableD.length; i++){
        tableDData.push({category :d[i].category, description : d[i].description,disc_yr: d[i].disc_yr,edb: d[i].edb,
            fcast_yr: d[i].fcast_yr,network:d[i].network,note:d[i].note,obs_yr:d[i].obs_yr,p_key: d[i].p_key,sch_ref:d[i].sch_ref,
            schedule:d[i].schedule,section:d[i].section,sub_category: d[i].sub_category,units:d[i].units,value:d[i].value})
    }
    return new DataTables(tableAData,tableBData,tableCData,tableDData);
}

// Uses the url to find what was searches and asks server for rows relating to that search
function loadFromURL(urlSelections){
    loadInSections(true,urlSelections); // First load in the section rows

    lastSearch = new Selection(urlSelections[0],urlSelections[1],urlSelections[2],urlSelections[3]); //TODO copy values
    // Send array of selected sections to server and the company
    $.post("/compare/search",{company : selectedCompany, selections : JSON.stringify(urlSelections)}, function(data){
        setSelectionsFromURL(urlSelections[0]); //TODO check for null to be more efficient
        setSelectionsFromURL(urlSelections[1]);
        setSelectionsFromURL(urlSelections[2]);
        setSelectionsFromURL(urlSelections[3]);

        dataTables = filterRowsToTables(data.rows); // Filter the rows into their tables

        // Create a copy of data tables
        copyOfDataTables = copyDataTables(dataTables);


        if(dataTables.tableA.length > 0){
            aSelected = true;
        }

        if(dataTables.tableB.length > 0){
            bSelected = true;
        }

        if(dataTables.tableC.length > 0){
            cSelected = true;
        }

        if(dataTables.tableD.length > 0){
            dSelected = true;
        }

        titles = createTableTitles(copyOfDataTables); // Pass the copy through

        showAll(copyOfDataTables,titles); // Loads in tables bar graphs and box plots
    });
}

// Takes all rows and filers into corresponding tables
function filterRowsToTables(rows){
    var aRows = rows.filter(function(e){return matchDBRow(e,lastSearch.aTable);});

    var bRows = rows.filter(function(e){return matchDBRow(e,lastSearch.bTable);});
    var cRows = rows.filter(function(e){return matchDBRow(e,lastSearch.cTable);});
    var dRows = rows.filter(function(e){return matchDBRow(e,lastSearch.dTable);});

    aRows.forEach(function(e){
        if(e.value === null){
            e.value = 0;
        }
    });

    bRows.forEach(function(e){
        if(e.value === null){
            e.value = 0;
        }
    });

    cRows.forEach(function(e){
        if(e.value === null){
            e.value = 0;
        }
    });

    dRows.forEach(function(e){
        if(e.value === null){
            e.value = 0;
        }
    });
    return new DataTables(aRows,bRows,cRows,dRows);
}

function createTableTitles(tablesData){

    var aTitle = "";
    var aUnit = "";
    if(aSelected){
        aTitle = tablesData.tableA[0].category + " " + tablesData.tableA[0].description;
        aUnit = tablesData.tableA[0].units;
    }

    var bTitle = "";
    var bUnit = "";
    if(bSelected){
        bTitle = tablesData.tableB[0].category + " " + tablesData.tableB[0].description;
        bUnit = tablesData.tableB[0].units;
    }

    var cTitle = "";
    var cUnit = "";
    if(cSelected){
        cTitle = tablesData.tableC[0].category + " " + tablesData.tableC[0].description;
        cUnit = tablesData.tableC[0].units;
    }

    var dTitle = "";
    var dUnit = "";
    if(dSelected){
        dTitle = tablesData.tableD[0].category + " " + tablesData.tableD[0].description;
        dUnit = tablesData.tableD[0].units;
    }

    return new DataTableTitles(aTitle,bTitle,cTitle,dTitle,aUnit,bUnit,cUnit,dUnit);
}

// Tables data contains 4 arrays with rows for each table
function showAll(tablesData, titles){
    // For each selection we need to check if it has been selected

    // Check selection A
    if(aSelected){
        // Insert table A
        var titleA = tablesData.tableA[0].section + ", " + tablesData.tableA[0].category;
        var subTitleA = "";
        if(tablesData.tableA[0].sub_category === null){
            subTitleA = tablesData.tableA[0].description;
        } else {
           subTitleA = tablesData.tableA[0].sub_category + ", " + tablesData.tableA[0].description;
        }

        $('#title-a').append('<h2 class="title">'+titleA+'</h2>')
                     .append('<h4 class="subTitle">'+subTitleA+'</h4>');

        insertTable(tablesData.tableA,'tableA');

        // Create and Insert the box plot for table A
        $('#title-a-box').append('<h2 class="title">'+titleA+'</h2>')
                         .append('<h4 class="subTitle">'+subTitleA+'</h4>');

        createBoxPlot(createDataForBoxPlot(tablesData.tableA), "#boxplotA-div", titles.aTitle, titles.aUnit);

        // Create and insert the grouped graph
        $('#title-a-bar').append('<h2 class="title">'+titleA+'</h2>')
                         .append('<h4 class="subTitle">'+subTitleA+'</h4>');

        var table1Data = createDataForGroupedGraph(tablesData.tableA);
        createdGroupedBarGraph(table1Data.data, table1Data.keys,titles.aTitle,titles.aUnit,"#grouped-bar-a");
        $('#full-table-a-div').show(); //Show the div
    }

    // Check selection B
    if(bSelected){
        var titleB = tablesData.tableB[0].section + ", " + tablesData.tableB[0].category;
        var subTitleB = "";
        if(tablesData.tableB[0].sub_category === null){
            subTitleB =tablesData.tableB[0].description;
        } else {
            subTitleB = tablesData.tableB[0].sub_category + ", " + tablesData.tableB[0].description;
        }


        $('#title-b').append('<h2 class="title">'+titleB+'</h2>')
                     .append('<h4 class="subTitle">'+subTitleB+'</h4>');

        insertTable(tablesData.tableB,'tableB');

        $('#title-b-box').append('<h2 class="title">'+titleB+'</h2>')
                         .append('<h4 class="subTitle">'+subTitleB+'</h4>');


        createBoxPlot(createDataForBoxPlot(tablesData.tableB), "#boxplotB-div", titles.bTitle, titles.bUnit);

        $('#title-b-bar').append('<h2 class="title">'+titleB+'</h2>')
            .append('<h4 class="subTitle">'+subTitleB+'</h4>');

        var table2Data = createDataForGroupedGraph(tablesData.tableB);
        createdGroupedBarGraph(table2Data.data, table2Data.keys, titles.bTitle, titles.bUnit, "#grouped-bar-b");
        $('#full-table-b-div').show();
    }

    // Check selection C
    if(cSelected){
        var titleC = tablesData.tableC[0].section + ", " + tablesData.tableC[0].category;
        var subTitleC = "";
        if(tablesData.tableC[0].sub_category === null){
            subTitleC =tablesData.tableC[0].description;
        } else {
            subTitleC = tablesData.tableC[0].sub_category + ", " + tablesData.tableC[0].description;
        }

        $('#title-c').append('<h2 class="title">'+titleC+'</h2>')
            .append('<h4 class="subTitle">'+subTitleC+'</h4>');

        insertTable(tablesData.tableC,'tableC');

        $('#title-c-box').append('<h2 class="title">'+titleC+'</h2>')
            .append('<h4 class="subTitle">'+subTitleC+'</h4>');
        createBoxPlot(createDataForBoxPlot(tablesData.tableC), "#boxplotC-div", titles.cTitle, titles.cUnit);


        $('#title-c-bar').append('<h2 class="title">'+titleC+'</h2>')
            .append('<h4 class="subTitle">'+subTitleC+'</h4>');
        var table3Data = createDataForGroupedGraph(tablesData.tableC);
        createdGroupedBarGraph(table3Data.data, table3Data.keys,titles.cTitle, titles.cUnit, "#grouped-bar-c");
        $('#full-table-c-div').show();
    }

    // Check selection D
    if(dSelected){
        var titleD = tablesData.tableD[0].section + ", " + tablesData.tableD[0].category;
        var subTitleD = "";
        if(tablesData.tableD[0].sub_category === null){
            subTitleD =tablesData.tableD[0].description;
        } else {
            subTitleD = tablesData.tableD[0].sub_category + ", " + tablesData.tableD[0].description;
        }

        $('#title-d').append('<h2 class="title">'+titleD+'</h2>')
            .append('<h4 class="subTitle">'+subTitleD+'</h4>');

        insertTable(tablesData.tableD,'tableD');

        $('#title-d-box').append('<h2 class="title">'+titleD+'</h2>')
            .append('<h4 class="subTitle">'+subTitleD+'</h4>');
        createBoxPlot(createDataForBoxPlot(tablesData.tableD), "#boxplotD-div", titles.dTitle, titles.dUnit);

        $('#title-d-bar').append('<h2 class="title">'+titleD+'</h2>')
            .append('<h4 class="subTitle">'+subTitleD+'</h4>');
        var table4Data = createDataForGroupedGraph(tablesData.tableD);
        createdGroupedBarGraph(table4Data.data, table4Data.keys, titles.dTitle, titles.dUnit, "#grouped-bar-d");
        $('#full-table-d-div').show();
    }

    // Check selection A and B
    if(aSelected && bSelected){
        $('#title-ab').append('<h3 class="combined-title">'+subTitleA+' <span class="over">over</span>,'+subTitleB+'</h3>');


        var abData = insertTableOverTable(true,tablesData);
        insertTable(abData, "tableAB");

        $('#title-ab-box').append('<h3 class="combined-title">'+subTitleA+' <span class="over">over</span>,'+subTitleB+'</h3>');

        createBoxPlot(createDataForBoxPlot(abData), "#boxplotAB-div", titles.aTitle + " Over " + titles.bTitle, titles.aUnit);

        $('#title-ab-bar').append('<h3 class="combined-title">'+subTitleA+' <span class="over">over</span>,'+subTitleB+'</h3>');
        var tableABData = createDataForGroupedGraph(abData);
        createdGroupedBarGraph(tableABData.data, tableABData.keys,titles.aTitle + " Over " + titles.bTitle , titles.aUnit, "#grouped-bar-ab");


        $('#title-ab-vector').append('<h3 class="combined-title">'+subTitleA+' <span class="over">over</span>,'+subTitleB+'</h3>');
        createVectorGraph(createDataForVectorGraph(dataTables.tableA,dataTables.tableB),titles.aUnit,titles.bUnit,titles.tableA + " Over " + titles.tableB,"#vector-graph-div-ab"); // TODO check if A/B / C/D
        $('#full-table-ab-div').show();
    }

    // Check selection C and D
    if(cSelected && dSelected){
        $('#title-cd').append('<h3 class="combined-title">'+subTitleC+' <span class="over">over</span>,'+subTitleD+'</h3>');

        var cdData = insertTableOverTable(false,tablesData);
        insertTable(cdData, "tableCD");

        $('#title-cd-box').append('<h3 class="combined-title">'+subTitleC+' <span class="over">over</span>,'+subTitleD+'</h3>');
        createBoxPlot(createDataForBoxPlot(cdData), "#boxplotCD-div", titles.cTitle + " Over " + titles.dTitle, titles.cUnit);

        $('#title-cd-bar').append('<h3 class="combined-title">'+subTitleC+' <span class="over">over</span>,'+subTitleD+'</h3>');
        var tableCDData = createDataForGroupedGraph(cdData);
        createdGroupedBarGraph(tableCDData.data, tableCDData.keys,titles.cTitle + " Over " + titles.dTitle , titles.aUnit, "#grouped-bar-cd");

        $('#title-cd-vector').append('<h3 class="combined-title">'+subTitleC+' <span class="over">over</span>,'+subTitleD+'</h3>');
        createVectorGraph(createDataForVectorGraph(dataTables.tableC,dataTables.tableD),titles.cUnit,titles.dUnit,titles.tableC + " Over " + titles.tableD,"#vector-graph-div-cd");
        $('#full-table-cd-div').show();
    }

    // Check selection A, B, C, and D
    if(aSelected && bSelected && cSelected && dSelected){
        var ab = insertTableOverTable(true, dataTables);
        var cd = insertTableOverTable(false, dataTables);

        $('#title-abcd-vec').append('<h4 class="combined-title">'+subTitleA+' / '+subTitleB+'</h4>')
                            .append('<h4>Over</h4>')
                            .append('<h4 class="combined-title">'+subTitleC+' / '+subTitleD+'</h4>');

        createVectorGraph(createDataForVectorGraph(ab,cd),titles.aUnit + " / " + titles.bUnit,titles.cUnit + " / " + titles.dUnit,"","#vector-graph-div-abcd");
        $('#vector-full-div-abcd').show();
    }
}

function insertTableOverTable(ab,tablesData){
    var combined = []; // Contain object with edb disc_yr value

    var at = ab ? tablesData.tableA : tablesData.tableC;
    var bt = ab ? tablesData.tableB : tablesData.tableD;

    for(var i = 0; i < at.length; i++){
        for(var j = 0; j < bt.length; j++){
            if(at[i].edb === bt[j].edb && at[i].obs_yr === bt[j].obs_yr && at[i].disc_yr === bt[j].disc_yr){
                combined.push({ disc_yr : bt[j].disc_yr ,
                                edb : bt[j].edb,
                                "obs_yr" : bt[j].obs_yr,
                                value : at[i].value / (bt[j].value === '0' ? 1 : bt[j].value), // Divide the value if va if dividing by 0 make it 1
                                section : bt[j].section + "" + bt[j].description + " over ", // Bit of a hack as description is inserted after section, this way both titles are added to table
                                description : at[i].section + " " + at[i].description,
                                unitA : at[i].units,
                                unitB : bt[j].units
                });
                break; // can exit the loop
            }
        }
    }
    return combined;
}


// Here every row belongs to the specific table
function insertTable(tableRows,id){
    // Sorts the EDB names
    tableRows.sort(function (a,b) {
        return [a.edb, b.edb].sort()[0] === a.edb ? -1 : 1; // Sort two names and return the first
    });

    if(tableRows.length === 0)return; // No data so return

    // Add the title to the table
    //$("#"+id).append('<caption class="cap">' +tableRows[0].section + " " + tableRows[0].description + '</caption>'); // TODO wont work with ab cd

    // Find the min and max year from the data
    var min = tableRows.reduce(function(prev, curr) {
        return prev.disc_yr < curr.disc_yr ? prev : curr;
    }).obs_yr;

    var max = tableRows.reduce(function(prev, curr) {
        return prev.disc_yr > curr.disc_yr ? prev : curr;
    }).obs_yr; //TODO this line might need to be disc_yr

    // Create cells for each of the years to use as header
    var years = "";
    for(var i = min; i <= max; i++){
        years += "<th>" + i + "</th>";
    }

    $("#"+id).append('<tr id="head-row" class="table-row table-head"> <th>EDB</th>'+ years + '</tr>');

    // An array of companies already processed
    var done = [];
    var cellCount = 0;
    var cellValues = [];
    var observerd = true;

    // Create the rows of data
    for(var i = 0; i < tableRows.length; i++){
        if(!done.includes(tableRows[i].edb)){
            done.push(tableRows[i].edb);

            var row= "<tr class='table-row' id=row"+id+i+">";

            // Insert name in column and assign an id to the row
            row += "<th class='edb-cell'>" + tableRows[i].edb + "</th>";


            for(var cur = min; cur <=max; cur++){
                // Iterate through all rows finding ones with the current edb
                for(var j = 0; j < tableRows.length; j++){

                    // Check it matches edb and year inserting into
                    if(tableRows[j].edb === tableRows[i].edb && tableRows[j].disc_yr === cur){
                        row += "<th class='cell "+cur+"' id='t"+id+""+cellCount+"'>" + tableRows[j].value + "</th>";

                        // Save the value and the id of the cell to display percentage
                        cellValues.push({ id : "#t"+id+""+cellCount, value : tableRows[j].value });
                        cellCount++;
                    }
                }
            }

            $("#"+id).append(row + '</tr>');
            // Here we can check the unit type and highlight appropriately
            // Assing a on click function to each of the rows to generate the bar graph with the row specific data
            //$( "#row"+i+"").click(function(event) {
            //    showBarWithRowElem(this.id);
            //});
        }
    }
    applyGradientCSS(cellValues);
}


function applyGradientCSS(cellValues){
    var percent = false;
    //if(tableRows[0].units.includes("%")) { //TODO check if this is the right way to identify percentage
    //    percent = true;
    //}
    // or proportion

    var maxCellValue = -Infinity;
    cellValues.forEach(function(elem){
        maxCellValue = +elem.value > maxCellValue ? +elem.value : maxCellValue;
    });

    // Apllie css to each cell
    for(var i = 0; i < cellValues.length; i++){
        var value = (percent ? value : ((+cellValues[i].value / maxCellValue)*100)); // If percentage metric just use valud

        $(cellValues[i].id).css({
                "background" : "-webkit-gradient(linear, left top, right top, color-stop(" + value +"%,#64B5F6), color-stop(" + value +"%,#FFF))",
            }
        );
    }
}

// Returns if a row from the DB matches one of the specified rows by the user
function matchDBRow(DBRow, selection){
    if(DBRow.section === selection.section && DBRow.category === selection.category && DBRow.description === selection.description){
        if(DBRow.sub_category !== null){
            return selection.subCategory === DBRow.sub_category; // Sub cat could be null but would still match
        }
        return true;
    }
    return false;
}

// Creates search parameters and creates url
function search(){
    if(!validateSearchParams())return;

    var rows = {
        i0 : selections[0].id,
        s0  : selections[0].section,
        c0 : selections[0].category,
        sc0 : selections[0].subCategory,
        d0 : selections[0].description,
        i1 : selections[1].id,
        s1  : selections[1].section,
        c1 : selections[1].category,
        sc1 : selections[1].subCategory,
        d1 : selections[1].description,
        i2 : selections[2].id,
        s2  : selections[2].section,
        c2 : selections[2].category,
        sc2 : selections[2].subCategory,
        d2 : selections[2].description,
        i3 : selections[3].id,
        s3  : selections[3].section,
        c3 : selections[3].category,
        sc3 : selections[3].subCategory,
        d3 : selections[3].description
    };
    console.log(selections[0]);

    params = serialise(rows);
    window.location.replace("compare?" + params);
}

// Turns object in url string
function serialise(obj) {
    var str = [];
    for(var p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
}


// table 1 can be A and table two C or table 1 is A / B and table two is
function createDataForVectorGraph(table1Rows,table2Rows) {
    var at = table1Rows;
    var bt = table2Rows;
    var edbDone = []; // The edbs that have been processed
    var vecData = []; // The final entry in the form { EDB, [ { year1, valueA, valueB }, {year2, valueA, valueB }]}

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
                if (!yearsDone.includes(edbRowsAt[j].disc_yr)) {
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
function createDataForBoxPlot(tableRows){
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
function createDataForGroupedGraph(rows){
    var data = [];
    var edbDone = [];

    // Find the min and max year from the data
    var min = rows.reduce(function(prev, curr) {
        return prev.disc_yr < curr.disc_yr ? prev : curr;
    }).obs_yr;

    var max = rows.reduce(function(prev, curr) {
        return prev.disc_yr > curr.disc_yr ? prev : curr;
    }).obs_yr;

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

    var keys = [];
    for(var i = min; i <= max; i++){
        keys.push(""+i);
    }
    return {data : data, keys : keys};
}


function setSelectionsFromURL(selection){
    // Find all the categories associated with this section
    $.post("/sections/s",{selected : selection.section }, function(data){
        if(data.categories.length > 0  &&  data.categories[0] !== null){
            $('#category-select'+selection.id).html(''); // Empty temp options
        }
        // Add the options to the drop down
        for(var i = 0; i < data.categories.length; i++){
            if(data.categories[i] === selection.category){
                $('#category-select'+selection.id).append('<option value="' + data.categories[i] + '"selected> ' + data.categories[i] + '</option>');
            } else {
                $('#category-select'+selection.id).append('<option value="' + data.categories[i] + '"> ' + data.categories[i] + '</option>');
            }

        }
        // Refresh all drop downs
        $(".selectpicker").selectpicker('refresh');
    });

    // Find all sub categories for the currently selected category
    $.post("/sections/sc",{section : selection.section, category : selection.category}, function(data){

        if(data.subCategories.length > 0  &&  data.subCategories[0] !== null){
            $('#subsection-select'+selection.id).html(''); // Empty temp options

            validOptions[selection.id] = true; // There are options for this row and sub category
        } else {
            return;
        }

        // Add sub section options
        for(var i = 0; i < data.subCategories.length; i++){
            if(data.subCategories[i] === selection.subCategory){
                $('#subsection-select'+selection.id).append('<option selected>' + data.subCategories[i] + '</option>');
            } else {
                $('#subsection-select'+selection.id).append('<option>' + data.subCategories[i] + '</option>');
            }
        }
        $(".selectpicker").selectpicker('refresh');
    });

    // Grab the descriptions
    $.post("/sections/desc",{category : selection.category,section : selection.section, subCategory : selection.subCategory}, function(data){
        if(data.descriptions.length > 0 &&  data.descriptions[0] !== null){
            $('#description-select'+selection.id).html(''); // Empty temp options
        } else {
            return;
        }
        // Add sub section options
        for(var i = 0; i < data.descriptions.length; i++){
            if(data.descriptions[i] === selection.description){
                $('#description-select'+selection.id).append('<option selected>' + data.descriptions[i] + '</option>');
            } else {
                $('#description-select'+selection.id).append('<option>' + data.descriptions[i] + '</option>');
            }
        }
        $(".selectpicker").selectpicker('refresh');
    });
}

// Sort the sections
function sortSections(data){
    data.sections.sort(function(a,b){
        // First check simple case of number difference
        var i = 0;
        while(!isNaN(a.charAt(i))){
            i++
        }
        var numberA = a.substring(0,i); // Gets the number from the section

        i = 0;
        while(!isNaN(b.charAt(i))){
            i++
        }
        var numberB = b.substring(0,i);

        if(numberA !== numberB) {
            return numberA - numberB;
        }
        return [a,b].sort()[0] === a ? -1 : 1; // Sort two names and return the first
    });
}

// Loads in sections along with the rows of selection boxes
function loadInSections(fromURL, userSelections){ // if from url false selections is null
    // Grab all the sections
    /// Query for all sections
    $.get("/sections/sections", function(data){
        // Create the four filters rows
        addSection(0);
        addSection(1);
        addSection(2);
        addSection(3);

        if(fromURL){
            for(var i = 0; i < userSelections.length; i++){
                selections[i].description = userSelections[i].description;
                selections[i].category = userSelections[i].category;
                selections[i].section = userSelections[i].section;
                selections[i].subCategory = userSelections[i].subCategory;
            }
        }

        // Sort the sections
        sortSections(data);

        // Go through each row and add the sections in
        for(var i = 0; i < selections.length; i++){
            for(var j = 0; j < data.sections.length; j++){
                if(fromURL && userSelections[i].section === data.sections[j]){
                    $("#section-select"+selections[i].id+"").append('<option selected>' + data.sections[j] + '</option>');
                } else {
                    $("#section-select"+selections[i].id+"").append('<option>' + data.sections[j] + '</option>');
                }
            }
            $(".selectpicker").selectpicker('refresh');
        }
        // showSelectedDivs(); // TODO changed late at night double check in the morning
    });
}

// Adds a new row of filters for section category and sub category
function addSection(numberSections){
    var table = ['A','B','C','D','E'];

    // Add in a new row div
    $('#compare-div').append('<div class="row" id="titleRow'+numberSections+'"><div class="col-md-12"><h5  class="selection-title">Make a selection for table '+table[numberSections]+'</h5> </div></div>');

    $('#compare-div').append('<div class="row" id="row'+numberSections+'">');

    $("#row"+numberSections).append('<div class="col-md-12 compare-col" id="col'+numberSections+'">');

    // add section selector with the number section as the dynamic id
    $("#col"+numberSections).append('<select data-width="250px" class="selectpicker select-compare"  title="Section" id="section-select'+numberSections+'"></select>');

    // Push the information for the new row into the selections array
    selections.push({id : numberSections, section : "", category : "", subCategory : "", description : ""});

    // Add a change listener for when a section is selected
    $("#section-select"+numberSections).on('change', function(event){
        var section = $(this).find("option:selected").text(); // Grab the selection
        var idNumb = event.target.id.charAt(event.target.id.length-1); // Grab the last character of the id that generated the event to work out correct id

        // First empty out all options for sub selections
        $('#category-select'+idNumb).html(''); // Empty temp options
        $('#subsection-select'+idNumb).html(''); // Empty temp options
        $('#description-select'+idNumb).html(''); // Empty temp options
        selections[idNumb] = {id : numberSections, section : "", category : "", subCategory : "", description : ""};
        validOptions[idNumb] = false;

        // Find all the categories associated with this section
        $.post("/sections/s",{selected : section }, function(data){
            if(data.categories.length > 0  &&  data.categories[0] !== null){
                $('#category-select'+idNumb).html(''); // Empty temp options
            }
            // Add the options to the drop down
            for(var i = 0; i < data.categories.length; i++){
                $('#category-select'+idNumb).append('<option>' + data.categories[i] + '</option>');
            }
            // Refresh all drop downs
            $(".selectpicker").selectpicker('refresh');
        });
        addToSelection(idNumb,"section",section); // Record change in the array of selections
    });

    // add category selector
    $("#col"+numberSections).append('<select data-width="190px" class="selectpicker select-compare" title="Category" id="category-select'+numberSections+'"></select>');
    $('#category-select'+numberSections).on('change', function(event){
        var category = $(this).find("option:selected").text();
        var idNumb = event.target.id.charAt(event.target.id.length-1);
        $('#description-select'+idNumb).html(''); // Empty temp options

        // Find all sub categories for the currently selected category
        $.post("/sections/sc",{section : selections[idNumb].section, category : category}, function(data){
            if(data.subCategories.length > 0  &&  data.subCategories[0] !== null){
                $('#subsection-select'+idNumb).html(''); // Empty temp options
                validOptions[idNumb] = true; // There are options for this row and sub category
            } else { //TODO could split into individual functions
                // Find all descriptions for the currently selected sub category
                $.post("/sections/desc",{category : selections[idNumb].category,section : selections[idNumb].section, subCategory : ""}, function(data){
                    if(data.descriptions.length > 0 &&  data.descriptions[0] !== null){
                        $('#description-select'+idNumb).html(''); // Empty temp options
                    } else {
                        return;
                    }
                    // Add sub section options
                    for(var i = 0; i < data.descriptions.length; i++){
                        $('#description-select'+idNumb).append('<option>' + data.descriptions[i] + '</option>');
                    }
                    $(".selectpicker").selectpicker('refresh');
                });
                return;
            }
            // Add sub section options
            for(var i = 0; i < data.subCategories.length; i++){
                $('#subsection-select'+idNumb).append('<option>' + data.subCategories[i] + '</option>');
            }
            $(".selectpicker").selectpicker('refresh');
        });
        addToSelection(idNumb,"category", category);
    });

    // add sub category selector
    $("#col"+numberSections).append('<select data-width="190px" class="selectpicker select-compare" title="Subsection" id="subsection-select'+numberSections+'"></select>');
    $('#subsection-select'+numberSections).on('change', function(event){
        var idNumb = event.target.id.charAt(event.target.id.length-1);
        var subCat = $(this).find("option:selected").text();

        // Find all descriptions for the currently selected sub category
        $.post("/sections/desc",{category : selections[idNumb].category,section : selections[idNumb].section, subCategory : subCat}, function(data){
            if(data.descriptions.length > 0 &&  data.descriptions[0] !== null){
                $('#description-select'+idNumb).html(''); // Empty temp options
            } else {
                return;
            }

            // Add sub section options
            for(var i = 0; i < data.descriptions.length; i++){
                $('#description-select'+idNumb).append('<option>' + data.descriptions[i] + '</option>');
            }
            $(".selectpicker").selectpicker('refresh');
        });
        addToSelection(idNumb,"subcategory", subCat);
    });

    // add description selector
    $("#col"+numberSections).append('<select data-width="190px" class="selectpicker select-compare" title="Description" id="description-select'+numberSections+'"></select>');
    $('#description-select'+numberSections).on('change', function(event){
        var idNumb = event.target.id.charAt(event.target.id.length-1);
        var data = $(this).find("option:selected").text();
        addToSelection(idNumb,"description", data);
    });
}

// Adds a section, category, sub category, or descriptions to a particular row in selections
function addToSelection(id, type, data){
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

// Object for holder the users selection
function Selection(a,b,c,d){
    this.aTable = a;
    this.bTable = b;
    this.cTable = c;
    this.dTable = d;
}

// Object for holder rows for each table
function DataTables(tableA,tableB,tableC,tableD){
    this.tableA = tableA;
    this.tableB = tableB;
    this.tableC = tableC;
    this.tableD = tableD;
}

// Holds the title for each table
function DataTableTitles(aTitle,bTitle,cTitle,dTitle,aUnit,bUnit,cUnit,dUnit){
    this.aTitle = aTitle;
    this.bTitle = bTitle;
    this.cTitle = cTitle;
    this.dTitle = dTitle;
    this.aUnit = aUnit;
    this.bUnit = bUnit;
    this.cUnit = cUnit;
    this.dUnit = dUnit;
}

// Set up rules for validating the CPI fields
function cpiValidationSetup(){
    $.validator.setDefaults({
            errorClass : 'help-block',
            highlight: function (element) {
                $(element).closest('.form-group').addClass('has-error')
            },
            unhighlight :function (element) {
                $(element).closest('.form-group').removeClass('has-error')
            }
        }
    );

    var cpiRules = {
        required : true,
        number : true,
        min : 0,
        max : 100
    };

    var messageSet = {
        required : "Please enter a percentage",
        number : "Please enter a valid number",
        min : "Please enter a percentage greater than 0",
        max : "Please enter a percentage less than 100"
    };

    $('#cpi-form').validate({
        rules : {
            Y2012 : cpiRules,
            Y2013 : cpiRules,
            Y2014 : cpiRules,
            Y2015 : cpiRules,
            Y2016 : cpiRules
        },
        messages : {
            Y2012 : messageSet,
            Y2013 : messageSet,
            Y2014 : messageSet,
            Y2015 : messageSet,
            Y2016 : messageSet
        }
    });
}




function applyCPI(units){
    if($('#cpi-form').valid()){
        if(noCPICells.length > 0){
            revertCPI(); // Reverts cpi before instead of saving values with cpi already applied
            copyOfDataTables = copyDataTables(dataTables); // Use the original data and create a copy of it
        }
        // CPI for 2012 - 2016
        var cpiValues = [{year : 2012, value : +$('#Y2012').val()},{year : 2013, value : +$('#Y2013').val()},{year : 2014, value : +$('#Y2014').val()},{year : 2015, value : +$('#Y2015').val()},{year : 2016, value : +$('#Y2016').val()}];


        if(aSelected && titles.aUnit.includes('$')){
            applyCPIToTable('#tableA',cpiValues);
            applyCPIToTableRows(copyOfDataTables.tableA, cpiValues);

            createBoxPlot(createDataForBoxPlot(copyOfDataTables.tableA), "#boxplotA-div", titles.aTitle, titles.aUnit);

            var table1Data = createDataForGroupedGraph(copyOfDataTables.tableA);
            createdGroupedBarGraph(table1Data.data, table1Data.keys,titles.aTitle,titles.aUnit,"#grouped-bar-a");
        }

        if(bSelected && titles.bUnit.includes('$')){
            applyCPIToTable('#tableB',cpiValues);
            applyCPIToTableRows(copyOfDataTables.tableB, cpiValues);
        }

        if(cSelected && titles.cUnit.includes('$')){
            applyCPIToTable('#tableC',cpiValues);
            applyCPIToTableRows(copyOfDataTables.tableC, cpiValues);
        }

        if(dSelected && titles.dUnit.includes('$')){
            applyCPIToTable('#tableD',cpiValues);
            applyCPIToTableRows(copyOfDataTables.tableD, cpiValues);
        }
    }
}


// Applies the CPI to rows of data
function applyCPIToTableRows(rows, cpiValues){
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

var noCPICells = []; // Hold the original cpi values

// Applies cpi values to the table with div id table
function applyCPIToTable(table, cpiValues){
    $('.cell', table).each(function(){ // Backup the values from the cells
        noCPICells.push({id : $(this).attr('id'), value : $(this).text()});
    });

    var minYear = Infinity;
    var maxYear = -Infinity;

    $('.cell', table).each(function(){ //cell or th
        var year = +$(this).attr("class").split(' ')[1];
        minYear = year < minYear ? year : minYear;
        maxYear = year > maxYear ? year : maxYear;
    });


    for(var cur = minYear; cur <=maxYear; cur++){ // Go through each possible year
        $('.cell', table).each(function(index){ // Grab every cell
            var year = +$(this).attr("class").split(' ')[1]; // Grab the year of the cell by checking the class

            var valueOfCell = $(this).text();

            for(var i = 0; i < cpiValues.length; i++){
                if(cpiValues[i].year === cur){
                    if(year <= cur){
                        valueOfCell = valueOfCell * (1 + (cpiValues[i].value / 100));
                    }
                }
            }
            $(this).text(valueOfCell); // CPI Applied value
        });
    }
    applyGradientCSS(noCPICells); // Highlights the cell based on the value compared to the max in the table
}

function revertCPI(){
    noCPICells.forEach(function(e){
        $('#'+e.id).text(e.value);
    });
    applyGradientCSS(noCPICells);
}

