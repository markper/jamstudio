var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();


var currentUser;

/* GET user profile. */
router.get('/', ensureLoggedIn, function(req, res, next) {
  currentUser = req.user;
  res.render('user', { user: req.user });
});

/* GET user profile. */
router.get('/getId', ensureLoggedIn, function(req, res, next) {
	console.log(req.user.id);
});

module.exports = router;
