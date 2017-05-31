var Track = require('../model/trackSchema');  // get our mongoose model
var Project = require('../model/projectSchema');  // get our mongoose model
var errors = require('./errors')

exports.createTrack = function(trackJson,callback){
	var newTrack = new Track(trackJson);
     Project.findOne({_id:newTrack.projectId},function(err,project){
        if(err || !project)
        	return callback(errors.errorNotFound((err?err:'')));
        newTrack.save(function(err) {
            if (err) 
        		return callback(errors.errorSave((err?err:'')));
            project.tracks.push(newTrack._id);
            project.save(function(err,project){
                if(err)
		        	return callback(errors.errorUpdate((err?err:'')));
		        return callback(newTrack);
            });
        });
    });
};

exports.getTrack = function(trackId,callback){
	Track.findOne({_id:trackId}, function(err, track) {
        if(err || !track)
        	return callback(errors.errorNotFound((err?err:'')));
        return callback(track);
    });
};

exports.deleteTrack = function(trackId,callback){
	Track.findOne({_id:trackId}, function(err, track) {
        if(err || !track)
        	return callback(errors.errorNotFound((err?err:'')));

        Project.update( {_id:track.projectId}, {$pull: {tracks: trackId}}, function(err, data){
        });

        track.remove(function(err,data){
	    	if(err)
		        return callback(errors.errorDelete((err?err:'')));
			return callback(track);
	    });

    });
};

exports.updateTrack = function(trackId,trackJson,callback){
    Track.findOne({_id:trackId}, function(err,track){
        if(err || !track)
        	return callback(errors.errorNotFound((err?err:'')));
        // to do:
		// if projectId changed update project too..
        // track.projectId = trackJson.projectId
        track.name = trackJson.name
        track.description = trackJson.description
        track.genre = trackJson.genre
        track.version = trackJson.version
        track.channels = trackJson.channels
        track.save(function(err){
	    	if(err)
		        return callback(errors.errorUpdate((err?err:'')));
			return callback(track);
        });
    });
};
