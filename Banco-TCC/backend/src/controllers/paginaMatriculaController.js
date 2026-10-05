const dashboardModel = require("../models/dashboardModel");

async function paginaMatricula(req, res) {
    const usuario = req.session?.usuario;

    if (!usuario) {
        return res.redirect("/site/login.html");
    }

    const matriculaDados = await dashboardModel.obterMatriculaAluno(usuario.id_usuario);

    res.render("matricula/index", {
        titulo: "Minha Matrícula & Mensalidades",
        usuario,
        matricula: matriculaDados,
    });
}

async function enviarComprovante(req, res) {
    try {
        const usuario = req.session?.usuario;
        if (!usuario) {
            return res.status(401).json({ sucesso: false, mensagem: "Usuário não autenticado." });
        }

        const { idRecebimento } = req.body;
        if (!idRecebimento) {
            return res.status(400).json({ sucesso: false, mensagem: "ID do recebimento é obrigatório." });
        }

        if (!req.file) {
            return res.status(400).json({ sucesso: false, mensagem: "Selecione o arquivo do comprovante para enviar." });
        }

        const comprovanteUrl = `/uploads/comprovantes/${req.file.filename}`;
        const sucesso = await dashboardModel.enviarComprovanteAluno(idRecebimento, comprovanteUrl);

        if (sucesso) {
            return res.json({
                sucesso: true,
                mensagem: "Comprovante enviado com sucesso! Nossa equipe administrativa irá validar seu pagamento em breve.",
                comprovanteUrl,
            });
        } else {
            return res.status(400).json({ sucesso: false, mensagem: "Não foi possível enviar o comprovante." });
        }
    } catch (err) {
        console.error("Erro ao enviar comprovante do aluno:", err);
        return res.status(500).json({ sucesso: false, mensagem: "Erro no servidor ao enviar comprovante." });
    }
}

module.exports = {
    paginaMatricula,
    enviarComprovante,
};
