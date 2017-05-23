var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var Project   = require('../model/projectSchema');  // get our mongoose model
var Track   = require('../model/trackSchema');  // get our mongoose model

//
/* PROJECT */
//

/* POST project. */
router.post('/', function(req, res, next) {
    var project = new Project(req.body);
    project.save(function(err) {
        if (err) throw err;
    });
    res.send(project);
});

/* GET project. */
router.get('/:projectId', function(req, res, next) {
    var projectId = req.params.projectId;
    console.log(projectId);
    Project
        .findOne({_id:projectId})
        .populate({path:'adminUser',select: ['firstName','lastName']})
        .populate({path:'tracks'})
        .populate({path:'issues'})
        .populate({path:'users',select:['_id','firstName','lastName']})
        .exec(function (err, project) {
            if (!err)
                res.send(project);
            else
                res.send('error');
        });
});

/* PUT - set project version */
router.put('/:projectId/SetVersion/:trackId', function(req, res, next) {
    var projectId = req.params.projectId;
    var trackId = req.params.trackId;
    Project.update( {_id:projectId}, {track_version:trackId}, function(err, project){
        if(err) {
            return res.status(500).json({'error' : 'error in deleting address'});
        }
        res.json(project);
    });
});


/* GET project versions. */
router.get('/:projectId/GetVersions', function(req, res, next) {
    var projectId = req.params.projectId;
    Project
        .findOne({_id:projectId})
        .select(["tracks"])
        .populate({path:'tracks',select:['trackId','projectId','name','description','genre','version']})
        .exec(function (err, versions) {
            if (!err){
                res.send({"versions": versions.tracks});
            }
            else
                res.send('error');
        });
});

/* GET project list by user. */
router.get('/GetList/:userId', function(req, res, next) {
    var userId = req.params.userId;
    Project
        .find({adminUser:userId})
        .select(["name","_id","description","adminUser","users","genre"])
        .populate({path:'adminUser',select: ['firstName','lastName']})
        .populate({path:'users',select:['_id','firstName','lastName']})
        .exec(function (err, adminProjects) {
            if (!err){
                console.log(adminProjects);
                 Project
                .find({ adminUser:{ $ne: userId },users: { $elemMatch: { user:userId } } })
                .select(["name","_id","description","adminUser","users","genre"])
                .populate({path:'adminUser',select: ['firstName','lastName']})
                .populate({path:'users',select:['_id','firstName','lastName']})
                .exec(function (err, contributorProject) {
                    if (!err)
                        res.send({'admin':adminProjects, 'contributor': contributorProject});
                    else
                        res.send('error');
                });
                //res.send(adminProjects);
            }
            else
                res.send('error');
        });
});


function getUserID(req){
    return req.user.identities[0].user_id;
}

/* DELETE - Remove project. */
router.delete('/:projectId'/*,ensureLoggedIn*/, function(req, res, next) {
    
    var projectId = req.params.projectId;
    var userToDelete = req.params.userToDelete;
    console.log(projectId);
    console.log(userToDelete);

    Project.findOne( {_id:projectId}, function(err, data){
        if(err) {
            return res.status(500).json({'error' : 'error could not find project'});
        }
    }).remove().exec(function(err,data){
        if(!err)
            return res.json({'message':'project deleted successfully..'});
        else
            return res.json({'message':'faild..'});
    });

});

//
/* USERS */
//

/* DELETE - Remove user from project. */
router.delete('/:projectId/user/:userId'/*,ensureLoggedIn*/, function(req, res, next) {
    
    var projectId = req.params.projectId;
    var userId = req.params.userId;
    Project.update( {_id:projectId}, {$pull: {users: {user:userId}}}, function(err, data){
        if(err) {
            return res.status(500).json({'error' : 'error in deleting address'});
        }
        res.json(data);
    });

});

/* POST - add user to project. */
router.post('/:projectId/user/:userId/access/:access'/*,ensureLoggedIn*/, function(req, res, next) {
    
    var projectId = req.params.projectId;
    var userId = req.params.userId;
    var access = req.params.access;

    Project.update( {_id:projectId}, {$push: {users: {user:userId,access:access}}}, function(err, data){
        if(err) {
            return res.status(500).json({'error' : 'error in adding user'});
        }
        res.json(data);

    });

});

/* PUT - update user access in project. */
router.put('/:projectId/user/:userId/access/:access'/*,ensureLoggedIn*/, function(req, res, next) {
    
    var projectId = req.params.projectId;
    var userId = req.params.userId;
    var access = req.params.access;

    Project.update( {_id:projectId,users: { $elemMatch: { user:userId } }},  { $set:{ "users.$.access":access }}, function(err, data){
        if(err) {
            return res.status(500).json({'error' : 'error in adding user'});
        }
        res.json(data);

    });

});

/* GET - get contributors. */
router.get('/:projectId/GetContributors'/*,ensureLoggedIn*/, function(req, res, next) {
    
    var projectId = req.params.projectId;
    var userId = req.params.userId;
    var access = req.params.access;

    Project
    .findOne( {_id:projectId})
    .select(["users"])
    .populate({path:'users',select:['firstName','lastName']})
    .exec(function(err, data)
    {
        if(err) {
            return res.status(500).json({'error' : 'error with find contributors'});
        }
        res.json({contributors: data.users});

    });

});

//
/* ISSUES */
//

/* POST add issue to project */
router.post('/:projectId/Issue', function(req, res, next) {
    Project.
    findOne({_id:req.params.projectId},function(err,project){
        if(err)
            return res.json({ success: false });
        project.issues.push(req.body);
        project.save(function(err,issue){
            if(err)
                return res.json({ success: false });
            else
                return res.json({ success: true });
        });
    });
});

/* GET issue from project */
router.get('/:projectId/Issue/:issueId'/*, ensureLoggedIn*/, function(req, res, next) {
  var projectId = req.params.projectId;
  var issueId = req.params.issueId;
  Project
  .findOne({_id:projectId,'issues._id':issueId})
  .populate({path:'issues'})
  .exec(function (err, project) {
    if (!err)
     res.send(project.issues[0]);  
    else
      res.send('error');
  });
});

/* DELETE issue from project */
router.delete('/:projectId/Issue/:issueId'/*, ensureLoggedIn*/, function(req, res, next) {
    var projectId = req.params.projectId;
    var issueId = req.params.issueId;
    Project.update( {_id:projectId}, {$pull: {issues: {_id:issueId}}}, function(err, data){
        if(err) {
            return res.status(500).json({'error' : 'error in deleting address'});
        }
        res.json(data);
    });
});

/* PUT update issue */
router.put('/:projectId/Issue/:issueId'/*,ensureLoggedIn*/, function(req, res, next) {
    
    var projectId = req.params.projectId;
    var issueId = req.params.issueId;
    req.body._id = issueId;

    Project.update( {_id:projectId,issues: { $elemMatch: { _id:issueId } }},  { $set:{ "issues.$":req.body }}, function(err, data){
        if(err) {
            return res.status(500).json({'error' : 'error in adding user'});
        }
        res.json(data);

    });

});


module.exports = router;
