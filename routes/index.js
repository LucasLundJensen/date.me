var express = require('express');
var router = express.Router();

//If the user is authenticated, redirect to the logged in page, if not redirect to login page
router.get('/', function(req, res, next){
	if (req.isAuthenticated()) {
		res.render('authed/home');
	}else{
		res.render('login');
	}
});

module.exports = router;