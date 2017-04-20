var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var Plan   = require('../model/planSchema');  // get our mongoose model


/* get specific request */
router.get('/plan:_id', function(req, res) {
    res.redirect('http://localhost/jam/plan'); // for now will just redirect back to plan page
});


/* create new request function */
router.post('/plan', function(req, res) {
    // get params
    var planId = req.body.planId;
    var name = req.body.name;
    var description = req.body.description;
    // request structure
    var newPlan = new Plan({
        planId : '',
        name: '',
        description: ''
    });
    //set structure
    newPlan.planId = planId;
    newPlan.name = name;
    newPlan.description = description;
    //console.log(newPlan);
    // save to database
    newPlan.save(function(err) {
        if (err) throw err;
        console.log('Plan was added successfully');
        res.json({ success: true });
        //res.redirect('http://localhost/jam/plan');
    });
});


/* delete request */
router.post('/deletePlan', function(req, res) {
    // get params
    var planId = req.body.planId;
    Plan.findOne({
        plan: req.body.planId
    }, function(err, plan) {
        if (err) throw err;
        if (!plan) {
            res.json({ success: false, message: 'plan not found.'});
        }
        if(plan.planId === planId){
            plan.remove(function(err) {
                if (err) throw err;
                console.log('User was removed successfully');
                res.json({ success: true });
                //res.redirect('http://localhost/jam/request');
            });
        }else{
            res.json({ success: false, message: 'Can not delete request, call 911.'});
        }
    });
});


/* update request */
router.put('/updatePlan:_id', function(req, res) {
    Plan.findOne(req.params.planId, function(err,plan){
        if (err) res.send(err);
        plan.storage_capacity += req.body.storage_capacity;
        plan.save(function(err){
            if (err) res.send(err);
            res.json({ message: "update plan"});
        });
    });
});


module.exports = router;