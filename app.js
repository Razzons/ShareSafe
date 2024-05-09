const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');

dotenv.config({path: './.env'});

const app = express();
const db = require('./connection')

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

app.set('view engine', 'hbs');

//Definir as rotas 
app.use('/', require('./routes/pages'));

app.get("/", (req, res) => {
    res.send("<h1>Home Page</h1>")
});

app.listen(5001, () =>{
    console.log("Server started on port 5001");
});