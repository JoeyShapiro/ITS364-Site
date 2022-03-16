const express = require('express');
const router = express.Router();


// This file defines all routes and which controller
// file will handle the route
var home = require('./home');
var search = require('./search');
var artist = require('./artist');
var about = require('./about');
var login = require('./login');


router.use('/', home);
router.use('/home', home);
router.use('/search', search);
router.use('/artist', artist);
router.use('/about', about);
router.use('/login', login);



module.exports = router;