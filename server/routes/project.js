//require modules
var express = require('express');
var passport = require('passport');
var router = express.Router();
var projectCtrl = require('../controllers/projects');

/* spread the user id from the request*/
function getUserId(req){
    try{
        return req.user.id.split("|")[1];
    }catch(exc){
        return "";
    }
}

/////////////////////////////////////////////////////////////////
/*
    Here start the project routers.
    they are responsible for calling the function in the controller
    and returning a response status
 */
/////////////////////////////////////////////////////////////////

router.post('/', function(req, res) {
    projectCtrl.createProject(req.body,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);
    });
});


router.get('/:projectId', function(req, res) {
    projectCtrl.getProject(req.params.projectId,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);
    });
});


router.get('/Search/:string', function(req, res) {
    projectCtrl.getProjectByString(req.params.string,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);
    });
});

router.get('/GetLast/:userId', function(req, res) {
    projectCtrl.getLastProject(req.params.userId,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);
    });
});


router.put('/:projectId', function(req, res) {
    projectCtrl.updateProject(req.params.projectId,req.body,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);
    });
});


router.put('/Info/:projectId', function(req, res) {
    projectCtrl.updateProjectInfo(req.params.projectId,req.body,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);
    });
});


router.put('/Privacy/:projectId', function(req, res) {
    projectCtrl.updateProjectPrivacy(req.params.projectId,req.body,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);
    });
});


router.put('/:projectId/SetVersion/:trackId', function(req, res) {
    projectCtrl.updateProjectVersion(req.params.projectId,req.params.trackId,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);
    });
});


router.put('/:projectId/CreateVersion/:trackId', function(req, res) {
    projectCtrl.makeProjectVersion(req.params.projectId,req.params.trackId,req.body,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);
    });
});


router.get('/:projectId/GetVersions', function(req, res) {
    projectCtrl.getVersions(req.params.projectId,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);       
    });
});


router.get('/GetList/:userId', function(req, res) {
    projectCtrl.getListByUser(req.params.userId,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);       
    });
});


router.delete('/:projectId', function(req, res) {
    projectCtrl.deleteProject(req.params.projectId,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);       
    });
});

/////////////////////////////////////////////////////////////////
/*
    Here start the users routers.
    they are responsible for calling the function in the controller
    and returning a response status
 */
/////////////////////////////////////////////////////////////////

/* DELETE - Remove user from project. */
router.delete('/:projectId/user/:userId', function(req, res) {
    projectCtrl.deleteUser(req.params.projectId,req.params.userId,getUserId(req),function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);       
    });
});


/* PUT - add user to project. */
router.post('/:projectId/user/:userId/access/:access', function(req, res) {
    projectCtrl.addUser(req.params.projectId,req.params.userId,req.params.access,getUserId(req),function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);       
    });
});


/* PUT - update user access in project. */
router.put('/:projectId/user/:userId/access/:access', function(req, res) {
    projectCtrl.updateUserAccess(req.params.projectId,req.params.userId,req.params.access,getUserId(req),function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);       
    });

});


/* GET - get contributors. */
router.get('/:projectId/GetContributors', function(req, res) {
    projectCtrl.getContributors(req.params.projectId,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);       
    });
});

/////////////////////////////////////////////////////////////////
/*
    Here start the issues routers.
    they are responsible for calling the function in the controller
    and returning a response status
 */
/////////////////////////////////////////////////////////////////

/* POST add issue to project */
router.post('/:projectId/Issue', function(req, res) {
    projectCtrl.addIssue(req.params.projectId,req.body,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);       
    });
});


/* GET issue from project */
router.get('/:projectId/Issue/:issueId', function(req, res) {
    projectCtrl.getIssue(req.params.projectId,req.params.issueId,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);       
    });
});


/* DELETE issue from project */
router.delete('/:projectId/Issue/:issueId', function(req, res) {
    projectCtrl.deleteIssue(req.params.projectId,req.params.issueId,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);       
    });
});

/* PUT update issue */
router.put('/:projectId/Issue/:issueId', function(req, res) {
    projectCtrl.updateIssue(req.params.projectId,req.params.issueId,req.body,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);       
    });
});


module.exports = router;