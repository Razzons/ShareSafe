const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const db = require('../connection');
const os = require('os')

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

const createTempFile = (data, callback) => {
    const tempFilePath = path.join(os.tmpdir(), `tempfile-${Date.now()}`);
    fs.writeFile(tempFilePath, data, (err) => {
        if (err) return callback(err);
        callback(null, tempFilePath);
    });
};

const removeTempFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting temporary file:', err);
    });
};

exports.decrypt = (req, res) => {
    console.log('Middleware body:', req.body);

    const { id } = req.body;

    console.log('Received ID:', id);

    if (!id) {
        return res.status(400).send('File ID is required.');
    }

    const query = 'SELECT * FROM Global WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching file:', err);
            return res.status(500).send('Error fetching file.');
        }

        console.log('Database query results:', results);

        if (results.length === 0) {
            return res.status(404).send('File not found.');
        }

        const fileData = results[0];
        const encryptedFile = Buffer.from(fileData.file, 'hex');
        const keyUsed = Buffer.from(fileData.key_used, 'hex');
        const ivUsed = Buffer.from(fileData.iv_used, 'hex');
        const cipherType = 'aes-256-cbc'


        console.log('File data:', fileData);
        console.log('Encrypted file:', encryptedFile);
        console.log('Key used:', keyUsed);
        console.log('IV used:', ivUsed);
        console.log('Cipher type:', cipherType);

        const decryptFile = (encrypted, key, iv) => {
            const decipher = crypto.createDecipheriv(cipherType, key, iv);
            let decrypted = decipher.update(encrypted);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return decrypted;
        };

        const decryptedFile = decryptFile(encryptedFile, keyUsed, ivUsed);

        console.log('Decrypted file:', decryptedFile);

        const hmac = crypto.createHmac('sha256', keyUsed);
        hmac.update(encryptedFile);
        const calculatedMac = hmac.digest('hex');

        console.log('Calculated MAC:', calculatedMac);
        console.log('Stored MAC:', fileData.mac);

        if (calculatedMac !== fileData.mac) {
            return res.status(400).send('File integrity check failed.');
        }

        createTempFile(decryptedFile, (err, tempFilePath) => {
            if (err) {
                console.log(err);
                return res.status(500).send('An error occurred while creating the temporary file.');
            }

            console.log('Temporary file path:', tempFilePath);

            res.download(tempFilePath, `decrypted_file_${id}`, (err) => {
                removeTempFile(tempFilePath);
                if (err) {
                    console.error('Error sending file:', err);
                }
            });
        });
    });
};