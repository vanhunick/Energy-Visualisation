var assert = chai.assert;

var dp = new DataProcessor();

// Testing the Datagen get message array returns one with the right length
describe('Search param validation function tests', function() {
  it('Should return false if all selections empty', function() {
    validOptions =[false,false,false,false];

    var s1 = {id : "", section : "",category : "",subCategory : "",description : "", };
    var s2 = {id : "", section : "",category : "",subCategory : "",description : "", };
    var s3 = {id : "", section : "",category : "",subCategory : "",description : "", };
    var s4 = {id : "", section : "",category : "",subCategory : "",description : "", };
    var selections = [s1,s2,s3,s4];

    assert.isFalse(dp.validateSearchParams(selections,validOptions));
    assert.isFalse(dp.validateSearchParams(selections,validOptions));
  });

  it('Should return false if only partial row selection made', function() {
    validOptions =[false,false,false,false];

    var s1 = {id : 0, section : "something",category : "",subCategory : "",description : "", };
    var s2 = {id : 1, section : "",category : "",subCategory : "",description : "", };
    var s3 = {id : 2, section : "",category : "",subCategory : "",description : "", };
    var s4 = {id : 3, section : "",category : "",subCategory : "",description : "", };
    var selections = [s1,s2,s3,s4];

    assert.isFalse(dp.validateSearchParams(selections,validOptions));
  });

  it('Should return True if one full row selection made first row', function() {
    validOptions =[false,false,false,false];

    var s1 = {id : 0, section : "something",category : "s",subCategory : "s",description : "s", };
    var s2 = {id : 1, section : "",category : "",subCategory : "",description : "", };
    var s3 = {id : 2, section : "",category : "",subCategory : "",description : "", };
    var s4 = {id : 3, section : "",category : "",subCategory : "",description : "", };
    var selections = [s1,s2,s3,s4];

    assert.isTrue(dp.validateSearchParams(selections,validOptions));
  });

  it('Should return True if one full row selection made second row', function() {
    validOptions =[false,false,false,false];

    var s1 = {id : 0, section : "",category : "",subCategory : "",description : "", };
    var s2 = {id : 1, section : "s",category : "s",subCategory : "s",description : "s", };
    var s3 = {id : 2, section : "",category : "",subCategory : "",description : "", };
    var s4 = {id : 3, section : "",category : "",subCategory : "",description : "", };
    var selections = [s1,s2,s3,s4];

    assert.isTrue(dp.validateSearchParams(selections,validOptions));
  });

  it('Should return True if one full row selection made third row', function() {
    validOptions =[false,false,false,false];

    var s1 = {id : 0, section : "",category : "",subCategory : "",description : "", };
    var s2 = {id : 1, section : "",category : "",subCategory : "",description : "", };
    var s3 = {id : 2, section : "s",category : "s",subCategory : "s",description : "s", };
    var s4 = {id : 3, section : "",category : "",subCategory : "",description : "", };
    var selections = [s1,s2,s3,s4];

    assert.isTrue(dp.validateSearchParams(selections,validOptions));
  });

  it('Should return True if one full row selection made fourth row', function() {
    validOptions =[false,false,false,false];

    var s1 = {id : 0, section : "",category : "",subCategory : "",description : "", };
    var s2 = {id : 1, section : "",category : "",subCategory : "",description : "", };
    var s3 = {id : 2, section : "",category : "",subCategory : "",description : "", };
    var s4 = {id : 3, section : "s",category : "s",subCategory : "s",description : "s", };
    var selections = [s1,s2,s3,s4];

    assert.isTrue(dp.validateSearchParams(selections,validOptions));
  });

  it('Should return True if a mix of rows are fully selected', function() {
    validOptions =[false,false,false,false];

    var s1 = {id : 0, section : "s",category : "s",subCategory : "s",description : "s", };
    var s2 = {id : 1, section : "",category : "",subCategory : "",description : "", };
    var s3 = {id : 2, section : "",category : "",subCategory : "",description : "", };
    var s4 = {id : 3, section : "s",category : "s",subCategory : "s",description : "s", };
    var selections = [s1,s2,s3,s4];

    assert.isTrue(dp.validateSearchParams(selections,validOptions));
  });

  it('Should return True if a different mix of rows are fully selected', function() {
    validOptions =[false,false,false,false];

    var s1 = {id : 0, section : "",category : "",subCategory : "",description : "", };
    var s2 = {id : 1, section : "s",category : "s",subCategory : "",description : "s", };
    var s3 = {id : 2, section : "s",category : "s",subCategory : "",description : "s", };
    var s4 = {id : 3, section : "",category : "",subCategory : "s",description : "", };
    var selections = [s1,s2,s3,s4];

    assert.isTrue(dp.validateSearchParams(selections,validOptions));
  });

  it('Should return False if all rows except one fully selected', function() {
    validOptions =[false,false,false,false];

    var s1 = {id : 0, section : "s",category : "s",subCategory : "s",description : "s", };
    var s2 = {id : 1, section : "s",category : "s",subCategory : "s",description : "s", };
    var s3 = {id : 2, section : "s",category : "s",subCategory : "",description : "s", };
    var s4 = {id : 3, section : "s",category : "s",subCategory : "s",description : "", };
    var selections = [s1,s2,s3,s4];

    assert.isFalse(dp.validateSearchParams(selections,validOptions));
  });

  it('Should return False if a sub category exists but not selected for first row', function() {
    validOptions =[true,false,false,false];

    var s1 = {id : 0, section : "s",category : "s",subCategory : "",description : "s", };
    var s2 = {id : 1, section : "s",category : "s",subCategory : "s",description : "s", };
    var s3 = {id : 2, section : "s",category : "s",subCategory : "",description : "s", };
    var s4 = {id : 3, section : "s",category : "s",subCategory : "s",description : "s", };
    var selections = [s1,s2,s3,s4];

    assert.isFalse(dp.validateSearchParams(selections,validOptions));
  });

  it('Should return True if a sub category is not selected but not available for second row', function() {
    validOptions =[true,false,false,false];

    var s1 = {id : 0, section : "s",category : "s",subCategory : "s",description : "s", };
    var s2 = {id : 1, section : "s",category : "s",subCategory : "",description : "s", };
    var s3 = {id : 2, section : "s",category : "s",subCategory : "",description : "s", };
    var s4 = {id : 3, section : "s",category : "s",subCategory : "s",description : "s", };
    var selections = [s1,s2,s3,s4];

    assert.isTrue(dp.validateSearchParams(selections,validOptions));
  });
});



