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

exports.getNotificationByUser = function(userId,type, callback){
  console.log(userId);
  Notification.find({"subscribes.user": userId, "type":type , subscribes: { $elemMatch:{user: userId}}})
  .sort({_id:-1}).limit(3)
  .populate({path:'factor',select: ['firstName','lastName','picture']})
  .populate({path:'subscribes.user',select: ['firstName','lastName','picture']})
  .exec(function (err, notifications) {
    console.log();
    if (err || !notifications) {
      return callback(errors.errorNotFound((err ? err : '')));
    } else {
      return callback(notifications);
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
	var userId = notificationJson['subscribes'];
  delete notificationJson['subscribes'];
  var notification = new Notification(notificationJson);
  notification.subscribes.push({user:userId,read: false});
	notification.save(function (err, notification) {
		if(err)
			return callback(err);
		return callback(notification);
	});
};
