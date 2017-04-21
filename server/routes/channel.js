var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var Channel   = require('../model/channelSchema');  // get our mongoose model

/* GET project. */
router.get('/', ensureLoggedIn, function(req, res, next) {
    //console.log("/");
    res.send('we really need to change the default routing...');
});


/* get specific track
 * todo - need to implement it to specific param depends on client wish
 */
router.get('/channel', function(req, res) {
    //console.log("/track");
    Channel.find({}, function(err, channels) {
        res.json(channels);
    });
});


/* create new track */
router.post('/channel', function(req, res) {
    var p1 = req.body.channelId;
    var p2 = req.body.trackId;
    var p3 = req.body.userId;
    var p4 = req.body.name;
    var p5 = req.body.instrument;
    var newChannel = new Channel({
        channelId : p1,
        trackId : p2,
        userId : p3,
        name : p4,
        instrument : p5,
        volume : "1.0",
        lock : false,
        visible : false,
        samples : "[]"
    });
    console.log(newChannel);
    // save to database
    newChannel.save(function(err) {
        if (err) throw err;
        console.log('Track was added successfully');
        res.json({ success: true });
    });
});


/* delete track */
router.post('/deleteChannel', function(req, res) {
    // get params
    var channelId = req.body.channelId;
    Channel.findOne({
        plan: req.body.channelId
    }, function(err, channel) {
        if (err) throw err;
        if (!channel) {
            res.json({ success: false, message: 'channel not found.'});
        }
        if(channel.channelId === channelId){
            channel.remove(function(err) {
                if (err) throw err;
                console.log('Channel was removed successfully');
                res.json({ success: true });
                //res.redirect('http://localhost/channel');
            });
        }else{
            res.json({ success: false, message: 'Can not delete channel'});
        }
    });
});


/* update track */
router.put('updateChannel:_id', function(req, res) {
    Channel.findOne(req.params.channelId, function(err,channel){
        if (err) res.send(err);
        Channel.visible = req.body.visible;
        channel.save(function(err){
            if (err) res.send(err);
            res.json({ message: "update channel"});
        });
    });
});


module.exports = router;