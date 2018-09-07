module.exports.bestMatchByAge = function(users, currentUser) {
    var closest = null;
    var user = null;
    for (var i = 0; i < users.length; i++) {
        if ((closest === null || (currentUser.age - closest) >= (users[i].age - currentUser.age)) && users[i].username != currentUser.username) {
            closest = users[i].age;
            user = users[i];
        }
    }
    return user;
 }