const aulaModel = require("../models/aulaModel");

async function listar(req, res) {
    try {
        const aulas = await aulaModel.buscarTodas();
        return res.status(200).json({ sucesso: true, aulas });
    } catch (error) {
        console.error("Erro ao listar aulas:", error);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar aulas." });
    }
}

async function cadastrar(req, res) {
    try {
        const { titulo, instrumento, professor_idprofessor, sala, data, hora, tipo, observacoes } = req.body;

        if (!titulo || !instrumento || !professor_idprofessor || !sala || !data || !hora) {
            return res.status(400).json({ sucesso: false, mensagem: "Campos obrigatórios não preenchidos." });
        }

        const data_aula = `${data} ${hora}:00`;
        const idAula = await aulaModel.inserir({
            titulo,
            instrumento,
            professor_idprofessor,
            sala,
            data_aula,
            status: tipo,
            observacoes
        });

        return res.status(201).json({ sucesso: true, mensagem: "Aula criada com sucesso!", idAula });
    } catch (error) {
        console.error("Erro ao cadastrar aula:", error);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao salvar aula." });
    }
}

async function atualizar(req, res) {
    try {
        const { id } = req.params;
        const { titulo, instrumento, professor_idprofessor, sala, data, hora, tipo, observacoes } = req.body;
        const data_aula = `${data} ${hora}:00`;

        const atualizado = await aulaModel.atualizar(id, {
            titulo,
            instrumento,
            professor_idprofessor,
            sala,
            data_aula,
            status: tipo,
            observacoes
        });

        if (!atualizado) return res.status(404).json({ sucesso: false, mensagem: "Aula não encontrada." });

        return res.status(200).json({ sucesso: true, mensagem: "Aula atualizada com sucesso!" });
    } catch (error) {
        console.error("Erro ao atualizar aula:", error);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao atualizar aula." });
    }
}

async function moverStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'cancelada', 'normal', etc.

        const atualizado = await aulaModel.atualizarStatus(id, status);
        if (!atualizado) return res.status(404).json({ sucesso: false, mensagem: "Aula não encontrada." });

        return res.status(200).json({ sucesso: true, mensagem: "Status alterado com sucesso!" });
    } catch (error) {
        console.error("Erro ao alterar status:", error);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao mudar status da aula." });
    }
}

async function deletar(req, res) {
    try {
        const { id } = req.params;
        const removido = await aulaModel.excluir(id);

        if (!removido) return res.status(404).json({ sucesso: false, mensagem: "Aula não encontrada." });

        return res.status(200).json({ sucesso: true, mensagem: "Aula excluída definitivamente!" });
    } catch (error) {
        console.error("Erro ao excluir aula:", error);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao excluir aula." });
    }
}

module.exports = {
    listar,
    cadastrar,
    atualizar,
    moverStatus,
    deletar
};