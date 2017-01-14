var express = require('express');
var router = express.Router();

var pg = require('pg');

// Formats sql queries in a nice way
var squel = require("squel");


router.get('/', function(req, res, next) {

  // Connect to the database
  pg.connect(global.databaseURI, function(err, client, done) {
    done(); // closes the connection once result has been returned

    // Check whether the connection to the database was successful
    if(err){
      console.error('Could not connect to the database');
      console.error(err);
      return;
    }

    console.log('Connected to database');

    var queryString = "SELECT DISTINCT section FROM test_strata_energy;";

    //
    queryString = squel.select()
        .from("test_strata_energy")
        .field("section")
        .distinct()
        .toString()

    client.query(queryString, function(error, result){
      done();

      var sections = [];
      var categories = [];
      var subsections = [];


      if(error) {
        console.error('Failed to execute query');
        console.error(error);
        return;
      } else {

        for (row in result.rows){
          var section = result.rows[row].section;
          sections.push(section);
        }

        console.log(sections.length);

        res.render('index', {sections: JSON.stringify(sections)}); // Send the search results
        return;
      }
    })
  });

  //res.render('index', { title: 'Express' });
});


// TODO when user clicks a category query the subcategory

function categoriesForSection(section){
  queryString = squel.select()
      .from("test_strata_energy")
      .field("category")
      .where("section =" + section)
      .distinct()
      .toString()
}

module.exports = router;
