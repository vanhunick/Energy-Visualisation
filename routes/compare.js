var express = require('express');
var router = express.Router();
var pg = require('pg');

// Formats sql queries in a nice way
var squel = require("squel");

router.get('/', function(req, res, next) {

res.render('compare', {sections: ""}); // Send the search results and render index

});


// Post for searching multiple categories
router.post('/search', function(req, res, next) {

    var company = req.body.company;
    var selections = JSON.parse(req.body.selections);

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

module.exports = router;
