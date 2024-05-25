const express = require('express');
const router = express.Router();
const db = require('../connection');

router.get('/', (req,res) => {
    res.render('index');
});

router.get('/home', (req,res) => {
    res.render('home', { user: req.session.user });
});

router.get('/chat', (req, res) => {
    db.query('SELECT * FROM Global', (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).send('An error occurred');
        }
        res.render('chat', { user: req.session.user, files: results });
    });
});

router.get('/grp_create', (req, res) => {
    res.render('grp_create', { user: req.session.user });
});

router.get('/message', (req, res) => {
    res.render('message', { user: req.session.user });
});

module.exports = router;
