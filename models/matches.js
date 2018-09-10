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

module.exports.bestMatch = function(users, matches = [],  currentUser) {
    var closest = null;
	var user = [];
	Loop1:
    for (var i = 0; i < users.length; i++) {
		
		console.log("closest" + closest + " : currentUser age" + currentUser.age + " : userAge" + users[i].age);


        if ((closest === null || (closest - currentUser.age) >= (users[i].age - currentUser.age)) && users[i].email != currentUser.email) {


            if (currentUser.preferedSex == users[i].gender){


                if (currentUser.maximumAge >= users[i].age && currentUser.minimumAge <= users[i].age){


					if(matches.length > 0){

						
						for (var x = 0; x < matches.length; x++) {
							console.log("Vi kommer ind i 1 loop");
							if (matches[x].response == "declined") {
								closest = users[i].age;
								user = users[i];
								console.log("declined");
								continue Loop1;
							} else if (matches[x].response == "awaiting") {
								console.log("declined");
								return users[i];
							}
						}
					}
                    closest = users[i].age;
                    user = users[i];
				}
			}
			console.log(users[i].username);
		}
		console.log(users[i].username);
    }
    return user;
}