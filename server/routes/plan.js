//require modules
var express = require('express');
var passport = require('passport');
var router = express.Router();
var planCtrl = require('../controllers/plans');

/////////////////////////////////////////////////////////////////
/*
    Here start the plan routers.
    they are responsible for calling the function in the controller
    and returning a response status
 */
/////////////////////////////////////////////////////////////////

router.get('/All', function(req, res) {
    planCtrl.getAllPlan( function(data){
  		if(data instanceof Error)
  			res.status(500).send(data.message);
  		else
  			res.status(200).send(data);
  	});
});


router.get('/:planId', function(req, res) {
    var id = req.params.planId;
    planCtrl.getPlan(id, function(data){
  		if(data instanceof Error)
  			res.status(500).send(data.message);
  		else
  			res.status(200).send(data);
  	});
});


router.post('/', function(req, res) {
    planCtrl.createPlan(req.body, function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
    });
});


router.put('/:planId', function(req, res) {
    var id = req.params.planId;
    var planJson = req.body;
    planCtrl.updatePlan(id, planJson, function(data){
  		if(data instanceof Error)
  			res.status(500).send(data.message);
  		else
  			res.status(200).send(data);
  	});
});


router.delete('/:planId', function(req, res) {
    planCtrl.deletePlan(req.params.planId, function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
    });
});


module.exports = router;