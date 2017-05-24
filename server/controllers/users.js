var User =  require('../model/userSchema');

exports.getUser = function(userId,callback){
	User.findOne({_id: userId}, function(err, user) {
		if (err) 
			callback(err);
		else
			callback(user);
  	});
};