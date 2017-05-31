var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var Request   = require('../model/requestSchema');  // get our mongoose model
var bodyParser  = require('body-parser');
var requestCtrl = require('../controllers/requests');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

/* GET project. */
router.get('/:requestId', function(req, res, next) {
    requestCtrl.getRequest(req.params.requestId,function(data){
  		if(data instanceof Error)
  			res.status(500).send(data.message);
  		else
  			res.status(200).send(data);
  	});
  });

router.put('/:requestId',/* ensureLoggedIn,*/ function(req, res, next) {
    requestCtrl.updateRequest(req.params.requestId, req.body, function(data){
  		if(data instanceof Error)
  			res.status(500).send(data.message);
  		else
  			res.status(200).send(data);
  	});
});

router.post('/', function(req, res, next) {
  var request = new Request(req.body);
  requestCtrl.createRequest(request, function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
  });
});

/* DELETE file */
router.delete('/:requestId', /* ensureLoggedIn, */function(req, res, next) {
    requestCtrl.deleteRequest(req.params.requestId, function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
    });
});


router.put('/:requestId/SetStatus/:status', function(req, res, next) {
    var requestId = req.params.requestId;
    var status = req.params.status;
    requestCtrl.updateRequestStatus(requestId, status, function(data){
  		if(data instanceof Error)
  			res.status(500).send(data.message);
  		else
  			res.status(200).send(data);
  	});
});


module.exports = router;
