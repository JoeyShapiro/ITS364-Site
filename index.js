// "imports"
const express = require('express');
const morgan = require('morgan');
const commander = require('commander');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');

const routes = require('./controllers');


// Process command-line arguments
commander
  .version('0.0.1', '-v, --version')
  .usage('[OPTIONS]...')
  .option('-l, --log', 'enable request logging')
  .parse(process.argv);
const options = commander.opts();

// Initialize the database connection
const db = require('./database');

// Create the server object
let app = express();

// Log requests to the server to the console
if (options.log) {
    app.use(morgan('dev'));
}

// Global settings
app.use(express.static('public'));

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