var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Match = require('../models/matches');

//If the user is authenticated, redirect to the logged in page, if not redirect to login page
router.get('/', function(req, res, next){
    if (req.isAuthenticated()) {
        User.find({ _id: { $ne: req.user._id }, gender: req.user.preferedSex }, function (err, users) {
            if (err) {
                console.log(err);
            } else {
                Match.find({ email: req.user.email }, function (err, matches) {
                    if (err) {
                        console.log(err);
                    } else {
                        match = Match.bestMatch(users, req.user);
                        res.render('authed/index', { match: match});
                    }
                });
            }
        });
	}else{
		res.render('login');
	}
});

module.exports = router;