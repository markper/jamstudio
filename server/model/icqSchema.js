<<<<<<< HEAD
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
=======
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
>>>>>>> 5c59ec51e2fb0a1538b08d9f3c9b366c6cde8e2a
