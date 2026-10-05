// Middleware compatível - redireciona para o authMiddleware padrão (JWT)
const authMiddleware = require("./authMiddleware");

module.exports = authMiddleware;