// Testing the Datagen get message array returns one with the right length
describe('Match database row function tests', function() {
  it('Selections equal, should return true', function() {
    var DBrow = {section : "s", category : "s", sub_category : "s", description : "s"};
    var row = {section : "s", category : "s", subCategory : "s", description : "s"};
    assert.isTrue(dp.matchDBRow(DBrow,row));
  });

  it('Selections not equal, should return false', function() {
    var DBrow = {section : "s", category : "s", sub_category : "s", description : "s"};
    var row =   {section : "s", category : "", subCategory : "s", description : "s"};
    assert.isFalse(dp.matchDBRow(DBrow,row));
  });

  it('Should handle a null sub category, should return false as row does have sub category', function() {
    var DBrow = {section : "s", category : "s", sub_category : null, description : "s"};
    var row =   {section : "s", category : "s", subCategory : "s", description : "s"};
    assert.isFalse(dp.matchDBRow(DBrow,row));
  });

  it('Should handle a null sub category, should return true as row does not have sub category', function() {
    var DBrow = {section : "s", category : "s", sub_category : null, description : "s"};
    var row =   {section : "s", category : "s", subCategory : "", description : "s"};
    assert.isTrue(dp.matchDBRow(DBrow,row));
  });

  it('Should be true all selected but different values section', function() {
    var DBrow = {section : "ssss", category : "s", sub_category : "s", description : "s"};
    var row =   {section : "s", category : "s", subCategory : "s", description : "s"};
    assert.isFalse(dp.matchDBRow(DBrow,row));
  });

  it('Should be true all selected but different values category', function() {
    var DBrow = {section : "s", category : "sssss", sub_category : "s", description : "s"};
    var row =   {section : "s", category : "s", subCategory : "s", description : "s"};
    assert.isFalse(dp.matchDBRow(DBrow,row));
  });

  it('Should be true all selected but different values sub_category', function() {
    var DBrow = {section : "s", category : "s", sub_category : "sssss", description : "s"};
    var row =   {section : "s", category : "s", subCategory : "s", description : "s"};
    assert.isFalse(dp.matchDBRow(DBrow,row));
  });

  it('Should be true all selected but different values description', function() {
    var DBrow = {section : "s", category : "s", sub_category : "sssss", description : "s"};
    var row =   {section : "s", category : "s", subCategory : "s", description : "s"};
    assert.isFalse(dp.matchDBRow(DBrow,row));
  });
});

