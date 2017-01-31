var express = require('express');
var router = express.Router();
var pg = require('pg');

// Formats sql queries in a nice way
var squel = require("squel");

router.get('/', function(req, res, next) {
    if(Object.keys(req.query).length === 0){
        console.log("Rendering standard page");
        res.render('compare', {selections: ""}); // Send the search results and render index
    } else {
        console.log("Rendering searched page");
        search(req ,res);
    }

});


function search(req, res){
    var row0 = {
        id : req.query.id0,
        section  : req.query.section0,
        category : req.query.category0,
        subCategory : req.query.subCategory0,
        description :req.query.description0
    };

    var row1 = {
        id : req.query.id0,
        section  : req.query.section1,
        category : req.query.category1,
        subCategory : req.query.subCategory1,
        description :req.query.description1
    };

    var row2 = {
        id : req.query.id2,
        section  : req.query.section2,
        category : req.query.category2,
        subCategory : req.query.subCategory2,
        description :req.query.description2
    };

    var row3 = {
        id : req.query.id3,
        section  : req.query.section3,
        category : req.query.category3,
        subCategory : req.query.subCategory3,
        description :req.query.description3
    };

    selections = [];
    selections.push(row0);
    selections.push(row1);
    selections.push(row2);
    selections.push(row3);

    console.log(selections);

    res.render('compare', {selections : JSON.stringify(selections)}); // Send the search results and render index

    return;

    var queryString = getMultipleRowQuery(selections);

    // Connect to the database
    pg.connect(global.databaseURI, function(err, client, done) {
        done(); // closes the connection once result has been returned

        // Check whether the connection to the database was successful
        if(err){
            console.error('Could not connect to the database');
            console.error(err);
            return;
        }


        client.query(queryString, function(error, result){
            done();

            if(error) {
                console.error('Failed to execute query');
                console.error(error);
                return;
            } else {
                var validRows = [];

                for (row in result.rows){
                    var section = result.rows[row];
                    validRows.push(section);
                }
                console.log("Rows for multiple query " + validRows.length);


                res.render('compare', {rows : validRows}); // Send the search results and render index

                return;
            }
        })
    });

}





// Post for searching multiple categories
router.post('/search', function(req, res, next) {

    var company = req.body.company;
    var selections = JSON.parse(req.body.selections);

    console.log(selections);

    var q = squel.select().from("large_strata_energy");

    var expr = squel.expr();

    // create query go through rows of sections
    for(var i = 0; i < selections.length; i++){
        if(selections[i].section === "")continue; // TODO find better way to handle B and D table null
        if(i === 0){ //Row 0 has to have data
            // There is always a section and a category
            expr.and("(section = '" + selections[i].section + "'")
                .and("category = '" + selections[i].category + "'");

            // Check is the sub category exists
            if(selections[i].subCategory !== ""){
                expr.and("sub_category = '" + selections[i].subCategory + "'");
            }

            // Add the description condition
            expr.and("description = '" + selections[i].description + "')");

        } else {
            var andExpr = squel.expr().and("section = '" + selections[i].section  + "'")
                .and("category = '" + selections[i].category  + "'");

            // Check is the sub category exists
            if(selections[i].subCategory !== ""){
                andExpr.and("sub_category = '" + selections[i].subCategory + "'");
            }

            andExpr.and("description = '" + selections[i].description + "'");

            expr.or(andExpr);
        }
    }

    q.where(expr);

    console.log(q.toString());


    // Connect to the database
    pg.connect(global.databaseURI, function(err, client, done) {
        done(); // closes the connection once result has been returned

        // Check whether the connection to the database was successful
        if(err){
            console.error('Could not connect to the database');
            console.error(err);
            return;
        }


        client.query(q.toString(), function(error, result){
            done();

            if(error) {
                console.error('Failed to execute query');
                console.error(error);
                return;
            } else {
                var validRows = [];

                for (row in result.rows){
                    var section = result.rows[row];
                    validRows.push(section);
                }
                console.log("Rows for multiple query " + validRows.length);
                res.send({rows : validRows});
                return;
            }
        })
    });
});

function getMultipleRowQuery(selections){
    var q = squel.select().from("large_strata_energy");

    var expr = squel.expr();

    // create query go through rows of sections
    for(var i = 0; i < selections.length; i++){
        if(selections[i].section === "")continue; // TODO find better way to handle B and D table null
        if(i === 0){ //Row 0 has to have data
            // There is always a section and a category
            expr.and("(section = '" + selections[i].section + "'")
                .and("category = '" + selections[i].category + "'");

            // Check is the sub category exists
            if(selections[i].subCategory !== ""){
                expr.and("sub_category = '" + selections[i].subCategory + "'");
            }

            // Add the description condition
            expr.and("description = '" + selections[i].description + "')");

        } else {
            var andExpr = squel.expr().and("section = '" + selections[i].section  + "'")
                .and("category = '" + selections[i].category  + "'");

            // Check is the sub category exists
            if(selections[i].subCategory !== ""){
                andExpr.and("sub_category = '" + selections[i].subCategory + "'");
            }

            andExpr.and("description = '" + selections[i].description + "'");

            expr.or(andExpr);
        }
    }

    q.where(expr);

    return q.toString();
}

module.exports = router;
