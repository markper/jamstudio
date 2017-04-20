var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var Request   = require('../model/requestSchema');  // get our mongoose model


/*  */
router.get('/request', function(req, res) {
    res.redirect('http://localhost/jam/request'); // for now will just redirect back to request page
});


/* create new request function */
router.post('/request', function(req, res) {
    // get params
    var reqPro = req.body.projectid;
    var reqUser = req.body.userid;
    var reqStat = req.body.status;
    // request structure
    var tempReq = new Request({
        projectId : '',
        userId: '',
        status: ''
    });
    //set structure
    tempReq.projectId = reqPro;
    tempReq.userId = reqUser;
    tempReq.status = reqStat;
    //console.log(tempUser);
    // save to database
    tempReq.save(function(err) {
        if (err) throw err;
        console.log('Request was added successfully');
        res.json({ success: true });
        //res.redirect('http://localhost/jam/request');
    });
});


/* delete request */
router.post('/deleteRequest', function(req, res) {
    // get params
    var reqId = req.body.requestId;
    Request.findOne({
        request: req.body._id
    }, function(err, request) {
        if (err) throw err;
        if (!request) {
            res.json({ success: false, message: 'Request not found.'});
        }
        if(request._id === reqId){
            request.remove(function(err) {
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
router.put('/deleteRequest:_id', function(req, res) {
    Request.findOne(req.params._id, function(err,request){
        if (err) res.send(err);
        request.status = req.body.status;
        request.save(function(err){
           if (err) res.send(err);
           res.json({ message: "update request"});
        });
    });
});


module.exports = router;