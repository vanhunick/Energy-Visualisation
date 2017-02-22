var express = require('express');
var router = express.Router();
var pg = require('pg');

// Formats sql queries in a nice way
var squel = require("squel");

router.get('/', function(req, res, next) {
    if(Object.keys(req.query).length === 0){
        res.render('compare', {selections: ""}); // Send the search results and render index
    } else {
        search(req ,res);
    }
});


function search(req, res){
  selections = [];

  if(req.query.s0 !== undefined){
    selections.push({id : 0,
    section  : req.query.s0,
    category : req.query.c0,
    subCategory : req.query.sc0,
    description :req.query.d0})
  } else {
    selections.push({id : 0,
    section  : "",
    category : "",
    subCategory : "",
    description :""});
  }

  if(req.query.s1 !== undefined){
    selections.push({id : 1,
    section  : req.query.s1,
    category : req.query.c1,
    subCategory : req.query.sc1,
    description :req.query.d1})
  } else {
    selections.push({id : 1,
    section  : "",
    category : "",
    subCategory : "",
    description :""});
  }

  if(req.query.s2 !== undefined){
    selections.push({id : 2,
    section  : req.query.s2,
    category : req.query.c2,
    subCategory : req.query.sc2,
    description :req.query.d2})
  } else {
    selections.push({id : 2,
    section  : "",
    category : "",
    subCategory : "",
    description :""});
  }

  if(req.query.s3 !== undefined){
    selections.push({id : 3,
    section  : req.query.s3,
    category : req.query.c3,
    subCategory : req.query.sc3,
    description :req.query.d3})
  } else {
    selections.push({
      id : 3,
      section  : "",
      category : "",
      subCategory : "",
      description :""
    });
  }

    //
    // var row0 = {
    //     id : req.query.i0,
    //     section  : req.query.s0,
    //     category : req.query.c0,
    //     subCategory : req.query.sc0,
    //     description :req.query.d0
    // };
    //
    // var row1 = {
    //     id : req.query.i1,
    //     section  : req.query.s1,
    //     category : req.query.c1,
    //     subCategory : req.query.sc1,
    //     description :req.query.d1
    // };
    //
    // var row2 = {
    //     id : req.query.i2,
    //     section  : req.query.s2,
    //     category : req.query.c2,
    //     subCategory : req.query.sc2,
    //     description :req.query.d2
    // };
    //
    // var row3 = {
    //     id : req.query.i3,
    //     section  : req.query.s3,
    //     category : req.query.c3,
    //     subCategory : req.query.sc3,
    //     description :req.query.d3
    // };
    //
    // selections.push(row0);
    // selections.push(row1);
    // selections.push(row2);
    // selections.push(row3);

    //res.render('compare', {selections : JSON.stringify(selections)}); // Send the search results and render index
    res.render('compare', {selections : selections}); // Send the search results and render index

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

    var q = squel.select().from("large_strata_energy");

    var expr = squel.expr();

    // create query go through rows of sections
    for(var i = 0; i < selections.length; i++){
        if(selections[i].section === "")continue; // TODO find better way to handle B and D table null
        if(i === 0){ //Row 0 has to have data
            // There is always a section and a category
            expr.and("(section = '" + selections[i].section.replace(/'/g , "''") + "'");

            if(selections[i].category != ""){
                expr.and("category = '" + selections[i].category.replace(/'/g , "''") + "'");
            }


            // Check is the sub category exists
            if(selections[i].subCategory !== ""){
                expr.and("sub_category = '" + selections[i].subCategory.replace(/'/g , "''") + "'");
            }

            // Add the description condition
            expr.and("description = '" + selections[i].description.replace(/'/g , "''") + "')");

        } else {
            var andExpr = squel.expr().and("section = '" + selections[i].section  + "'")
                .and("category = '" + selections[i].category.replace(/'/g , "''")  + "'");

            // Check is the sub category exists
            if(selections[i].subCategory !== ""){
                andExpr.and("sub_category = '" + selections[i].subCategory + "'");
            }

            andExpr.and("description = '" + selections[i].description + "'");

            expr.or(andExpr);
        }
    }

    q.where(expr);


    // Connect to the database
    pg.connect(global.databaseURI, function(err, client, done) {
        done(); // closes the connection once result has been returned

        // Check whether the connection to the database was successful
        if(err){
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
