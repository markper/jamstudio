// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Channel', new Schema({
    channelId: String,
    trackId: String,
    userId: String,
    name: String,
    instrument: String,
    volume:String,
    lock: Boolean,
    visible: Boolean,
    samples: [{
        sampleId: Schema.Types.ObjectId,
        channelId: { type: String, ref: 'Channel' },
        fadein: String,
        fadeout: String,
        start: String,
        volume: String,
        duration: String,
        file: { type: String, ref: 'File' }
    }]
}));


