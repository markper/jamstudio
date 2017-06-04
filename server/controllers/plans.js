var Plan = require('../model/planSchema');
var errors = require('./errors');


exports.getPlan = function(planId, callback) {
  Plan.findOne({_id: planId}, function(err, plans) {
    if (err || !plans) {
      return callback(errors.errorNotFound((err ? err : '')));
    } else {
      return callback(plans);
    }
  });
};

exports.createPlan = function(planJson, callback){
  var plan = new Plan(planJson);
	plan.save(function (err, plan) {
		if(err)
			return callback(errors.errorCreate());
		return callback(plan);
	});
};

exports.updatePlan = function(planId, planJson, callback) {
  Plan.findOne({_id: planId}, function(err, plan) {
    if (err || !plan) {
      return callback(errors.errorNotFound((err ? err : '')));
    } else {
      plan.planId = planJson.planId;
      plan.name = planJson.name;
      plan.description = planJson.description;
      plan.repositories_amount = planJson.repositories_amount;
      plan.storage_capacity = planJson.storage_capacity;
      plan.setting_bounds = planJson.setting_bounds;
      plan.save();
      plan.save(function(err,data){
  			if(err)
  				return callback(errors.errorUpdate());
  			return callback(data);
      });
    }
  });
};

exports.deletePlan = function(planId,callback){
	Plan.findByIdAndRemove({_id: planId}, function (err, data) {
		if(err || !data)
			return callback(errors.errorDelete());
		return callback(data);
	});
};
