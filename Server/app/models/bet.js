var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var BetSchema   = new Schema({
    author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    date: {type: Date, default: new Date(), required: true},
    content: {type: String, required: true},
    deadline: {type: Date, required: true},
    rating: {type: Number, default: 0},
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    status: {type: String, enum: ['Active', 'Completed', 'Failed']}
});

module.exports = db.model('Bet', BetSchema);