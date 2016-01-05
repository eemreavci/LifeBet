// https://scotch.io/tutorials/build-a-restful-api-using-node-and-express-4
// https://mongolab.com/databases/lifebetdb

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');




var mongoose   = require('mongoose');
global.db = mongoose.createConnection('mongodb://admin:lifebet1551@ds037095.mongolab.com:37095/lifebetdb'); // connect to the database, global db for creating models on other js files

// configure app to use bodyParser() to get the data from POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// configure app for jade templates
app.set('views', './views');
app.set('view engine', 'jade');

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR THE API
// =============================================================================
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// Static content
app.use(express.static('../Client'));
app.use(express.static('../Client/src'));
app.use(express.static('images'));


// REGISTER OUR ROUTES -------------------------------
app.get('/[a-z]{0,100}', function(req, res){
  res.render('index');
});

// all of the api routes will be prefixed with /api
app.use('/api', require('./api'))



// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);