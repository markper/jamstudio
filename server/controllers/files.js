var File = require('../model/fileSchema');
var errors = require('./errors');
var http = require('http');
var remoteFiles = 'https://oran1.herokuapp.com';
var request = require('request');


function isExistPyshicaly(path,callback){
	var options = {
	  uri: remoteFiles+'/isExist',
	  method: 'POST',
	  json: {
	    "path":path
	  }
	};
	request(options, function (error, response, body) {
	  	if (!error && response.statusCode == 200) 
			return callback(body.exist);
		return callback(false);
	});
}

exports.isExistDeleteIfNot = isExistDeleteIfNot;
function isExistDeleteIfNot(fileId,callback){
	getFileById(fileId,function(file){
		if(file || !(file instanceof Error))
			isExistPyshicaly(file.path,function(isExist){
				if(isExist)
					return callback(true);
				else					
				// 	deleteFile(fileId,function(data){
				 		return callback(false);
				// 	});
			});
		else
			return callback(false);
	});

}


function deleteFile(fileId,callback){
	File.findByIdAndRemove({_id: fileId}, function (err, data) {
		if(err || !data)
			return callback(errors.errorDelete());
		return callback(data);
	});
};

function getFileById(fileId,callback){
	File.findOne({_id: fileId}, function(err, file) {
		if (err) 
			return callback(errors.errorNotFound());
		return callback(file);
  	});
};

exports.getFile = getFileById;


exports.getAllByUser = function(userId,callback){	
	File
	.find({ $or:[{sharedUsers: userId},{userOwner: userId}]})
	.populate({path:'userOwner', select:['firstName','lastName','picture']})
    .populate({path:'sharedUsers', select:['firstName','lastName','picture']})
    .exec(function (err, files) {
		if (err) 
			return callback(errors.errorNotFound());

		var owner= [], shared = [];
		for (var i = files.length - 1; i >= 0; i--) {
			if(files[i])
				if(files[i].userOwner._id == userId)
					owner.push(files[i]);
				else
					shared.push(files[i]);
		}

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
exports.updateFileAccess = function(fileId,userId,access,callback){
	User.findOne({_id: userId}, function(err, user) {	
		if(err || !user) 
			return callback(errors.errorNotFound());
		else
			File.findOne({_id: fileId}, function(err, file) {	
				if (err) 
					return callback(errors.errorNotFound());
				var isInArray = file.sharedUsers.some(function (user) {
				    return user==userId;
				});
				if(!isInArray && access=='1')
					file.sharedUsers.push(userId);
				else if(isInArray && access=='0')
					file.sharedUsers.pop(userId);
				file.save(function(err,data){
					if(err)
						return callback(errors.errorUpdate());
					return callback(data);
				});
			});
		
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

exports.renameFile = function(fileId,name,callback){
	 File.findOne({_id: fileId}, function(err, file) {	
		if (err) 
			return callback(errors.errorNotFound());
		file.name = name;
		file.save(function(err,data){
			if(err)
				return callback(errors.errorUpdate());
			return callback(data);
		});
	});
};

exports.deleteFile = deleteFile;
