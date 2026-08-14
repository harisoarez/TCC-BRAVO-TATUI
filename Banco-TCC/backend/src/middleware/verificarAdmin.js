const { ehAdmin } = require("../utils/admin");

function verificarAdmin(req, res, next) {
    if (!ehAdmin(req.user.uid)) {
        return res.status(403).json({
            sucesso: false,
            mensagem: "Apenas o administrador pode realizar esta ação.",
        });
    }

    return next();
}

module.exports = verificarAdmin;