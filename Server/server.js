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

// Get the model
var Post     = require('./app/models/post');

// configure app to use bodyParser() to get the data from POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

// Routes for CRUD operations
router.route('/posts')

    // create a post (accessed at POST http://localhost:8080/api/posts)
    .post(function(req, res) {
        
        var post = new Post();  
        post.name = req.body.name;

        // save the post and check for errors
        post.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'New post created!' });
        });

        
    })
    // get all the posts (accessed at GET http://localhost:8080/api/posts)
    .get(function(req, res) {
        Post.find({}, function(err, posts) {
            if (err)
                res.send(err);

            res.json(posts);
        });
    });

router.route('/posts/:post_id')

    // get post with id (accessed at GET http://localhost:8080/api/posts/:post_id)
    .get(function(req, res) {
        Post.findById(req.params.post_id, function(err, post) {
            if (err)
                res.send(err);
            res.json(post);
        });
    })

    // update post with id (accessed at PUT http://localhost:8080/api/posts/:post_id)
    .put(function(req, res) {
        Post.findById(req.params.post_id, function(err, post) {
            if (err)
                res.send(err);

            post.name = req.body.name; // Update post info

            post.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Post updated!' });
            });

        });
    })

    // delete post with id (accessed at DELETE http://localhost:8080/api/posts/:post_id)
    .delete(function(req, res) {
        Post.remove({
            _id: req.params.post_id
        }, function(err, post) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    });



// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);



// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);