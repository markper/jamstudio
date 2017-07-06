var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var userCtrl = require('../controllers/users');
var fs = require("fs");
var path = require('path');
var formidable = require('formidable');
var mkdirp = require('mkdirp');

/* GET logged userId. */
router.get('/getId',/* ensureLoggedIn, */ function(req, res, next) {
	console.log(req.user.id);
});

/* get logged in information */
router.get('/getInfo', ensureLoggedIn,  function(req, res, next) {

	userCtrl.getUser(userCtrl.getUserId(req.user.id),function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
 	});
});



router.post('/picture', function(req, res){

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '../public/app/uploads');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name

  var  name = null;
  form.on('file', function(field, file) {
  	var id = getUserId(req);
  	var ext = path.extname(file.name);
  	name = id+ext;
    fs.rename(file.path, path.join(form.uploadDir, name));
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
  	userCtrl.updateUserPicture(getUserId(req),name,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			 res.end(name);
 	});
  });

  // parse the incoming request containing the form data
  form.parse(req);

});

/* GET user by id */
router.get('/:userId',/* ensureLoggedIn, */function(req, res, next) {
 	userCtrl.getUser(req.params.userId,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
 	});
});

/* GET user list */
router.get('/GetList/:prefix',/* ensureLoggedIn, */function(req, res, next) {
 	userCtrl.getUsersByPrefix(req.params.prefix,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
 	});
});

/* PUT user by id */
router.put('/:userId',/* ensureLoggedIn, */function(req, res, next) {
	userCtrl.updateUser(req.params.userId,req.body,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
 	});
});

/* PUT user by id */
router.put('/:userId/Plan/:planId',/* ensureLoggedIn, */function(req, res, next) {
	userCtrl.updateUserPlan(req.params.userId,req.params.planId,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
 	});
});


/* POST user */
router.post('/',function(req, res, next) {
	userCtrl.createUser(req.body,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
 	});
});

/* DELETE user */
router.delete('/:userId', /* ensureLoggedIn, */function(req, res, next) {
	userCtrl.deleteUser(req.params.userId,function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
 	});
});

function getUserId(req){
    try{
        return req.user.id.split("|")[1];
    }catch(exc){
        return "";
    }
};

module.exports = router;
