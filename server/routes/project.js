var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var Project   = require('../model/projectSchema');  // get our mongoose model


/* GET project. */
router.get('/', ensureLoggedIn, function(req, res, next) {
  res.send('hello world');
});


function isPermission(user){
    return user==="58b898af734d1d10ff5f4aec";
}

function getUserID(req){
    return req.user.identities[0].user_id;
}


/* GET - Remove user from project. */
router.get('/:projectId/removeUser/:userToDelete',ensureLoggedIn, function(req, res, next) {
	var userId =  getUserID(req);
	var projectId = req.params.projectId;
	var userToDelete = req.params.userToDelete;
	// check if has permissions
	if(isPermission(userId)){
		res.render('test1', { userId: userId,projectId: projectId,userToDelete:userToDelete});
	}else{
		res.render('error', { error: {stack: getUserID(req) + ' not auth'} });
	}
});


/* todo - Will be implemented by maoz, need to touch oran's code so its on hold. */

module.exports = router;
