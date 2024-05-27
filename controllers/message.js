const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const db = require('../connection');
const os = require('os')

exports.send = (req, res) => {
    const { cifra } = req.body;
    const { chatName } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    const user_id = req.session.user.id;

    // Lê o conteúdo do arquivo
    const filePath = file.path;
    const fileBuffer = fs.readFileSync(filePath);

    // Gera uma chave para cifrar o arquivo
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    

    // Função para verificar a assinatura digital
    const verifySignature = (publicKey, data, signature) => {
        const verify = crypto.createVerify('sha256');
        verify.update(data);
        verify.end();
        return verify.verify(publicKey, signature);
    };

    // Se o cifra for "signature", verificar a assinatura
    if (cifra === "signature") {
        const getPublicKeyQuery = "SELECT public_key FROM Users WHERE id = ?";
        db.query(getPublicKeyQuery, [user_id], (err, results) => {
            if (err) {
                console.error('Error fetching public key:', err);
                return res.status(500).send('Error fetching public key.');
            }

            if (results.length === 0) {
                return res.status(404).send('User not found.');
            }

            const publicKey = results[0].public_key;

            // Aqui, assumimos que o arquivo tem a assinatura anexada no final
            const signatureLength = 256; // tamanho da assinatura RSA SHA-256 em bytes
            const dataLength = fileBuffer.length - signatureLength;

            const data = fileBuffer.slice(0, dataLength);
            const file = fileBuffer.slice(0, dataLength); // dados originais
            const signature = fileBuffer.slice(dataLength); // assinatura

            if (!verifySignature(publicKey, file, signature)) {
                return res.status(400).send('Invalid signature.');
            }

            const hmac = crypto.createHmac('sha256', key);
            hmac.update(data);
            const messageAuthenticationCode = hmac.digest('hex');

            const querySig = "INSERT INTO Global (user_id, file, cipher, mac, viewer) VALUES (?, ?, ?, ?, ?)";
            db.query(querySig, [user_id, data, cifra, messageAuthenticationCode, chatName], (err) => {
                if (err) {
                    console.error('Error inserting file:', err);
                    return res.status(500).send('Error inserting file.');
                }

                // Remove o arquivo temporário após a inserção na base de dados
                fs.unlinkSync(filePath);

                res.status(200).send('File sent securely to all users with valid signature!');
            });
        });
    } else {
        // Função para cifrar usando AES
        const encryptFile = (buffer, key, iv) => {
            const cipher = crypto.createCipheriv(cifra, key, iv);
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

        // Insere os dados na base de dados para cada usuário
        const query = 'INSERT INTO Global (user_id, file, key_used, iv_used, cipher, mac, viewer) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [user_id, encryptedFile, keyUsed, ivUsed, cifra, messageAuthenticationCode, chatName], (err, results) => {
            if (err) {
                console.error('Error inserting file:', err);
                return res.status(500).send('Error inserting file.');
            }

            // Remove o arquivo temporário após a cifragem e a inserção na base de dados
            fs.unlinkSync(filePath);

            res.status(200).send('File sent securely to all users!');
        });
    }
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

    const { id, cifra } = req.body;

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
        const fileBuffer = Buffer.from(fileData.file, 'hex');

        if (cifra === "signature") {
            createTempFile(fileBuffer, (err, tempFilePath) => {
                if (err) {
                    console.log(err);
                    return res.status(500).send('An error occurred while creating the temporary file.');
                }

                console.log('Temporary file path:', tempFilePath);

                res.download(tempFilePath, `file_${id}`, (err) => {
                    removeTempFile(tempFilePath);
                    if (err) {
                        console.error('Error sending file:', err);
                    }
                });
            });
        } else {
            const keyUsed = Buffer.from(fileData.key_used, 'hex');
            const ivUsed = Buffer.from(fileData.iv_used, 'hex');
            const cipherType = fileData.cipher;

            console.log('File data:', fileData);
            console.log('Encrypted file:', fileBuffer);
            console.log('Key used:', keyUsed);
            console.log('IV used:', ivUsed);
            console.log('Cipher type:', cipherType);

            const decryptFile = (encrypted, key, iv) => {
                const decipher = crypto.createDecipheriv(cipherType, key, iv);
                let decrypted = decipher.update(encrypted);
                decrypted = Buffer.concat([decrypted, decipher.final()]);
                return decrypted;
            };

            const decryptedFile = decryptFile(fileBuffer, keyUsed, ivUsed);

            console.log('Decrypted file:', decryptedFile);

            const hmac = crypto.createHmac('sha256', keyUsed);
            hmac.update(fileBuffer);
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
        }
    });
};

exports.grp = (req, res) => {
    const { groupName, userGroup } = req.body;

    if (!groupName || !userGroup || userGroup.length === 0) {
        return res.status(400).send('O nome do grupo e pelo menos um elemento é necessário.');
    }

  

    // Verificar se já existe um grupo com o mesmo nome
    const checkGroupQuery = 'SELECT id FROM Grupo WHERE nome = ?';
    db.query(checkGroupQuery, [groupName], (error, results) => {
        if (error) {
            console.error('Error checking group name:', error);
            return res.status(500).send('Ocorreu um erro ao verificar o nome do grupo.');
        }

        if (results.length > 0) {
            return res.status(400).send('Já existe um grupo com esse nome.');
        }

        // Se não houver duplicatas, insira o novo grupo
        const groupQuery = 'INSERT INTO Grupo (user_Id, nome) VALUES ?';
        const groupValues = userGroup.map(userId => [userId, groupName]);

        db.query(groupQuery, [groupValues], (error, results) => {
            if (error) {
                console.error('Error inserting group:', error);
                return res.status(500).send('Ocorreu um erro ao criar o grupo.');
            }

            res.redirect('/home');
        });
    });


};