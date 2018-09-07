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
var Matches = require('../models/matches')

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

router.get('/user/profile', ensureAuthenticated, function(req, res){
	res.render('authed/profile');
});

router.get('/user/settings', ensureAuthenticated, function(req, res, next) {
	res.redirect('/user/settings/profile')
})

router.get('/user/settings/profile', ensureAuthenticated, function(req, res, next) {
	res.render('authed/settings');
})

router.get('/user/settings/security', ensureAuthenticated, function(req, res, next) {
	res.render('authed/settings');
})

router.get('/user/editStandards', ensureAuthenticated, function(req, res, next) {
	res.render('authed/editStandards');
})


router.post('/user/settings/security/DeleteAccount', ensureAuthenticated, function(req, res) {
	User.deleteUserByID(req.user._id, function(err, feedback){
		if (err) {
			throw err;
		}
		console.log(feedback);

		req.flash('success', 'Account has been deleted');
		res.location('/');
		res.redirect('/');
	});
})


router.get('/user/matches', ensureAuthenticated, function(req, res, next) {
	User.find({}, function(err, users){
		if(err){
			console.log(err);
		} else {
			var matches;

			var match = bestMatchByAge(req.user.age, users, req.user)
			res.render('authed/matches', {match: match});
			console.log(match);
		}
	});
})



function bestMatchByAge(num, users, currentUser) {
   var closest = null;
   var user = null;
	for (var i = 0; i < users.length; i++) {
		if (closest === null || (num - closest) >= (users[i].age - num) && users[i].username != currentUser.username) {
			closest = users[i].age;
			user = users[i];
		}
		console.log(users[i].age);
	}
   return user;
}

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


router.post('/user/updateProfileImage', upload.single('avatar'), function(req, res, next){
	User.updateUserImage(req.user.username, req.file.filename, function(err, feedback){
		if (err) {
			throw err;
		}
		console.log(feedback);

		req.flash('success', 'Profile picture has been updated!')

		res.location('/user/settings/profile');
		res.redirect('/user/settings/profile');
	});
})

router.post('/user/editStandards', function(req, res, next){
	User.updateUserStandards(req.user.username, req.body.minimumAge, req.body.maximumAge, req.body.distance, function(err, feedback){
		if (err) {
			throw err;
		}
		console.log(feedback);

		req.flash('success', 'Your standards has been changed!')

		res.location('/user/matches');
		res.redirect('/user/matches');
	});
})

router.post('/register', function(req, res, next) {
	var username = req.body.username;
	var email = req.body.email;
	var age = req.body.age;
	var city = req.body.city;
	var postcode = req.body.postcode;
	var gender = req.body.gender;
	var preferedSex = req.body.preferedSex;
	var distance = "all";
	var bio = "";
	var minimumAge = 18;
	var maximumAge = 100;
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
			age: age,
			city: city,
			postcode: postcode,
			gender: gender,
			distance: distance,
			minimumAge: minimumAge,
			maximumAge: maximumAge,
			preferedSex: preferedSex,
			password: password,
			bio: bio,
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