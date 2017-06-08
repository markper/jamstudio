var Channel = require('../model/channelSchema');
var Track = require('../model/trackSchema');
var errors = require('./errors')

exports.getChannel = function(channelId,callback){
	Channel.findOne({_id: channelId})
    .populate({path:'samples.file', model:'File'})
    .exec(function (err, channel) {
        if (err || !channel)
            return callback(errors.errorNotFound((err?err:'')));
        else
            return callback(channel);
    });
};

exports.createChannel = function(channelJson,callback){
    var newChannel = new Channel(channelJson);
     Track.findOne({_id:channelJson.trackId},function(err,track){
        if(err || !track)
            return callback(errors.errorNotFound((err?err:'')));
        newChannel.save(function(err) {
            if (err) 
                return callback(errors.errorSave((err?err:'')));
            track.channels.push(newChannel._id);
            track.save(function(err,project){
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
        channel.trackId = channelJson.trackId
        channel.userId = channelJson.userId
        channel.name = channelJson.name
        channel.instrument = channelJson.instrument
        channel.volume = channelJson.volume
        channel.lock = channelJson.lock
        channel.visible = channelJson.visible
        channel.samples = [];
        var samples = JSON.parse(channelJson.samples);
        for (var i = 0; i < samples.length; i++) {
            var obj =samples[i];

            console.log('pushing..' + obj,channelId);

            console.log(obj);

            var sample = {
                    "channelId": obj,channelId,
                    "fadein": obj.fadein,
                    "fadeout": obj.fadeout,
                    "start": obj.start,
                    "volume": obj.volume,
                    "duration": obj.duration,
                    "file":  obj.file  
            };
            channel.samples.push(sample);

            console.log('pushed..');

        }
        channel.save(function(err){
	        if (err) 
	        	return callback(errors.errorUpdate((err?err:'')));
	        return callback(channel);
        });
    });
};


exports.syncChannels = function(channelsJson,callback){
    console.log('syncChannels!');
    console.log(channelsJson);
    for (var i = 0; i < channelsJson.channels.length; i++) {
        var channel = channelsJson.channels[i];
        Channel.findOne({_id:channel.channelId}, function(err,channel){
            if (err || !channel) {
                console.log('create!');
                createChannel(channel.channelId,channel,function(data){
                    if(data instanceof Error)
                        return callback(data);      
                });
            }
            else{
                console.log('update!');
                updateChannel(channel.channelId,channel,function(data){
                     if(data instanceof Error)
                        return callback(data);      
                });
            }
        });
    }
    return callback({'message':'success'});  
};

exports.createSample = function(channelId,sampleJson,callback){
	Channel.
    findOne({_id:channelId},function(err,channel){
        if (err || !channel) 
        	return callback(errors.errorNotFound((err?err:'')));
        channel.samples.push(sampleJson);
        channel.save(function(err,channel){
	        if (err) 
	        	return callback(errors.errorSave((err?err:'')));
	        return callback(channel.samples[channel.samples.length-1]);
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

exports.updateSample = function(channelId,sampleJson,callback){
	Channel.update( {_id:channelId,samples: { $elemMatch: { _id:sampleJson._id } }},  { $set:{ "samples.$":sampleJson }}, function(err, data){
        if(err || !data.nModified) {
            var sample = {
                "channelId": sampleJson,channelId,
                "fadein": sampleJson.fadein,
                "fadeout": sampleJson.fadeout,
                "start": sampleJson.start,
                "volume": sampleJson.volume,
                "duration": sampleJson.duration,
                "file":  sampleJson.file  
            };
            Channel.findByIdAndUpdate(
                channelId,
                {$push: {"samples": sample}},
                {safe: true, upsert: true},
                function(err, model) {
                    if(err) {
                        return callback(errors.errorUpdate((err?err:'')));
                    }
                    Channel.findOne({_id:channelId},function(err,date){
                        if(err) 
                            return callback(errors.errorUpdate((err?err:'')));
                        return callback(date.samples[date.samples.length-1]);
                    })
                }
            );
        }
        else
            return callback(data);
    });
};


