var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var Project   = require('../model/projectSchema');  // get our mongoose model


/* POST project. */
router.post('/', function(req, res, next) {
    var project = new Project(req.body);
    project.save();
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

/* permission function */
function isPermission(user){
    return user==="58b898af734d1d10ff5f4aec";
}


function getUserID(req){
    return req.user.identities[0].user_id;
}

/* GET - Remove user from project. */
router.get('/:projectId/removeUser/:userToDelete',ensureLoggedIn, function(req, res, next) {
	var userId =  getUserID(req);
	var projectId = req.params.projectId;
	var userToDelete = req.params.userToDelete;
	// check if has permissions
	if(isPermission(userId)){
		res.render('test1', { userId: userId,projectId: projectId,userToDelete:userToDelete});
	}else{
		res.render('error', { error: {stack: getUserID(req) + ' not auth'} });
	}
});

module.exports = router;
