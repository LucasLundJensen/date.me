var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/datingsite', { useNewUrlParser: true});

var db = mongoose.connection;


// User Schema
var MessageSchema = mongoose.Schema({
	from: {
		type: String
    },
    to: {
		type: String
	},
	fromName: {
		type: String
	},
	message: {
		type: String
	},
	messageDateTime: {
		type: String
	}
});


var Match = module.exports = mongoose.model('Message', MessageSchema);

//Create Message
module.exports.createMessage = function(newMessage, callback) {
	bcrypt.genSalt(10, function(err, salt) {
        newMessage.save(callback);
	})
}

module.exports.createMessageRecord = function(_idFrom, _idTo, _fromName, _message) {
    var from = _idFrom;
	var to = _idTo;
	var fromName = _fromName;
	var message = _message;
	var messageDateTime = new Date().toLocaleDateString();

	var newMessage = new Match({
		from: from,
		to: to,
		fromName: _fromName,
		message: message,
		messageDateTime: messageDateTime
	});

	Match.createMessage(newMessage, function(err, message){
		if (err) {
			throw err;
		}
	});
}