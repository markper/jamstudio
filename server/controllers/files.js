var File = require('../model/fileSchema');
var errors = require('./errors');

exports.getFile = function(fileId,callback){
	File.findOne({_id: fileId}, function(err, file) {
		if (err) 
			return callback(errors.errorNotFound());
		return callback(file);
  	});
};

exports.getAllByUser = function(userId,callback){
	File
	.find({ $or:[{sharedUsers: userId},{userOwner: userId}]})
	.populate({path:'userOwner', select:['firstName','lastName','picture']})
    .populate({path:'sharedUsers', select:['firstName','lastName','picture']})
    .exec(function (err, files) {
			console.log(files);
		var owner= [], shared = [];
		for (var i = files.length - 1; i >= 0; i--) {
			if(files[i].userOwner._id == userId)
				owner.push(files[i]);
			else
				shared.push(files[i]);
		}
		if (err) 
			return callback(errors.errorNotFound());
		return callback({
			files: owner,
			sharedFiles: shared
		});
  	});
};

exports.getListByUser = function(userId,callback){
	File.find({userOwner: userId}
		, function(err, files) {
		if (err) 
			return callback(errors.errorNotFound());
		return callback(files);
  	});
};

exports.getSharedListByUser = function(userId,callback){
	File.find({sharedUsers:  userId }
		, function(err, files) {
		if (err) 
			return callback(errors.errorNotFound());
		return callback(files);
  	});
};

exports.updateFile = function(fileId,fileJson,callback){
    File.findOne({_id: fileId}, function(err, file) {	
		if (err) 
			return callback(errors.errorNotFound());
		file.userOwner = fileJson.userOwner;
		file.privacy = fileJson.privacy;
		file.name = fileJson.name;
		file.path = fileJson.path;
		file.size = fileJson.size;
		file.duration = fileJson.duration;
		file.sharedUsers = fileJson.sharedUsers;
		file.save(function(err,data){
			if(err)
				return callback(errors.errorUpdate());
			return callback(data);
		});
	});
};

exports.createFile = function(fileJson,callback){
	var file = new File(fileJson);
	file.save(function (err, file) {
		if(err)
			return callback(errors.errorCreate());
		return callback(file);
	});
};

exports.deleteFile = function(fileId,callback){
	File.findByIdAndRemove({_id: fileId}, function (err, data) {
		if(err || !data)
			return callback(errors.errorDelete());
		return callback(data);
	});
};
