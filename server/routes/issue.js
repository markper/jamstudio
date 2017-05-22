var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var Issue = require('../model/issueSchema');  // get our mongoose model
var Project = require('../model/projectSchema');  // get our mongoose model

/* GET project. */
router.get('/:issueId', ensureLoggedIn, function(req, res, next) {
    //res.send('hello mark');
    // we're connected!
    var id = req.params.issueId;
    Issue.find({_id: id}, function(err, issue) {
      if (err) {
        res.send("error");
      } else {
        res.send(issue);
      }
  });
});

router.post('/', function(req, res, next) {
    Project.findOne({_id:req.body.issue.projectId},function(err,project){
        project.issues.push(req.body);
        project.save(function(err){
            if(err)
                console.log(err);
        });
        res.json({ success: true });
    });
});


router.put('/:issueId',/* ensureLoggedIn,*/ function(req, res, next) {
    var id = req.params.issueId;
    var issueJson = req.body;
    Issue.findOne({_id: id}, function(err, issue) {
      if (err) {
        res.send(err);
      } else {
        issue.issueId = issueJson.issueId;
        issue.fromUserId = issueJson.fromUserId;
        issue.toUserId = issueJson.toUserId;
        issue.name = issueJson.name;
        issue.description = issueJson.description;
        issue.status = issueJson.status;
        issue.save();
        res.send(issue);
      }
  });
});

router.delete('/:issueId', function(req, res, next) {
  Issue.findByIdAndRemove({_id: req.params.issueId}, function (err, issue) {
    if(err)
      res.send('failed');
    else
      res.send('ok');
  });
});


module.exports = router;
