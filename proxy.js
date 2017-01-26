var request = require('request');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var https = require('https');
var fs = require('fs');
var http = require('http');
var nodemailer = require('nodemailer');

app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type:'application/vnd.api+json'}));
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', "*");
	res.header('Access-Control-Allow-Methods', 'POST');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});

var certs = {
	key: fs.readFileSync('privateKey.pem'), //private key for SSL
	cert: fs.readFileSync('certificate.pem') //certificate for SSL
}

//Web Client
//Verify a patient (POST https://localhost:7000/api/patient)
app.post('/api/patient', function(req, res) {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
	
	var patient = null;
	var options = {
		url: 'https://localhost:3000/api/appointments/' + req.body.id,
		headers: {
			'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwiZ2V0dGVycyI6e30sIndhc1BvcHVsYXRlZCI6ZmFsc2UsImFjdGl2ZVBhdGhzIjp7InBhdGhzIjp7Il9fdiI6ImluaXQiLCJhZG1pbiI6ImluaXQiLCJwYXNzd29yZCI6ImluaXQiLCJ1c2VybmFtZSI6ImluaXQiLCJfaWQiOiJpbml0In0sInN0YXRlcyI6eyJpZ25vcmUiOnt9LCJkZWZhdWx0Ijp7fSwiaW5pdCI6eyJfX3YiOnRydWUsImFkbWluIjp0cnVlLCJwYXNzd29yZCI6dHJ1ZSwidXNlcm5hbWUiOnRydWUsIl9pZCI6dHJ1ZX0sIm1vZGlmeSI6e30sInJlcXVpcmUiOnt9fSwic3RhdGVOYW1lcyI6WyJyZXF1aXJlIiwibW9kaWZ5IiwiaW5pdCIsImRlZmF1bHQiLCJpZ25vcmUiXX0sImVtaXR0ZXIiOnsiZG9tYWluIjpudWxsLCJfZXZlbnRzIjp7fSwiX2V2ZW50c0NvdW50IjowLCJfbWF4TGlzdGVuZXJzIjowfX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJfX3YiOjAsImFkbWluIjp0cnVlLCJwYXNzd29yZCI6InBhc3N3b3JkIiwidXNlcm5hbWUiOiJIYWlwaW5nIENoZW4iLCJfaWQiOiI1NzU0NzdkMjcxMjVhMWRjMjM3MDAxNWMifSwiX3ByZXMiOnsiJF9fb3JpZ2luYWxfc2F2ZSI6W251bGwsbnVsbF0sIiRfX29yaWdpbmFsX3ZhbGlkYXRlIjpbbnVsbF0sIiRfX29yaWdpbmFsX3JlbW92ZSI6W251bGxdfSwiX3Bvc3RzIjp7IiRfX29yaWdpbmFsX3NhdmUiOltdLCIkX19vcmlnaW5hbF92YWxpZGF0ZSI6W10sIiRfX29yaWdpbmFsX3JlbW92ZSI6W119LCJpYXQiOjE0ODQyMTA3MjUsImV4cCI6MTQ4NDI5NzEyNX0.19SkEAc5ApTILjlfmjPAMQ_KbpKCU47H72vUGMHl56c'
		}
	};
	
	function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			patient = JSON.parse(body);
			if (patient.name == req.body.name) {
				res.json({
					name: patient.name,
					appointment: patient.appointment,
					time: patient.time,
					email: 'doctor.hp.c@hotmail.com',
					telephone: '+4917677205168'
				});
			} else {
				res.json({
					name: 'Failed, patient is not found!',
					appointment: 'Failed, patient is not found',
					time: '!',
					email: 'Failed, patient is not found!',
					telephone: 'Failed, patient is not found!'
				});
			} 
		} else {
			res.json({
				name: 'Failed, appointment is not found!',
				appointment: 'Failed, appointment is not found',
				time: '!',
				email: 'Failed, appointment is not found!',
				telephone: 'Failed, appointment is not found!'
			});
		}
	}

	request(options, callback);
});

