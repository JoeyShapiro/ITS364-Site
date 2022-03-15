// "imports"
const mysql = require('mysql2');
const fs = require('fs');
const exphbs = require('express-handlebars');
const util = require('util');

// express server
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// settings for express app
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.engine('hbs', exphbs.engine({
    defaultLayout: 'main',
    extname: '.hbs'
}));
app.set('view engine', 'hbs');

// mysql settings
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

// start server
app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});


// node native promisify
const query = util.promisify(conn.query).bind(conn); // no idea what this does, but somehow returns result, rather than that other stuff

// render the page for an artist
function renderArtist(res) {
    artistID = 1;

    (async () => {
        users = await query('SELECT * FROM artist WHERE artistID='+artistID); // cant do [0], because says "cant add command when conn is close state"
        schedule = await query("SELECT ArtistScheduleID, StartDate FROM artist_schedule WHERE ArtistID="+ artistID +" AND StartDate > NOW()");
        pays = await query("SELECT a.ArtistID, Total-(Total*(c.Royalty/100))-e.Amount AS 'Payment' FROM invoice INNER JOIN artist a on a.ArtistID = invoice.ArtistID INNER JOIN contract c on a.ArtistID = c.ArtistID INNER JOIN expense e on invoice.ExpenseID = e.ExpenseID WHERE a.ArtistID="+artistID);
        ratings = await query("SELECT rating FROM artist_rating WHERE ArtistID="+artistID);
        //conn.end(); // c48 actually has to close here
        user = users[0];
        pay = pays[0];
        rating = ratings[0];
        res.render('artist', {user, schedule, pay, rating});
    })();
}

// render the page for a manager
function renderManager(res) {
    ArtistManagerID = 1;

    (async () => {
        users = await query('SELECT * FROM artistmanager WHERE ArtistManagerID='+ArtistManagerID);
        artists = await query('SELECT artist.ArtistID, artist.FirstName, artist.LastName FROM artist INNER JOIN contract on artist.ArtistID = contract.ArtistID WHERE ArtistManagerID='+ArtistManagerID);
        //conn.end(); // c48 actually has to close here
        user = users[0];
        res.render('manager', {user, artists});
    })();
}

// render the page for a customer
function renderCustomer(res) {
    CustomerID = 1;

    (async () => {
        //conn.end(); // c48 actually has to close here
        user = users[0];
        res.render('customer', {user});
    })();
}

// render the page for searching
function renderSearch(res, res_body) {
    (async () => {
        res_search = [];
        if (res_body != undefined)
            res_search = await query('SELECT ArtistID, FirstName, LastName, Instruments FROM Artist WHERE Instruments LIKE \'%'+res_body.search+'%\'');
        //conn.end();
        res.render('search', {res_body, res_search});
    })();
}

// GET
app.get('/', function (req, res, next) {
    conn.connect();
    pid = 1;
    user_type = 'search';

    if (user_type == 'artist')
        renderArtist(res);
    else if (user_type == 'manager')
        renderManager(res);
    else if (user_type == 'customer')
        renderCustomer(res);
    else if (user_type == 'search')
        renderSearch(res, {});
    else
        res.render('home');
});

// POST
app.post('/', function(req, res) {
    var body = req.body;

    var res_body = {
        search: body.search
    };

    renderSearch(res, res_body);
});