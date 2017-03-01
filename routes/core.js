/**
 * Created by Nicky on 28/01/2017.
 */

var express = require('express');
var router = express.Router();
var pg = require('pg');

// Formats sql queries in a nice way
var squel = require("squel");

router.get('/', function(req, res, next) {
	// No longer used route
    res.render('404', {sections: ""}); // Send the search results and render index
});

module.exports = router;
