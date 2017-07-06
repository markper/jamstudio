var Channel = require('../model/channelSchema');
var Track = require('../model/trackSchema');
var errors = require('./errors')
var mongoose = require('mongoose');
var users = require('./users');
var Project = require('../model/projectSchema');



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

exports.createChannel = function(channelJson,userId,callback){
    var newChannel = new Channel(channelJson);
     Track.findOne({_id:channelJson.trackId},function(err,track){
        if(err || !track)
            return callback(errors.errorNotFound((err?err:'')));
        checkTrackPermitions(track._id,userId,function(access){
            if(!access){
                return callback(errors.errorPermitions((err?err:'')));
            }else{
               newChannel.save(function(err) {
                    if (err) 
                        return callback(errors.errorSave((err?err:'')));
                    else{
                        track.channels.push(newChannel._id);
                        track.save(function(err,project){
                            if(err)
                                return callback(errors.errorUpdate((err?err:'')));
                            else
                                return callback(newChannel);
                        });
                    }
                });
            }
        });
    });
};

exports.deleteChannel = function(channelId,userId,callback){
    Channel.findOne({
        _id: channelId
    }, function(err, channel) {
    	if(!channel)
    		return callback(errors.errorNotFound((err?err:'')));
        checkChannelPermitions(channelId,userId,function(access){
            if(!access){
                return callback(errors.errorPermitions((err?err:'')));
            }else{
                Track.update( {_id:channel.trackId}, {$pull: {channels: channelId}}, function(err, data){
                });
                channel.remove(function(err){
                    if(err)
                        return callback(errors.errorDelete((err?err:'')));
                    return callback(channel);
                });
            }
        });
    });
};
exports.sortChannels = function(list,callback){
    var err = {success: true};
    var counter = 0;
    for (var i = 0;  i < list.length; i++) { 
        sortChannel(list[i],i,function(result){
            if (result instanceof Error)
                err = errors.errorUpdate((err?err:''));
            if(++counter== list.length)
                return callback({success: err});
        });
    }
};

function sortChannel(channelId,level,callback){
    Channel.findOne({_id:channelId}, function(err,channel){
    if (err || !channel) 
          return callback(errors.errorNotFound((err?err:'')));
    else
        channel.orderLevel = parseInt(level); 
        channel.save(function(_err){
            return callback(_err);               
        });          
    });
  
}

exports.updateChannel = function(channelId,channelJson,userId,callback){
    checkChannelPermitions(channelId,userId,function(access){
        if(!access){
            return callback(errors.errorPermitions(''));
        }else{

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
        }
    });
};

exports.createSample = function(channelId,sampleJson,userId,callback){
	Channel.
    findOne({_id:channelId},function(err,channel){
        if (err || !channel) {
            console.log('channel not found');
        	return callback(errors.errorNotFound((err?err:'')));            
        }
        checkChannelPermitions(channelId,userId,function(access){
            if(!access){
                return callback(errors.errorPermitions((err?err:'')));
            }else{
                if(!mongoose.Types.ObjectId.isValid(sampleJson["_id"]))
                    delete sampleJson["_id"]
                if(!mongoose.Types.ObjectId.isValid(sampleJson["sampleId"]))
                    delete sampleJson["sampleId"]

                channel.samples.push(sampleJson);
                channel.save(function(err,channel){
                    if (err) {
                        console.log('channel not saved..');
                        return callback(errors.errorSave((err?err:'')));
                    }
                    return callback(channel.samples[channel.samples.length-1]);
                });
            }
        });        
    });
}

exports.moveSample = function(userId,oldChannelId,newChannelId,sampleId,callback){
    checkChannelPermitions(oldChannelId,userId,function(access){
        if(!access){
            return callback(errors.errorPermitions((err?err:'')));
        }else{
            checkChannelPermitions(newChannelId,userId,function(access){
                if(!access){ 
                    return callback(errors.errorPermitions((err?err:'')));
                }else{
                    moveSample(userId,oldChannelId,newChannelId,sampleId,callback);
                }
            });
        }
    });   
}

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
            });
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

exports.deleteSample = function(userId,channelId,sampleId,callback){
    checkChannelPermitions(channelId,userId,function(access){
        if(!access)
            return callback(errors.errorPermitions((err?err:'')));
        else
            deleteSample(channelId,sampleId,function(result){
                callback(result);
                console.log("fuck");
            });
    });   
}

