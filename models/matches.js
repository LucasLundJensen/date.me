var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/datingsite', { useNewUrlParser: true});

var db = mongoose.connection;


// User Schema
var UserSchema = mongoose.Schema({
	email: {
		type: String,
		index: true
	},
	matchEmail: {
		type: String
	},
	response: {
		type: String
	}
});


var Match = module.exports = mongoose.model('Match', UserSchema);

//Create Match
module.exports.createMatch = function(newMatch, callback) {
	bcrypt.genSalt(10, function(err, salt) {
        newMatch.save(callback);
	})
}

// Check if match exists
module.exports.matchExist = function(email, callback){
	var query = {email: email, response: 'awaiting'};
	User.find(query, callback);
}

// Update Match response to Match
module.exports.updateResponse = function(email, response, callback) {
	var findQuery = {"email": email};
	var updateQuery = {$set:{response: response}};

	Match.updateOne(findQuery, updateQuery, callback);
}

module.exports.bestMatch = function(users, currentUser) {
    var closest = users[0].age;
	var user = [];

    for (var i = 0; i < users.length; i++) {
		
		console.log();
		console.log("closest: " + closest);
		console.log("user: " + user);
		console.log("currentUserAge: " + currentUser.age);
		console.log("users[i].age: " + users[i].age);
		console.log();

        if (closest === null || Math.abs(currentUser.age - closest) > Math.abs(users[i].age - currentUser.age)) {


			if (currentUser.maximumAge >= users[i].age && currentUser.minimumAge <= users[i].age){

				closest = users[i].age;
				user = users[i];
			
			}
		}
	}
    return user;
}