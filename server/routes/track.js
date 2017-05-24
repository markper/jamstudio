// vars
var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var Track = require('../model/trackSchema');  // get our mongoose model
var Project = require('../model/projectSchema');  // get our mongoose model

// get params from request
var bodyParser = require('body-parser');
router.use(bodyParser.json());


/* POST track  */
router.post('/', function(req, res) {
     var newTrack = new Track(req.body);
     Project.findOne({_id:newTrack.projectId},function(err,project){
        if (err) return res.json({'message': err});
        newTrack.save(function(err) {
            if (err) 
                return res.json({'message': err});
            project.tracks.push(newTrack._id);
            project.save();
            return res.json(newTrack);
        });
    });
});

/* GET track  */
router.get('/:trackId', function(req, res) {
    //console.log("/track");
    Track.findOne({_id:req.params.trackId}, function(err, track) {
        res.json(track);
    });
});

/* DELETE track */
router.delete('/:trackId', function(req, res) {
    Track.findOne({_id:req.params.trackId}, function(err, track) {
        if(track)
        Project.update( {_id:track.projectId}, {$pull: {tracks: req.params.trackId}}, function(err, data){
        });
    }).remove().exec(function(err,data){
        if(!err) return res.json({'message':'track deleted successfully..'});
        else return res.json({'message':'falid..'});
    });
});


/* update track */
router.put('/:trackId', function(req, res) {
    var newTrack = req.body;
    Track.findOne({_id:req.params.trackId}, function(err,track){
        if (err) res.send(err);
        if(!track) return res.json({ message: 'track does not found..'});
        track.projectId = newTrack.projectId
        track.name = newTrack.name
        track.description = newTrack.description
        track.genre = newTrack.genre
        track.version = newTrack.version
        track.channels = newTrack.channels
        track.save(function(err){
            if (err) res.send(err);
            res.json({ message: "update track"});
        });
    });
});

module.exports = router;