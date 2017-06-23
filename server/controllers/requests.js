var Request = require('../model/requestSchema');
var errors = require('./errors');

exports.getRequest = function(requestId, callback) {
  Request.findOne({_id: requestId})
  .populate({path: 'user', select: ['firstName','lastName', 'picture', 'userId'] })
  .exec(function(err, requests) {
    if (err || !requests) {
      return callback(errors.errorNotFound((err ? err : '')));
    } else {
      return callback(requests);
    }
  });
};

exports.getRequestByAdmin = function(userId, callback) {
  Request.findOne({'projectId.adminUser._id': userId})
  .populate({path: 'user', select: ['firstName','lastName', 'picture', 'userId'] })
  .exec(function(err, requests) {
    if (err || !requests) {
      return callback(errors.errorNotFound((err ? err : '')));
    } else {
      return callback(requests);
    }
  });
};

exports.updateRequest = function(requestId, reqJson, callback) {
  Request.findOne({_id: requestId}, function(err, request) {
    if (err || !request) {
      return callback(errors.errorNotFound((err ? err : '')));
    } else {
      request.projectId = reqJson.projectId;
      request.status = reqJson.status;
      request.userId = reqJson.userId;
      request.save();
      request.save(function(err,data){
  			if(err)
  				return callback(errors.errorUpdate());
  			return callback(data);
      });
    }
  });
};

exports.createRequest = function(requestJson,callback){
	var request = new Request(requestJson);
	request.save(function (err, request) {
		if(err)
			return callback(errors.errorCreate());
		return callback(request);
	});
};


exports.deleteRequest = function(requestId,callback){
	Request.findByIdAndRemove({_id: requestId}, function (err, data) {
		if(err || !data)
			return callback(errors.errorDelete());
		return callback(data);
	});
};


exports.updateRequestStatus = function(requestId, status, callback) {
  Request.update( {_id: requestId}, {$set:{status: status}}, function(err, request) {
    if (err || !request) {
      return callback(errors.errorNotFound((err ? err : '')));
    } else {
  			if(err)
  				return callback(errors.errorUpdate());
  			return callback(request);
      }
    });
  };

