var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var channelCtrl = require('../controllers/channels');


/* GET a channel */
router.get('/:channelId', function(req, res) {

    channelCtrl.getChannel( req.params.channelId , function(data){
        if(data instanceof Error)
            res.status(500).send(data.message);
        else
            res.status(200).send(data);
    });

});

/* POST a new channel */
router.post('/', function(req, res) {
    channelCtrl.createChannel(req.body,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message);
        else
            res.status(200).send(data);
    }); 
});

/* DELETE channel */
router.delete('/:channelId', function(req, res) {
    channelCtrl.deleteChannel(req.params.channelId,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message);
        else
            res.status(200).send(data);
    }); 
});

/* PUT channel */
router.put('/:channelId', function(req, res) {
    channelCtrl.updateChannel(req.params.channelId,req.body,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message);
        else
            res.status(200).send(data);
    }); 
});

router.post('/Sync', function(req, res) {
    channelCtrl.syncChannels(req.body,function(data){
        if(data instanceof Error){
            console.log(data.message);
            res.status(500).send(data.message);}
        else
            res.status(200).send(data);
    }); 
});

//
/* SAMPLES */
//

/* POST add sample to project */
router.post('/:channelId/Sample', function(req, res, next) {
    channelCtrl.createSample(req.params.channelId,req.body,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message);
        else
            res.status(200).send(data);
    }); 
});

/* GET sample from project */
router.get('/:channelId/Sample/:sampleId'/*, ensureLoggedIn*/, function(req, res, next) {
    channelCtrl.getSample(req.params.channelId,req.params.sampleId,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message);
        else
            res.status(200).send(data);
    }); 
});

/* DELETE sample from project */
router.delete('/:channelId/Sample/:sampleId'/*, ensureLoggedIn*/, function(req, res, next) {
    channelCtrl.deleteSample(req.params.channelId,req.params.sampleId,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message);
        else
            res.status(200).send(data);
    }); 
});

/* PUT sample issue */
router.put('/:channelId/Sample/:sampleId'/*,ensureLoggedIn*/, function(req, res, next) {
    req.body._id = req.params.sampleId;
    channelCtrl.updateSample(req.params.channelId,req.body,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message);
        else
            res.status(200).send(data);
    }); 


});


module.exports = router;