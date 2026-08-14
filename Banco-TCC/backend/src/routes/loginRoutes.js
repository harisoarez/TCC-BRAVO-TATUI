const express = require("express");
const router = express.Router();

const loginController = require("../controllers/loginController");
const authFirebase = require("../middleware/authFirebase");

router.post("/login", authFirebase, loginController.login);

router.post(
  "/login/primeiro-acesso",
  authFirebase,
  loginController.trocarSenhaPrimeiroAcesso
);

router.post("/logout", authFirebase, loginController.logout);

router.post("/login/recuperar-senha", loginController.solicitarRecuperacaoSenha);

/* router.post('/logout', authFirebase, loginController.logout);

router.post('/primeiro-acesso', authFirebase, loginController.trocarSenhaPrimeiroAcesso);

router.post('/recuperar-senha', loginController.recuperarSenha); */

module.exports = router;