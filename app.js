var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var expressValidator = require('express-validator');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var bcrypt = require('bcryptjs');
var mongodb = require('mongodb');
var mongoose = require('mongoose');

var db = mongoose.connection;
var app = express();

var mainRoute = require('./routes/index');

app.use(bodyParser.urlencoded({extended: false}));
app.set("view engine", "ejs");
app.use(express.static('public'));

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

app.use('/', mainRoute);

app.listen(3000, function(){
    console.log("Listening to port 3000...");
});