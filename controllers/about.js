const express = require('express');
const router = express.Router();
const db = require('../database');

// Since this file handles routes for /about,
// this is actually the route '/about'
// even though '/' is the argument used for the route.
router.get('/', function(req, res, next) {
    res.render('error', {errorMessage: 'Not implemented'});
});

module.exports = router;