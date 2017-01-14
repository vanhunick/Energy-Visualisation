/**
 * Created by Nicky on 12/01/2017.
 */
var express = require('express');
var router = express.Router();
var pg = require('pg');

router.get('/', function(req, res){

    console.log(req.query.search);
    //test(res);
    searchDatabase("e",res);

    return;

    console.log("Searching DB");


    // Check if it should be an advanced search
    if(req.query.adv == 'true'){

        console.log("searching advanced");
        searchDatabase(createQueryAdvanced(
            req.query.q,
            req.query.category,
            req.query.minPrice,
            req.query.maxPrice,
            req.query.valued
        ),res);
    } else {
        console.log("searching normal");
        searchDatabase(createQueryNormal(req.query.q),res);
    }
});


function test (res) {
    var entry = {
        letter: "",
        frequency: 0
    };
    var data = [];

    var newEntry = Object.create(entry);
    newEntry.letter = "B";
    newEntry.frequency = 100;
    data.push(newEntry);

    var newEntry2 = Object.create(entry);
    newEntry2.letter = "A";
    newEntry2.frequency = 200;
    data.push(newEntry2);

    //res.send(data);
    res.render('search', {data: JSON.stringify(data)}); // Send the search results
}

function createQueryNormal(q){

    if(q){
        var QUERY = "SELECT * FROM stock WHERE label iLIKE '%_SEARCH_%' AND status='listed';".replace("_SEARCH_", q);
    } else {
        var QUERY = "SELECT * FROM stock WHERE status='listed';"
    }
    return QUERY;
}

function createQueryAdvanced(q, category, min, max, valued ){



    var QUERY = "SELECT * FROM stock";

    if(q){
        QUERY = QUERY + " WHERE label iLIKE '%_SEARCH_%'".replace("_SEARCH_", q);
    }

    if (category){
        QUERY = QUERY + " AND category <@ '%CATEGORY%'".replace("%CATEGORY%", category);
    }
    if (min){
        QUERY = QUERY + " AND price > %MIN%".replace("%MIN%", min);
    }
    if (max){
        QUERY = QUERY + " AND price < %MAX%".replace("%MAX%", max);
    }
    if (valued === true){
        QUERY = QUERY + " AND selling_at_list=false";
    }

    QUERY = QUERY + " AND status='listed';";

    if(QUERY.indexOf("WHERE") === -1){
        QUERY = QUERY.replace("AND", "WHERE");
    }

    return QUERY;

}

function searchDatabase(queryString,res){

    console.log(queryString);

    // Connect to the database
    pg.connect(global.databaseURI, function(err, client, done) {
        done();

        // Check whether the connection to the database was successful
        if(err){
            console.error('Could not connect to the database');
            console.error(err);
            return;
        }

        console.log('Connected to database');

        // Execute the query -- an empty result indicates that the username:password pair does
        // not exist in the database
        var queryString = "SELECT * FROM test_strata_energy where disc_yr=2013;"

        queryString = uniqueSectionQuery();
        console.log(queryString);

        client.query(queryString, function(error, result){
            done();
            console.log(result);
            if(error) {
                console.error('Failed to execute query');
                console.error(error);
                return;
            }
            else {
                for (row in result.rows){
                    console.log(row);
                    //result.rows[row].valued_at = mean(result.rows[row].valuations);
                }
                var data = [{"name": "nicky", "color" : "blue"},{"name": "Jim", "color" : "Red"}];

                res.render('search', {rows: data}); // Send the search results
                return;
            }
        })
    });
}


function uniqueSectionQuery(){
    return "SELECT DISTINCT section FROM test_strata_energy;";
}

module.exports = router;