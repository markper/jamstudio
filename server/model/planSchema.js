<<<<<<< HEAD
// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Plan', new Schema({
    planId: String,
    name: String,
    description: String,
    repositories_amount: 0,
    storage_capacity: 0,
    setting_bounds: [String]
}));
=======
// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Plan', new Schema({
    planId: String,
    name: String,
    description: String,
    repositories_amount: 0,
    storage_capacity: 0,
    setting_bounds: [String]
}));
>>>>>>> 5c59ec51e2fb0a1538b08d9f3c9b366c6cde8e2a
