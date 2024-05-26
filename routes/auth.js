const express = require("express");
const authController = require("../controllers/auth");
const router = express.Router();
const db = require("../connection");

router.post("/register", authController.register)
router.post("/login", authController.login)
router.post("/logout", authController.logout)

module.exports = router;