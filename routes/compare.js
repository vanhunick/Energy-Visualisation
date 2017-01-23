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


    //console.log(selections);



    var q = squel.select().from("large_strata_energy");

    var expr = squel.expr().and("edb = " + company);

    // create query
    for(var i = 0; i < selections.length; i++){
        if(i === 0){
            expr.and(squel.expr().and("section = '" + selections[i].section + "'")
                .and("category = " + selections[i].category)
                .and("sub_category = '" + selections[i].subCategory))
        } else {
            expr.or(squel.expr().and("section = " + selections[i].section  + "'")
                .and("category = '" + selections[i].category  + "'")
                .and("sub_category = '" + selections[i].subCategory  + "'"))
        }
    }

    q.where(expr);

    console.log(q.toString());
});

module.exports = router;
