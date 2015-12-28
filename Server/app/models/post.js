// app/models/bear.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PostSchema   = new Schema({
    name: String
});

module.exports = db.model('Post', PostSchema);