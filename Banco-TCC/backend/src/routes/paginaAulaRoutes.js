const express = require("express");
const router = express.Router();

// Redireciona o antigo quadro de aulas para o Calendário oficial do sistema
router.get("*", (req, res) => {
    res.redirect("/site/calendario.html");
});

module.exports = router;