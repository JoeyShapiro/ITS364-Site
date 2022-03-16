// "imports"
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const routes = require('./controllers');

// Magic way to access database (The Node Way™️) (if you wanna know how this works it will probably take a while to explain, but it does work lol)
const db = require('./database');

// express server
let app = express();

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

// Routes are defined in the controllers/index.js file
app.use('/', routes);

// start server
app.listen(3000, function () {
    console.log('FAME Management Web Portal running on port 3000!');
});