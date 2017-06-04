<<<<<<< HEAD
var Icq = require('../model/icqSchema');
var errors = require('./errors');

exports.getIcq = function(icqId, callback){
  Icq.findOne({_id: icqId}, function(err, cq) {
    if (err || !cq) {
      return callback(errors.errorNotFound((err ? err : '')));
    } else {
      return callback(cq);
    }
  });
};


exports.getIcqByInstrument = function(instruments, callback){
  Icq.find({instruments: { $in: instruments}}, function(err, cq) {
    if (err || !cq) {
      return callback(errors.errorNotFound((err ? err : '')));
    } else {
      return callback(cq);
    }
  });
};

exports.createIcq = function(icqJson, callback){
  var icq = new Icq(icqJson);
	icq.save(function (err, icq) {
		if(err)
			return callback(errors.errorCreate());
		return callback(icq);
	});
};


exports.updateIcq = function(icqId, icqJson, callback){
    Icq.findOne({_id: icqId}, function(err, icq) {
      if (err || !icq) {
        return callback(errors.errorNotFound((err ? err : '')));
      }
      icq.genre = icqJson.genre;
      icq.instruments = icqJson.instruments;
      icq.date = icqJson.date;
  		icq.save(function(err, data){
  			if(err)
  				return callback(errors.errorUpdate());
  			return callback(data);
  		});
  	});
};


exports.deleteIcq = function(icqId,callback) {
	Icq.findByIdAndRemove({_id: icqId}, function (err, icq) {
		if(err || !icq)
			return callback(errors.errorDelete());
		return callback(icq);
	});
}
=======
var Icq = require('../model/icqSchema');
var errors = require('./errors');

exports.getIcq = function(icqId, callback){
  Icq.findOne({_id: icqId}, function(err, cq) {
    if (err || !cq) {
      return callback(errors.errorNotFound((err ? err : '')));
    } else {
      return callback(cq);
    }
  });
};


exports.getIcqByInstrument = function(instruments, callback){
  Icq.find({instruments: { $in: instruments}}, function(err, cq) {
    if (err || !cq) {
      return callback(errors.errorNotFound((err ? err : '')));
    } else {
      return callback(cq);
    }
  });
};

exports.createIcq = function(icqJson, callback){
  var icq = new Icq(icqJson);
	icq.save(function (err, icq) {
		if(err)
			return callback(errors.errorCreate());
		return callback(icq);
	});
};


exports.updateIcq = function(icqId, icqJson, callback){
    Icq.findOne({_id: icqId}, function(err, icq) {
      if (err || !icq) {
        return callback(errors.errorNotFound((err ? err : '')));
      }
      icq.genre = icqJson.genre;
      icq.instruments = icqJson.instruments;
      icq.date = icqJson.date;
  		icq.save(function(err, data){
  			if(err)
  				return callback(errors.errorUpdate());
  			return callback(data);
  		});
  	});
};


exports.deleteIcq = function(icqId,callback) {
	Icq.findByIdAndRemove({_id: icqId}, function (err, icq) {
		if(err || !icq)
			return callback(errors.errorDelete());
		return callback(icq);
	});
}
>>>>>>> 5c59ec51e2fb0a1538b08d9f3c9b366c6cde8e2a
