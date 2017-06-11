exports.errorPermitions = function(info){
	return new Error('error: you are not permited to do this action.\n '+ info);
};

exports.errorNotFound = function(info){
	return new Error('error: object not found.\n '+ info);
};

exports.errorUpdate = function(info){
	return new Error('error: object not updated.\n '+ info);
};

exports.errorDelete = function(info){
	return new Error('error: object not deleted.\n '+ info);
};

exports.errorCreate = function(info){
	return new Error('error: object not created.\n '+ info);
};

exports.errorSave = function(info){
	return new Error('error: object not saved.\n '+ info);
};