// Testing the Datagen get message array returns one with the right length
describe('Filter rows to table function tests', function() {


  it('All rows selected all tables should have two rows', function() {
    var search = {
      aTable : {id : 0, section : "a", category : "s", subCategory : "s", description : "s"},
      bTable : {id : 1, section : "b", category : "s", subCategory : "s", description : "s"},
      cTable : {id : 2, section : "c", category : "s", subCategory : "s", description : "s"},
      dTable : {id : 3, section : "d", category : "s", subCategory : "s", description : "s"}
    };

    var rows = [
      {section : "a", category : "s", sub_category : "s", description : "s"},
      {section : "a", category : "s", sub_category : "s", description : "s"},
      {section : "b", category : "s", sub_category : "s", description : "s"},
      {section : "b", category : "s", sub_category : "s", description : "s"},
      {section : "c", category : "s", sub_category : "s", description : "s"},
      {section : "c", category : "s", sub_category : "s", description : "s"},
      {section : "d", category : "s", sub_category : "s", description : "s"},
      {section : "d", category : "s", sub_category : "s", description : "s"}
    ]

    var tablesData = dp.filterRowsToTables(rows,search);

    assert.isTrue(tablesData.tableA.length === 2);
    assert.isTrue(tablesData.tableB.length === 2);
    assert.isTrue(tablesData.tableC.length === 2);
    assert.isTrue(tablesData.tableD.length === 2);
  });

  it('Test different number of rows per sections', function() {
    var search = {
      aTable : {id : 0, section : "a", category : "s", subCategory : "s", description : "s"},
      bTable : {id : 1, section : "b", category : "s", subCategory : "s", description : "s"},
      cTable : {id : 2, section : "c", category : "s", subCategory : "s", description : "s"},
      dTable : {id : 3, section : "d", category : "s", subCategory : "s", description : "s"}
    };

    var rows = [
      {section : "a", category : "s", sub_category : "s", description : "s"},
      {section : "b", category : "s", sub_category : "s", description : "s"},
      {section : "b", category : "s", sub_category : "s", description : "s"},
      {section : "c", category : "s", sub_category : "s", description : "s"},
      {section : "d", category : "s", sub_category : "s", description : "s"},
      {section : "d", category : "s", sub_category : "s", description : "s"}
    ]

    var tablesData = dp.filterRowsToTables(rows,search);

    assert.isTrue(tablesData.tableA.length === 1);
    assert.isTrue(tablesData.tableB.length === 2);
    assert.isTrue(tablesData.tableC.length === 1);
    assert.isTrue(tablesData.tableD.length === 2);
  });

  it('Test one row empty', function() {
    var search = {
      aTable : {id : 0, section : "", category : "", subCategory : "", description : ""},
      bTable : {id : 1, section : "b", category : "s", subCategory : "s", description : "s"},
      cTable : {id : 2, section : "c", category : "s", subCategory : "s", description : "s"},
      dTable : {id : 3, section : "d", category : "s", subCategory : "s", description : "s"}
    };

    var rows = [
      {section : "b", category : "s", sub_category : "s", description : "s"},
      {section : "b", category : "s", sub_category : "s", description : "s"},
      {section : "c", category : "s", sub_category : "s", description : "s"},
      {section : "d", category : "s", sub_category : "s", description : "s"},
      {section : "d", category : "s", sub_category : "s", description : "s"}
    ]

    var tablesData = dp.filterRowsToTables(rows,search);

    assert.isTrue(tablesData.tableA.length === 0);
    assert.isTrue(tablesData.tableB.length === 2);
    assert.isTrue(tablesData.tableC.length === 1);
    assert.isTrue(tablesData.tableD.length === 2);
  });

  it('Should create Table AB rows', function() {
    var search = {
      aTable : {id : 0, section : "a", category : "s", subCategory : "s", description : "s"},
      bTable : {id : 1, section : "b", category : "s", subCategory : "s", description : "s"},
      cTable : {id : 2, section : "c", category : "s", subCategory : "s", description : "s"},
      dTable : {id : 3, section : "d", category : "s", subCategory : "s", description : "s"}
    };

    var rows = [
      {section : "a", category : "s", sub_category : "s", description : "s"},
      {section : "a", category : "s", sub_category : "s", description : "s"},
      {section : "b", category : "s", sub_category : "s", description : "s"},
      {section : "b", category : "s", sub_category : "s", description : "s"},
      {section : "c", category : "s", sub_category : "s", description : "s"},
      {section : "d", category : "s", sub_category : "s", description : "s"},
      {section : "d", category : "s", sub_category : "s", description : "s"}
    ]

    var tablesData = dp.filterRowsToTables(rows,search);

    assert.isTrue(tablesData.tableAB.length === 2);
  });

  it('Should create Table CD rows', function() {
    var search = {
      aTable : {id : 0, section : "a", category : "s", subCategory : "s", description : "s"},
      bTable : {id : 1, section : "b", category : "s", subCategory : "s", description : "s"},
      cTable : {id : 2, section : "c", category : "s", subCategory : "s", description : "s"},
      dTable : {id : 3, section : "d", category : "s", subCategory : "s", description : "s"}
    };

    var rows = [
      {section : "c", category : "s", sub_category : "s", description : "s"},
      {section : "c", category : "s", sub_category : "s", description : "s"},
      {section : "d", category : "s", sub_category : "s", description : "s"},
      {section : "d", category : "s", sub_category : "s", description : "s"}
    ]

    var tablesData = dp.filterRowsToTables(rows,search);

    assert.isTrue(tablesData.tableCD.length === 2);
  });

  it('Should create Table AB and CD rows', function() {
      var search = {
        aTable : {id : 0, section : "a", category : "s", subCategory : "s", description : "s"},
        bTable : {id : 1, section : "b", category : "s", subCategory : "s", description : "s"},
        cTable : {id : 2, section : "c", category : "s", subCategory : "s", description : "s"},
        dTable : {id : 3, section : "d", category : "s", subCategory : "s", description : "s"}
      };

      var rows = [
        {section : "a", category : "s", sub_category : "s", description : "s"},
        {section : "a", category : "s", sub_category : "s", description : "s"},
        {section : "b", category : "s", sub_category : "s", description : "s"},
        {section : "b", category : "s", sub_category : "s", description : "s"},
        {section : "c", category : "s", sub_category : "s", description : "s"},
        {section : "c", category : "s", sub_category : "s", description : "s"},
        {section : "d", category : "s", sub_category : "s", description : "s"},
        {section : "d", category : "s", sub_category : "s", description : "s"}
      ]

      var tablesData = dp.filterRowsToTables(rows,search);

      assert.isTrue(tablesData.tableAB.length === 2);
      assert.isTrue(tablesData.tableCD.length === 2);
    });

  it('Any null values should be changed to 0', function() {
    var search = {
      aTable : {id : 0, section : "a", category : "s", subCategory : "s", description : "s"},
      bTable : {id : 1, section : "b", category : "s", subCategory : "s", description : "s"},
      cTable : {id : 2, section : "c", category : "s", subCategory : "s", description : "s"},
      dTable : {id : 3, section : "d", category : "s", subCategory : "s", description : "s"}
    };

    var rows = [
      {section : "a", category : "s", sub_category : "s", description : "s", value : null},
      {section : "a", category : "s", sub_category : "s", description : "s", value : null },
      {section : "b", category : "s", sub_category : "s", description : "s", value : null},
      {section : "b", category : "s", sub_category : "s", description : "s", value : null},
      {section : "c", category : "s", sub_category : "s", description : "s", value : null},
      {section : "c", category : "s", sub_category : "s", description : "s", value : null},
      {section : "d", category : "s", sub_category : "s", description : "s", value : null},
      {section : "d", category : "s", sub_category : "s", description : "s", value : null}
    ];

    var tablesData = dp.filterRowsToTables(rows,search);

    assert.isTrue(tablesData.tableA[0].value === 0);
    assert.isTrue(tablesData.tableB[0].value === 0);
  });


  it('Any  not null values should not change changed to 0', function() {
    var search = {
      aTable : {id : 0, section : "a", category : "s", subCategory : "s", description : "s"},
      bTable : {id : 1, section : "b", category : "s", subCategory : "s", description : "s"},
      cTable : {id : 2, section : "c", category : "s", subCategory : "s", description : "s"},
      dTable : {id : 3, section : "d", category : "s", subCategory : "s", description : "s"}
    };

    var rows = [
      {section : "a", category : "s", sub_category : "s", description : "s", value : null},
      {section : "a", category : "s", sub_category : "s", description : "s", value : null },
      {section : "b", category : "s", sub_category : "s", description : "s", value : 10},
      {section : "b", category : "s", sub_category : "s", description : "s", value : null},
      {section : "c", category : "s", sub_category : "s", description : "s", value : 10},
      {section : "c", category : "s", sub_category : "s", description : "s", value : null},
      {section : "d", category : "s", sub_category : "s", description : "s", value : null},
      {section : "d", category : "s", sub_category : "s", description : "s", value : null}
    ];

    var tablesData = dp.filterRowsToTables(rows,search);

    assert.isTrue(tablesData.tableB[0].value === 10);
    assert.isTrue(tablesData.tableC[0].value === 10);
    assert.isTrue(tablesData.tableA[0].value === 0);
  });

});



