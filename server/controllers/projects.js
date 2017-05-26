var Project = require('../model/projectSchema');
var User = require('../model/userSchema');
var errors = require('./errors')

exports.createProject =  function(projectJson,callback){
	var project = new Project(projectJson);
    project.save(function(err) {
        if (err) 
        	return callback(errors.errorCreate((err?err:'')));
        return callback(project);
    });
};


exports.getProject =  function(projectId,callback){
    Project
        .findOne({_id:projectId})
        .populate({path:'adminUser',select: ['firstName','lastName']})
        .populate({path:'tracks'})
        .populate({path:'issues'})
        .populate({path:'users.user'})
        .exec(function (err, project) {
            if (err || !project)
        		return callback(errors.errorNotFound((err?err:'')));
            else
        		return callback(project);
        });
};

exports.deleteProject = function(projectId,callback){
	Project.findOne( {_id:projectId}, function(err, project){
		if(err || !project)
    		return callback(errors.errorNotFound((err?err:'')));
    	else
	    	project.remove(function(err,project){
	    		if(err)
	    			return callback(errors.errorDelete((err?err:'')));
	    		return callback(project);
	    	});
	});
};

exports.getVersions = function(projectId,callback){
    Project
    .findOne({_id:projectId})
    .select(["tracks"])
    .populate({path:'tracks',select:['trackId','projectId','name','description','genre','version']})
    .exec(function (err, versions) {
        if (err || !versions)
    		return callback(errors.errorNotFound((err?err:'')));
        else
    		return callback(versions);
    });
};

exports.getListOfUser = function(userId,callback){
	Project
    .find({adminUser:userId})
    .select(["name","_id","description","adminUser","users","genre"])
    .populate({path:'adminUser',select: ['firstName','lastName']})
    .populate({path:'users',select:['_id','firstName','lastName']})
    .exec(function (err, adminProjects) {
        if (err)
        	return callback(errors.errorNotFound((err?err:'')));
         Project
        .find({ adminUser:{ $ne: userId },users: { $elemMatch: { user:userId } } })
        .select(["name","_id","description","adminUser","users","genre"])
        .populate({path:'adminUser',select: ['firstName','lastName']})
        .populate({path:'users',select:['_id','firstName','lastName']})
        .exec(function (err, contributorProject) {
            if (err)
        		return callback(errors.errorUpdate((err?err:'')));
            else
                return callback({'admin':adminProjects, 'contributor': contributorProject});
        });
  

    });
};

exports.updateProject =  function(projectId,projectJson,callback){
    Project.update( {_id:projectId}, {
    "adminUser": projectJson.adminUser,
    "name": projectJson.name,
    "description": projectJson.description,
    "genre": projectJson.genre,
    "track_version": projectJson.track_version,
    "users": projectJson.users,
    "issues": projectJson.issues,
    "tracks": projectJson.tracks
    }, function(err, data){
        if (err)
            return callback(errors.errorNotFound((err?err:'')));
        else
            return callback(data);
    });
};

exports.updateProjectVersion =  function(projectId,trackId,callback){
    Project.update( {_id:projectId}, {track_version:trackId}, function(err, data){
        if (err)
    		return callback(errors.errorNotFound((err?err:'')));
        else
    		return callback(data);
    });
};

exports.addUser = function(projectId,userId,access,callback){
	User.findOne({_id:userId},function(err,user){
		console.log(user);
		if(err || !user)
            return callback(errors.errorNotFound((err?err:'')));
        else
            Project.update( {_id:projectId,'users.user': { $ne: userId }}, {$push: {users: {user:userId,access:access}}}, function(err, data){
		        if(err) 
		            return callback(errors.errorUpdate((err?err:'')));
		        return callback(data);
		    });
	});
};

exports.deleteUser = function(projectId,userId,callback){
	User.findOne({_id:userId},function(err,user){
		console.log(user);
		if(err || !user)
            return callback(errors.errorNotFound((err?err:'')));
        else
	        Project.findOne( {_id:projectId}, function(err, project){
				if(err || !project)
            		return callback(errors.errorNotFound((err?err:'')));
            	else
            		project.remove(function(err,data){
				        if(err)
            				return callback(errors.errorDelete((err?err:'')));
				        else
				            return callback(data);
				    });
		    });
	});
};


exports.updateUserAccess =  function(projectId,userId,access,callback){
    Project.update( {_id:projectId,users: { $elemMatch: { user:userId } }},  { $set:{ "users.$.access":access }}, function(err, data){
 		if(err)
            return callback(errors.errorUpdate((err?err:'')));
        return callback(data);
    });
};

exports.getContributors = function(projectId,callback){
	Project
    .findOne( {_id:projectId})
    .select(["users"])
    .populate({path:'users.user',select:['firstName','lastName','picture']})
    .exec(function(err, data)
    {
 		if(err)
            return callback(errors.errorNotFound((err?err:'')));
        return callback(data);

    });
};

exports.addIssue = function(projectId,issueJson,callback){
	Project.
    findOne({_id:projectId},function(err,project){
		if(err || !project)
            return callback(errors.errorNotFound((err?err:'')));
        project.issues.push(issueJson);
        project.save(function(err,data){
	 		if(err)
	            return callback(errors.errorUpdate((err?err:'')));
	        return callback(data);
        });
    });
};

exports.getIssue = function(projectId,issueId,callback){
	Project
	.findOne({_id:projectId}, {issues: { $elemMatch: { _id : issueId } } } )
	.exec(function (err, project) {
 		if(err || !project || !project.issues[0])
            return callback(errors.errorNotFound((err?err:'')));
        return callback(project.issues[0]);
	});
};

exports.deleteIssue = function(projectId,issueId,callback){
    Project.update( {_id:projectId}, {$pull: {issues: {_id:issueId}}}, function(err, data){
        if(err || !data)
            return callback(errors.errorNotFound((err?err:'')));
        return callback(data);
    });
};

exports.updateIssue = function(projectId,issueId,issueJson,callback){    
    Project.update( {_id:projectId,issues: { $elemMatch: { _id:issueId } }},  { $set:{
     "issues.$.fromUserId":issueJson.fromUserId,
     "issues.$.toUserId":issueJson.toUserId,
     "issues.$.name":issueJson.name,
     "issues.$.description":issueJson.description,
     "issues.$.status":issueJson.status
    }}, function(err, data){
        if(err || !data)
            return callback(errors.errorNotFound((err?err:'')));
        return callback(data);
    });
};