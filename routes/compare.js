var express = require('express');
var router = express.Router();
var pg = require('pg');

// Formats sql queries in a nice way
var squel = require("squel");

router.get('/', function(req, res, next) {

res.render('compare', {sections: ""}); // Send the search results and render index

});

module.exports = router;
