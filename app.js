var express = require('express');
var app = express();
var server = app.listen(3000, function(){
	console.log('Server listening to port 3000...');
});
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var expressValidator = require('express-validator');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var bcrypt = require('bcryptjs');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var io = require('socket.io').listen(server);

var db = mongoose.connection;
var Message = require('./models/message');


var mainRoute = require('./routes/index');
var usersRoute = require('./routes/users');

app.use(bodyParser.urlencoded({extended: false}));
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use('/socket-io', express.static(__dirname + '/node_modules/socket.io-client/dist/'));

//Handle Sessions
app.use(session({
	secret:'secret',
	saveUninitialized: true,
	resave: true
}));

//Passport
app.use(passport.initialize());
app.use(passport.session());

//Validator
app.use(expressValidator({
	errorFormatter: function(param, msg, value){
		var namespace = param.split('.'),
		root = namespace.shift(),
		formParam = root;

		while(namespace.length){
			formParam += '[' + namespace.shift() + ']';
		}
		return{
			param : formParam,
			msg : msg,
			value: value
		};
	}
}));
app.use(require('connect-flash')());
app.use(function(req, res, next){
	res.locals.messages = require('express-messages')(req, res);
	next();
});

app.get('*', function(req, res, next) {
	res.locals.user = req.user || null;
	res.locals.url = req.url || null;
	next();
});

//socket.io
io.on('connection', function(socket) {
	console.log('A user connected');
	console.log(socket.id);
	socket.on('disconnect', function() {
		console.log('A user disconnected');
	})
    socket.on('chat message', function (msg) {
        console.log('message: ' + msg.msg + ', to: ' + msg.to + ', from: ' + msg.from + ' AKA: ' + msg.fromName);
		io.emit(msg.to, msg.from, msg.fromName, msg.msg);
		Message.createMessageRecord(msg.from, msg.to, msg.fromName, msg.msg);
	})
	socket.on('get message', function (msg) {

		Message.find({ $or:[ {to: msg.to, from: msg.from}, {to: msg.from, from: msg.to} ] }, function(err, message){
			if(err) throw err;
			console.log(message);
			io.emit('get message', message);
		})

	})
	socket.on('new user', function(data, callback) {
		//idk
	});
})

app.use('/', mainRoute);
app.use('/', usersRoute);