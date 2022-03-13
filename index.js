const mysql = require('mysql2');
const fs = require('fs');
var express = require('express');
var app = express();

app.use(express.static('public'))

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


app.get('/', function (req, res) {
    conn.connect();
    conn.query('SELECT * FROM artist', function(err, rows, fields)   
    {  
        if (err) throw err;
        res.json(rows); 
    });
    conn.end();
});
