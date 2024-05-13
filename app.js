const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');

dotenv.config({path: './.env'});

const app = express();
const db = require('./connection')

app.use(
    session({
        secret: 'secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 600000, //10 minutos em milisegundos
            secure: false //false deviso a não estar a usar https
        },
        rolling: true //dá reset ao tempo de sessão a cada request que o utilizador faz 
    })
);

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

app.set('view engine', 'hbs');

//Definir as rotas 
app.use('/', require('./routes/pages'));

app.listen(5050, () =>{
    console.log("Server started on port 5050");
});