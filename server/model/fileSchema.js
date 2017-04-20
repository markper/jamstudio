// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Channel', new Schema({
    fileId: String,
    userId: String,
    privacy: String,
    name: String,
    path: String
}));
