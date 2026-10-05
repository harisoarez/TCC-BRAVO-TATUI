const { ehAdmin } = require("../utils/admin");

function verificarAdmin(req, res, next) {
    if (!req.user || !ehAdmin(req.user)) {
        return res.status(403).json({
            sucesso: false,
            mensagem: "Apenas o administrador pode realizar esta ação.",
        });
    }

    return next();
}

module.exports = verificarAdmin;