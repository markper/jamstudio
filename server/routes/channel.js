//require modules
var express = require('express');
var passport = require('passport');
var router = express.Router();
var channelCtrl = require('../controllers/channels');


/* spread the user id from the request*/
function getUserId(req){
    try{
        return req.user.id.split("|")[1];
    }catch(exc){
        return "";
    }
}

/////////////////////////////////////////////////////////////////
/*
    Here start the channels routers.
    they are responsible for calling the function in the controller
    and returning a response status
 */
/////////////////////////////////////////////////////////////////

router.get('/:channelId', function(req, res) {
    channelCtrl.getChannel( req.params.channelId , function(data){
        if(data instanceof Error)
            res.status(500).send(data.message);
        else
            res.status(200).send(data);
    });
});


router.get('/:channelId/user/:userId/access', function(req, res) {
    channelCtrl.checkChannelPermitions(req.params.channelId,req.params.userId , function(data){
        if(data instanceof Error)
            res.status(500).send(data.message);
        else
            res.status(200).send(data);
    });
});


router.post('/', function(req, res) {
    channelCtrl.createChannel(req.body,getUserId(req),function(data){
        if(data instanceof Error)
            res.status(500).send(data.message);
        else
            res.status(200).send(data);
    }); 
});


router.delete('/:channelId', function(req, res) {
    channelCtrl.deleteChannel(req.params.channelId,getUserId(req),function(data){
        if(data instanceof Error)
            res.status(500).send(data.message);
        else
            res.status(200).send(data);
    }); 
});


router.put('/Sort', function(req, res) {
    channelCtrl.sortChannels(req.body.list,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message);
        else
            res.status(200).send(data);
    }); 
});


router.put('/:channelId', function(req, res) {
    channelCtrl.updateChannel(req.params.channelId,req.body,getUserId(req),function(data){
        if(data instanceof Error)
            res.status(500).send(data.message);
        else
            res.status(200).send(data);
    }); 
});

/////////////////////////////////////////////////////////////////
/*
    Here start the samples routers.
    they are responsible for calling the function in the controller
    and returning a response status
 */
/////////////////////////////////////////////////////////////////

router.post('/:channelId/Sample', function(req, res) {
    channelCtrl.createSample(req.params.channelId,req.body,getUserId(req),function(data){
        if(data instanceof Error)
            res.status(500).send(data.message);
        else
            res.status(200).send(data);
    }); 
});


router.get('/:channelId/Sample/:sampleId', function(req, res) {
    channelCtrl.getSample(req.params.channelId,req.params.sampleId,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message);
        else
            res.status(200).send(data);
    }); 
});


router.delete('/:channelId/Sample/:sampleId', function(req, res) {
    channelCtrl.deleteSample(getUserId(req),req.params.channelId,req.params.sampleId,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message);
        else
            res.status(200).send(data);
    }); 
});


router.put('/:channelId/Sample', function(req, res) {
    channelCtrl.updateSample(req.body,getUserId(req),function(data){
        if(data instanceof Error)
            res.status(500).send(data.message);
        else
            res.status(200).send(data);
    }); 
});


router.put('/:channelId/Sample/:sampleId', function(req, res) {
    req.body._id = req.params.sampleId;
    channelCtrl.updateSample(req.params.channelId,req.body,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message);
        else
            res.status(200).send(data);
    }); 
});


router.put('/:channelId/Sample/:sampleId/NewChannel/:channel2Id', function(req, res) {
    req.body._id = req.params.sampleId;
    channelCtrl.moveSample(getUserId(req),req.params.channelId,req.params.channel2Id,req.params.sampleId,function(data){
        if(data instanceof Error)
            res.status(500).send(data.message);
        else
            res.status(200).send(data);
    }); 
});


module.exports = router;