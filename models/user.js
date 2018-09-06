var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/datingsite', { useNewUrlParser: true});

var db = mongoose.connection;

// User Schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index: true
	},
	password: {
		type: String
	},
	email: {
		type: String
	},
	gender: {
		type: String
	},
	preferedSex: {
		type: String
	},
	profileImage: {
		type: String
	},
	accountRank: {
		type: Number
	},
	age: {
		type: String
	},
	city: {
		type: String
	},
	postcode: {
		type: String
	},
	joinDate: {
		type: String
	},
	distance: {
		type: String
	},
	minimumAge: {
		type: Number
	},
	maximumAge: {
		type: Number
	}
});


var User = module.exports = mongoose.model('User', UserSchema);

// User Functions

//Create user
module.exports.createUser = function(newUser, callback) {
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(newUser.password, salt, function(err, hash) {
			newUser.password = hash;
			newUser.save(callback);
		})
	})
}

//Update the users image
module.exports.updateUserImage = function(username, profileImage, callback){
	var findQuery = {username: username};
	var updateQuery = {$set:{profileImage: profileImage}};

	User.update(findQuery, updateQuery, callback);
}


//Get user by id
module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}


//Get user by username
module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}


//Compare passwords (used in login)
module.exports.comparePassword = function(candidatePassword, hash, callback) {
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
		callback(null, isMatch);
	});
}

//Delete user by userid
module.exports.deleteUserByID = function(userid, callback) {
	var query = {"_id": 'ObjectId("' + userid + '"'}
	User.deleteOne(query, callback);
}