


module.exports.bestMatchByAge = function(num, users, currentUser) {
    var closest = null;
    var user = null;
    for (var i = 0; i < users.length; i++) {
        if ((closest === null || (num - closest) >= (users[i].age - num)) && users[i].username != currentUser.username) {
            closest = users[i].age;
            user = users[i];
        }
    }
    return user;
 }