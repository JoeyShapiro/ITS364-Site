const mysql = require('mysql2');
const fs = require('fs');
var express = require('express');
const exphbs = require('express-handlebars');
const util = require('util');
var app = express();

app.use(express.static('public'))

app.engine('hbs', exphbs.engine({
    defaultLayout: 'main',
    extname: '.hbs'
}));

app.set('view engine', 'hbs');

var settings = JSON.parse(fs.readFileSync('secret.json', 'utf8')); // could just make this config

const serverCa = [fs.readFileSync("DigiCertGlobalRootCA.crt.pem", 'utf-8')];
var config =
{
   host     : settings['host'],
   user     : settings['user'],
   password : settings['password'],
   database : settings['database'],
   port: 3306,
   ssl: {
        rejectUnauthorized: true,
        ca: serverCa
    }
};

const conn = new mysql.createConnection(config);

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});


// node native promisify
const query = util.promisify(conn.query).bind(conn); // no idea what this does, but somehow returns result, rather than that other stuff

app.get('/', function (req, res) {
    conn.connect();
    artistID = 1;

    (async () => {
        users = await query('SELECT * FROM artist WHERE artistID='+artistID); // cant do [0], because says "cant add command when conn is close state"
        schedule = await query("SELECT ArtistScheduleID, StartDate FROM artist_schedule WHERE ArtistID="+ artistID +" AND StartDate > NOW()");
        pays = await query("SELECT a.ArtistID, Total-(Total*(c.Royalty/100))-e.Amount AS 'Payment' FROM invoice INNER JOIN artist a on a.ArtistID = invoice.ArtistID INNER JOIN contract c on a.ArtistID = c.ArtistID INNER JOIN expense e on invoice.ExpenseID = e.ExpenseID WHERE a.ArtistID="+artistID);
        ratings = await query("SELECT rating FROM artist_rating WHERE ArtistID="+artistID);
        conn.end(); // c48 actually has to close here
        user = users[0];
        pay = pays[0];
        rating = ratings[0];
        res.render('home', {user, schedule, pay, rating});
    })();
});
