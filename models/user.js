var bcrypt = require('bcryptjs');
const mongoose = require("../mongoose");

// User Schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index: true
	},
	password: {
		type: String,
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
		type: Number
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
	minimumAge: {
		type: Number
	},
	maximumAge: {
		type: Number
	},
	bio: {
		type: String
	}
});


var User = module.exports = mongoose.model('User', UserSchema);

// User Functions

//Create user
module.exports.createUser = function(newUser, callback) {
	this.checkEmailExists(newUser.email, function(err, feedback) {
		if(err) {
			console.log(err);
		}
		else {
			if(feedback) {
				return callback(null, false);
			} else {
				bcrypt.genSalt(10, function(err, salt) {
					bcrypt.hash(newUser.password, salt, function(err, hash) {
					newUser.password = hash;
					newUser.save(callback);
					})
				})
			}
		}
	})
		
	
	
}

module.exports.checkEmailExists = function checkEmailExists(userEmail, callback) {
	User.count({ email: userEmail }, function(err, count) {
	  if (err) {
		callback(err);
	  } else {
		callback(null, count !== 0);
	  }
	});
  };

//Update the users image
module.exports.updateUserImage = function(userid, profileImage, callback){
	var findQuery = {"_id": userid};
	var updateQuery = {$set:{profileImage: profileImage}};

	User.update(findQuery, updateQuery, callback);
}

//Update the users Standards
module.exports.updateUserStandards = function(userid, minimumAge, maximumAge, callback){
	var findQuery = {"_id": userid};
	var updateQuery = {$set:{minimumAge: minimumAge, maximumAge: maximumAge}};

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

//Get user by email
module.exports.getUserByEmail = function(email, callback){
	email = email.toLowerCase();
	var query = {email: email};
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
	var query = {"_id": userid}
	User.deleteOne(query, callback);
}

module.exports.updateAge = function(userid, age, callback) {
	var findQuery = {"_id": userid};
	var updateQuery = {$set:{age: age}};

	User.update(findQuery, updateQuery, callback);
}

module.exports.updateBio = function(userid, bio, callback) {
	var findQuery = {"_id": userid};
	var updateQuery = {$set:{bio: bio}};

	User.update(findQuery, updateQuery, callback);
}

module.exports.updateGender = function(userid, gender, callback){
	var findQuery = {"_id": userid};
	var updateQuery = {$set:{gender: gender}};

	User.update(findQuery, updateQuery, callback);
}

module.exports.updateCity = function(userid, city, callback){
	var findQuery = {"_id": userid};
	var updateQuery = {$set:{city: city}};

	User.update(findQuery, updateQuery, callback);
}

module.exports.updatePassword = function(userid, newPassword, callback){
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(newPassword, salt, function(err, hash) {
			newPassword = hash;
			var findQuery = {"_id": userid};
			var updateQuery = {$set:{password: newPassword}};
			User.update(findQuery, updateQuery, callback);
		})
	})
}