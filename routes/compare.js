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
    console.log("Company " + company);
    //console.log("Selections " + selections);


    var q = squel.select().from("large_strata_energy");

    var expr = squel.expr().and("edb = '" + company + "'");

    // create query
    for(var i = 0; i < selections.length; i++){
        if(i === 0){
            expr.and(squel.expr().and("section = '" + selections[i].section + "'")
                .and("category = '" + selections[i].category + "'")
                .and("sub_category = '" + selections[i].subCategory + "'"))
        } else {
            expr.or(squel.expr().and("section = '" + selections[i].section  + "'")
                .and("category = '" + selections[i].category  + "'")
                .and("sub_category = '" + selections[i].subCategory  + "'"))
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

                res.send({rows : validRows});
                return;
            }
        })
    });


});

module.exports = router;
