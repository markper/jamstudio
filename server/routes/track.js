// vars
var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var trackCtrl = require('../controllers/tracks');

// get params from request
var bodyParser = require('body-parser');
router.use(bodyParser.json());


/* POST track  */
router.post('/', function(req, res) {
    trackCtrl.createTrack(req.body , function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);
    });
});

/* GET track  */
router.get('/:trackId', function(req, res) {
    trackCtrl.getTrack( req.params.trackId , function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);
    });
});

/* DELETE track */
router.delete('/:trackId', function(req, res) {
    trackCtrl.deleteTrack( req.params.trackId , function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);
    });
});


/* update track */
router.put('/:trackId', function(req, res) {
    trackCtrl.updateTrack( req.params.trackId ,req.body, function(data){
        if(data instanceof Error)
            res.status(500).send(data.message); 
        else
            res.status(200).send(data);
    });
});

module.exports = router;