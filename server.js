var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    restful = require('node-restful');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var app = express();
var https = require('https');
var fs = require('fs');

var jwt  = require('jsonwebtoken'); // used to create, sign, and verify tokens
var User = require('./models/user'); // get mongoose model

var options = {
	key: fs.readFileSync('privateKey.pem'), //private key for SSL
	cert: fs.readFileSync('certificate.pem') //certificate for SSL
}

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type:'application/vnd.api+json'}));
app.use(methodOverride());

mongoose.connect('mongodb://localhost/appointment');

//On-premise Client
//User authenticate -------------------
app.set('superSecret', 'patientmanagementsystem'); // secret variable
//create a user
app.get('/setup', function(req, res) {

  // create a sample user
  var nick = new User({ 
    username: 'Haiping Chen', 
    password: 'password',
    admin: true
  });

  // save the sample user
  nick.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true });
  });
});

// route to authenticate a user (POST https://localhost:3000/api/authenticate)
app.post('/api/authenticate', function(req, res) {

  // find the user
  User.findOne({
    username: req.body.username
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.', token: null });
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.', token: null });
      } else {

        // if user is found and password is right
        // create a token
        var token = jwt.sign(user, app.get('superSecret'), {
          expiresIn: "24h" // expires in 24 hours
        });

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }   

    }

  });
});

// route middleware to verify a token
function tokenVerify(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });
    
  }
}

//Request Handler
var Resource = app.resource = restful.model('resource', mongoose.Schema({
    name: String,
	appointment: String,
	time: String,
	email: String,
	telephone: String
  }))
  .methods(['get', 'post', 'put', 'delete']) 
  .before('get', tokenVerify)
  .before('post', tokenVerify)
  .before('put', tokenVerify)
  .before('delete', tokenVerify)
  .after('get', callback)
  .after('post', callback)
  .after('put', callback)
  .after('delete', callback_del);

Resource.register(app, '/api/appointments');
//set timeout
function callback(req, res, next){
	setTimeout(function (){next();}, 150);
}
//set timeout and send response
function callback_del(req, res, next){
	setTimeout(function (){next();}, 150);
	
	return res.status(200).send({ 
        success: true, 
        message: 'Delete succeed.' 
    });
}
//start the server
https.createServer(options, app).listen(3000, function () {
   console.log('API is running on port 3000!');
});