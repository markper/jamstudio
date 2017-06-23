// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Notification', new Schema({
    notificationId: String,
    projectId: String,
    factor: {type: String, ref: 'User'},
    type: String,
    typeId: String,
    action: String,
    info: String,
    subscribes: [{user: {type: String, ref: 'User'}, read: Boolean}]
}));
