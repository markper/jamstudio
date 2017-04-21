// vars
var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var Track = require('../model/trackSchema');  // get our mongoose model

// get params from request
var bodyParser = require('body-parser');
router.use(bodyParser.json());


/* GET user profile. */
router.get('/', function(req, res) {
    //console.log("/");
    res.send('we really need to change the default routing...');
});


/* get specific track
 * todo - need to implement it to specific param depends on client wish
 */
router.get('/track', function(req, res) {
    //console.log("/track");
    Track.find({}, function(err, tracks) {
        res.json(tracks);
    });
});


/* create new track */
router.post('/track', function(req, res) {
    var p1 = req.body.trackid;
    var p2 = req.body.name;
    var p3 = req.body.description;
    var newTrack = new Track({
        trackId : p1,
        name : p2,
        description : p3
    });
    console.log(newTrack);
    // save to database
    newTrack.save(function(err) {
        if (err) throw err;
        console.log('Track was added successfully');
        res.json({ success: true });
    });
});


/* delete track */
router.post('/deleteTrack', function(req, res) {
    // get params
    var trackId = req.body.trackId;
    Track.findOne({
        plan: req.body.trackId
    }, function(err, track) {
        if (err) throw err;
        if (!track) {
            res.json({ success: false, message: 'track not found.'});
        }
        if(track.trackId === trackId){
            track.remove(function(err) {
                if (err) throw err;
                console.log('Track was removed successfully');
                res.json({ success: true });
                //res.redirect('http://localhost/track');
            });
        }else{
            res.json({ success: false, message: 'Can not delete track'});
        }
    });
});


/* update track */
router.put('updateTrack:_id', function(req, res) {
    Track.findOne(req.params.trackId, function(err,track){
        if (err) res.send(err);
        track.description = req.body.description;
        track.save(function(err){
            if (err) res.send(err);
            res.json({ message: "update track"});
        });
    });
});

module.exports = router;