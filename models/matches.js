






module.exports.bestMatch = function(users, currentUser) {
    var closest = null;
    var user = [];
    for (var i = 0; i < users.length; i++) {
        if ((closest === null || (currentUser.age - closest) >= (users[i].age - currentUser.age)) && users[i].email != currentUser.email) {
            if (currentUser.preferedSex == users[i].gender){
                if (currentUser.maximumAge >= users[i].age && currentUser.minimumAge <= users[i].age){
                    closest = users[i].age;
                    user = users[i];
                }
            }
        }
    }
    return user;
 }