const crypto = require("crypto");

function generateSessionKey() {
    //32 bytes equivale a 256 bits
    const size = 32;

    return crypto.randomBytes(size).toString('hex');
}

module.exports = generateSessionKey;