$( '#editBio' ).on('click', function() {
    $( '.bioForm' ).toggleClass('visible');
    $( '#user_bio' ).toggleClass('invisible');
})

var joinDateElement = document.getElementById("joinDate"),
    jDate = joinDateElement.dataset.parent,
    today = new Date().toJSON().slice(0,10).replace(/-/g,'-'),
    milliseconds = (Date.parse(today) - Date.parse(jDate)),
    seconds = parseInt(Math.floor(milliseconds / 1000)),
    minutes = parseInt(Math.floor(seconds / 60)),
    hours = parseInt(Math.floor(minutes / 60)),
    days = parseInt(Math.floor(hours / 24))

joinDateElement.innerHTML = "Joined " + days + " days ago";