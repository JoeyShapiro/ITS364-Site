const express = require('express');
const router = express.Router();
const db = require('../database');

function renderSearch(res, res_body) {
    (async () => {
        res_search = [];
        if (res_body != undefined)
            res_search = await db.query('SELECT ArtistID, FirstName, LastName, Instruments FROM Artist WHERE Instruments LIKE ?', '%' + res_body.search + '%');

        res.render('search', {res_body, res_search});
    })();
}

// Since this file handles routes for /search,
// this is actually the route '/search'
// even though '/' is the argument used for the route.
router.get('/', function(req, res, next) {
    renderSearch(res);
});

router.post('/', function(req, res) {
    console.log('search');
    const body = req.body;

    const res_body = {
        search: body.search
    };

    renderSearch(res, res_body);
});

module.exports = router;