<<<<<<< HEAD
var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var Plan = require('../model/planSchema');  // get our mongoose model
var planCtrl = require('../controllers/plans');

router.get('/:planId', /*ensureLoggedIn*/ function(req, res, next) {
    var id = req.params.planId;
    planCtrl.getPlan(id, function(data){
  		if(data instanceof Error)
  			res.status(500).send(data.message);
  		else
  			res.status(200).send(data);
  	});
});


router.post('/', function(req, res, next) {
  planCtrl.createPlan(req.body, function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
  });
});

router.put('/:planId',/* ensureLoggedIn,*/ function(req, res, next) {
    var id = req.params.planId;
    var planJson = req.body;
    planCtrl.updatePlan(id, planJson, function(data){
  		if(data instanceof Error)
  			res.status(500).send(data.message);
  		else
  			res.status(200).send(data);
  	});
});

router.delete('/:planId', /* ensureLoggedIn, */function(req, res, next) {
    planCtrl.deletePlan(req.params.planId, function(data){
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
var Plan = require('../model/planSchema');  // get our mongoose model
var planCtrl = require('../controllers/plans');

router.get('/:planId', /*ensureLoggedIn*/ function(req, res, next) {
    var id = req.params.planId;
    planCtrl.getPlan(id, function(data){
  		if(data instanceof Error)
  			res.status(500).send(data.message);
  		else
  			res.status(200).send(data);
  	});
});


router.post('/', function(req, res, next) {
  planCtrl.createPlan(req.body, function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
  });
});

router.put('/:planId',/* ensureLoggedIn,*/ function(req, res, next) {
    var id = req.params.planId;
    var planJson = req.body;
    planCtrl.updatePlan(id, planJson, function(data){
  		if(data instanceof Error)
  			res.status(500).send(data.message);
  		else
  			res.status(200).send(data);
  	});
});

router.delete('/:planId', /* ensureLoggedIn, */function(req, res, next) {
    planCtrl.deletePlan(req.params.planId, function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
    });
});


module.exports = router;
>>>>>>> 5c59ec51e2fb0a1538b08d9f3c9b366c6cde8e2a