// 
describe('Copy of table data function tests', function() {
  it('Length of copy should all one', function () {

    var search = {
      aTable: {id: 0, section: "i0", category: "a0", subCategory: "j0", description: "b0"},
      bTable: {id: 1, section: "i1", category: "a1", subCategory: "j1", description: "b1"},
      cTable: {id: 2, section: "i2", category: "a2", subCategory: "j2", description: "b2"},
      dTable: {id: 3, section: "i3", category: "a3", subCategory: "j3", description: "b3"}
    };
    var rows = [];
    for (var i = 0; i < 4; i++) {
      rows.push(
          {
            category: "a" + i, description: "b" + i, disc_yr: 1 + i, edb: "c" + i,
            fcast_yr: 10 + i, network: "d" + i, note: "e" + i, obs_yr: "f" + i, p_key: 20 + i, sch_ref: "g" + i,
            schedule: "h" + i, section: "i" + i, sub_category: "j" + i, units: "h" + i, value: 30 + i
          }
      );
    }

    var tablesData = dp.filterRowsToTables(rows, search);

    var copyOfDataTables = dp.copyOfDataTables(tablesData);

    assert.isTrue(copyOfDataTables.tableA.length === 1);
    assert.isTrue(copyOfDataTables.tableB.length === 1);
    assert.isTrue(copyOfDataTables.tableC.length === 1);
    assert.isTrue(copyOfDataTables.tableD.length === 1);
  });

  it('Values should be 30 plus the table id', function () {

    var search = {
      aTable: {id: 0, section: "i0", category: "a0", subCategory: "j0", description: "b0"},
      bTable: {id: 1, section: "i1", category: "a1", subCategory: "j1", description: "b1"},
      cTable: {id: 2, section: "i2", category: "a2", subCategory: "j2", description: "b2"},
      dTable: {id: 3, section: "i3", category: "a3", subCategory: "j3", description: "b3"}
    };
    var rows = [];
    for (var i = 0; i < 4; i++) {
      rows.push(
          {
            category: "a" + i, description: "b" + i, disc_yr: 1 + i, edb: "c" + i,
            fcast_yr: 10 + i, network: "d" + i, note: "e" + i, obs_yr: "f" + i, p_key: 20 + i, sch_ref: "g" + i,
            schedule: "h" + i, section: "i" + i, sub_category: "j" + i, units: "h" + i, value: 30 + i
          }
      );
    }

    var tablesData = dp.filterRowsToTables(rows, search);

    var copyOfDataTables = dp.copyOfDataTables(tablesData);

    assert.isTrue(copyOfDataTables.tableA[0].value === 30);
    assert.isTrue(copyOfDataTables.tableB[0].value === 31);
    assert.isTrue(copyOfDataTables.tableC[0].value === 32);
    assert.isTrue(copyOfDataTables.tableD[0].value === 33);
  });

  it('Values should still be the same after modifying original', function () {

    var search = {
      aTable: {id: 0, section: "i0", category: "a0", subCategory: "j0", description: "b0"},
      bTable: {id: 1, section: "i1", category: "a1", subCategory: "j1", description: "b1"},
      cTable: {id: 2, section: "i2", category: "a2", subCategory: "j2", description: "b2"},
      dTable: {id: 3, section: "i3", category: "a3", subCategory: "j3", description: "b3"}
    };
    var rows = [];
    for (var i = 0; i < 4; i++) {
      rows.push(
          {
            category: "a" + i, description: "b" + i, disc_yr: 1 + i, edb: "c" + i,
            fcast_yr: 10 + i, network: "d" + i, note: "e" + i, obs_yr: "f" + i, p_key: 20 + i, sch_ref: "g" + i,
            schedule: "h" + i, section: "i" + i, sub_category: "j" + i, units: "h" + i, value: 30 + i
          }
      );
    }

    var tablesData = dp.filterRowsToTables(rows, search);

    var copyOfDataTables = dp.copyOfDataTables(tablesData);

    tablesData.tableA[0].value = 0;
    tablesData.tableB[0].value = 0;
    tablesData.tableC[0].value = 0;
    tablesData.tableD[0].value = 0;

    assert.isTrue(copyOfDataTables.tableA[0].value === 30);
    assert.isTrue(copyOfDataTables.tableB[0].value === 31);
    assert.isTrue(copyOfDataTables.tableC[0].value === 32);
    assert.isTrue(copyOfDataTables.tableD[0].value === 33);
  });


  it('Values should be the same as original', function () {

    var search = {
      aTable: {id: 0, section: "i0", category: "a0", subCategory: "j0", description: "b0"},
      bTable: {id: 1, section: "i1", category: "a1", subCategory: "j1", description: "b1"},
      cTable: {id: 2, section: "i2", category: "a2", subCategory: "j2", description: "b2"},
      dTable: {id: 3, section: "i3", category: "a3", subCategory: "j3", description: "b3"}
    };
    var rows = [];
    for (var i = 0; i < 4; i++) {
      rows.push(
          {
            category: "a" + i, description: "b" + i, disc_yr: 1 + i, edb: "c" + i,
            fcast_yr: 10 + i, network: "d" + i, note: "e" + i, obs_yr: "f" + i, p_key: 20 + i, sch_ref: "g" + i,
            schedule: "h" + i, section: "i" + i, sub_category: "j" + i, units: "h" + i, value: 30 + i
          }
      );
    }

    var tablesData = dp.filterRowsToTables(rows, search);

    var copyOfDataTables = dp.copyOfDataTables(tablesData);

    assert.isTrue(copyOfDataTables.tableA[0].category === "a0");
    assert.isTrue(copyOfDataTables.tableB[0].category === "a1");
    assert.isTrue(copyOfDataTables.tableC[0].category === "a2");
    assert.isTrue(copyOfDataTables.tableD[0].category === "a3");

    assert.isTrue(copyOfDataTables.tableA[0].description === "b0");
    assert.isTrue(copyOfDataTables.tableB[0].description === "b1");
    assert.isTrue(copyOfDataTables.tableC[0].description === "b2");
    assert.isTrue(copyOfDataTables.tableD[0].description === "b3");

    assert.isTrue(copyOfDataTables.tableA[0].disc_yr === 1);
    assert.isTrue(copyOfDataTables.tableB[0].disc_yr === 2);
    assert.isTrue(copyOfDataTables.tableC[0].disc_yr === 3);
    assert.isTrue(copyOfDataTables.tableD[0].disc_yr === 4);

    assert.isTrue(copyOfDataTables.tableA[0].edb === "c0");
    assert.isTrue(copyOfDataTables.tableB[0].edb === "c1");
    assert.isTrue(copyOfDataTables.tableC[0].edb === "c2");
    assert.isTrue(copyOfDataTables.tableD[0].edb === "c3");

    assert.isTrue(copyOfDataTables.tableA[0].fcast_yr === 10);
    assert.isTrue(copyOfDataTables.tableB[0].fcast_yr === 11);
    assert.isTrue(copyOfDataTables.tableC[0].fcast_yr === 12);
    assert.isTrue(copyOfDataTables.tableD[0].fcast_yr === 13);

    assert.isTrue(copyOfDataTables.tableA[0].network === "d0");
    assert.isTrue(copyOfDataTables.tableB[0].network === "d1");
    assert.isTrue(copyOfDataTables.tableC[0].network === "d2");
    assert.isTrue(copyOfDataTables.tableD[0].network === "d3");

    assert.isTrue(copyOfDataTables.tableA[0].value === 30);
    assert.isTrue(copyOfDataTables.tableB[0].value === 31);
  });
});

