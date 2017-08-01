//require modules
var express = require('express');
var router = express.Router();
var Request = require('../model/requestSchema');  // get our mongoose model
var bodyParser = require('body-parser');
var requestCtrl = require('../controllers/requests');

// get params from request
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

/////////////////////////////////////////////////////////////////
/*
    Here start the requests routers.
    they are responsible for calling the function in the controller
    and returning a response status
 */
/////////////////////////////////////////////////////////////////

router.get('/admin/:userId', function(req, res) {
    requestCtrl.getRequestByAdmin(req.params.userId,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message);
        else
            res.status(200).send(data);
    });
});


router.get('/:requestId', function(req, res) {
    requestCtrl.getRequest(req.params.requestId,function(data){
  		if(data instanceof Error)
            res.status(500).send(data.message);
  		else
  			res.status(200).send(data);
  	});
});


router.put('/:requestId', function(req, res) {
    requestCtrl.updateRequest(req.params.requestId, req.body, function(data){
  		if(data instanceof Error)
  			res.status(500).send(data.message);
  		else
  			res.status(200).send(data);
  	});
});


router.post('/', function(req, res) {
    var request = new Request(req.body);
    requestCtrl.createRequest(request, function(data){
        if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
    });
});


router.delete('/:requestId', function(req, res) {
    requestCtrl.deleteRequest(req.params.requestId, function(data){
		if(data instanceof Error)
			res.status(500).send(data.message);
		else
			res.status(200).send(data);
    });
});


router.put('/:requestId/SetStatus/:status', function(req, res) {
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