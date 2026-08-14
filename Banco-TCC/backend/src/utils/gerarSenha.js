const crypto = require('crypto');

function gerarSenhaTemporaria() {
    return crypto.randomBytes(4).toString("hex");
}

module.exports =  gerarSenhaTemporaria ;