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
var Match = require('../models/matches')

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.getUserById(id, function(err, user) {
		done(err, user);
	});
});

passport.use(new LocalStrategy({
		usernameField: 'email'
	},
	function(username, password, done){
	User.getUserByEmail(username, function(err, user) {
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

router.get('/user/profile/:userid', ensureAuthenticated, function(req, res){
	User.getUserById(req.params.userid, function(err, user) {
		if (err) throw err;

	res.render('authed/profile', {fetchedUser: user});

	})
});

//Settings Page
router.get('/user/settings', ensureAuthenticated, function(req, res, next) {
	res.redirect('/user/settings/profile')
})

router.get('/user/settings/profile', ensureAuthenticated, function(req, res, next) {
	res.render('authed/settings');
})

router.get('/user/settings/security', ensureAuthenticated, function(req, res, next) {
	res.render('authed/settings');
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

router.post('/user/settings/profile/UpdateAge', ensureAuthenticated, function(req, res) {
	User.updateAge(req.user._id, req.body.age, function(err, feedback) {
		if(err) {
			req.flash('error', 'Age did not get updated');
			res.location('/user/settings/profile')
			res.redirect('/user/settings/profile')
			throw err;
		}
		console.log(feedback);

		req.flash('success', 'Age has been updated');
		res.location('/user/settings/profile')
		res.redirect('/user/settings/profile')
	})
})

router.post('/user/settings/profile/UpdateBio', ensureAuthenticated, function(req, res) {
	User.updateBio(req.user._id, req.body.bio, function(err, feedback) {
		if(err) {
			req.flash('error', 'Bio did not get updated');
			res.location('/user/profile/' + req.user._id)
			res.redirect('/user/profile/' + req.user._id)
			throw err;
		}
		console.log(feedback);

		req.flash('success', 'Bio has been updated');
		res.location('/user/profile/' + req.user._id)
		res.redirect('/user/profile/' + req.user._id)
	})
})


router.post('/user/settings/profile/UpdateGender', ensureAuthenticated, function(req, res) {
	User.updateGender(req.user._id, req.body.gender, function(err, feedback) {
		if(err) {
			req.flash('error', 'Gender did not get updated');
			res.location('/user/settings/profile')
			res.redirect('/user/settings/profile')
			throw err;
		}
		console.log(feedback);

		req.flash('success', 'Gender has been updated');
		res.location('/user/settings/profile')
		res.redirect('/user/settings/profile')
	})
})

router.post('/user/settings/profile/UpdateCity', ensureAuthenticated, function(req, res) {
	User.updateCity(req.user._id, req.body.city, function(err, feedback) {
		if(err) {
			req.flash('error', 'City did not get updated');
			res.location('/user/settings/profile')
			res.redirect('/user/settings/profile')
			throw err;
		}
		console.log(feedback);

		req.flash('success', 'City has been updated');
		res.location('/user/settings/profile')
		res.redirect('/user/settings/profile')
	})
})

router.post('/user/settings/security/UpdatePassword', ensureAuthenticated, function(req, res) {
	User.comparePassword(req.body.currentPassword, req.user.password, function(err, isMatch) {
		if (err) return done(err);
		if (isMatch) {
			User.updatePassword(req.user._id, req.body.newPassword, function(err, feedback) {
				if(err) throw err;

				req.flash('success', 'Account password has been updated');
				res.redirect('/user/settings/security')
			})
		} else {
			req.flash('error', 'Account password could not be updated');
			res.redirect('/user/settings/security')
		}
	})
})

router.post('/user/settings/profile/updateProfileImage', upload.single('avatar'), function(req, res, next){
	if(req.file === undefined){
		var uploadedImage = "noimage.png"
	} else {
		var uploadedImage = req.file.filename
	}
	User.updateUserImage(req.user._id, uploadedImage, function(err, feedback){
		if (err) {
			throw err;
		}
		console.log(feedback);

		req.flash('success', 'Profile picture has been updated!')

		res.location('/user/settings/profile');
		res.redirect('/user/settings/profile');
	});
})

router.post('/user/declineMatch', function(req, res, next){
	Match.updateResponse(req.user.email, "declined", function(err, feedback){
		if (err) {
			throw err;
		}
		console.log(feedback);

		req.flash('success', 'Match has been declined!');

		res.location('/user/matches');
		res.redirect('/user/matches');
	});
})

//Matches Page
router.get('/user/editStandards', ensureAuthenticated, function(req, res, next) {
	res.render('authed/editStandards');
})

router.get('/user/matches', ensureAuthenticated, function(req, res, next) {
	User.find({ _id: { $ne : req.user._id}, gender: req.user.preferedSex }, function(err, users){
		if(err){
			console.log(err);
		} else {

			Match.find({email: req.user.email}, function(err, matches){
				if(err) {
					console.log(err);
				} else {
					var match = null;

					// Her fjerner vi de personer der er blevet declined
					for (var i = 0; i < matches.length; i++) {
						for (var x = 0; x < users.length; x++) {
							if (users[x].email == matches[i].matchEmail && matches[i].response == "declined") {
								users.splice(x, 1);
							}
						}
					}
					match = Match.bestMatch(users, req.user)
					var response = "";

					if (match != null) {
						if (matches.length > 0) {
							var temp = 0;
							for(var i = 0; i < matches.length; i++){
								if (matches[i].matchEmail == match.email) {
									temp = 1;
								}
							}
							if(temp == 0) {
								Match.createMatchRecord(req.user.email, match.email);

							}
						} else {
							console.log("loop else");
							Match.createMatchRecord(req.user.email, match.email);
						}

						res.render('authed/matches', {match: match});

					} else {
						console.log("else");
						if (match !== null) {
							Match.createMatchRecord(req.user.email, match.email);
						}
						res.render('authed/matches', {match: match});
					}

				} 
			});
		}
	});
})

router.post('/user/editStandards', function(req, res, next){
	User.updateUserStandards(req.user._id, req.body.minimumAge, req.body.maximumAge, function(err, feedback){
		if (err) {
			throw err;
		}
		console.log(feedback);

		req.flash('success', 'Your standards has been changed!')

		res.location('/user/matches');
		res.redirect('/user/matches');
	});
})

//Login / Logout Page
//Post request used in the login form
router.post('/login', passport.authenticate('local', {failureRedirect:'/', failureFlash: 'Invalid email or password'}), function(req, res) {
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
	var email = req.body.email.toLowerCase();
	var age = req.body.age;
	var city = req.body.city;
	var postcode = req.body.postcode;
	var gender = req.body.gender;
	var preferedSex = req.body.preferedSex;
	var bio = "This user has not yet set their bio.";
	var minimumAge = 18;
	var maximumAge = 100;
	var password = req.body.password;
	var joinDate = new Date().toLocaleDateString();
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
	req.checkBody('age', 'Age has to be numeric').isNumeric();
	req.checkBody('city', 'City field is empty').notEmpty();
	req.checkBody('postcode', 'Postcode field has to be numeric').isNumeric();
	req.checkBody('postcode', 'Postcode field is empty').notEmpty();
	req.checkBody('gender', 'Gender not selected').not().contains('selectGender');
	req.checkBody('preferedSex', 'Prefered Sex not selected').not().contains('selectGender');
	req.checkBody('password', 'Password field is empty').notEmpty();
	req.checkBody('password', 'Password has to be atleast 5 charcters long').isLength({min: 5, max: 999});
	req.checkBody('confirmPassword', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if (errors) {
		res.render('register', {
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
			minimumAge: minimumAge,
			maximumAge: maximumAge,
			joinDate: joinDate,
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
			if(!user) {
				req.flash('error', 'Account has not been created, email already exists!');
				res.redirect('/register')
			} else {
				console.log(user)
				req.flash('success', 'Account has been created!');

				res.location('/');
				res.redirect('/');
			}
		});
	}
});





function ensureAuthenticated(req, res, next){
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}

module.exports = router;