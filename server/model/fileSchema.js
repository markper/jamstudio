// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('File', new Schema({
    fileId: String,
    userOwner: {type: String, ref: 'User' },
    privacy: String,
    name: String,
    path: String,
    size: String,
    duration: String,
    sharedUsers: [{type: String, ref: 'User' }]
}));