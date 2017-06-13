var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var fileCtrl = require('../controllers/files');

/* GET file by id */
router.get('/:fileId',/* ensureLoggedIn, */function(req, res, next) {

	fileCtrl.getFile(req.params.fileId,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);	
		else
			res.status(200).send(data);
	});	

});

/* GET file list */
router.get('/GetAll/:userId',/* ensureLoggedIn, */function(req, res, next) {
	fileCtrl.getAllByUser(req.params.userId,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);	
		else
			res.status(200).send(data);
	});
});


router.get('/isExist/:fileId',/* ensureLoggedIn, */function(req, res, next) {
	fileCtrl.isExistDeleteIfNot(req.params.fileId,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);	
		else
			res.status(200).send(data);
	});
});

/* GET file list */
router.get('/GetList/:userId',/* ensureLoggedIn, */function(req, res, next) {
	fileCtrl.getListByUser(req.params.userId,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);	
		else
			res.status(200).send(data);
	});
});

/* GET file list */
router.get('/GetSharedList/:userId',/* ensureLoggedIn, */function(req, res, next) {
	fileCtrl.getSharedListByUser(req.params.userId,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);	
		else
			res.status(200).send(data);
	});
});

/* PUT user by id */
router.put('/:fileId',/* ensureLoggedIn, */function(req, res, next) {
    fileCtrl.updateFile(req.params.fileId,req.body,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);	
		else
			res.status(200).send(data);
    });
});

/* POST file */
router.post('/',function(req, res, next) {
    fileCtrl.createFile(req.body,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);	
		else
			res.status(200).send(data);
    });
});

/* DELETE file */
router.delete('/:fileId', /* ensureLoggedIn, */function(req, res, next) {
    fileCtrl.deleteFile(req.params.fileId,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);	
		else
			res.status(200).send(data);
    });
});

module.exports = router;
