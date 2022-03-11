const mysql = require('mysql2');
const fs = require('fs');
const { database } = require('pg/lib/defaults');

var settings = JSON.parse(fs.readFileSync('secret.json', 'utf8')); // could just make this config

const serverCa = [fs.readFileSync("BaltimoreCyberTrustRoot.crt.pem", 'utf-8')];
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

conn.connect(
    function (err) { 
        if (err) { 
            console.log("!!! Cannot connect !!! Error:");
            throw err;
        }
        else {
            console.log("Connection established.");
            readData();
        }
    });

function readData(){
    conn.query('SELECT * FROM artist', 
        function (err, results, fields) {
            if (err) throw err;
            else console.log('Selected ' + results.length + ' row(s).');
            for (i = 0; i < results.length; i++) {
                console.log('Row: ' + JSON.stringify(results[i]));
            }
            console.log('Done.');
        })
    conn.end(
        function (err) { 
            if (err) throw err;
            else  console.log('Closing connection.') 
    });
};