function getTestRowsForCombineTableTests(){
  return {t1 :[
    {edb : "bob", units : "u", obs_yr : 2010,disc_yr : 2010,section : "a", category : "s", sub_category : "s", description : "s", value : 100},
    {edb : "bob", units : "u",obs_yr : 2011,disc_yr : 2011,section : "a", category : "s", sub_category : "s", description : "s", value : 80 },
    {edb : "bob", units : "u",obs_yr : 2012,disc_yr : 2012,section : "a", category : "s", sub_category : "s", description : "s", value : 40},
    {edb : "bob", units : "u",obs_yr : 2013,disc_yr : 2013,section : "a", category : "s", sub_category : "s", description : "s", value : 20},
  ] , t2 :[
    {edb : "bob", units : "v",obs_yr : 2010,disc_yr : 2010,section : "a", category : "s", sub_category : "s", description : "s", value : 10},
    {edb : "bob", units : "v",obs_yr : 2011,disc_yr : 2011,section : "a", category : "s", sub_category : "s", description : "s", value : 10},
    {edb : "bob", units : "v",obs_yr : 2012,disc_yr : 2012,section : "a", category : "s", sub_category : "s", description : "s", value : 10},
    {edb : "bob", units : "v",obs_yr : 2013,disc_yr : 2013,section : "a", category : "s", sub_category : "s", description : "s", value : 10},
  ] };
}
describe('Combine Tables tests', function() {
  it('Length should be the same as the individual table', function () {

    var testRows = getTestRowsForCombineTableTests();
    var combined = dp.combineTables(testRows.t1,testRows.t2);

    assert.isTrue(combined.length === testRows.t1.length);
  });

  it('The value of each row should be the first table divided by the second', function () {

    var testRows = getTestRowsForCombineTableTests();
    var combined = dp.combineTables(testRows.t1,testRows.t2);

    assert.isTrue(combined[0].value === 10);
    assert.isTrue(combined[1].value === 8);
    assert.isTrue(combined[2].value === 4);
    assert.isTrue(combined[3].value === 2);
  });

  it('The combined row should have "u" for unit a', function () {

    var testRows = getTestRowsForCombineTableTests();
    var combined = dp.combineTables(testRows.t1,testRows.t2);

    assert.isTrue(combined[0].unitA === "u");
    assert.isTrue(combined[1].unitA === "u");
    assert.isTrue(combined[2].unitA === "u");
    assert.isTrue(combined[3].unitA === "u");
  });

  it('The combined row should have "v" for unit b', function () {

    var testRows = getTestRowsForCombineTableTests();
    var combined = dp.combineTables(testRows.t1,testRows.t2);

    assert.isTrue(combined[0].unitB === "v");
    assert.isTrue(combined[1].unitB === "v");
    assert.isTrue(combined[2].unitB === "v");
    assert.isTrue(combined[3].unitB === "v");
  });

  it('The combined row should have "u / v" for combined unit', function () {

    var testRows = getTestRowsForCombineTableTests();
    var combined = dp.combineTables(testRows.t1,testRows.t2);

    assert.isTrue(combined[0].unit === "u / v");
    assert.isTrue(combined[1].unit === "u / v");
    assert.isTrue(combined[2].unit === "u / v");
    assert.isTrue(combined[3].unit === "u / v");
  });


  it('The values should be the same for the years after combining', function () {

    var testRows = getTestRowsForCombineTableTests();
    var combined = dp.combineTables(testRows.t1,testRows.t2);

    combined.forEach(function (row) {
      if(row.obs_yr === 2010){
        assert.isTrue(row.value === 10);
      }
      if(row.obs_yr === 2011){
        assert.isTrue(row.value === 8);
      }
      if(row.obs_yr === 2012){
        assert.isTrue(row.value === 4);
      }
      if(row.obs_yr === 2013){
        assert.isTrue(row.value === 2);
      }
    })
  });


  it('Should handle 0 values by changing to 1 and doing division', function () {

    var testRows = getTestRowsForCombineTableTests();
    testRows.t2[0].value = 0;
    var combined = dp.combineTables(testRows.t1,testRows.t2);


    combined.forEach(function (row) {
      if(row.obs_yr === 2010){
        assert.isTrue(row.value === 100); // 100 because divided by 1
      }
      if(row.obs_yr === 2011){
        assert.isTrue(row.value === 8);
      }
      if(row.obs_yr === 2012){
        assert.isTrue(row.value === 4);
      }
      if(row.obs_yr === 2013){
        assert.isTrue(row.value === 2);
      }
    });
  });
});

