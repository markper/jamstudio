// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Icq', new Schema({
    icqId: String,
    projectId: {type: String, ref: 'Project'},
    applicants: [{user:{type: String, ref: 'User'},message: String}],
    title: String,
    description: String,
    instruments: [{
    	type: String
	}],
    date: {type: Date, default: Date.now}
}));
