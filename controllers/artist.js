const express = require('express');
const router = express.Router();
const db = require('../database');

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

// Since this file handles routes for /artist,
// this is actually the route '/artist'
// even though '/' is the argument used for the route.
router.get('/', function(req, res, next) {
    renderArtist(res, {PID: 29});
});

module.exports = router;