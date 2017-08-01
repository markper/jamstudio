//require modules
var express = require('express');
var passport = require('passport');
var router = express.Router();
var trackCtrl = require('../controllers/tracks');

// get params from request
var bodyParser = require('body-parser');
router.use(bodyParser.json());

/////////////////////////////////////////////////////////////////
/*
    Here start the track routers.
    they are responsible for calling the function in the controller
    and returning a response status
 */
/////////////////////////////////////////////////////////////////

router.post('/', function(req, res) {
    trackCtrl.createTrack(req.body , function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);
    });
});


router.get('/:trackId', function(req, res) {
    trackCtrl.getTrack( req.params.trackId , function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);
    });
});


router.delete('/:trackId', function(req, res) {
    trackCtrl.deleteTrack( req.params.trackId , function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);
    });
});


router.put('/:trackId', function(req, res) {
    trackCtrl.updateTrack( req.params.trackId ,req.body, function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);
    });
});


module.exports = router;