describe('Testing function that applied cpi to all table rows', function() {
  it('Test one years worth of cpi applied', function () {
    var cpiValues = [ {year : 2012, value : 1},{year : 2013, value : 5},{year : 2013, value : 10},{year : 2014, value : 25}];

    var rows = [
      {disc_yr : 2014, obs_yr : 2014, value : 100}
    ];

    dp.applyCPIToTableRows(rows,cpiValues);
    assert.isTrue(rows[0].value === 125);
  });

  it('Test last year not affected by cpi value stays the same', function () {
    var cpiValues = [ {year : 2012, value : 1},{year : 2013, value : 5},{year : 2013, value : 10},{year : 2014, value : 25}];

    var rows = [
      {disc_yr : 2016, obs_yr : 2016, value : 100},
    ];

    dp.applyCPIToTableRows(rows,cpiValues);

    assert.isTrue(rows[0].value === 100);
  });

  it('Test cpi is compounded over two year', function () {
    var cpiValues = [ {year : 2011, value : 1},{year : 2012, value : 5},{year : 2013, value : 10},{year : 2014, value : 25}];

    var rows = [
      {disc_yr : 2013, obs_yr : 2013, value : 100}
    ];

    dp.applyCPIToTableRows(rows,cpiValues);
    assert.equal(rows[0].value.toFixed(2), "137.50");
  });


  it('Test cpi is compounded over three year', function () {
    var cpiValues = [ {year : 2011, value : 1},{year : 2012, value : 5},{year : 2013, value : 10},{year : 2014, value : 25}];

    var rows = [
      {disc_yr : 2012, obs_yr : 2012, value : 100}
    ];

    dp.applyCPIToTableRows(rows,cpiValues);
    assert.equal(rows[0].value.toFixed(3), "144.375");
  });

  it('Test different years compounded differently', function () {
    var cpiValues = [ {year : 2011, value : 1},{year : 2012, value : 5},{year : 2013, value : 10},{year : 2014, value : 25}];

    var rows = [
      {disc_yr : 2012, obs_yr : 2012, value : 100},
      {disc_yr : 2013, obs_yr : 2013, value : 100}
    ];

    dp.applyCPIToTableRows(rows,cpiValues);
    assert.equal(rows[0].value.toFixed(3), "144.375");
    assert.equal(rows[1].value.toFixed(2), "137.50");
  });

  it('Test different years compounded differently out of order', function () {
    var cpiValues = [ {year : 2011, value : 1},{year : 2012, value : 5},{year : 2013, value : 10},{year : 2014, value : 25}];

    var rows = [
      {disc_yr : 2013, obs_yr : 2013, value : 100},
      {disc_yr : 2012, obs_yr : 2012, value : 100}
    ];

    dp.applyCPIToTableRows(rows,cpiValues);
    assert.equal(rows[1].value.toFixed(3), "144.375");
    assert.equal(rows[0].value.toFixed(2), "137.50");
  });
});

