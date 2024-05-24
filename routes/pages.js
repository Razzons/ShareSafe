const express = require('express');
const router = express.Router();

router.get('/', (req,res) => {
    res.render('index');
});

router.get('/home', (req,res) => {
    res.render('home', { user: req.session.user });
});

router.get('/chat', (req, res) => {
    res.render('chat', { user: req.session.user });
});

router.get('/grp_create', (req, res) => {
    res.render('grp_create', { user: req.session.user });
});

router.get('/message', (req, res) => {
    res.render('message', { user: req.session.user });
});

module.exports = router;