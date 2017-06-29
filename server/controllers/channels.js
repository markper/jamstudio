var Channel = require('../model/channelSchema');
var Track = require('../model/trackSchema');
var errors = require('./errors')

exports.getChannel = getChannel;

function getChannel(channelId,callback){
    Channel.findOne({_id: channelId})
    .populate({path:'samples.file', model:'File'})
    .exec(function (err, channel) {
        if (err || !channel)
            return callback(errors.errorNotFound((err?err:'')));
        else
            return callback(channel);
    });
}

exports.createChannel = function(channelJson,callback){
    var newChannel = new Channel(channelJson);
     Track.findOne({_id:channelJson.trackId},function(err,track){
        if(err || !track)
            return callback(errors.errorNotFound((err?err:'')));
        // Channel
        //   .find({trackId:channelJson.trackId})
        //   .sort({"orderLevel":-1})
        //   .limit(1)
        //   .exec(function (err, channel) {
        //     console.log(channel);
        //     channel = channel[0];
        //      if(!channel || err || channel.orderLevel==undefined)
        //         newChannel.orderLevel = 0;
        //      else{
        //         console.log("a");
        //         console.log();
        //         var counter = channel.orderLevel+1;
        //         newChannel.orderLevel = counter;
                
        //      }
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
          // });
       
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
exports.sortChannels = function(list,callback){
    var err = null;
    for (var i = 0;  i < list.length; i++) { 
        sortChannel(list[i].channelId,list[i].level,callback);
    }
};

function sortChannel(channelId,level,callback){
    Channel.findOne({_id:channelId}, function(err,channel){
    console.log("find");   
    if (err || !channel) 
        return callback(errors.errorNotFound((err?err:'')));
    else
        try{      
            channel.orderLevel = parseInt(level); 
            channel.save(function(_err){
            });          
        }catch(exc){  
            console.log(exc.message);   
        }
    });
}

exports.updateChannel = function(channelId,channelJson,callback){
    Channel.findOne({_id:channelId}, function(err,channel){
        if (err || !channel) 
        	return callback(errors.errorNotFound((err?err:'')));
        // to do:
		// if trackId changed update track too..
        channel.trackId = channelJson.trackId;
        channel.userId = channelJson.userId;
        channel.name = channelJson.name;
        channel.instrument = channelJson.instrument;
        channel.volume = channelJson.volume;
        channel.lock = channelJson.lock;
        channel.visible = channelJson.visible;
        channel.orderLevel = channelJson.orderLevel;
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
                    "file":  obj.file,
                    "delay":  obj.delay  
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
        if (err || !channel) {
            console.log('channel not found');
        	return callback(errors.errorNotFound((err?err:'')));            
        }
        
        delete sampleJson["sampleId"]
        channel.samples.push(sampleJson);
        channel.save(function(err,channel){
	        if (err) {
                console.log('channel not saved..');
	        	return callback(errors.errorSave((err?err:'')));
            }
	        return callback(channel.samples[channel.samples.length-1]);
        });
    });
}

exports.moveSample = moveSample;

function moveSample(oldChannelId,newChannelId,sampleId,callback){
   Channel
    .findOne({ '_id': oldChannelId, 'samples._id': sampleId }, { 'samples.$': 1 })
    .exec(function (err, channel) {
        if (err || !channel || !channel.samples[0]) 
            return callback(errors.errorNotFound((err?err:'')));
        else{
            var sample = channel.samples[0];
            deleteSample(sample.channelId,sample._id,function(result){
                if(err)
                    return callback(errors.errorNotFound((err?err:'')));
                else
                    getChannel(newChannelId,function(channel){
                        sample.channelId = newChannelId;
                        channel.samples.push(sample);
                        channel.save(function(err){
                            if(err)
                                return callback(errors.errorNotFound((err?err:'')));
                            else
                                return callback({success: true});
                        });
                    });
            })
        }
    });
}

exports.getSample = function(channelId,sampleId,callback){
	Channel
	.findOne({ '_id': channelId, 'samples._id': sampleId }, { 'samples.$': 1 })
	.populate({path:'samples'})
    .populate({path:'samples.file', model:'File'})
	.exec(function (err, channel) {
		if (err || !channel || !channel.samples[0]) 
        	return callback(errors.errorNotFound((err?err:'')));
        return callback(channel.samples[0]);
	});
};

exports.deleteSample = deleteSample;

function deleteSample(channelId,sampleId,callback){
    Channel.update( {_id:channelId}, {$pull: {samples: {_id:sampleId}}}, function(err, data){
        if(err || !data.nModified) {
            return callback(errors.errorUpdate((err?err:'')));
        }
        return callback(data);
    });
}

function updateSample(channelId,sampleJson,callback){
    Channel.update( {_id:channelId,samples: { $elemMatch: { _id:sampleJson._id } }},  { $set:{ "samples.$":sampleJson }}, function(err, data){
        if(err || !data.nModified) {
            Channel.findByIdAndUpdate(
                channelId,
                {$push: {"samples": sampleJson}},
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

exports.updateSample = function(sampleJson,callback){
    console.log('111111');
    Channel
    .findOne({'samples._id': sampleJson._id }, { 'samples.$': 1 })
    .exec(function (err, channel) {
        if (err || !channel || !channel.samples[0]) {
            console.log('111111');
            return callback(errors.errorNotFound((err?err:'')));
        }
        else{
            var sample = channel.samples[0];
            console.log('sample');
            console.log(sample);
            if(sample.channelId != sampleJson.channelId)
                moveSample(sample.channelId,sampleJson.channelId,sampleJson._id,function(result){
                    console.log('movesample result..');
                    console.log(result);
                    if(result){                        
                        updateSample(sampleJson.channelId,sampleJson,function(result){
                            return callback(result);
                        });
                    }
                    else
                        return callback(errors.errorNotFound((err?err:'')));
                });
            else
                updateSample(sampleJson.channelId,sampleJson,function(result){
                    console.log('updatesample result..');
                    console.log(result);
                    return callback(result);
                });
        }
    });
};



