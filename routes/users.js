var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var express = require('express');
var progress = require('progress-stream');
var multer  = require('multer');
var storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, 'public/uploads/')
	},
	filename: function(req, file, cb) {
		cb(null, Date.now() + file.originalname);
	}
});
var upload = multer({ storage: storage });
var User = require('../models/user');

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.getUserById(id, function(err, user) {
		done(err, user);
	});
});

passport.use(new LocalStrategy(function(username, password, done){
	User.getUserByUsername(username, function(err, user) {
		if (err) throw err;

		if (!user) {
			return done(null, false, {message: 'Unknown User'});
		}

		User.comparePassword(password, user.password, function(err, isMatch) {
			if (err) return done(err);
			if (isMatch) {
				return done(null, user);
			}else {
				return done(null, false, {message: 'Invalid Password'});
			}
		});
	});
}));

//Example for folder redirection
router.get('/temp', function(req, res){
	res.render('authed/index');
});

//Post request used in the login form
router.post('/login', passport.authenticate('local', {failureRedirect:'/', failureFlash: 'Invalid username or password'}), function(req, res) {
	req.flash('success', 'You are now logged in!');
	res.redirect('/');
});

//Logs the user out
router.get('/logout', ensureAuthenticated, function(req, res){
	req.logout();
	req.flash('success', 'You are now logged out!');
	res.redirect('/');
});

router.get('/register', function(req, res, next) {
	res.render('register');
});

router.post('/register', function(req, res, next) {
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var confirmPassword = req.body.confirmPassword;
	var profileimage = 'noimage.png';
	var accountRank;
	if (accountRank) {
		accountRank = req.body.accountRank;
	}else {
		accountRank = 0;
	}
	//Validator
	req.checkBody('username', 'Username field is empty').notEmpty();
	req.checkBody('email', 'Email field is empty').notEmpty();
	req.checkBody('password', 'Password field is empty').notEmpty();
	req.checkBody('confirmPassword', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if (errors) {
		res.render('/register', {
			errors: errors
		});
	} else {
		var newUser = new User({
			username: username,
			email: email,
			password: password,
			profileImage: profileimage,
			accountRank: accountRank
		});

		User.createUser(newUser, function(err, user){
			if (err) {
				throw err;
			}
			console.log(user);
		});

		req.flash('success', 'Account has been created!');

		res.location('/');
		res.redirect('/');
	}
});

function ensureAuthenticated(req, res, next){
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}

module.exports = router;