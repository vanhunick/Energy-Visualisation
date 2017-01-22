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

    // Create query to get all the distinct sections
    var queryString = squel.select().from("large_strata_energy").field("section").distinct().toString()

    client.query(queryString, function(error, result){
      done();

      if(error) {
        console.error('Failed to execute query');
        console.error(error);
        return;
      } else {
        var sections = [];

        for (row in result.rows){
          var section = result.rows[row].section;
          sections.push(section);
        }

        res.render('index', {sections: JSON.stringify(sections)}); // Send the search results and render index
        return;
      }
    })
  });
});

module.exports = router;
