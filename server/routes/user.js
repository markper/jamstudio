var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var userCtrl = require('../controllers/users');
var fs = require("fs");
var path = require('path');
var formidable = require('formidable');
var mkdirp = require('mkdirp');

/* GET logged userId. */
router.get('/getId',/* ensureLoggedIn, */ function(req, res, next) {
	console.log(req.user.id);
});

/* get logged in information */
router.get('/getLogged', ensureLoggedIn,  function(req, res, next) {

	userCtrl.getUser(userCtrl.getUserId(req.user.id),function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
 	});
});

router.put('/picture', function(req, res){
	userCtrl.updateUserPicture(getUserId(req),req.body.picture,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			 res.end(req.body.picture);
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

/* PUT user by id */
router.put('/:userId/Plan/:planId',/* ensureLoggedIn, */function(req, res, next) {
	userCtrl.updateUserPlan(req.params.userId,req.params.planId,function(data){
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

function getUserId(req){
    try{
        return req.user.id.split("|")[1];
    }catch(exc){
        return "";
    }
};

module.exports = router;
