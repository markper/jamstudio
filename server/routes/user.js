var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var User = require('../model/userSchema');


/* GET user by id */
router.get('/:userId',/* ensureLoggedIn, */function(req, res, next) {
    var id = req.params.userId;
	User.find({_id: id}, function(err, user) {
		if (err) 
			res.send("error");
		res.send(user);
  	});
});

/* GET logged userId. */
router.get('/getId',/* ensureLoggedIn, */ function(req, res, next) {
	console.log(req.user.id);
});

/* PUT user by id */
router.put('/:userId',/* ensureLoggedIn, */function(req, res, next) {
    var id = req.params.userId;
    var userJson = req.body;
    User.findOne({_id: id}, function(err, user) {	
		if (err) 
        	res.send(err);

		user.userId = userJson.userId;
		user.firstName = userJson.firstName;
		user.lastName = userJson.lastName;
		user.email = userJson.email;
		user.password = userJson.password;
		user.picture = userJson.picture;
		user.planId = userJson.planId;
		user.storage_usage = userJson.storage_usage;
		user.save();
		res.send(user);

	});
});

/* POST user */
router.post('/',function(req, res, next) {
	var user = new User(req.body);
	user.save(function (err, savedUser) {
		if (err)
			res.send(err);
		res.send(savedUser);
	});
});

/* DELETE user */

router.delete('/:userId', /* ensureLoggedIn, */function(req, res, next) {
	User.findByIdAndRemove({_id: req.params.userId}, function (err, plan) {
		if(err)
			res.send('failed');
		res.send('ok');
	});
});

module.exports = router;