describe('Testing creating data for grouped bar graphs', function() {
  it('Simple test to check both EDBs exist in data', function () {
    var rows = [
      {edb : "a", disc_yr : 2012, obs_yr : 2012, value : 100},
      {edb : "b", disc_yr : 2012, obs_yr : 2012, value : 100},
      {edb : "a", disc_yr : 2013, obs_yr : 2013, value : 200},
      {edb : "b", disc_yr : 2013, obs_yr : 2013, value : 200}
    ];

    var barData = dp.createDataForGroupedGraph(rows);
    console.log(barData)

    var containsA = false;
    var containsB = false;

    barData.data.forEach(function(d){
      if(d.edb === "a"){
        containsA = true;
      }

      if(d.edb === "b"){
        containsB = true;
      }
    });

    assert.isTrue(containsA);
    assert.isTrue(containsB);
  });

  it('Simple test to keys contain all years and no duplicates', function () {
    var rows = [
      {edb : "a", disc_yr : 2012, obs_yr : 2012, value : 100},
      {edb : "b", disc_yr : 2012, obs_yr : 2012, value : 100},
      {edb : "a", disc_yr : 2013, obs_yr : 2013, value : 200},
      {edb : "b", disc_yr : 2013, obs_yr : 2013, value : 200}
    ];

    var barData = dp.createDataForGroupedGraph(rows);

    assert.equal(barData.keys[0],2012);
    assert.equal(barData.keys[1],2013);
    assert.equal(barData.keys.length, 2);
  });


  it('Checks values for EDBs', function () {
    var rows = [
      {edb : "a", disc_yr : 2012, obs_yr : 2012, value : 100},
      {edb : "b", disc_yr : 2012, obs_yr : 2012, value : 200},
      {edb : "a", disc_yr : 2013, obs_yr : 2013, value : 300},
      {edb : "b", disc_yr : 2013, obs_yr : 2013, value : 400}
    ];

    var barData = dp.createDataForGroupedGraph(rows);

    barData.data.forEach(function(d){
      if(d.edb === "a"){
        assert.equal(d["2012"],100);
        assert.equal(d["2013"],300);
      }

      if(d.edb === "b"){
        assert.equal(d["2012"],200);
        assert.equal(d["2013"],400);
      }
    });
  });

  it('Checks keys are ordered', function () {
    var rows = [
      {edb : "a", disc_yr : 2013, obs_yr : 2013, value : 300},
      {edb : "b", disc_yr : 2013, obs_yr : 2013, value : 400},
      {edb : "a", disc_yr : 2012, obs_yr : 2012, value : 100},
      {edb : "b", disc_yr : 2012, obs_yr : 2012, value : 200}
    ];

    var barData = dp.createDataForGroupedGraph(rows);

    // First entry should be 2012
    assert.equal(barData.keys[0], 2012);
    assert.equal(barData.keys[1], 2013);
  });

  it('Test edge case one edb', function () {
    var rows = [
      {edb : "a", disc_yr : 2013, obs_yr : 2013, value : 300},
      {edb : "a", disc_yr : 2012, obs_yr : 2012, value : 100},
    ];

    var barData = dp.createDataForGroupedGraph(rows);

    assert.equal(barData.data[0]["2012"], 100);
    assert.equal(barData.data[0]["2013"], 300);

    assert.equal(barData.keys[0], 2012);
    assert.equal(barData.keys[1], 2013);
    assert.equal(barData.keys.length, 2);
  });

  it('Test many edbs one year', function () {
    var rows = [
      {edb : "a", disc_yr : 2013, obs_yr : 2012, value : 100},
      {edb : "b", disc_yr : 2012, obs_yr : 2012, value : 100},
      {edb : "c", disc_yr : 2012, obs_yr : 2012, value : 100},
      {edb : "d", disc_yr : 2012, obs_yr : 2012, value : 100},
      {edb : "e", disc_yr : 2012, obs_yr : 2012, value : 100},
    ];

    var barData = dp.createDataForGroupedGraph(rows);

    assert.equal(barData.data.length, 5);
    assert.equal(barData.keys.length, 1);
  });
});

