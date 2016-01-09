var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var bcrypt 		 = require('bcrypt-nodejs');
var validator	 = require('validator');

var UserSchema   = new Schema({
	firstName: {type: String, required: true},
	lastName: {type: String, required: true},
	email: {type: String, required: true, validate: [validator.isEmail, 'invalid email'], index: {unique: true}},
	password: {type: String, required: true},
	joinDate: {type: Date, required: true},
	birthDate: {type: Date, required: true},
	location: String,
	profilePicturePath: String,
	bets: [{type: Schema.Types.ObjectId, ref: 'Bet'}],
	friends: [{type: Schema.Types.ObjectId, ref: 'User'}],
    votes: [{targetBet: {type: Schema.Types.ObjectId, ref: 'Bet'}, voteUp: Number}]
});

UserSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // hash the password
    bcrypt.hash(user.password, null, null, function(err, hash) {
        if (err) return next(err);

        // override the cleartext password with the hashed one
        user.password = hash;
        next();
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

UserSchema.methods.toJSON = function() {
  var obj = this.toObject();
  delete obj.password;
  return obj;
}


module.exports = db.model('User', UserSchema);