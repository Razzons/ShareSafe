const bcrypt = require("bcrypt");
const db = require("../connection");

exports.register = (req, res) => {
    const { username, email, password, passwordConfirm } = req.body;

    db.query("SELECT email, username FROM User WHERE email = ? AND username = ?", [email, username], (error, results) => {
        if (error) {
            console.log(error);            
        }

        for (let i = 0; i< results.length; i++) {
          if (results[i].email === email) {
            return res.render ("index", {
                message: "That email is already in use"
            })
          }
           if (results[i].username === username) {
             return res.render ("index", {
                message: "That username is already in use"
             })   
           }            
        }

        if (password !== passwordConfirm) {
            return res.render("index", {
                message: "Passwords do not match"
            })
        }

        const salt = bcrypt.genSaltSync(12);
        const hashedPassword = bcrypt.hashSync(password + salt);
        console.log(hashedPassword);

        //Inserir na base de dados os dados do formulário

    });
}

exports.login = (req, res) => {
    const { username, password } = req.body;

    db.query("SELECT * FROM User WHERE username = ?", [username], (req, res) => {
        if (error) {
            console.log(error);
        }

        if (results.length === 0 ) {
            return res.render("index", {
                message: "Incorrect Username"
            });
        }

        const validPassword = bcrypt.compareSync(password + results[0].salt, results[0].hashedPassword );

        if (!validPassword) {
            return res.render("index", {
                message: "Incorrect Password"
            });
        } else {
            req.session.authenticated = true;
            req.session.user = results[0];
            req.app.locals.message = "Successfull login"
        }
        
        console.log("User Authenticated?" + req.session.authenticated );
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