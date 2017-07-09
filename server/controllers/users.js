var User =  require('../model/userSchema');
var errors = require('./errors');

exports.getUser = function(userId,callback){
	User.findOne({_id: userId}, function(err, user) {
		if (err)
			return callback(errors.errorNotFound());
		return callback(user);
  	});
};

exports.getUserId = function(fullUserId){
	return fullUserId.split("|")[1];
};

exports.getUsersByPrefix = function(prefix,callback){
    var regex = '/'+ prefix +'/i';
	User.find({$or:[
		{"firstName": new RegExp('^'+prefix, "i")},
		{"lastName": new RegExp('^'+prefix, "i")}
		]}
		, function(err, users) {
		if (err)
			return callback(errors.errorNotFound());
		return callback(users);
  	});
};

exports.updateUserPicture = function(userId,picture,callback){
    User.findOne({_id: userId}, function(err, user) {
		if(err)
			return callback(errors.errorNotFound());
		user.picture = picture;
		user.save(function(err,data){
			if(err)
				return callback(errors.errorUpdate());
			return callback(data);
		});
	});
};

exports.updateUser = function(userId,userJson,callback){
    User.findOne({_id: userId}, function(err, user) {
		if(err)
			return callback(errors.errorNotFound());
		user.firstName = userJson.firstName;
		user.lastName = userJson.lastName;
		user.email = userJson.email;
		user.password = userJson.password;
		user.picture = userJson.picture;
		user.planId = userJson.planId;
		user.storage_usage = userJson.storage_usage;
		user.save(function(err,data){
			if(err)
				return callback(errors.errorUpdate());
			return callback(data);
		});
	});
};

exports.updateUserPlan = function(userId,planId,callback){
    User.findOne({_id: userId}, function(err, user) {
		if(err)
			return callback(errors.errorNotFound());
		user.planId = planId;
		user.save(function(err,data){
			if(err)
				return callback(errors.errorUpdate());
			return callback(data);
		});
	});
};

exports.createUser = function(userJson,callback) {
	var user = new User(userJson);
	if("undefined" === typeof userJson.picture)
		user.picture = 'https://oran1.herokuapp.com/uploads/user/profile.png';
	user.save(function (err, savedUser) {
		if(err)
			return callback(errors.errorCreate());
		return callback(savedUser);
	});
}

exports.deleteUser = function(userId,callback) {
	User.findByIdAndRemove({_id: userId}, function (err, user) {
		if(err || !user)
			return callback(errors.errorDelete());
		return callback(user);
	});
}
