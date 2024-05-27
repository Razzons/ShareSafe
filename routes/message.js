const express = require("express");
const multer = require('multer');
const messageController = require("../controllers/message");
const router = express.Router();
const path = require('path');
const fs = require('fs');

const uploadDirectory = path.join(__dirname, '..', 'uploads');

// Verifica se a pasta uploads existe, se não, cria
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory);
}

const upload = multer({ dest: uploadDirectory });

router.post('/send', upload.single('fileToSend'), messageController.send);
router.post('/decrypt', messageController.decrypt);
router.post('/grp', messageController.grp);

module.exports = router;