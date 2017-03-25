var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();

/* GET project. */
router.get('/', ensureLoggedIn, function(req, res, next) {
  currentUser = req.user;
  res.render('project', { user: req.user });
});

/* GET - Remove user from project. */
router.get('/:projectId/removeUser/:userToDelete',ensureLoggedIn, function(req, res, next) {
	var userId =  getUserID(req);
	var projectId = req.params.projectId;
	var userToDelete = req.params.userToDelete;
	// check if has permissions
	if(isPermissioned(userId)){
		res.render('test1', { userId: userId,projectId: projectId,userToDelete:userToDelete});
	}else{
		res.render('error', { error: {stack: getUserID(req) + ' not auth'} });
	}
});

function isPermissioned(user){
	if(user=="58b898af734d1d10ff5f4aec"){
		return true;
	}
	return false;
}

function getUserID(req){
	return req.user.identities[0].user_id;
}

module.exports = router;
