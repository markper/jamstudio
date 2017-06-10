var Icq = require('../model/icqSchema');
var errors = require('./errors');

exports.getIcq = function(icqId, callback){
       Icq.findOne({_id: icqId})
        .populate({path:'user',select: ['firstName','lastName','email','picture']})
        .exec(function (err, icq) {
            if (err || !project)
                return callback(errors.errorNotFound((err?err:'')));
            else
                return callback(project);
        });
};

exports.getIcqByProject = function(projectId, callback){
       Icq.find({projectId: projectId})
        .populate({path:'applicants.user',select:["firstName","lastName","picture"]})
        .exec(function (err, icq) {
            if (err || !icq)
                return callback(errors.errorNotFound((err?err:'')));
            else
                return callback(icq);
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

exports.jumpIcq = function(icqId, callback){
   Icq.find({_id: icqId})
    .exec(function (err, icq) {
        if (err || !icq)
            return callback(errors.errorNotFound((err?err:'')));
        icq.date = Date.now;
        icq.save(function (err, icq) {
          if(err)
            return callback(errors.errorCreate());
          return callback(icq);
        });
    });
}

exports.deleteIcq = function(icqId, callback){
   Icq.find({_id: icqId})
   .remove()
    .exec(function (err, icq) {
        if (err || !icq)
            return callback(errors.errorNotFound((err?err:'')));
          console.log('aaa');
    });;
}


exports.createIcq = function(icqJson, callback){
  ;
  console.log(JSON.stringify(icqJson));
  var icq = new Icq();
  icq.projectId = icqJson.projectId;
  icq.applicants = icqJson.applicants.slice();
  icq.instruments = icqJson.instruments;
  icq.title = icqJson.title;
  icq.description = icqJson.description;
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
      icq.applicants = icqJson.users,
      icq.title = icqJson.title,
      icq.description = icqJson.description,
      icq.instruments = icqJson.instruments,
      icq.date = {type: Date, default: Date.now}
  		icq.save(function(err, data){
  			if(err)
  				return callback(errors.errorUpdate());
  			return callback(data);
  		});
  	});
};


exports.deleteIcqApplicant = function(icqId,userId,callback){
    Icq.update( {_id:icqId},  { $pull: { "applicants" : { user: userId } } }, function(err, data){
        if(err || !data.nModified) {
            return callback(errors.errorUpdate((err?err:'')));
        }
        return callback(data);
    });
};

exports.addIcqApplicant = function(icqId,applicantJson,callback){
    Icq.update( {_id:icqId}, {$push: {applicants: applicantJson}}, function(err, data){
        if(err || !data.nModified) {
            return callback(errors.errorUpdate((err?err:'')));
        }
        return callback(data);
    });
};

