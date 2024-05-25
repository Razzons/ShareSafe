const bcrypt = require("bcryptjs");
const db = require("../connection");
const forge = require("node-forge");
const fs = require("fs");
const path = require("path");

// Função para criar um arquivo temporário
function createTempFile(content, callback) {
    const tempFilePath = path.join(__dirname, `${Date.now()}_private_key.pem`);
    fs.writeFile(tempFilePath, content, (err) => {
        if (err) {
            return callback(err);
        }
        callback(null, tempFilePath);
    });
}

// Função para remover um arquivo temporário
function removeTempFile(filePath) {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.log(`Error deleting temp file: ${err}`);
        }
    });
}

exports.register = (req, res) => {
    const { username, email, password, passwordConfirm } = req.body;

    db.query("SELECT email, username FROM User WHERE email = ? OR username = ?", [email, username], (error, results) => {
        if (error) {
            console.log(error);
            return res.render("index", {
                message: "An error occurred"
            });
        }

        for (let i = 0; i < results.length; i++) {
            if (results[i].email === email) {
                return res.render("index", {
                    message: "That email is already in use"
                });
            }
            if (results[i].username === username) {
                return res.render("index", {
                    message: "That username is already in use"
                });
            }
        }

        if (password !== passwordConfirm) {
            return res.render("index", {
                message: "Passwords do not match"
            });
        }

        let salt = bcrypt.genSaltSync(12);
        let hashedPassword = bcrypt.hashSync(password + salt);
        console.log(hashedPassword);

        // Generate RSA keys
        const keypair = forge.pki.rsa.generateKeyPair(2048);
        const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
        const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);

        // Save public key in the database
        db.query('INSERT INTO User SET ?', {
            username: username, 
            salt: salt, 
            password: hashedPassword, 
            email: email, 
            publicKey: publicKeyPem
        }, (error, results) => {
            if (error) {
                console.log(error);
                return res.render("index", {
                    message: "An error occurred while saving the user"
                });
            } else {
                console.log(results);

                // Create a temporary file for the private key
                createTempFile(privateKeyPem, (err, tempFilePath) => {
                    if (err) {
                        console.log(err);
                        return res.render("index", {
                            message: "An error occurred while creating the private key file"
                        });
                    }

                    // Send the private key file to the user
                    res.download(tempFilePath, `${username}_private_key.pem`, (err) => {
                        // Delete the temporary file after sending it
                        removeTempFile(tempFilePath);

                        if (err) {
                            console.log(err);
                            return res.render("index", {
                                message: "An error occurred while sending the private key file"
                            });
                        }
                    });
                });
            }
        });
    });
};

exports.login = (req, res) => {

    const {username, password} = req.body

    db.query("SELECT * FROM User WHERE username = ?", [username], async (error, results) => {
        if (error) {
            console.log(error);
        } 

        if (results.length === 0) {
            console.log(error);
            return res.render('index', {
                message: "Your username is incorrect"
            });
        }

        const validPassword = bcrypt.compareSync(password + results[0].salt, results[0].password); 
        
        if (!validPassword) {
            return res.render('index', {
                message: "Incorrect password"
            });
        } else {
            req.session.authenticated = true;
            req.session.user = results[0];
            req.app.locals.message = "Successfull login"
        }

        console.log("User authenticated? " + req.session.authenticated);
        console.log(req.session.user);

        res.redirect("/home");
    
    });
}

exports.logout = (req, res) => {
    req.session.destroy ((error) => {
        if (error) {
            console.log(error);
            return res.render('home', {
                message: "An error was ocurred when you are trying to logout"
            });
        } else {
            req.app.locals.message = "Successfull Logout"
            res.redirect('/');
        }
    });
}