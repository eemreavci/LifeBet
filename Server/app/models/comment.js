var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CommentSchema   = new Schema({
    author: {type: Schema.Types.ObjectId, ref: 'Name', required: true},
    date: {type: Date, default: new Date(), required: true},
    content: {type: String, required: true},
    voteUp: Boolean
});

module.exports = db.model('Comment', CommentSchema);