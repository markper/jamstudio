var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var userCtrl = require('../controllers/users');

/* GET logged userId. */
router.get('/getId',/* ensureLoggedIn, */ function(req, res, next) {
	console.log(req.user.id);
});

/* get logged in information */
router.get('/getInfo', ensureLoggedIn,  function(req, res, next) {
	
	userCtrl.getUser(userCtrl.getUserId(req.user.id),function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);	
		else
			res.status(200).send(data);
 	});
});

/* GET user by id */
router.get('/:userId',/* ensureLoggedIn, */function(req, res, next) {
 	userCtrl.getUser(req.params.userId,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);	
		else
			res.status(200).send(data);
 	});
});

/* GET user list */
router.get('/GetList/:prefix',/* ensureLoggedIn, */function(req, res, next) {
 	userCtrl.getUsersByPrefix(req.params.prefix,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);	
		else
			res.status(200).send(data);
 	});
});

/* PUT user by id */
router.put('/:userId',/* ensureLoggedIn, */function(req, res, next) {
	userCtrl.updateUser(req.params.userId,req.body,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);	
		else
			res.status(200).send(data);
 	});

});

/* POST user */
router.post('/',function(req, res, next) {
	userCtrl.createUser(req.body,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);	
		else
			res.status(200).send(data);
 	});
});

/* DELETE user */
router.delete('/:userId', /* ensureLoggedIn, */function(req, res, next) {
	userCtrl.deleteUser(req.params.userId,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);	
		else
			res.status(200).send(data);
 	});
});

module.exports = router;
