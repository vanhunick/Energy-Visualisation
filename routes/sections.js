var express = require('express');
var router = express.Router();
var pg = require('pg');
var squel = require("squel");
var SQLProtection = require("./SQLProtection");

// finds all categories that match a section
router.post('/s', function(req, res, next) {

    // Check that the section exists in the database before putting it in a query
    if(!SQLProtection.validSection(req.body.selected)){
        res.send({categories: []});
        return;
    }

    // Construct the query
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
    if(!SQLProtection.validCategory(req.body.category)){
        res.send({subCategories: []});
        return;
    }

    if(!SQLProtection.validSection(req.body.section)){
        res.send({subCategories: []});
        return;
    }

    var queryString = squel.select()
        .from("large_strata_energy")
        .field("sub_category").distinct()
        .where("section = '"+req.body.section+"'");

    if(req.body.category !== ""){
        queryString = queryString.where("category = '"+req.body.category+"'");
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

        client.query(queryString.toString(), function (error, result) {
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


// Finds all descriptions
router.post('/desc', function(req, res, next) {
    // Check valid section
    if(!SQLProtection.validSection(req.body.section)){
        res.send({descriptions: []});
        return;
    }

    // check valid category
    if(!SQLProtection.validCategory(req.body.category)){
        res.send({descriptions: []});
        return;
    }

    var queryString = squel.select()
        .from("large_strata_energy")
        .field("description").distinct();

    if(req.body.category !== ""){
        queryString = queryString.where("category = '"+ req.body.category+ "'")
    }

    if(req.body.subCategory !== ''){

        // Check valid subCategory
        if(!SQLProtection.validSubCategory(req.body.subCategory)){
            res.send({descriptions: []});
            return;
        }
        queryString = queryString.where("section = '"+ req.body.section + "'")
            .where("sub_category = '"+ req.body.subCategory+ "'").toString(); // Adds subcategory clause
    } else {
        queryString = queryString.where("section = '"+ req.body.section + "'").toString();
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

            var descriptions = [];

            if (error) {
                console.error('Failed to execute query');
                console.error(error);
                return;
            } else {
                for (row in result.rows) {
                    var c = result.rows[row].description;
                    descriptions.push(c);
                }
                res.send({descriptions: descriptions});
                return;
            }
        })
    });
});

// Finds all companies
router.get('/company', function(req, res) {

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

// Returns all sections
router.get('/sections', function(req, res) {
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
                res.send({sections: sections});
                return;
            }
        })
    });
});

// Returns all rows for a search
router.post('/search', function(req, res, next) {
    // Check valid section
    if(!SQLProtection.validSection(req.body.section)){
        res.send({rows: []});
        return;
    }

    // check valid category
    if(!SQLProtection.validCategory(req.body.category)){
        res.send({rows: []});
        return;
    }

    // check valid category
    if(!SQLProtection.validDescription(req.body.description)){
        res.send({rows: []});
        return;
    }


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
        // Check valid subCategory
        if(!SQLProtection.validSubCategory(req.body.subCategory)){
            res.send({descriptions: []});
            return;
        }

        queryString = queryString.where("section = '"+ req.body.section + "'")
            .where("category = '"+ req.body.category+ "'")
            .where("sub_category = '"+ req.body.subCategory+ "'"); // Adds subcategory clause
    } else {
        queryString = queryString.where("section = '"+ req.body.section + "'")
            .where("category = '"+ req.body.category+ "'");
    }

    queryString = queryString.where("description = '"+ req.body.description + "'").toString();

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
                    rowsSimplified.push(result.rows[row]);
                }
                res.send({rows : rowsSimplified});
                return;
            }
        })
    });
});
module.exports = router;
