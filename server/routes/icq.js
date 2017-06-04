<<<<<<< HEAD
var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var icqCtrl = require('../controllers/icqs');
var Project = require('../model/projectSchema');  // get our mongoose model
var User = require('../model/userSchema');  // get our mongoose model

/* GET - icq. */
router.get('/:icqId', function(req, res, next) {
	var icqId = req.params.icqId;
  icqCtrl.getIcq(icqId, function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
	});
});

router.get('/instruments/:list', function(req, res, next) {
	var instruments = req.params.list;
  icqCtrl.getIcqByInstrument( instruments.split(','), function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
	});
});

router.post('/', function(req, res, next) {
	icqCtrl.createIcq(req.body, function(data){
	if(data instanceof Error)
		res.status(500).send(data.message);
	else
		res.status(200).send(data);
	});
});

router.put('/:icqId',/* ensureLoggedIn, */function(req, res, next) {
	icqCtrl.updateIcq(req.params.icqId, req.body, function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
 	});
});

router.delete('/:icqId', /* ensureLoggedIn, */function(req, res, next) {
	icqCtrl.deleteIcq(req.params.icqId, function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
 	});
});

module.exports = router;
=======
var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var icqCtrl = require('../controllers/icqs');
var Project = require('../model/projectSchema');  // get our mongoose model
var User = require('../model/userSchema');  // get our mongoose model

/* GET - icq. */
router.get('/:icqId', function(req, res, next) {
	var icqId = req.params.icqId;
  icqCtrl.getIcq(icqId, function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
	});
});

router.get('/instruments/:list', function(req, res, next) {
	var instruments = req.params.list;
  icqCtrl.getIcqByInstrument( instruments.split(','), function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
	});
});

router.post('/', function(req, res, next) {
	icqCtrl.createIcq(req.body, function(data){
	if(data instanceof Error)
		res.status(500).send(data.message);
	else
		res.status(200).send(data);
	});
});

router.put('/:icqId',/* ensureLoggedIn, */function(req, res, next) {
	icqCtrl.updateIcq(req.params.icqId, req.body, function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
 	});
});

router.delete('/:icqId', /* ensureLoggedIn, */function(req, res, next) {
	icqCtrl.deleteIcq(req.params.icqId, function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
 	});
});

module.exports = router;
>>>>>>> 5c59ec51e2fb0a1538b08d9f3c9b366c6cde8e2a
