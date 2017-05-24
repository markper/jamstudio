var File = require('../model/fileSchema');

exports.getFile = function(fileId,callback){
	File.findOne({_id: fileId}, function(err, file) {
		if (err) 
			callback(err);
		else
			callback(file);
  	});
};