var express = require('express')
  , router  = express.Router();

var multer     = require('multer');
var uploadProfilePicture = multer({ dest: './images/profileImages/'});

var bcrypt     = require('bcrypt-nodejs');
var jwt        = require('jsonwebtoken');
var fs         = require('fs');
var _ = require('underscore');


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
                      token: token,
                      user: user
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
    	console.log("New image");
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
                res.json({'success': true, 'message': 'Upload successfull', 'profilePicturePath': user.profilePicturePath});

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

// User routes

router.route('/user')
    .get(function(req, res) {
        res.json({'user': req.user});
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

router.route('/users/:user_id')
    .get(function(req, res) {
        User.findById(req.params.user_id, function(err, user) {
            if(err)
                res.send(err);
            
            res.json({'user': user});
        });
    });

router.post('/users/search', function(req, res) {
	var rexp = new RegExp(req.body.searchText, "i");
	User.find()
		.or([{ 'firstName': { $regex: rexp }}, { 'lastName': { $regex: rexp }}])
		.sort('firstName')
		.limit(20)
		.exec(function(err, users) {
		    res.json({'result': users});
		});

});

// Friends routes
router.route('/user/friends')
	.post(function(req, res) {
		User.findById(req.user._id, function(err, user) {
            if(err)
                res.send(err);
            
            user.friends.push(req.body.friend);
        
	        user.save(function(err) {
	            if (err)
	                res.send(err);

	            res.json({ message: 'New friend added!' });
	        });
        });
    })
    .get(function(req, res) {
    	User.findById(req.user._id)
    		.populate('friends')
    		.exec(function(err, user) {
	            if(err)
	        		res.send(err);

	        	res.json({'friends': user.friends});
	        });
        
    });

router.route('/user/friends/:friend_id')
	.delete(function(req, res) {
        User.findById(req.user._id, function(err, user) {
            if(err)
                res.send(err);
            
            user.friends.pull(req.params.friend_id);

	        user.save(function(err) {
	            if (err)
	                res.send(err);

	            res.json({ message: 'Friend removed!' });
	        });
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

router.route('/users/:user_id/bets')

    .get(function(req, res) {
         Bet.find({author: req.params.user_id})
         	.sort({date: 'desc'})
            .populate('author')
            .populate({path: 'comments',
        				populate: {
        					path: 'author',
        					model: 'User'
        				}
        			})
            .exec(function(err, bets) {
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

        // save the post and check for errors
        bet.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'New post created!' });
        });

        
    })
    // get all the posts (accessed at GET http://localhost:8080/api/posts)
    .get(function(req, res) {
    	User.findById(req.user._id, function(err, user) {
	        Bet.find({$or: [{author: {$in: user.friends}}, {author: req.user._id}]})
	        	.sort({date: 'desc'})
	            .populate('author')
	            .populate({path: 'comments',
	        				populate: {
	        					path: 'author',
	        					model: 'User'
	        				}
	        			})
	            .exec(function(err, bets) {
	                if (err)
	                    res.send(err);

	                res.json(bets);
	            });
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

// Comments
router.route('/bets/:bet_id/comments')
	// create a post (accessed at POST http://localhost:8080/api/posts)
    .post(function(req, res) {
        
        var comment = new Comment();
        comment.author = req.user;
        comment.bet = req.params.bet_id;
        comment.date = new Date();
        comment.content = req.body.content;

        var userVote = _.find(req.user.votes, function(c) { return c.targetBet == req.params.bet_id; });
        comment.voteUp = (userVote != undefined) ? userVote.voteUp : 0;

        Bet.findById(req.params.bet_id, function(err, bet) {
            if (err)
                res.send(err);
            bet.comments.push(comment);

            bet.save(function(err) {
                if (err)
                    res.send(err);

                console.log("New comment added to Bet");
            });
        });
    	
        // save the comment after we've found the bet
	        comment.save(function(err) {
	            if (err)
	                res.send(err);

	            Comment.populate(comment, {path: 'author'}, function(err, comment) {
	            	if(err)
	            		res.send(err);

	            	res.json({ message: 'New comment posted!', comment: comment });
	            });
	            
	        });

        
    })

    // get comments of a bet with id
    .get(function(req, res) {
        Comment.find({'bet': req.params.bet_id}, function(err, comments) {
            if (err)
                res.send(err);
            res.json(comments);
        });
    })


router.route('/bets/:bet_id/comments/:comment_id')

    // get post with id (accessed at GET http://localhost:8080/api/posts/:post_id)
    .get(function(req, res) {
        Comment.findById(req.params.comment_id, function(err, comment) {
            if (err)
                res.send(err);
            res.json(comment);
        });
    })

    // update post with id (accessed at PUT http://localhost:8080/api/posts/:post_id)
    .put(function(req, res) {
        Comment.findById(req.params.comment_id, function(err, comment) {
            if (err)
                res.send(err);

            comment.content = req.body.content; // Update post info

            comment.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Comment updated!' });
            });

        });
    })

    // delete post with id (accessed at DELETE http://localhost:8080/api/posts/:post_id)
    .delete(function(req, res) {
        Comment.remove({
            _id: req.params.comment_id
        }, function(err, bet) {
            if (err)
                res.send(err);

            res.json({ message: 'Comment successfully deleted' });
        });
    });

module.exports = router;