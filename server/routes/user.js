//require modules
var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var userCtrl = require('../controllers/users');
var fs = require("fs");


/* spread the user id from the request*/
function getUserId(req){
    try{
        return req.user.id.split("|")[1];
    }catch(exc){
        return "";
    }
}

/////////////////////////////////////////////////////////////////
/*
    Here start the users routers.
    they are responsible for calling the function in the controller
    and returning a response status
 */
/////////////////////////////////////////////////////////////////

/* GET logged userId. */
router.get('/getId', function(req, res) {
	console.log(req.user.id);
});


/* get logged in information */
router.get('/getLogged', ensureLoggedIn,  function(req, res) {
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
router.get('/:userId',function(req, res) {
 	userCtrl.getUser(req.params.userId,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
 	});
});


/* GET user list */
router.get('/GetList/:prefix',function(req, res) {
 	userCtrl.getUsersByPrefix(req.params.prefix,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
 	});
});


/* PUT user by id */
router.put('/:userId',function(req, res) {
	userCtrl.updateUser(req.params.userId,req.body,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
 	});
});


/* PUT user by id */
router.put('/:userId/Plan/:planId',function(req, res) {
	userCtrl.updateUserPlan(req.params.userId,req.params.planId,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
 	});
});


/* POST user */
router.post('/',function(req, res) {
	userCtrl.createUser(req.body,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
 	});
});


/* DELETE user */
router.delete('/:userId', function(req, res) {
	userCtrl.deleteUser(req.params.userId,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
 	});
});


module.exports = router;