// server.js
// https://scotch.io/tutorials/build-a-restful-api-using-node-and-express-4
// https://mongolab.com/databases/lifebetdb

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

var mongoose   = require('mongoose');
mongoose.connect('mongodb://admin:lifebet1551@ds037095.mongolab.com:37095/lifebetdb'); // connect to our database

var db = mongoose.connection;
db.once('open', function()	{
	console.log("Connected to database");
});
db.on('error', console.error.bind(console, 'Connection error'));

var Post     = require('./app/models/post');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router



// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

// more routes for our API will happen here
router.route('/posts')

    // create a post (accessed at POST http://localhost:8080/api/posts)
    .post(function(req, res) {
        
        var post = new Post();      // create a new instance of the Bear model
        post.name = req.body.name;  // set the post name (comes from the request)

        post.save();

        // save the post and check for errors
        post.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'New post created!' });
        });

        
    })
    // get all the bears (accessed at GET http://localhost:8080/api/bears)
    .get(function(req, res) {
    	console.log("getting");
        Post.find({}, function(err, posts) {
            if (err)
                res.send(err);

            res.json(posts);
        });
        console.log("got it");
    });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);



// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);