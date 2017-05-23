// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Project', new Schema({
    projectId: String,
    adminUser: {type: String, ref: 'User' },
    userId: String,
    name: String,
    description: String,
    genre: String,
    track_version: String,
    users: [{user:{ type: String, ref: 'User' },access:String}],
    issues: [{
            issueId: Schema.Types.ObjectId,
            projectId: String,
            fromUserId: { type: String, ref: 'User' },
            toUserId: { type: String, ref: 'User' },
            name: String,
            description: String,
            status: 0
    }],
    tracks: [{ type: String, ref: 'Track' }]
}));
