var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var Plan = require('../model/planSchema');  // get our mongoose model

/* GET project. */
router.get('/:planId', ensureLoggedIn, function(req, res, next) {
    //res.send('hello mark');
    // we're connected!
    var id = req.params.planId;
    Plan.find({_id: id}, function(err, plans) {
      if (err) {
        res.send("error");
      } else {
        res.send(plans);
      }
  });
});

router.post('/', function(req, res, next) {
  var plan = new Plan(req.body);
  plan.save(function (err, createdPlanObject) {
      if (err) {
          res.send(err);
      }
      // This createdPlanObject is the same one we saved, but after Mongo
      // added its additional properties like _id.
      res.send(createdPlanObject);
  });
});

router.put('/:planId',/* ensureLoggedIn,*/ function(req, res, next) {
    var id = req.params.planId;
    var planJson = req.body;
    Plan.findOne({_id: id}, function(err, plan) {
      if (err) {
        res.send(err);
      } else {
        plan.planId = planJson.planId;
        plan.name = planJson.name;
        plan.description = planJson.description;
        plan.repositories_amount = planJson.repositories_amount;
        plan.storage_capacity = planJson.storage_capacity;
        plan.setting_bounds = planJson.setting_bounds;
        plan.save();
        res.send(plan);
      }
  });
});

router.delete('/:planId', function(req, res, next) {
  Plan.findByIdAndRemove({_id: req.params.planId}, function (err, plan) {
    if(err)
      res.send('failed');
    else
      res.send('ok');
  });
});


module.exports = router;
