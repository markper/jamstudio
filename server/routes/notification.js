//require modules
var express = require('express');
var passport = require('passport');
var router = express.Router();
var notificationCtrl = require('../controllers/notifications');


/////////////////////////////////////////////////////////////////
/*
    Here start the notification routers.
    they are responsible for calling the function in the controller
    and returning a response status
 */
/////////////////////////////////////////////////////////////////

router.post('/', function(req, res) {
	notificationCtrl.newNotification(req.body, function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
	});
});


router.get('/:notificationId', function(req, res) {
	var notificationId = req.params.notificationId;
    notificationCtrl.getNotification(notificationId, function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
	});
});


router.get('/GetList/:userId/:type', function(req, res) {
	notificationCtrl.getNotificationByUser(req.params.userId,req.params.type, function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
	});
});


router.put('/:notificationId/ReadByUser/:userId', function(req, res) {
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