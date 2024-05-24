const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const db = require('../connection');

exports.send = (req, res) => {
    const { cipher } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    // Lê o conteúdo do arquivo
    const filePath = file.path;
    const fileBuffer = fs.readFileSync(filePath);

    // Gera uma chave para cifrar o arquivo
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    // Função para cifrar usando AES
    const encryptFile = (buffer, key, iv) => {
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(buffer);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return encrypted;
    };

    // Cifra o arquivo
    const encryptedFile = encryptFile(fileBuffer, key, iv);

    // Calcula um código de autenticação de mensagens (MAC) usando HMAC
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(encryptedFile);
    const messageAuthenticationCode = hmac.digest('hex');

    // Converte a chave e o IV para strings para armazenamento
    const keyUsed = key.toString('hex');
    const ivUsed = iv.toString('hex');

    const user_id = req.session.user.id;
    // Insere os dados na base de dados para cada usuário
    const query = 'INSERT INTO Global (user_id, file, key_used, iv_used, cipher, mac) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [user_id, encryptedFile, keyUsed, ivUsed, cipher, messageAuthenticationCode], (err, results) => {
        if (err) {
            console.error('Error inserting file:', err);
            return res.status(500).send('Error inserting file.');
        }

        // Remove o arquivo temporário após a cifragem e a inserção na base de dados
        fs.unlinkSync(filePath);

        res.status(200).send('File sent securely to all users!');
    });
};

exports.encrypt = (req, res) => {
    const {} = req.body;
    //Inserir script de python para encriptar com base numa flag que virá do body
};

exports.decrypt = (req, res) => {
    //Inserir script de python para desencriptar
};