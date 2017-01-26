/**
 * Created by Nicky on 15/01/2017.
 */
var express = require('express');
var router = express.Router();
var pg = require('pg');

var squel = require("squel");

// finds all categories that match a section
router.post('/s', function(req, res, next) {

    //TODO escape req.body.selected
    var queryString = squel.select()
        .from("large_strata_energy")
        .field("category").distinct()
        .where("section = '"+req.body.selected+"'").toString();


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


// Finds all sub categories
router.post('/sc', function(req, res, next) {

    //TODO escape req.body.category
    //var queryString = "SELECT DISTINCT category FROM large_strata_energy WHERE section = '" + req.body.selected +  "AND category = '" + req.body.category + "';";

    var queryString = squel.select()
        .from("large_strata_energy")
        .field("sub_category").distinct()
        .where("category = '"+req.body.category+"'").toString();


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

            var subCategories = [];

            if (error) {
                console.error('Failed to execute query');
                console.error(error);
                return;
            } else {
                for (row in result.rows) {
                    var c = result.rows[row].sub_category;
                    subCategories.push(c);
                }
                res.send({subCategories: subCategories});
                return;
            }
        })
    });
});

router.get('/company', function(req, res) {

    //TODO escape req.body.selected
    //TODO maybe check if the company data exists for the section and category
    var queryString = squel.select()
        .from("large_strata_energy")
        .field("edb").distinct()
        .toString();

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

            var companies = [];

            if (error) {
                console.error('Failed to execute query');
                console.error(error);
                return;
            } else {
                for (row in result.rows) {
                    var c = result.rows[row].edb;
                    companies.push(c);
                }
                res.send({companies: companies});
                return;
            }
        })
    });
});


router.get('/sections', function(req, res) {

    //TODO escape req.body.selected
    //TODO maybe check if the company data exists for the section and category
    var queryString = squel.select()
        .from("large_strata_energy")
        .field("section").distinct()
        .toString();

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

            var sections = [];

            if (error) {
                console.error('Failed to execute query');
                console.error(error);
                return;
            } else {
                for (row in result.rows) {
                    var c = result.rows[row].section;
                    sections.push(c);
                }
                console.log("L " + sections.length);
                res.send({sections: sections});
                return;
            }
        })
    });
});

router.post('/search', function(req, res, next) {

    //TODO escape req.body.selected
    var queryString = squel.select()
        .from("large_strata_energy")
        .field("edb")
        .field("disc_yr")
        .field("description")
        .field("obs_yr")
        .field("fcast_yr")
        .field("units")
        .field("value");

    if(req.body.subCategory !== ''){
        queryString = queryString.where("section = '"+ req.body.section + "'")
            .where("category = '"+ req.body.category+ "'")
            .where("sub_category = '"+ req.body.subCategory+ "'").toString(); // Adds subcategory clause
    } else {
        queryString = queryString.where("section = '"+ req.body.section + "'")
            .where("category = '"+ req.body.category+ "'").toString();
    }

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

            var rowsSimplified = [];

            if (error) {
                console.error('Failed to execute query');
                console.error(error);
                return;
            } else {
                for (row in result.rows) {
                    console.log("Pushing " + row);
                    rowsSimplified.push(result.rows[row]);
                }
                console.log(rowsSimplified.length);
                res.send({rows : rowsSimplified});
                return;
            }
        })
    });
});



module.exports = router;
