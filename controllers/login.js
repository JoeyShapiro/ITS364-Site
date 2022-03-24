const express = require('express');
const router = express.Router();
const db = require('../database');


// Render the page for an artist
function renderArtist(res, user) {
    (async () => {
        artist = (await db.query('SELECT * FROM artist WHERE ArtistPID=?', [user.PID]))[0]; // cant do [0], because says "cant add command when conn is close state"
        schedule = await db.query("SELECT ArtistScheduleID, StartDate FROM artist_schedule WHERE ArtistID=? AND StartDate > NOW()", [artist.ArtistID]);
        pays = await db.query("SELECT a.ArtistID, Total-(Total*(c.Royalty/100))-e.Amount AS 'Payment' FROM invoice INNER JOIN artist a on a.ArtistID = invoice.ArtistID INNER JOIN contract c on a.ArtistID = c.ArtistID INNER JOIN expense e on invoice.ExpenseID = e.ExpenseID WHERE a.ArtistID=?", [artist.ArtistID]);
        ratings = await db.query("SELECT rating FROM artist_rating WHERE ArtistID=?", [artist.ArtistID]);

        pay = pays[0];
        rating = ratings[0];
        res.render('artist', {user: artist, schedule, pay, rating});
    })();
}

// Render the page for a manager
function renderManager(res, user) {
    (async () => {
        let artistManager = (await db.query('SELECT * FROM artistmanager WHERE PID=?', user.PID))[0];
        let artists = await db.query('SELECT artist.ArtistID, artist.FirstName, artist.LastName FROM artist INNER JOIN contract on artist.ArtistID = contract.ArtistID WHERE ArtistManagerID=?', artistManager.ArtistManagerID);

        res.render('manager', {user: artistManager, artists});
    })();
}

// Render the page for a customer
function renderCustomer(res, user) {
    CustomerID = 1;

    (async () => {
        res.render('customer', {user});
    })();
}

// Render the page for an admin
function renderAdmin(res) {
    (async () => {
        res.render('admin');
    })();
}


// Since this file handles routes for /login,
// this is actually the route '/login'
// even though '/' is the argument used for the route.
router.get('/', function(req, res, next) {
    res.render('login', {});
});


// Handle login and check credentials
router.post('/', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    (async () => {
        // BINARY makes the statement case-sensitive.
        let users = await db.query('SELECT Type, PID FROM people WHERE Username = ? AND BINARY Password = ?', [username, password]); // this seems the best way, then in func get id, rather than get every type
        if (users.length != 1) {
            res.render('error', {errorMessage: 'Invalid username or password'});
            return;
        }

        let user = users[0];
    
        if (user.Type.toLowerCase() == 'artist') {
            renderArtist(res, user);
        } else if (user.Type.toLowerCase() == 'artist manager') {
            renderManager(res, user);
        } else if (user.Type.toLowerCase() == 'customer') {
            renderCustomer(res, user);
        } else if (user.Type.toLowerCase() == 'owner') {
            renderAdmin(res); 
        } else {
            res.render('error', {errorMessage: 'Unknown user type'});
        }
    })();
});

module.exports = router;