describe('Testing creating data for box plots', function() {
  it('Test min and max positive', function () {
    var rows = [
      {edb : "a", disc_yr : 2013, obs_yr : 2013, value : 300},
      {edb : "b", disc_yr : 2013, obs_yr : 2013, value : 400},
      {edb : "a", disc_yr : 2012, obs_yr : 2012, value : 100},
      {edb : "b", disc_yr : 2012, obs_yr : 2012, value : 200}
    ];

    var boxPlotData = dp.createDataForBoxPlot(rows);

    assert.equal(boxPlotData.min, 100);
    assert.equal(boxPlotData.max, 400);
  });

  it('Test negative max and min', function () {
    var rows = [
      {edb : "a", disc_yr : 2013, obs_yr : 2013, value : -300},
      {edb : "b", disc_yr : 2013, obs_yr : 2013, value : -400},
      {edb : "a", disc_yr : 2012, obs_yr : 2012, value : -100},
      {edb : "b", disc_yr : 2012, obs_yr : 2012, value : -200}
    ];

    var boxPlotData = dp.createDataForBoxPlot(rows);
    console.log(boxPlotData);

    assert.equal(boxPlotData.min, -400);
    assert.equal(boxPlotData.max, -100);
  });


  it('Test data contains multiple EDBs', function () {
    var rows = [
      {edb : "a", disc_yr : 2013, obs_yr : 2013, value : -300},
      {edb : "b", disc_yr : 2013, obs_yr : 2013, value : -400},
      {edb : "c", disc_yr : 2012, obs_yr : 2012, value : -100},
      {edb : "d", disc_yr : 2012, obs_yr : 2012, value : -200}
    ];

    var boxPlotData = dp.createDataForBoxPlot(rows);
    console.log(boxPlotData);

    var containsA = false, containsB = false, containsC = false, containsD = false;

    boxPlotData.scatterData.forEach(function(d){
      if(d.edb === "a"){
        containsA =true;
      }
      if(d.edb === "b"){
        containsB =true;
      }
      if(d.edb === "c"){
        containsC =true;
      }
      if(d.edb === "d"){
        containsD =true;
      }
    });

    assert.isTrue(containsA);
    assert.isTrue(containsB);
    assert.isTrue(containsC);
    assert.isTrue(containsD);
  });
});

describe('Testing creating data for vector Graph', function() {
  it('Test min and max positive', function () {

  });
});



