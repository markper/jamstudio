// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Track', new Schema({
    trackId: String,
    projectId: String,
    name: String,
    description: String,
    genre: String,
    version: String,
    channels: [String]
}));