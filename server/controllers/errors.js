exports.errorPermitions = function(){
	return new Error('error: you are not permited to do this action..');
};

exports.errorNotFound = function(){
	return new Error('error: object not found');
};

exports.errorUpdate = function(){
	return new Error('error: object not updated');
};

exports.errorDelete = function(){
	return new Error('error: object not deleted');
};

exports.errorCreate = function(){
	return new Error('error: object not created');
};