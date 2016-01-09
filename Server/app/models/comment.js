var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CommentSchema   = new Schema({
    author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    bet: {type: Schema.Types.ObjectId, ref: 'Bet', required: true},
    date: {type: Date, required: true},
    content: {type: String, required: true},
    voteUp: Number
});

module.exports = db.model('Comment', CommentSchema);