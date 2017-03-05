var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  console.log("Rendering test runner")
    res.render('testrunner', {sections: ""}); // Send the search results and render index
});

module.exports = router;
