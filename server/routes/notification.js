var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var Notification = require('../model/notificationSchema');  // get our mongoose model
var Project = require('../model/projectSchema');  // get our mongoose model
var User = require('../model/userSchema');  // get our mongoose model
var notificationCtrl = require('../controllers/notifications');

/* POST - notification. */
router.post('/', function(req, res, next) {
	notificationCtrl.newNotification(req.body, function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
	});
});

/* GET - notification. */
// done controllers
router.get('/:notificationId', function(req, res, next) {
	var notificationId = req.params.notificationId;
  notificationCtrl.getNotification(notificationId, function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
	});
});

// done controllers
router.get('/GetList/:userId/:type', function(req, res, next) {
	notificationCtrl.getNotificationByUser(req.params.userId,req.params.type, function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
	});
});

router.put('/:notificationId/ReadByUser/:userId'/*,ensureLoggedIn*/, function(req, res, next) {

    var notificationId = req.params.notificationId;
    var userId = req.params.userId;
    req.body._id = userId;
		notificationCtrl.updateNotificationStatus(notificationId, userId, function(data) {
			if(data instanceof Error)
				res.status(500).send(data.message);
			else
				res.status(200).send(data);
		});
});


module.exports = router;
