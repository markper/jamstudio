var Channel = require('../model/channelSchema');
var Track = require('../model/trackSchema');
var errors = require('./errors')

exports.getChannel = function(channelId,callback){
	Channel.findOne({_id: channelId}, function(err, channel) {
        if(err)
        	return callback(errors.errorNotFound(err));
        return callback(channel);
    });
};

exports.createChannel = function(channelJson,callback){
    var newChannel = new Channel(trackJson);
     Channel.findOne({_id:newChannel.trackId},function(err,channel){
        if(err)
            return callback(errors.errorNotFound((err?err:'')));
        newChannel.save(function(err) {
            if (err) 
                return callback(errors.errorSave((err?err:'')));
            channel.channels.push(newChannel._id);
            channel.save(function(err,project){
                if(err)
                    return callback(errors.errorUpdate((err?err:'')));
                return callback(newChannel);
            });
        });
    });
};

exports.deleteChannel = function(channelId,callback){
    Channel.findOne({
        _id: channelId
    }, function(err, channel) {
    	if(!channel)
    		return callback(errors.errorNotFound((err?err:'')));

	    Track.update( {_id:channel.trackId}, {$pull: {channels: channelId}}, function(err, data){
	    });

	    channel.remove(function(err){
	        if(err)
	        	return callback(errors.errorDelete((err?err:'')));
			return callback(channel);
	    });

    });
};

exports.updateChannel = function(channelId,channelJson,callback){
    Channel.findOne({_id:channelId}, function(err,channel){
        if (err || !channel) 
        	return callback(errors.errorNotFound((err?err:'')));
        // to do:
		// if trackId changed update track too..
        //channel.trackId = channelJson.trackId
        channel.userId = channelJson.userId
        channel.name = channelJson.name
        channel.instrument = channelJson.instrument
        channel.volume = channelJson.volume
        channel.lock = channelJson.lock
        channel.visible = channelJson.visible
        channel.samples = channelJson.samples
        channel.save(function(err){
	        if (err) 
	        	return callback(errors.errorUpdate((err?err:'')));
	        return callback(channel);
        });
    });
};

exports.createSample = function(channelId,channelJson,callback){
	Channel.
    findOne({_id:channelId},function(err,channel){
        if (err || !channel) 
        	return callback(errors.errorNotFound((err?err:'')));
        channel.samples.push(channelJson);
        channel.save(function(err,issue){
	        if (err) 
	        	return callback(errors.errorSave((err?err:'')));
	        return callback(channel);
        });
    });
}

exports.getSample = function(channelId,sampleId,callback){
	Channel
	.findOne({_id:channelId,'samples._id':sampleId})
	.populate({path:'samples'})
	.exec(function (err, channel) {
		if (err || !channel || !channel.samples[0]) 
        	return callback(errors.errorNotFound((err?err:'')));
        return callback(channel.samples[0]);
	});
};

exports.deleteSample = function(channelId,sampleId,callback){
    Channel.update( {_id:channelId}, {$pull: {samples: {_id:sampleId}}}, function(err, data){
        if(err || !data.nModified) {
            return callback(errors.errorUpdate((err?err:'')));
        }
        return callback(data);
    });
};

exports.updateSample = function(channelId,channelJson,callback){
	Channel.update( {_id:channelId,samples: { $elemMatch: { _id:channelJson._id } }},  { $set:{ "samples.$":channelJson }}, function(err, data){
        if(err || !data.nModified) {
            return callback(errors.errorUpdate((err?err:'')));
        }
        return callback(data);
    });
};


