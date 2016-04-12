var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var session = require('express-session');
var bodyParser = require('body-parser');


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

var checkUser = function(){

}

app.get('/', 
function(req, res) {
  res.render('login');
});

app.get('/login',
  function(req, res){
    res.render('login');
  })
app.get('/logout',
  function(req, res){
    alert("You've been logged out");
    res.render('login');
  })
app.get('/create', 
function(req, res) {
  res.render('index');
});

app.get('/signup',
  function(req, res){
    res.render('signup');
  })


app.get('/links', 
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});

app.post('/links', 
function(req, res) {
  var uri = req.body.url;
  console.log('What is req.body...', req.body);
  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      console.log('found.attributes', found.attributes);
      console.log('found', found);
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }
        // console.log('What is at do title be?', title);
        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin,
          // user_id : user.get('id')
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your dedicated authentication routes here
// e.g. login, logout, etc.
/************************************************************/
app.post('/signup', 
function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  // util.getUrlTitle()
  var user = new User({
    name: username,
    password: password
    // title: title,
  });

  user.save().then(function(newUser){
    Users.add(newUser);
    res.redirect("login");
  })
});

app.post('/login', 
function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  new User({
    name: username,
    password: password,
  }).fetch().then( function(found){
    if (found){
      //initialize session here
    app.use(session({
    // When there is nothing on the session, do not save it
    saveUninitialized: false,
    // Update session if it changes
    resave: true,
    // Set cookie
    cookie: {
        // Unsecure
        secure: false,
        // Http & https
        httpOnly: false,
        // Domain of the cookie
        domain: 'http://localhost:3001',
       
        expires: false,
        // Maximum age of the cookie
        maxAge: 1000*60*60*24*7,
      },
    // Name of your cookie
    name: 'testCookie',
    // Secret of your cookie
    secret: 'someHugeSecret',
    // Store the cookie in db
    })); 

      res.render('index');
    } else {
      alert("Wrong password");
      res.render('login');
    }
  })
});

/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {

  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
