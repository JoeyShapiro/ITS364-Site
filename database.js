const mysql = require('mysql2');
const util = require('util');
const fs = require('fs');

// Read the database credentials and settings from the config file
const settings = JSON.parse(fs.readFileSync('secret.json', 'utf8'));
const serverCa = [fs.readFileSync("DigiCertGlobalRootCA.crt.pem", 'utf-8')];

const config = {
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

conn.connect(function(err) {
    // Don't start the app if we faild to connect to the database
    if (err) throw err;
});

const query = util.promisify(conn.query).bind(conn);

module.exports = {connection: conn, query: query};