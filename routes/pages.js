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
    db.query('SELECT id, username FROM User', (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).send('An error occurred');
        }
        res.render('grp_create', { user: req.session.user, users: results });
    });
});


router.get('/message', (req, res) => {
    res.render('message', { user: req.session.user });
});

router.post('/group-create', (req, res) => {
    const { groupName, userGroup } = req.body;

    if (!groupName || !userGroup || userGroup.length === 0) {
        return res.status(400).send('O nome do grupo e pelo menos um elemento é necessário.');
    }

    const diffieGrp = 'default_value';

    const groupQuery = 'INSERT INTO groups (userId, name, diffieGrp) VALUES ?';
    const groupValues = userGroup.map(userId => [userId, groupName, diffieGrp]);

    db.query(groupQuery, [groupValues], (error, results) => {
        if (error) {
            console.error('Error inserting group:', error);
            return res.status(500).send('Ocorreu um erro ao criar o grupo.');
        }

        res.redirect('/success');
    });
});


module.exports = router;
