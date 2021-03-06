var express = require('express');
var router = express.Router();
var pg = require('pg');
var squel = require("squel");
var auth = require('http-auth');

// , auth.connect(global.basic) add to line 9 to secure just this route 
// Renders the compare page
router.get('/', function(req, res, next) {
    if(Object.keys(req.query).length === 0){
        res.render('compare', {selections: ""}); // Render the standard page
    } else {
        search(req ,res);
    }
});

// Renders the page with and sends the user selections along
function search(req, res){
  selections = [];

  if(req.query.s0 !== undefined){
    selections.push({id : 0, section  : req.query.s0, category : req.query.c0, subCategory : req.query.sc0, description :req.query.d0});
  } else {
    selections.push({id : 0, section  : "", category : "", subCategory : "", description :""});
  }

  if(req.query.s1 !== undefined){
    selections.push({id : 1,section  : req.query.s1,category : req.query.c1,subCategory : req.query.sc1,description :req.query.d1});
  } else {
    selections.push({id : 1,section  : "",category : "",subCategory : "",description :""});
  }

  if(req.query.s2 !== undefined){
    selections.push({id : 2,section  : req.query.s2,category : req.query.c2,subCategory : req.query.sc2,description :req.query.d2});
  } else {
    selections.push({id : 2,section  : "",category : "",subCategory : "",description :""});
  }

  if(req.query.s3 !== undefined){
    selections.push({id : 3,section  : req.query.s3,category : req.query.c3,subCategory : req.query.sc3,description :req.query.d3});
  } else {
    selections.push({
      id : 3,section  : "",category : "",subCategory : "",description :""});
  }
  console.log(selections);

  res.render('compare', {selections : selections}); // Send the search results and render index
  return;
}


// Post for searching multiple categories
router.post('/search', function(req, res, next) {
    var selections = JSON.parse(req.body.selections); // The user selections

    var q = squel.select().from("large_strata_energy");
    var expr = squel.expr();

    // create query go through rows of sections
    for(var i = 0; i < selections.length; i++){
        if(selections[i].section === "")continue; // A section could be empty
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
            var andExpr = squel.expr().and("section = '" + selections[i].section +"'")
                .and("category = '" + selections[i].category.replace(/'/g , "''")+"'");

            // Check is the sub category exists
            if(selections[i].subCategory !== ""){
                andExpr.and("sub_category = '" + selections[i].subCategory.replace(/'/g , "''") + "'");
            }
            andExpr.and("description = '" + selections[i].description.replace(/'/g , "''") + "'");
            expr.or(andExpr);
        }
    }
    q.where(expr); // Add condition the the where clause
    console.log(q.toString());

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
module.exports = router;
