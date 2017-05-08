var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var Request   = require('../model/requestSchema');  // get our mongoose model
var bodyParser  = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

/* GET project. */
router.get('/:requestId', ensureLoggedIn, function(req, res, next) {
    //res.send('hello mark');
    // we're connected!
    var id = req.params.requestId;
    Request.find({_id: id}, function(err, requests) {
      if (err) {
        res.send("error");
      } else {
        res.send(requests);
      }
  });
});

router.put('/:requestId',/* ensureLoggedIn,*/ function(req, res, next) {
    var id = req.params.requestId;
    var reqJson = req.body;
    Request.findOne({_id: id}, function(err, request) {
      if (err) {
        res.send(err);
      } else {
        request.projectId = reqJson.projectId;
        request.status = reqJson.status;
        request.userId = reqJson.userId;
        request.save();
        res.send(request);
      }
  });
});

router.post('/', function(req, res, next) {
  var request = new Request(req.body);
  res.send(req.body);
  request.save(function (err, createdRequestObject) {
      if (err) {
          res.send(err);
      }
      // This createdRequestObject is the same one we saved, but after Mongo
      // added its additional properties like _id.
      res.send(createdRequestObject);
  });
});

router.delete('/:requestId', function(req, res, next) {
  Request.findByIdAndRemove({_id: req.params.requestId}, function (err, request) {
    if(err)
      res.send('failed');
    else
      res.send('ok');
  });
});

module.exports = router;