function deleteSample(channelId,sampleId,callback){
    Channel.update( {_id:channelId}, {$pull: {samples: {_id:sampleId}}}, function(err, data){
        if(err || !data.nModified) 
            return callback(errors.errorUpdate((err?err:'')));
        else
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
                    if(err) 
                        return callback(errors.errorUpdate((err?err:'')));
                    else
                        Channel.findOne({_id:channelId},function(err,date){
                            if(err) 
                                return callback(errors.errorUpdate((err?err:'')));
                            else
                                return callback(date.samples[date.samples.length-1]);
                        });
                }
            );
        }
        else
            return callback(data);
    });
};



exports.checkChannelPermitions = function(channelId,userId,callback){
    checkChannelPermitions(channelId,userId,function(result){
        callback(result);
    });
}

function checkTrackPermitions(trackId,userId,callback){
    Track.findOne({_id:trackId},function(err,track){
        if(err || !track)
           return callback(false)
        else{
            Project.findOne({_id:track.project},function(err,project){
                if(err || !project)
                    return callback(track)
                else{
                    if(project.adminUser == userId){
                        return callback(true);
                    }else{
                        var isSent = false;
                        for (var i = 0; i < project.users.length; i++) {
                            if(project.users[i].user == userId){
                                return callback(true);
                                isSent = true;
                            } 
                        }   
                        if (!isSent)
                            return callback(false);  
                    }
                }                         
            });
        }
    });
}

function checkChannelPermitions(channelId,userId,callback){
    Channel
    .findOne({_id: channelId })
    .populate({path:'channels'})
    .exec(function (err, channel){
        if (err || !channel){
             console.log('!channel');
            return callback(false);
        }
        else{
            Track.findOne({_id:channel.trackId},function(err,track){
                if(err || !track){
                    console.log('!track');
                   return callback(false)                                                   
                }
                else{
                    Project.findOne({_id:track.project},function(err,project){
                        if(err || !project){
                            console.log('!project');
                            return callback(false)
                        }
                        else{
                            if(project.adminUser == userId){
                                console.log('admin');
                                return callback(true);                                
                            }else{
                                var isSent = false;
                                for (var i = 0; i < project.users.length; i++) {
                                    if((project.users[i].user == userId &&
                                        project.users[i].access == '1')){
                                        return callback(true);
                                        console.log('manager');
                                        isSent = true;
                                    }
                                    else if(channel.userId == userId){
                                        return callback(true);
                                        console.log('channel owner');
                                        isSent = true;
                                    } 
                                }   
                                if (!isSent)
                                    return callback(false);  
                            }
                        }                         
                    });
                }
            });
        }
    });
}

exports.updateSample = function(sampleJson,userId,callback){    
    Channel
    .findOne({'samples._id': sampleJson._id }, { 'samples.$': 1 })
    .exec(function (err, channel) {
        if (err || !channel || !channel.samples[0]) {
            return callback(errors.errorNotFound((err?err:'')));
        } 
        else{         
            var sample = channel.samples[0];
            checkChannelPermitions(sample.channelId,userId,function(access){
                if(!access){
                    return callback(errors.errorPermitions((err?err:'')));
                }else{
                    if(sample.channelId != sampleJson.channelId){
                        checkChannelPermitions(sample.channelId,userId,function(access){
                            if(!access){
                                return callback(errors.errorPermitions((err?err:'')));
                            }else{
                                checkChannelPermitions(sampleJson.channelId,userId,function(access){
                                    if(!access){ 
                                        return callback(errors.errorPermitions((err?err:'')));
                                    }else{
                                            moveSample(sample.channelId,sampleJson.channelId,sampleJson._id,function(result){
                                            if(result){                        
                                                updateSample(sampleJson.channelId,sampleJson,function(result){
                                                    return callback(result);
                                                });
                                            }
                                            else
                                                return callback(errors.errorNotFound((err?err:'')));
                                        });
                                    }
                                });
                            }
                        });
                    }
                    else
                        updateSample(sampleJson.channelId,sampleJson,function(result){
                            return callback(result);
                        });
                }
            });
        }
    });
};



