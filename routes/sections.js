/**
 * Created by Nicky on 15/01/2017.
 */
var express = require('express');
var router = express.Router();
var pg = require('pg');

router.post('/', function(req, res, next) {

    //TODO escape req.body.selected
    var queryString = "SELECT DISTINCT category FROM test_strata_energy WHERE section = '" + req.body.selected + "';";

    // Connect to the database
    pg.connect(global.databaseURI, function (err, client, done) {
        done(); // closes the connection once result has been returned

        // Check whether the connection to the database was successful
        if (err) {
            console.error('Could not connect to the database');
            console.error(err);
            return;
        }

        client.query(queryString, function (error, result) {
            done();

            var categories = [];

            if (error) {
                console.error('Failed to execute query');
                console.error(error);
                return;
            } else {
                for (row in result.rows) {
                    var c = result.rows[row].category;
                    categories.push(c);
                }
                res.send({categories: categories});
                return;
            }
        })
    });
});

module.exports = router;
