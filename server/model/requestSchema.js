// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Request', new Schema({
    requestId: String,
    projectId:  { type: String, ref: 'Project' },
    userId:  { type: String, ref: 'User' },
    status: String
}));