//Get list of booked dates.
app.post('/api/list', function(req, res) {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
	
	var options2 = {
		url: 'https://localhost:3000/api/appointments/',
		headers: {
			'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwiZ2V0dGVycyI6e30sIndhc1BvcHVsYXRlZCI6ZmFsc2UsImFjdGl2ZVBhdGhzIjp7InBhdGhzIjp7Il9fdiI6ImluaXQiLCJhZG1pbiI6ImluaXQiLCJwYXNzd29yZCI6ImluaXQiLCJ1c2VybmFtZSI6ImluaXQiLCJfaWQiOiJpbml0In0sInN0YXRlcyI6eyJpZ25vcmUiOnt9LCJkZWZhdWx0Ijp7fSwiaW5pdCI6eyJfX3YiOnRydWUsImFkbWluIjp0cnVlLCJwYXNzd29yZCI6dHJ1ZSwidXNlcm5hbWUiOnRydWUsIl9pZCI6dHJ1ZX0sIm1vZGlmeSI6e30sInJlcXVpcmUiOnt9fSwic3RhdGVOYW1lcyI6WyJyZXF1aXJlIiwibW9kaWZ5IiwiaW5pdCIsImRlZmF1bHQiLCJpZ25vcmUiXX0sImVtaXR0ZXIiOnsiZG9tYWluIjpudWxsLCJfZXZlbnRzIjp7fSwiX2V2ZW50c0NvdW50IjowLCJfbWF4TGlzdGVuZXJzIjowfX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJfX3YiOjAsImFkbWluIjp0cnVlLCJwYXNzd29yZCI6InBhc3N3b3JkIiwidXNlcm5hbWUiOiJIYWlwaW5nIENoZW4iLCJfaWQiOiI1NzU0NzdkMjcxMjVhMWRjMjM3MDAxNWMifSwiX3ByZXMiOnsiJF9fb3JpZ2luYWxfc2F2ZSI6W251bGwsbnVsbF0sIiRfX29yaWdpbmFsX3ZhbGlkYXRlIjpbbnVsbF0sIiRfX29yaWdpbmFsX3JlbW92ZSI6W251bGxdfSwiX3Bvc3RzIjp7IiRfX29yaWdpbmFsX3NhdmUiOltdLCIkX19vcmlnaW5hbF92YWxpZGF0ZSI6W10sIiRfX29yaWdpbmFsX3JlbW92ZSI6W119LCJpYXQiOjE0ODQyMTA3MjUsImV4cCI6MTQ4NDI5NzEyNX0.19SkEAc5ApTILjlfmjPAMQ_KbpKCU47H72vUGMHl56c'
		}
	};
	
	function getList(error, response, body) {
		if (!error && response.statusCode == 200) {
			var list = JSON.parse(body);
			var getdates = "";
			for (var i = 0; i < list.length; i++) {
				getdates += list[i].appointment + '","';
			}
			res.send([getdates]);
		}
	}
	
	request(options2, getList);
});

