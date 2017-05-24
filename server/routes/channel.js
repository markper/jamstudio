var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var Channel   = require('../model/channelSchema');  // get our mongoose model
var Track = require('../model/trackSchema');  // get our mongoose model

/* GET a channel */
router.get('/:channelId', function(req, res) {
    Channel.findOne({_id: req.params.channelId}, function(err, channel) {
        res.json(channel);
    });
});

/* POST a new channel */
router.post('/', function(req, res) {
    var newChannel = new Channel(req.body);
    newChannel.save(function(err,channel) {
        if (err) throw err;
            Track.update( {_id:channel.trackId}, {$push: {channels: channel._id}}, function(err, data){
                if(err) return res.status(500).json({'error' : 'error in deleting address'});
                else return res.json(data);
            });
    });
});

/* DELETE channel */
router.delete('/:channelId', function(req, res) {
    // get params
    var channelId = req.params.channelId;
    Channel.findOne({
        _id: channelId
    }, function(err, channel) {
            if(channel){
                Track.update( {_id:channel.trackId}, {$pull: {channels: channelId}}, function(err, data){
                });
                channel.remove(function(err){
                    if(err) return res.status(500).json({'error' : 'error in deleting address'});
                    else return res.json({'success' : 'channel deleting'});
                });
             }else return res.status(500).json({'error' : 'error in deleting address'});

    });
});

/* PUT channel */
router.put('/:channelId', function(req, res) {
    var newChannel = req.body;
    Channel.findOne({_id:req.params.channelId}, function(err,channel){
        if (err) res.send(err);
        if(!channel) return res.json({ message: 'channel does not found..'});
        channel.trackId = newChannel.trackId
        channel.userId = newChannel.userId
        channel.name = newChannel.name
        channel.instrument = newChannel.instrument
        channel.volume = newChannel.volume
        channel.lock = newChannel.lock
        channel.visible = newChannel.visible
        channel.samples = newChannel.samples
        channel.save(function(err){
            if (err) res.send(err);
            res.json({ message: "update channel"});
        });
    });
});

//
/* SAMPLES */
//

/* POST add sample to project */
router.post('/:channelId/Sample', function(req, res, next) {
    Channel.
    findOne({_id:req.params.channelId},function(err,channel){
        if(err)
            return res.json({ success: false });
        channel.samples.push(req.body);
        channel.save(function(err,issue){
            if(err)
                return res.json({ success: false });
            else
                return res.json({ success: true });
        });
    });
});

/* GET issue from project */
router.get('/:channelId/Sample/:sampleId'/*, ensureLoggedIn*/, function(req, res, next) {
  var channelId = req.params.channelId;
  var sampleId = req.params.sampleId;
  Channel
  .findOne({_id:channelId,'samples._id':sampleId})
  .populate({path:'samples'})
  .exec(function (err, channel) {
    if (!err)
     res.send(channel.samples[0]);  
    else
      res.send('error');
  });
});

/* DELETE issue from project */
router.delete('/:channelId/Sample/:sampleId'/*, ensureLoggedIn*/, function(req, res, next) {
    var channelId = req.params.channelId;
    var sampleId = req.params.sampleId;
    Channel.update( {_id:channelId}, {$pull: {samples: {_id:sampleId}}}, function(err, data){
        if(err) {
            return res.status(500).json({'error' : 'error in deleting address'});
        }
        res.json(data);
    });
});

/* PUT update issue */
router.put('/:channelId/Sample/:sampleId'/*,ensureLoggedIn*/, function(req, res, next) {
    
    var channelId = req.params.channelId;
    var sampleId = req.params.sampleId;
    req.body._id = sampleId;

    Channel.update( {_id:channelId,samples: { $elemMatch: { _id:sampleId } }},  { $set:{ "samples.$":req.body }}, function(err, data){
        if(err) {
            return res.status(500).json({'error' : 'error in adding user'});
        }
        res.json(data);

    });

});


module.exports = router;