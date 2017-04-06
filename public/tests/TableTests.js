var assert = chai.assert;

describe('Create Table Data Tests', function() {

  // Grab sections test
  it('Create table data one edb one year', function() {
      var table = new Table(null,null,null);

      var rows = [
        {edb : "bob", units : "u", obs_yr : 2010, disc_yr : 2010,section : "a", category : "s", sub_category : "s", description : "s", value : 100},
      ];
      var data = table.createTableData (rows);
      assert.equal(100, data[0].years[0].value);
  });

  it('Create table data one edb multiple years', function() {
    var table = new Table(null,null,null);

    var rows = [
      {edb : "bob", units : "u", obs_yr : 2010, disc_yr : 2010,section : "a", category : "s", sub_category : "s", description : "s", value : 100},
      {edb : "bob", units : "u",obs_yr : 2011, disc_yr : 2011,section : "a", category : "s", sub_category : "s", description : "s", value : 80},
      {edb : "bob", units : "u",obs_yr : 2012, disc_yr : 2012,section : "a", category : "s", sub_category : "s", description : "s", value : 120 },
    ];

    var data = table.createTableData (rows);
    assert.equal(100, data[0].years[0].value);
    assert.equal(80, data[0].years[1].value);
    assert.equal(120, data[0].years[2].value);
  });

  it('Create table data two edbs one year', function() {
    var table = new Table(null,null,null);

    var rows = [
      {edb : "bob", units : "u", obs_yr : 2010, disc_yr : 2010,section : "a", category : "s", sub_category : "s", description : "s", value : 100},
      {edb : "jim", units : "u",obs_yr : 2010, disc_yr : 2010,section : "a", category : "s", sub_category : "s", description : "s", value : 80},
    ];

    var data = table.createTableData (rows);
    assert.equal(100, data[0].years[0].value);
    assert.equal(80, data[1].years[0].value);
  });

  it('Create table data two edbs two years', function() {
    var table = new Table(null,null,null);

    // Rows years not sorted
    var rows = [
      {edb : "bob", units : "u",obs_yr : 2011, disc_yr : 2011,section : "a", category : "s", sub_category : "s", description : "s", value : 80},
      {edb : "bob", units : "u",obs_yr : 2012, disc_yr : 2012,section : "a", category : "s", sub_category : "s", description : "s", value : 90},
      {edb : "jim", units : "u", obs_yr : 2011, disc_yr : 2011,section : "a", category : "s", sub_category : "s", description : "s", value : 100},
      {edb : "jim", units : "u", obs_yr : 2012, disc_yr : 2012,section : "a", category : "s", sub_category : "s", description : "s", value : 110}
    ];

    var data = table.createTableData (rows);


    data.forEach(function(d){
      if(d.edb === 'bob'){
        assert.equal(80, d.years[0].value);
        assert.equal(90, d.years[1].value);
      } else if(d.edb === 'jim') {
        assert.equal(100, d.years[0].value);
        assert.equal(110, d.years[1].value);
      }
  });
  });


  it('Create table data multiple edbs multiple years unsorted', function() {
    var table = new Table(null,null,null);

    // Rows years not sorted
    var rows = [
      {edb : "gary", units : "u",obs_yr : 2012, disc_yr : 2012,section : "a", category : "s", sub_category : "s", description : "s", value : 130 },
      {edb : "bob", units : "u",obs_yr : 2012, disc_yr : 2012,section : "a", category : "s", sub_category : "s", description : "s", value : 80},
      {edb : "jim", units : "u", obs_yr : 2011, disc_yr : 2011,section : "a", category : "s", sub_category : "s", description : "s", value : 110},
      {edb : "bob", units : "u",obs_yr : 2011, disc_yr : 2011,section : "a", category : "s", sub_category : "s", description : "s", value : 90},
      {edb : "jim", units : "u", obs_yr : 2012, disc_yr : 2012,section : "a", category : "s", sub_category : "s", description : "s", value : 120},
      {edb : "gary", units : "u",obs_yr : 2011, disc_yr : 2011,section : "a", category : "s", sub_category : "s", description : "s", value : 140 },
    ];

    var data = table.createTableData (rows);


    data.forEach(function(d){
      if(d.edb === 'bob'){
        assert.equal(90, d.years[0].value);
        assert.equal(80, d.years[1].value);
      } else if(d.edb === 'jim') {
        assert.equal(110, d.years[0].value);
        assert.equal(120, d.years[1].value);
      } else if(d.edb === 'gary') {
        assert.equal(140, d.years[0].value);
        assert.equal(130, d.years[1].value);
      }
    });

  });

  it('Create table data one edb missing year', function() {
    var table = new Table(null,null,null);

    // Rows years not sorted
    var rows = [
      {edb : "bob", units : "u",obs_yr : 2011, disc_yr : 2011,section : "a", category : "s", sub_category : "s", description : "s", value : 80},
      {edb : "bob", units : "u", obs_yr : 2009, disc_yr : 2009,section : "a", category : "s", sub_category : "s", description : "s", value : 100},
      {edb : "bob", units : "u",obs_yr : 2012, disc_yr : 2012,section : "a", category : "s", sub_category : "s", description : "s", value : 120 },
    ];

    var data = table.createTableData (rows);
    console.log(data[0]);
    assert.equal(100, data[0].years[0].value);
    assert.equal(80, data[0].years[1].value);
    assert.equal(120, data[0].years[2].value);

    assert.equal(2009, data[0].years[0].year);
    assert.equal(2011, data[0].years[1].year);
    assert.equal(2012, data[0].years[2].year);
  });


  it('Create table data test years sorted', function() {
    var table = new Table(null,null,null);

    // Rows years not sorted
    var rows = [
      {edb : "bob", units : "u",obs_yr : 2011, disc_yr : 2011,section : "a", category : "s", sub_category : "s", description : "s", value : 80},
      {edb : "bob", units : "u", obs_yr : 2010, disc_yr : 2010,section : "a", category : "s", sub_category : "s", description : "s", value : 100},
      {edb : "bob", units : "u",obs_yr : 2012, disc_yr : 2012,section : "a", category : "s", sub_category : "s", description : "s", value : 120 },
    ];

    var data = table.createTableData (rows);

    assert.equal(100, data[0].years[0].value);
    assert.equal(80, data[0].years[1].value);
    assert.equal(120, data[0].years[2].value);
  });

});
