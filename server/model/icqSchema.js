// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Icq', new Schema({
    icqId: String,
    projectId: String,
    user: {type: String, ref: 'User'},
    genre: String,
    instruments: [String],
    date: {type: Date, default: Date.now}
}));
