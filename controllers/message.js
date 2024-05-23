const bcrypt = require("bcryptjs");
const db = require("../connection");

exports.send = (req, res) => {
    const {} = req.body;

    db.query("INSERT ", (req, res) => {

    });
};

exports.encrypt = (req, res) => {
    const {} = req.body;
    //Inserir script de python para encriptar com base numa flag que virá do body
};

exports.decrypt = (req, res) => {
    //Inserir script de python para desencriptar
};