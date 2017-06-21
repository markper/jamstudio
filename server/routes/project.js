var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var Project   = require('../model/projectSchema');  // get our mongoose model
var Track   = require('../model/trackSchema');  // get our mongoose model
var projectCtrl = require('../controllers/projects');
//
/* PROJECT */
//

/* POST project. */
router.post('/', function(req, res, next) {
    projectCtrl.createProject(req.body,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);
    });
});

/* GET project. */
router.get('/:projectId', function(req, res, next) {
    projectCtrl.getProject(req.params.projectId,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);
    });
});

/* GET project. */
router.get('/Search/:string', function(req, res, next) {
    projectCtrl.getProjectByString(req.params.string,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);
    });
});

router.get('/GetLast/:userId', function(req, res, next) {
    projectCtrl.getLastProject(req.params.userId,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);
    });
});

/* PUT - update project  */
router.put('/:projectId', function(req, res, next) {
    projectCtrl.updateProject(req.params.projectId,req.body,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);
    });
});

router.put('/Info/:projectId', function(req, res, next) {
    projectCtrl.updateProjectInfo(req.params.projectId,req.body,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);
    });
});

router.put('/Privacy/:projectId', function(req, res, next) {
    projectCtrl.updateProjectPrivacy(req.params.projectId,req.body,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);
    });
});


/* PUT - set project version */
router.put('/:projectId/SetVersion/:trackId', function(req, res, next) {
    projectCtrl.updateProjectVersion(req.params.projectId,req.params.trackId,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);
    });
});
router.put('/:projectId/CreateVersion/:trackId', function(req, res, next) {
    projectCtrl.makeProjectVersion(req.params.projectId,req.params.trackId,req.body,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);
    });
});

/* GET project versions. */
router.get('/:projectId/GetVersions', function(req, res, next) {
    projectCtrl.getVersions(req.params.projectId,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);       
    });
});

/* GET project list by user. */
router.get('/GetList/:userId', function(req, res, next) {
    projectCtrl.getListByUser(req.params.userId,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);       
    });
});


function getUserID(req){
    return req.user.identities[0].user_id;
}

/* DELETE - Remove project. */
router.delete('/:projectId'/*,ensureLoggedIn*/, function(req, res, next) {

    projectCtrl.deleteProject(req.params.projectId,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);       
    });

});

//
/* USERS */
//

/* DELETE - Remove user from project. */
router.delete('/:projectId/user/:userId'/*,ensureLoggedIn*/, function(req, res, next) {
    
    projectCtrl.deleteUser(req.params.projectId,req.params.userId,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);       
    });

});

/* PUT - add user to project. */
router.post('/:projectId/user/:userId/access/:access'/*,ensureLoggedIn*/, function(req, res, next) {
    console.log('<><><><>');
    projectCtrl.addUser(req.params.projectId,req.params.userId,req.params.access,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);       
    });

});

/* PUT - update user access in project. */
router.put('/:projectId/user/:userId/access/:access'/*,ensureLoggedIn*/, function(req, res, next) {
    
    projectCtrl.updateUserAccess(req.params.projectId,req.params.userId,req.params.access,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);       
    });

});

/* GET - get contributors. */
router.get('/:projectId/GetContributors'/*,ensureLoggedIn*/, function(req, res, next) {
    
    projectCtrl.getContributors(req.params.projectId,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);       
    });

});

//
/* ISSUES */
//

/* POST add issue to project */
router.post('/:projectId/Issue', function(req, res, next) {

    projectCtrl.addIssue(req.params.projectId,req.body,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);       
    });

});

/* GET issue from project */
router.get('/:projectId/Issue/:issueId'/*, ensureLoggedIn*/, function(req, res, next) {

    projectCtrl.getIssue(req.params.projectId,req.params.issueId,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);       
    });

});

/* DELETE issue from project */
router.delete('/:projectId/Issue/:issueId'/*, ensureLoggedIn*/, function(req, res, next) {
    
    projectCtrl.deleteIssue(req.params.projectId,req.params.issueId,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);       
    });

});

/* PUT update issue */
router.put('/:projectId/Issue/:issueId'/*,ensureLoggedIn*/, function(req, res, next) {
    
    projectCtrl.updateIssue(req.params.projectId,req.params.issueId,req.body,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);       
    });

});


module.exports = router;
