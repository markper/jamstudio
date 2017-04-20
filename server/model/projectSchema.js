// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Project', new Schema({
    projectId: String,
    userId: String,
    name: String,
    description: String,
    genre: String,
    track_version: String,
    users: [String],
    issues: [{
    issue: {
        issueId: String,
        fromUserId: String,
        toUserId: String,
        name: String,
        description: String,
        status: 0
    }
}],
    "tracks": [String]
}));
