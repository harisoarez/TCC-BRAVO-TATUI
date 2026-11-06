const aulaModel = require("../models/aulaModel");
const professorModel = require("../models/professorModel");

async function resolverIdProfessor(valorProfessor) {
    if (!valorProfessor) return 1;

    const idNumerico = parseInt(valorProfessor, 10);
    if (!isNaN(idNumerico) && idNumerico > 0) {
        return idNumerico;
    }

    try {
        const professores = await professorModel.buscarTodos();
        const encontrado = professores.find(p =>
            p.nome && p.nome.toLowerCase().includes(String(valorProfessor).toLowerCase().trim())
        );
        if (encontrado) return encontrado.idprofessor;
        if (professores.length > 0) return professores[0].idprofessor;
    } catch (e) {
        console.error("Aviso ao buscar professores:", e.message);
    }

    return 1;
}

async function listar(req, res) {
    try {
        const usuario = req.user;
        const tipoUsuario = (usuario?.tipo_usuario || "").toLowerCase();
        
        let filtro = {};

        // Regra de segurança: Se o usuário logado for aluno ou normal, ele vê SOMENTE as suas próprias aulas
        if (tipoUsuario === "aluno" || tipoUsuario === "normal") {
            filtro.usuario_login_id = usuario.id_usuario;
        }

        // Se for staff (owner, admin, professor), permite filtrar por sala
        if (req.query.sala && req.query.sala !== "todas") {
            const salaNum = parseInt(req.query.sala, 10);
            if (!isNaN(salaNum)) {
                filtro.sala = salaNum;
            }
        }

        const aulas = await aulaModel.buscarTodas(filtro);
        return res.status(200).json({ 
            sucesso: true, 
            aulas,
            perfil: tipoUsuario,
            ehAluno: (tipoUsuario === "aluno" || tipoUsuario === "normal"),
            usuario: {
                id: usuario?.id_usuario,
                nome: usuario?.nome,
                tipo: tipoUsuario
            }
        });
    } catch (error) {
        console.error("Erro ao listar aulas:", error);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar aulas." });
    }
}

async function cadastrar(req, res) {
    try {
        const { titulo, instrumento, professor, professor_idprofessor, aluno, aluno_idaluno, sala, data, hora, tipo, observacoes } = req.body;

        if (!titulo || !instrumento || !sala || !data || !hora) {
            return res.status(400).json({ sucesso: false, mensagem: "Campos obrigatórios não preenchidos." });
        }

        const idProfessor = await resolverIdProfessor(professor_idprofessor || professor);
        const data_aula = `${data} ${hora}:00`;

        let salaNum = parseInt(sala, 10);
        if (isNaN(salaNum)) {
            if (String(sala).toLowerCase().includes("bateria")) salaNum = 5;
            else salaNum = 1;
        }

        const idAlunoFinal = (aluno_idaluno || aluno) ? parseInt(aluno_idaluno || aluno, 10) : null;

        const idAula = await aulaModel.inserir({
            titulo,
            instrumento,
            professor_idprofessor: idProfessor,
            aluno_idaluno: idAlunoFinal && !isNaN(idAlunoFinal) ? idAlunoFinal : null,
            sala: salaNum,
            data_aula,
            status: tipo || "normal",
            observacoes: observacoes || ""
        });

        return res.status(201).json({ sucesso: true, mensagem: "Aula criada com sucesso!", idAula });
    } catch (error) {
        console.error("Erro ao cadastrar aula:", error);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao salvar aula no banco de dados." });
    }
}

async function atualizar(req, res) {
    try {
        const { id } = req.params;
        const { titulo, instrumento, professor, professor_idprofessor, aluno, aluno_idaluno, sala, data, hora, tipo, observacoes } = req.body;

        const idProfessor = await resolverIdProfessor(professor_idprofessor || professor);
        const data_aula = `${data} ${hora}:00`;

        let salaNum = parseInt(sala, 10);
        if (isNaN(salaNum)) {
            if (String(sala).toLowerCase().includes("bateria")) salaNum = 5;
            else salaNum = 1;
        }

        const idAlunoFinal = (aluno_idaluno || aluno) ? parseInt(aluno_idaluno || aluno, 10) : null;

        const atualizado = await aulaModel.atualizar(id, {
            titulo,
            instrumento,
            professor_idprofessor: idProfessor,
            aluno_idaluno: idAlunoFinal && !isNaN(idAlunoFinal) ? idAlunoFinal : null,
            sala: salaNum,
            data_aula,
            status: tipo || "normal",
            observacoes: observacoes || ""
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
        const { status } = req.body; // 'cancelada', 'normal', 'reposicao'

        const statusValidos = ["normal", "reposicao", "cancelada"];
        if (!statusValidos.includes(status)) {
            return res.status(400).json({ sucesso: false, mensagem: "Status inválido." });
        }

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
