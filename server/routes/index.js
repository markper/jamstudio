var express = require('express');
var passport = require('passport');
var router = express.Router();
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var path = require('path');

var env = {
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback'
};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', env: env });
});

/* GET home page. */
router.get('/app/*', ensureLoggedIn, function(req, res, next) {
  next();
});



router.get('/app/studio/:projectId', function (req, res, next) {
  var path2 = path.join(__dirname, '../public', 'app/studio.html');
  console.log(path2);
  return res.sendFile(path2);
  next();
})

router.get('/app/project/:projectId', function (req, res, next) {
  var path2 = path.join(__dirname, '../public', 'app/project.html');
  console.log(path2);
  return res.sendFile(path2);
  next();
})

router.get('/app/dashboard', function (req, res, next) {
  var path2 = path.join(__dirname, '../public', 'app/dashboard.html');
  console.log(path2);
  return res.sendFile(path2);
  next();
})



router.get('/login',
  function(req, res){
    res.render('login', { env: env });
  });

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

router.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/url-if-something-fails' }),
  function(req, res) {
    res.redirect(req.session.returnTo || '/app/dashboard');
  });


module.exports = router;
