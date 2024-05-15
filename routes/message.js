const express = require("express");
const messageController = require("../controllers/message");
const router = express.Router();
const db = require("../connection");

router.post('/send', messageController.send);
router.post('/encrypt', messageController.encrypt);
router.post('/decrypt', messageController.decrypt);

module.exports = router;