var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var Notification = require('../model/notificationSchema');  // get our mongoose model
var Project = require('../model/projectSchema');  // get our mongoose model
var User = require('../model/userSchema');  // get our mongoose model

/* POST - notification. */
router.post('/', function(req, res, next) {
	var notification = new Notification(req.body);
	notification.save();
	res.send(notification);
});

/* GET - notification. */
router.get('/:notificationId', function(req, res, next) {
	var notificationId = req.params.notificationId;
	Notification
	.findOne({_id:notificationId})
	.populate({path:'factor',select: ['firstName','lastName']})
	.exec(function (err, notification) {
	  if (!err)
		 res.send(notification);
	  else
	  	res.send('error');
	});
});

router.get('/GetList/:userId', function(req, res, next) {
	var userId = req.params.userId;
	Notification
	.findOne({"subscribes.user": userId})
	.populate({path:'factor',select: ['firstName','lastName']})
  .populate({path:'subscribes.user',select: ['firstName','lastName']})
	.exec(function (err, notification) {
	  if (!err)
		 res.send(notification);
	  else
	  	res.send('error');
	});
});

router.put('/:notificationId/ReadByUser/:userId'/*,ensureLoggedIn*/, function(req, res, next) {

    var notificationId = req.params.notificationId;
    var userId = req.params.userId;
    req.body._id = userId;
    Notification.update( {_id: notificationId, subscribes: { $elemMatch:{user: userId}}},
    {$set: {"subscribes.$.read": true}}, function(err, notification){
        if(err) {
            return res.status(500).json({'error' : 'error in changing read flag'});
        }
        res.json(notification);

    });

});


module.exports = router;
