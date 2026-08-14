const { auth } = require("../config/firebase");
const usuarioModel = require("../models/usuarioModel");
const { enviarEmailCadastrado, enviarEmailRecuperacaoSenha } = require("./emailService");

async function login(firebaseUid) {
  const usuario = await usuarioModel.buscarPorFirebaseUID(firebaseUid);

  if (!usuario) {
    const erro = new Error("Usuário não encontrado no sistema.");
    erro.status = 404;
    throw erro;
  }

  await usuarioModel.atualizarUltimoAcesso(firebaseUid);

  return {
    ...usuario,
    primeiroAcesso: Boolean(usuario.primeiro_acesso),
  };
}


async function trocarSenhaPrimeiroAcesso(firebaseUid, novaSenha) {
  const usuario = await usuarioModel.buscarPorFirebaseUID(firebaseUid);

  if (!usuario) {
    const erro = new Error("Usuário não encontrado no sistema.");
    erro.status = 404;
    throw erro;
  }

  if (!usuario.primeiro_acesso) {
    const erro = new Error("Este usuário já concluiu o primeiro acesso.");
    erro.status = 400;
    throw erro;
  }

  await auth.updateUser(firebaseUid, { password: novaSenha });
  await usuarioModel.marcarPrimeiroAcessoConcluido(firebaseUid);

  return true;
}


async function logout(firebaseUid) {
  const usuario = await usuarioModel.buscarPorFirebaseUID(firebaseUid);

  if (!usuario) {
    const erro = new Error("Usuário não encontrado no sistema.");
    erro.status = 404;
    throw erro;
  }

  await auth.revokeRefreshTokens(firebaseUid);

  return true;
}

async function solicitarRecuperacaoSenha(emailAluno) {
  const usuario = await usuarioModel.buscarPorEmail(emailAluno);

  if (!usuario) {
    return;  //Ignora emails não cadastrados para não expor informações do sistema
  }

  const actionCodeSettings = {
    url: `${process.env.FRONTEND_URL}/recuperar-senha`,
    handleCodeInApp: true,
  }

  const link = await auth.generatePasswordResetLink(emailAluno, actionCodeSettings);

  await enviarEmailRecuperacaoSenha(emailAluno, usuario.nome, link);
}

module.exports = {
  login,
  trocarSenhaPrimeiroAcesso,
  logout,
  solicitarRecuperacaoSenha
};