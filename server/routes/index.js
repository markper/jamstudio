var express = require('express');
var passport = require('passport');
var router = express.Router();
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var path = require('path');
var config = require('../config');       // get our config file
var projects = require('../controllers/projects');

var env = {
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL || config.server+'/callback'
};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', env: env });
});

router.get('/app/p',ensureLoggedIn, function (req, res, next) {
  var path2 = path.join(__dirname, '../public', 'app/preview.html');
  console.log(path2);
  return res.sendFile(path2);
  next();
})

router.get('/app/search',ensureLoggedIn, function (req, res, next) {
  var path2 = path.join(__dirname, '../public', 'app/search.html');
  console.log(path2);
  return res.sendFile(path2);
  next();
})

router.get('/app/usersettings',ensureLoggedIn, function (req, res, next) {
  var path2 = path.join(__dirname, '../public', 'app/usersettings.html');
  console.log(path2);
  return res.sendFile(path2);
  next();
})

router.get('/app/studio/:projectId',ensureLoggedIn, function (req, res, next) {
  var path2 = path.join(__dirname, '../public', 'app/studio.html');
  console.log(path2);
  return res.sendFile(path2);
  next();
})

router.get('/app/project/:projectId', ensureLoggedIn ,function (req, res, next) {
  // projects.getProject(req.params.projectId , function(project){
  //   if(project.adminUser == req.user.id){
       var path2 = path.join(__dirname, '../public', 'app/project.html');
      console.log(path2);
      return res.sendFile(path2);
  //   }else
  //       res.render('login', { env: env });
  // });
  
  next();
})

router.get('/app/dashboard', ensureLoggedIn, function (req, res, next) {
  var path2 = path.join(__dirname, '../public', 'app/dashboard.html');
  console.log(path2);
  return res.sendFile(path2);
  next();
})

router.get('/app/dashboard/:userId', ensureLoggedIn, function (req, res, next) {
  var path2 = path.join(__dirname, '../public', 'app/dashboard.html');
  console.log(path2);
  return res.sendFile(path2);
  next();
})

router.get('/app/tamplate', ensureLoggedIn, function (req, res, next) {
  var path2 = path.join(__dirname, '../public', 'app/template.html');
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
