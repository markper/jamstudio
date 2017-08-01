//require modules
var express = require('express');
var passport = require('passport');
var router = express.Router();
var icqCtrl = require('../controllers/icqs');


/////////////////////////////////////////////////////////////////
/*
    Here start the icq routers.
    they are responsible for calling the function in the controller
    and returning a response status
 */
/////////////////////////////////////////////////////////////////

router.get('/:icqId', function(req, res) {
    var icqId = req.params.icqId;
    icqCtrl.getIcq(icqId, function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
    });
});


router.get('/Admin/:userId', function(req, res) {
    var userId = req.params.userId;
    icqCtrl.getIcqByAdmin(userId, function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
    });
});


router.get('/search/:string', function(req, res) {
    icqCtrl.getIcqByString(req.params.string, function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
    });
});


router.get('/project/:projectId', function(req, res) {
    var projectId = req.params.projectId;
    icqCtrl.getIcqByProject(projectId, function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
	});
});


router.get('/instruments/:list', function(req, res) {
	var instruments = req.params.list;
    icqCtrl.getIcqByInstrument( instruments.split(','), function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
	});
});


router.post('/', function(req, res) {
	icqCtrl.createIcq(req.body, function(data){
	if(data instanceof Error)
		res.status(500).send(data.message);
	else
		res.status(200).send(data);
	});
});


router.put('/:icqId',function(req, res) {
	icqCtrl.updateIcq(req.params.icqId, req.body, function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
 	});
});


router.put('/:icqId/Jump',function(req, res) {
	icqCtrl.jumpIcq(req.params.icqId ,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
 	});
});


router.delete('/:icqId',function(req, res) {
	icqCtrl.deleteIcq(req.params.icqId, function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
 	});
});


router.delete('/:icqId/Applicant/:userId',function(req, res) {
	icqCtrl.deleteIcqApplicant(req.params.icqId, req.params.userId,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
 	});
});


router.put('/:icqId/Applicant',function(req, res) {
	icqCtrl.addIcqApplicant(req.params.icqId, req.body,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
 	});
});


router.get('/:icqId/Applicant/:userId',function(req, res) {
	icqCtrl.getIcqApplicant(req.params.icqId, req.params.userId,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
 	});
});


module.exports = router;