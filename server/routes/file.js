//require modules
var express = require('express');
var passport = require('passport');
var router = express.Router();
var fileCtrl = require('../controllers/files');


/////////////////////////////////////////////////////////////////
/*
    Here start the files routers.
    they are responsible for calling the function in the controller
    and returning a response status
 */
/////////////////////////////////////////////////////////////////

router.get('/:fileId', function(req, res) {
	fileCtrl.getFile(req.params.fileId,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);	
		else
			res.status(200).send(data);
	});
});


router.get('/GetAll/:userId',function(req, res) {
	fileCtrl.getAllByUser(req.params.userId,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);	
		else
			res.status(200).send(data);
	});
});


router.get('/isExist/:fileId',function(req, res) {
	fileCtrl.isExistDeleteIfNot(req.params.fileId,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);	
		else
			res.status(200).send(data);
	});
});


router.get('/GetList/:userId',function(req, res) {
	fileCtrl.getListByUser(req.params.userId,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);	
		else
			res.status(200).send(data);
	});
});


router.get('/GetSharedList/:userId',function(req, res) {
	fileCtrl.getSharedListByUser(req.params.userId,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);	
		else
			res.status(200).send(data);
	});
});


router.put('/:fileId',function(req, res) {
    fileCtrl.updateFile(req.params.fileId,req.body,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);	
		else
			res.status(200).send(data);
    });
});


router.put('/:fileId/Name/:name',function(req, res) {
    fileCtrl.renameFile(req.params.fileId,req.params.name,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);	
		else
			res.status(200).send(data);
    });
});


router.put('/:fileId/User/:userId/Access/:access',function(req, res) {
    fileCtrl.updateFileAccess(req.params.fileId,req.params.userId,req.params.access,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);	
		else
			res.status(200).send(data);
    });
});


router.post('/',function(req, res) {
    fileCtrl.createFile(req.body,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);	
		else
			res.status(200).send(data);
    });
});


router.delete('/:fileId', function(req, res) {
    fileCtrl.deleteFile(req.params.fileId,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);	
		else
			res.status(200).send(data);
    });
});


module.exports = router;
