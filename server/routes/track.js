var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var Track = require('../model/trackSchema');  // get our mongoose model

var bodyParser  = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

/* GET project. */
router.get('/', ensureLoggedIn, function(req, res, next) {
    res.send('hello maoz');
});


/* get specific request */
router.get('/track', function(req, res) {
    // todo - need to implement
    res.send('hello world');
});


/* create new request function */
router.post('/track', function(req, res) {
    // get params
    var trackId = req.body.trackid;
    var name = req.body.name;
    var description = req.body.des;
    // request structure
    var newTrack = new Track({
         trackId:'',
         name:'',
         description:'',
         projectId: '',
         genre: '',
         version: '',
         channels: []
    });
    //set structure
    newTrack.trackId = trackId;
    newTrack.name = name;
    newTrack.description = description;
    console.log(newTrack);
    // save to database
    newPlan.save(function(err) {
        if (err) throw err;
        console.log('Track was added successfully');
        // res.json({ success: true });

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
router.put('jam/updatePlan:_id', function(req, res) {
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