var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var Request   = require('../model/requestSchema');  // get our mongoose model

/* GET project. */
router.get('/', ensureLoggedIn, function(req, res, next) {
    res.send('hello mark');
});

/*
* deleted. will be implemented by mark
* */

module.exports = router;