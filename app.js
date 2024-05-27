const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const multer = require('multer');
const hbs = require('hbs'); 
const bodyParser = require('body-parser')

dotenv.config({path: './.env'});

const app = express();
const db = require('./connection');
const generateSessionKey = require('./session');

app.use(
    session({
        secret: generateSessionKey(),
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

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.set('view engine', 'hbs');


//Definir as rotas 
app.use('/', require('./routes/pages'));
app.use("/auth", require("./routes/auth"));
app.use("/msg", require("./routes/message"));

app.listen(5050, () =>{
    console.log("Server started on port 5050");
});
