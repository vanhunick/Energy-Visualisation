// Modules
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var postgres = require('pg');
var auth = require('http-auth');

// Authentication
global.basic = auth.basic({
    realm: "Private Area",
    file: __dirname + "/htpasswd",
});

// Routes
var SQLProtection = require('./routes/SQLProtection');
var sections = require('./routes/sections');
var compare = require('./routes/compare');
var test = require('./routes/testrunner');
var index = require('./routes/index');

var app = express();

// Use authentication
app.use(auth.connect(global.basic));

// Local db
global.databaseURI = "postgres://Admin:admin@localhost:5432/Energy";

// Heroku db
// global.databaseURI = process.env.DATABASE_URL;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public','images', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/sections',sections);
app.use('/compare',compare);
app.use('/test',test);

SQLProtection.createValidSelectionData();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;

  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  if(err.status === 404){
    res.render('404');
  } else {
      res.render('error');
  }
});

module.exports = app;
