const express = require('express');
const router = express.Router();
const db = require('../connection');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const os = require('os')



router.get('/', (req,res) => {
    res.render('index');
});

router.get('/home', (req,res) => {
    res.render('home', { user: req.session.user });
});

router.get('/help', (req,res) => {
    res.render('help', { user: req.session.user });
});

router.get('/chat', (req, res) => {
    const userId = req.session.user.id;

    // Função para buscar os nomes
    function getUsernames(userId, callback) {
        const sql = 'SELECT DISTINCT nome FROM Grupo WHERE user_id = ?';
        db.query(sql, [userId], (error, results) => {
            if (error) {
                return callback(error, null);
            }

            // Armazenando os resultados em um array
            const usernamesArray = results.map(row => row.nome);
            callback(null, usernamesArray);
        });
    }

    // Primeiro buscamos os nomes
    getUsernames(userId, (err, usernames) => {
        if (err) {
            console.log(err);
            return res.status(500).send('An error occurred while fetching usernames');
        }

        if (usernames.length === 0) {
            return res.status(404).send('No usernames found for this user');
        }

        // Construímos a query para buscar os arquivos
        const sql = `SELECT user_id,viewer, file, mac, id, cipher FROM Global WHERE viewer IN (${usernames.map(() => '?').join(', ')})`;
        
        // Executamos a query passando os nomes como parâmetros
        db.query(sql, usernames, (error, results) => {
            if (error) {
                console.log(error);
                return res.status(500).send('An error occurred while fetching files');
            }
            res.render('chat', { user: req.session.user, files: results });
        });
    });
});

router.get('/grp_create', (req, res) => {

    db.query('SELECT id, username FROM Users', (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).send('An error occurred');
        }
        res.render('grp_create', { user: req.session.user, users: results });
    });
});

router.get('/message', (req, res) => {
    const userId = req.session.user.id;
    console.log("id do user:", req.session.user.id);
    db.query('SELECT DISTINCT nome FROM Grupo WHERE user_Id = ?', [userId], (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).send('An error occurred');
        }
        res.render('message', { user: req.session.user, grupos: results });
    });
});

module.exports = router;
