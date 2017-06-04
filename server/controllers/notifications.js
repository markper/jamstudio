var Notification = require('../model/notificationSchema');
var errors = require('./errors');

exports.getNotification = function(notificationId, callback){
  Notification.findOne({_id:notificationId})
	.populate({path:'factor',select: ['firstName','lastName']})
	.exec(function (err, notification) {
    if (err || !notification) {
      return callback(errors.errorNotFound((err ? err : '')));
    } else {
      return callback(notification);
    }
	});
};

exports.getNotificationByUser = function(userId, callback){
  Notification.findOne({"subscribes.user": userId})
  .populate({path:'factor',select: ['firstName','lastName']})
  .populate({path:'subscribes.user',select: ['firstName','lastName']})
  .exec(function (err, notification) {
    if (err || !notification) {
      return callback(errors.errorNotFound((err ? err : '')));
    } else {
      return callback(notification);
    }
	});
};

exports.updateNotificationStatus = function(notificationId, userId, callback) {
  Notification.update( {_id: notificationId, subscribes: { $elemMatch:{user: userId}}},
  {$set: {"subscribes.$.read": true}}, function(err, data) {
    if (err || !data) {
      return callback(errors.errorNotFound((err ? err : '')));
    }
    return callback(data);
  });
};

exports.newNotification = function(notificationJson,callback){
	var notification = new Notification(notificationJson);
	notification.save(function (err, notification) {
		if(err)
			return callback(errors.errorCreate());
		return callback(notification);
	});
};
