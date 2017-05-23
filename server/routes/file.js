var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var File = require('../model/fileSchema');


/* GET file by id */
router.get('/:fileId',/* ensureLoggedIn, */function(req, res, next) {
    var id = req.params.fileId;
	File.findOne({_id: id}, function(err, file) {
		if (err) 
			res.send("error");
		res.send(file);
  	});
});

/* GET file list */
router.get('/GetList/:userId',/* ensureLoggedIn, */function(req, res, next) {
    var userId = req.params.userId;
	File.find({userOwner: userId}
		, function(err, files) {
		if (err) 
			res.send("error");
		res.send(files);
  	});
});


/* PUT user by id */
router.put('/:fileId',/* ensureLoggedIn, */function(req, res, next) {
    var fileId = req.params.fileId;
    var fileJson = req.body;

    File.findOne({_id: fileId}, function(err, file) {	
		if (err) 
        	return res.send(err);
		file.userOwner = fileJson.userOwner;
		file.privacy = fileJson.privacy;
		file.name = fileJson.name;
		file.path = fileJson.path;
		file.size = fileJson.size;
		file.duration = fileJson.duration;
		file.sharedUsers = fileJson.sharedUsers;

		file.save();
		return res.send(file);
	});
});

/* POST file */
router.post('/',function(req, res, next) {
	var file = new File(req.body);
	file.save(function (err, savedFile) {
		if (err)
			res.send(err);
		res.send(savedFile);
	});
});

/* DELETE file */

router.delete('/:fileId', /* ensureLoggedIn, */function(req, res, next) {
	File.findByIdAndRemove({_id: req.params.fileId}, function (err, plan) {
		if(err)
			res.send('failed');
		res.send('file deleted');
	});
});

module.exports = router;
