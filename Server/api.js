var express = require('express')
  , router  = express.Router();

var multer     = require('multer');
var uploadProfilePicture = multer({ dest: './images/profileImages/'});

var bcrypt     = require('bcrypt-nodejs');
var jwt        = require('jsonwebtoken');
var fs         = require('fs');


// Get the models
var User        = require('./app/models/user');
var Bet         = require('./app/models/bet');
var Comment     = require('./app/models/comment');

// set secret for token
var secret = 'thisisasupersecretworddontevershareit';

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    console.log("Welcome");
    // res.sendFile('../Client/src/index.html');
});

router.post('/register', function(req, res) {
    var user = new User();
    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.email = req.body.email;
    user.password = req.body.password;
    user.joinDate = new Date();
    user.birthDate = new Date(req.body.birthDate);
    user.location = req.body.location;

    user.save(function(err) {
        if(err)
            res.send(err);
        res.json({ message: "User created successfully"});
    });
});

router.post('/login', function(req, res) {
    User.findOne({ email: req.body.email }, function(err, user) {
        if(err) throw err;

        if(!user)
            res.json({ success: false, message: 'Authentication failed. User not found.' });
        else {
            user.comparePassword(req.body.password, function(err, isMatch) {
                if (err) throw err;
                if(isMatch) {
                    // if user is found and password is right
                    // create a token
                    var token = jwt.sign(user, secret, {
                      expiresIn: 1440*60 // expires in 24 hours
                    });

                    // return the information including token as JSON
                    res.json({
                      success: true,
                      message: 'Login successfull',
                      token: token
                    });
                }
                else
                    res.json({ success: false, message: 'Authentication failed. User not found.' });
            });
        }
    });
});

// route middleware to verify a token
router.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, secret, function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.user = decoded;    
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });
    
  }
});

// Upload image
router.route('/user/profile/image')
    .post(uploadProfilePicture.single('image'), function(req, res){

        if(!req.file)
            res.send({'success': false, 'message': 'Please choose a file'});
        console.log(req.file);
        
        

        User.findById(req.user._id, function(err, user) {
            if(err)
                res.send(err);
            var oldImage = user.profilePicturePath;
            
            user.update({profilePicturePath: req.file.path.replace(/\\/g, '/').replace(/^images\//, '')}, function(err, user) {
                if(err)
                    res.send(err);
                res.json({'success': true, 'message': 'Upload successfull'});

                // Remove old profile picture to save server resources
                if(oldImage) {
                    fs.unlink(oldImage, function(err) {
                        if(err)
                            res.send(err);
                    });
                }
            });
        });
    })

    .get(function(req, res) {
        User.findById(req.user._id, function(err, user) {
            if(err)
                res.send(err);
            
            res.json({'profilePicturePath': user.profilePicturePath});
        });
    });

router.route('/user/:user_id/profile/image')
    .get(function(req, res) {
        User.findById(req.params.user_id, function(err, user) {
            if(err)
                res.send(err);
            
            res.json({'profilePicturePath': user.profilePicturePath});
        });
    });

router.get('/users', function(req, res) {
    User.find({}, function(err, posts) {
        if (err)
            res.send(err);

        res.json({'posts': posts, user: req.user});
    });
});

router.route('/user/bets')

    .get(function(req, res) {
         Bet.find({author: req.user._id}, function(err, bets) {
            if (err)
                res.send(err);

            res.json(bets);
        });
    });

// Routes for Bets
router.route('/bets')

    // create a post (accessed at POST http://localhost:8080/api/posts)
    .post(function(req, res) {
        
        var bet = new Bet();  
        bet.author = req.user;
        bet.date = new Date();
        bet.content = req.body.content;
        bet.deadline = new Date(req.body.deadline);
        bet.rating = 0;
        bet.status = 'Active';


        // author: {type: Schema.Types.ObjectId, ref: 'Name', required: true},
        // date: {type: Date, default: new Date(), required: true},
        // content: {type: String, required: true},
        // deadline: {type: Date, required: true},
        // rating: {type: Number, default: 0},
        // comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
        // status: {type: String, enum: ['Active', 'Completed', 'Failed']}

        // save the post and check for errors
        bet.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'New post created!' });
        });

        
    })
    // get all the posts (accessed at GET http://localhost:8080/api/posts)
    .get(function(req, res) {
        Bet.find({})
            .populate('author')
            .exec(function(err, bets) {
                console.log("hey " + bets);
                if (err)
                    res.send(err);

                res.json(bets);
            });
    });

router.route('/bets/:bet_id')

    // get post with id (accessed at GET http://localhost:8080/api/posts/:post_id)
    .get(function(req, res) {
        Bet.findById(req.params.bet_id, function(err, bet) {
            if (err)
                res.send(err);
            res.json(bet);
        });
    })

    // update post with id (accessed at PUT http://localhost:8080/api/posts/:post_id)
    .put(function(req, res) {
        Post.findById(req.params.bet_id, function(err, bet) {
            if (err)
                res.send(err);

            bet.name = req.body.name; // Update post info

            bet.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Post updated!' });
            });

        });
    })

    // delete post with id (accessed at DELETE http://localhost:8080/api/posts/:post_id)
    .delete(function(req, res) {
        Bet.remove({
            _id: req.params.bet_id
        }, function(err, bet) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    });

module.exports = router;