//Change date and time.
app.post('/api/submitdatetime', function(req, res) {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
	
	var options3 = {
		url: 'https://localhost:3000/api/appointments/' + req.body.id,
		headers: {
			'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwiZ2V0dGVycyI6e30sIndhc1BvcHVsYXRlZCI6ZmFsc2UsImFjdGl2ZVBhdGhzIjp7InBhdGhzIjp7Il9fdiI6ImluaXQiLCJhZG1pbiI6ImluaXQiLCJwYXNzd29yZCI6ImluaXQiLCJ1c2VybmFtZSI6ImluaXQiLCJfaWQiOiJpbml0In0sInN0YXRlcyI6eyJpZ25vcmUiOnt9LCJkZWZhdWx0Ijp7fSwiaW5pdCI6eyJfX3YiOnRydWUsImFkbWluIjp0cnVlLCJwYXNzd29yZCI6dHJ1ZSwidXNlcm5hbWUiOnRydWUsIl9pZCI6dHJ1ZX0sIm1vZGlmeSI6e30sInJlcXVpcmUiOnt9fSwic3RhdGVOYW1lcyI6WyJyZXF1aXJlIiwibW9kaWZ5IiwiaW5pdCIsImRlZmF1bHQiLCJpZ25vcmUiXX0sImVtaXR0ZXIiOnsiZG9tYWluIjpudWxsLCJfZXZlbnRzIjp7fSwiX2V2ZW50c0NvdW50IjowLCJfbWF4TGlzdGVuZXJzIjowfX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJfX3YiOjAsImFkbWluIjp0cnVlLCJwYXNzd29yZCI6InBhc3N3b3JkIiwidXNlcm5hbWUiOiJIYWlwaW5nIENoZW4iLCJfaWQiOiI1NzU0NzdkMjcxMjVhMWRjMjM3MDAxNWMifSwiX3ByZXMiOnsiJF9fb3JpZ2luYWxfc2F2ZSI6W251bGwsbnVsbF0sIiRfX29yaWdpbmFsX3ZhbGlkYXRlIjpbbnVsbF0sIiRfX29yaWdpbmFsX3JlbW92ZSI6W251bGxdfSwiX3Bvc3RzIjp7IiRfX29yaWdpbmFsX3NhdmUiOltdLCIkX19vcmlnaW5hbF92YWxpZGF0ZSI6W10sIiRfX29yaWdpbmFsX3JlbW92ZSI6W119LCJpYXQiOjE0ODQyMTA3MjUsImV4cCI6MTQ4NDI5NzEyNX0.19SkEAc5ApTILjlfmjPAMQ_KbpKCU47H72vUGMHl56c'
		},
		method: 'PUT', 
		json: {appointment: req.body.date, time: req.body.time}
	};
	
	var options4 = {
		url: 'https://localhost:3000/api/appointments/' + req.body.id,
		headers: {
			'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwiZ2V0dGVycyI6e30sIndhc1BvcHVsYXRlZCI6ZmFsc2UsImFjdGl2ZVBhdGhzIjp7InBhdGhzIjp7Il9fdiI6ImluaXQiLCJhZG1pbiI6ImluaXQiLCJwYXNzd29yZCI6ImluaXQiLCJ1c2VybmFtZSI6ImluaXQiLCJfaWQiOiJpbml0In0sInN0YXRlcyI6eyJpZ25vcmUiOnt9LCJkZWZhdWx0Ijp7fSwiaW5pdCI6eyJfX3YiOnRydWUsImFkbWluIjp0cnVlLCJwYXNzd29yZCI6dHJ1ZSwidXNlcm5hbWUiOnRydWUsIl9pZCI6dHJ1ZX0sIm1vZGlmeSI6e30sInJlcXVpcmUiOnt9fSwic3RhdGVOYW1lcyI6WyJyZXF1aXJlIiwibW9kaWZ5IiwiaW5pdCIsImRlZmF1bHQiLCJpZ25vcmUiXX0sImVtaXR0ZXIiOnsiZG9tYWluIjpudWxsLCJfZXZlbnRzIjp7fSwiX2V2ZW50c0NvdW50IjowLCJfbWF4TGlzdGVuZXJzIjowfX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJfX3YiOjAsImFkbWluIjp0cnVlLCJwYXNzd29yZCI6InBhc3N3b3JkIiwidXNlcm5hbWUiOiJIYWlwaW5nIENoZW4iLCJfaWQiOiI1NzU0NzdkMjcxMjVhMWRjMjM3MDAxNWMifSwiX3ByZXMiOnsiJF9fb3JpZ2luYWxfc2F2ZSI6W251bGwsbnVsbF0sIiRfX29yaWdpbmFsX3ZhbGlkYXRlIjpbbnVsbF0sIiRfX29yaWdpbmFsX3JlbW92ZSI6W251bGxdfSwiX3Bvc3RzIjp7IiRfX29yaWdpbmFsX3NhdmUiOltdLCIkX19vcmlnaW5hbF92YWxpZGF0ZSI6W10sIiRfX29yaWdpbmFsX3JlbW92ZSI6W119LCJpYXQiOjE0ODQyMTA3MjUsImV4cCI6MTQ4NDI5NzEyNX0.19SkEAc5ApTILjlfmjPAMQ_KbpKCU47H72vUGMHl56c'
		}
	};
	
	function getUpdateInfo(errorU, responseU, bodyU) {
		if (!errorU && responseU.statusCode == 200) {
			var patient = JSON.parse(bodyU);
			res.json({
				appointment: patient.appointment,
				time: patient.time
			});
			// create reusable transporter object using the default SMTP transport 
			var transporter = nodemailer.createTransport({
				service: 'hotmail',
				auth: {
					user: 'haiping.chen@hotmail.com',
					pass: '********'
				}
			});
			// setup e-mail data with unicode symbols 
			var mailOptions = {
				from: '"PMS" <haiping.chen@hotmail.com>', // sender address 
				to: 'hpc708@msn.com', // list of receivers 
				subject: 'Appointment Date Changed', // Subject line 
				text: 'Appointment date of ' + patient.name + ' is Changed to ' + patient.appointment + ', ' + patient.time + '.', // plaintext body 
				html: '<b>Appointment date of ' + patient.name + ' is Changed to' + patient.appointment + ', ' + patient.time + '.</b>' // html body 
			};
			// send mail with defined transport object 
			transporter.sendMail(mailOptions, function(error, info){
				if(error){
					return console.log(error);
				}
				console.log('Message sent: ' + info.response);
			});
		} else {
			res.json({
				appointment: 'Date change Failed',
				tiem: '!'
			});
		}
	}
	
	function submit(error, response, body) {
		if (!error && response.statusCode == 200) {
			request(options4, getUpdateInfo);
		} else {
			res.json({
				appointment: 'Date change Failed',
				tiem: '!'
			});
		}
	}

	request(options3, submit);
});


app.use('/fonts', express.static(__dirname + '/fonts'));
app.use('/public', express.static(__dirname + '/public'));
app.use('/patientservice', express.static(__dirname + '/index.html'));

//Create proxy server.
https.createServer(certs, app).listen(7000, function () {
   console.log('API is running on port 7000!');
});
