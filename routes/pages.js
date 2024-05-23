const express = require('express');
const router = express.Router();

router.get('/', (req,res) => {
    res.render('index');
});

router.get('/home', (req,res) => {
    res.render('home');
});

router.get('/chat', (req, res) => {
    res.render('chat');
});

router.get('/group_create', (req, res) => {
    res.render('grp_create');
});

router.get('/message', (req, res) => {
    res.render('message');
});

module.exports = router;