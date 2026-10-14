const bcrypt = require("bcryptjs");
const pool = require("../config/database");
const { ehOwner, ehAdmin } = require("../utils/admin");
const { validarCPF, validarEmail, validarTelefone } = require("../utils/validators");

async function criarConta(req, res) {
    try {
        const { nome, cpf, email, telefone, senha, tipo_usuario, data_nascimento, cursos, especialidades, curso, especialidade } = req.body;
        const usuarioLogado = req.user || req.session?.usuario;

        if (!email || !senha) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "E-mail e senha são obrigatórios.",
            });
        }

        if (!validarEmail(email)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Formato de e-mail inválido.",
            });
        }

        if (senha.length < 8) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "A senha deve ter no mínimo 8 caracteres.",
            });
        }

        if (cpf && !validarCPF(cpf)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "CPF informado é inválido.",
            });
        }

        if (telefone && !validarTelefone(telefone)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Telefone informado é inválido.",
            });
        }

        const isOwner = ehOwner(usuarioLogado);
        const isAdmin = ehAdmin(usuarioLogado);

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                sucesso: false,
                mensagem: "Você não tem permissão para criar contas.",
            });
        }

        let tipoFinal = (tipo_usuario || "normal").toLowerCase();
        if (tipoFinal === "aluno") tipoFinal = "normal";

        // Regra: Administrador normal não pode criar contas admin ou owner
        if (!isOwner) {
            if (tipoFinal === "admin" || tipoFinal === "owner") {
                return res.status(403).json({
                    sucesso: false,
                    mensagem: "Administradores não têm permissão para criar outros administradores ou contas owner.",
                });
            }
            if (tipoFinal !== "professor") {
                tipoFinal = "normal";
            }
        } else {
            // Owner pode escolher 'admin', 'professor' ou 'normal' (aluno)
            if (tipoFinal !== "admin" && tipoFinal !== "normal" && tipoFinal !== "professor") {
                tipoFinal = "normal";
            }
        }

        // Formatação de cursos do aluno
        let cursosFormatados = null;
        const cursosInput = cursos || curso;
        if (Array.isArray(cursosInput)) {
            cursosFormatados = cursosInput.filter(Boolean).map(c => c.trim()).join(", ");
        } else if (typeof cursosInput === "string" && cursosInput.trim() !== "") {
            cursosFormatados = cursosInput.trim();
        }

        // Formatação de especialidades do professor
        let especialidadesFormatadas = null;
        const espInput = especialidades || especialidade;
        if (Array.isArray(espInput)) {
            especialidadesFormatadas = espInput.filter(Boolean).map(e => e.trim()).join(", ");
        } else if (typeof espInput === "string" && espInput.trim() !== "") {
            especialidadesFormatadas = espInput.trim();
        }

        const conexao = await pool.getConnection();

        try {
            // 1. Verificar se o e-mail já está em uso
            const [existentes] = await conexao.query(
                "SELECT id_usuario FROM usuario_login WHERE email = ? LIMIT 1",
                [email.trim().toLowerCase()]
            );

            if (existentes.length > 0) {
                conexao.release();
                return res.status(409).json({
                    sucesso: false,
                    mensagem: "Já existe uma conta cadastrada com este e-mail.",
                });
            }

            // 2. Se informado CPF, verificar unicidade
            const cpfLimpo = cpf ? cpf.replace(/\D/g, "") : null;
            if (cpfLimpo) {
                const [existenteCpf] = await conexao.query(
                    "SELECT id_usuario FROM usuario_login WHERE cpf = ? LIMIT 1",
                    [cpfLimpo]
                );
                if (existenteCpf.length > 0) {
                    conexao.release();
                    return res.status(409).json({
                        sucesso: false,
                        mensagem: "Já existe uma conta cadastrada com este CPF.",
                    });
                }
            }

            const senhaHash = await bcrypt.hash(senha, 10);
            const nomeFinal = nome ? nome.trim() : email.split("@")[0];

            await conexao.beginTransaction();

            const [resUsuario] = await conexao.query(
                `INSERT INTO usuario_login 
                (senha, tipo_usuario, email, nome, telefone, cpf, tipo_instrumento, primeiro_acesso, data_cadastro)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
                [
                    senhaHash,
                    tipoFinal,
                    email.trim().toLowerCase(),
                    nomeFinal,
                    telefone ? telefone.trim() : null,
                    cpfLimpo,
                    tipoFinal === "professor" ? (especialidadesFormatadas || "Piano") : (cursosFormatados || null),
                ]
            );

            const idUsuario = resUsuario.insertId;

            // Se for conta de usuário normal / aluno, vincula na tabela aluno
            if (tipoFinal === "normal") {
                const dataNascFinal = (data_nascimento && data_nascimento.trim() !== "") ? data_nascimento.trim() : "2000-01-01";
                await conexao.query(
                    `INSERT INTO aluno (CPF, data_nascimento, usuario_login_id, curso)
                     VALUES (?, ?, ?, ?)`,
                    [cpfLimpo || `SEM_CPF_${idUsuario}`, dataNascFinal, idUsuario, cursosFormatados || "Piano"]
                );
            }

            // Se for conta de professor, vincula na tabela professor
            if (tipoFinal === "professor") {
                await conexao.query(
                    `INSERT INTO professor (CPF, usuario_login_id)
                     VALUES (?, ?)`,
                    [cpfLimpo || `SEM_CPF_${idUsuario}`, idUsuario]
                );
            }

            await conexao.commit();

            return res.status(201).json({
                sucesso: true,
                mensagem: `Conta (${tipoFinal === "normal" ? "Aluno" : (tipoFinal === "professor" ? "Professor" : "Administrador")}) criada com sucesso!`,
                usuario: {
                    id_usuario: idUsuario,
                    nome: nomeFinal,
                    email: email.trim().toLowerCase(),
                    tipo_usuario: tipoFinal,
                    cpf: cpfLimpo,
                    telefone: telefone || null,
                    cursos: cursosFormatados,
                    especialidades: especialidadesFormatadas,
                },
            });
        } catch (err) {
            await conexao.rollback();
            throw err;
        } finally {
            conexao.release();
        }
    } catch (error) {
        console.error("Erro ao criar conta:", error);
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao criar conta no servidor.",
        });
    }
}

// Listar contas para administração (Owner / Admin)
async function listarContas(req, res) {
    try {
        const [usuarios] = await pool.query(
            `SELECT id_usuario, nome, email, telefone, cpf, tipo_usuario, primeiro_acesso, data_cadastro, ultimo_acesso
             FROM usuario_login
             ORDER BY data_cadastro DESC`
        );

        return res.status(200).json({ sucesso: true, usuarios });
    } catch (error) {
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao listar usuários." });
    }
}

// Alterar cargo (apenas Owner)
async function alterarCargo(req, res) {
    try {
        if (!ehOwner(req.user)) {
            return res.status(403).json({
                sucesso: false,
                mensagem: "Apenas o Owner pode alterar cargos de usuários.",
            });
        }

        const { id } = req.params;
        const { novo_tipo } = req.body;

        const tiposPermitidos = ["admin", "normal", "aluno", "professor"];
        if (!tiposPermitidos.includes(novo_tipo)) {
            return res.status(400).json({ sucesso: false, mensagem: "Cargo inválido." });
        }

        const [resultado] = await pool.query(
            "UPDATE usuario_login SET tipo_usuario = ? WHERE id_usuario = ? AND tipo_usuario != 'owner'",
            [novo_tipo, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ sucesso: false, mensagem: "Usuário não encontrado ou é o Owner principal." });
        }

        return res.status(200).json({ sucesso: true, mensagem: `Cargo alterado para ${novo_tipo} com sucesso!` });
    } catch (error) {
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao alterar cargo." });
    }
}

// Editar usuário completo (Owner tem poder total em qualquer conta; Admin pode editar alunos)
async function editarUsuario(req, res) {
    try {
        const idUsuario = req.params.id;
        const usuarioLogado = req.user || req.session?.usuario;
        const isOwner = ehOwner(usuarioLogado);
        const isAdmin = ehAdmin(usuarioLogado);

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ sucesso: false, mensagem: "Acesso não autorizado." });
        }

        const [usuariosAlvo] = await pool.query(
            "SELECT id_usuario, tipo_usuario, email, nome, telefone, cpf FROM usuario_login WHERE id_usuario = ?",
            [idUsuario]
        );

        if (usuariosAlvo.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: "Usuário não encontrado." });
        }

        const alvo = usuariosAlvo[0];

        // Regra de segurança: Apenas Owner pode editar outros administradores ou a conta Owner
        if (alvo.tipo_usuario === "owner" && !isOwner) {
            return res.status(403).json({ sucesso: false, mensagem: "Apenas o Owner pode editar esta conta." });
        }
        if (alvo.tipo_usuario === "admin" && !isOwner) {
            return res.status(403).json({ sucesso: false, mensagem: "Apenas o Owner pode editar outros administradores." });
        }

        const {
            nome,
            email,
            telefone,
            cpf,
            tipo_usuario,
            data_nascimento,
            cursos,
            curso,
            especialidades,
            especialidade,
            desconto_porcentagem,
        } = req.body;

        const conexao = await pool.getConnection();
        try {
            await conexao.beginTransaction();

            const cpfLimpo = cpf ? cpf.replace(/\D/g, "") : null;
            if (cpfLimpo) {
                const [existenteCpf] = await conexao.query(
                    "SELECT id_usuario FROM usuario_login WHERE cpf = ? AND id_usuario != ? LIMIT 1",
                    [cpfLimpo, idUsuario]
                );
                if (existenteCpf.length > 0) {
                    conexao.release();
                    return res.status(409).json({ sucesso: false, mensagem: "Já existe outro usuário com este CPF." });
                }
            }

            if (email && email.trim().toLowerCase() !== alvo.email.toLowerCase()) {
                const [existenteEmail] = await conexao.query(
                    "SELECT id_usuario FROM usuario_login WHERE email = ? AND id_usuario != ? LIMIT 1",
                    [email.trim().toLowerCase(), idUsuario]
                );
                if (existenteEmail.length > 0) {
                    conexao.release();
                    return res.status(409).json({ sucesso: false, mensagem: "Já existe outro usuário com este e-mail." });
                }
            }

            // Tratamento de especialidades do professor
            let especialidadeFinal = null;
            const espInput = especialidades || especialidade;
            if (Array.isArray(espInput)) {
                especialidadeFinal = espInput.filter(Boolean).map(e => e.trim()).join(", ");
            } else if (typeof espInput === "string" && espInput.trim() !== "") {
                especialidadeFinal = espInput.trim();
            }

            // Tratamento de cursos do aluno
            let cursosFinal = null;
            const cursosInput = cursos || curso;
            if (Array.isArray(cursosInput)) {
                cursosFinal = cursosInput.filter(Boolean).map(c => c.trim()).join(", ");
            } else if (typeof cursosInput === "string" && cursosInput.trim() !== "") {
                cursosFinal = cursosInput.trim();
            }

            // Apenas o Owner pode alterar o tipo de usuário (e nunca rebaixar outro owner)
            let novoTipo = alvo.tipo_usuario;
            if (isOwner && tipo_usuario && alvo.tipo_usuario !== "owner") {
                const tiposPermitidos = ["admin", "normal", "aluno", "professor"];
                if (tiposPermitidos.includes(tipo_usuario)) {
                    novoTipo = tipo_usuario === "aluno" ? "normal" : tipo_usuario;
                }
            }

            await conexao.query(
                `UPDATE usuario_login
                    SET nome = COALESCE(?, nome),
                        email = COALESCE(?, email),
                        telefone = ?,
                        cpf = ?,
                        tipo_usuario = ?,
                        tipo_instrumento = COALESCE(?, tipo_instrumento)
                  WHERE id_usuario = ?`,
                [
                    nome ? nome.trim() : null,
                    email ? email.trim().toLowerCase() : null,
                    telefone ? telefone.trim() : null,
                    cpfLimpo,
                    novoTipo,
                    especialidadeFinal || cursosFinal || null,
                    idUsuario,
                ]
            );

            // Atualização ou inserção nas tabelas específicas (aluno / professor)
            if (novoTipo === "normal" || novoTipo === "aluno") {
                const [alunoExistente] = await conexao.query(
                    "SELECT idaluno FROM aluno WHERE usuario_login_id = ?",
                    [idUsuario]
                );
                const dataNasc = (data_nascimento && data_nascimento.trim()) ? data_nascimento.trim() : null;

                if (alunoExistente.length > 0) {
                    const paramsUpdate = [];
                    const setClausulas = [];
                    if (dataNasc) {
                        setClausulas.push("data_nascimento = ?");
                        paramsUpdate.push(dataNasc);
                    }
                    if (cursosFinal) {
                        setClausulas.push("curso = ?");
                        paramsUpdate.push(cursosFinal);
                    }
                    if (isOwner && desconto_porcentagem !== undefined && desconto_porcentagem !== null && desconto_porcentagem !== "") {
                        setClausulas.push("desconto_porcentagem = ?");
                        paramsUpdate.push(Math.max(0, Math.min(100, parseFloat(desconto_porcentagem) || 0)));
                    }
                    if (cpfLimpo) {
                        setClausulas.push("CPF = ?");
                        paramsUpdate.push(cpfLimpo);
                    }
                    if (setClausulas.length > 0) {
                        paramsUpdate.push(idUsuario);
                        await conexao.query(
                            `UPDATE aluno SET ${setClausulas.join(", ")} WHERE usuario_login_id = ?`,
                            paramsUpdate
                        );

                        // Recalcular mensalidades pendentes / em análise se alterou curso ou desconto
                        if (cursosFinal || (isOwner && desconto_porcentagem !== undefined && desconto_porcentagem !== null && desconto_porcentagem !== "")) {
                            const idAluno = alunoExistente[0].idaluno;
                            const [dadosRec] = await conexao.query("SELECT curso, desconto_porcentagem FROM aluno WHERE idaluno = ?", [idAluno]);
                            if (dadosRec.length > 0) {
                                const [cursosDb] = await conexao.query("SELECT nome, valor_mensalidade FROM curso_mensalidade WHERE ativo = 1");
                                const precosMap = {};
                                cursosDb.forEach(c => precosMap[c.nome.trim().toLowerCase()] = parseFloat(c.valor_mensalidade) || 180.00);
                                const listaNomes = String(dadosRec[0].curso || "Piano").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
                                let somaBase = 0;
                                listaNomes.forEach(n => somaBase += (precosMap[n] !== undefined ? precosMap[n] : 180.00));
                                if (somaBase === 0) somaBase = 180.00;
                                const dPct = parseFloat(dadosRec[0].desconto_porcentagem) || 0;
                                const valorFinal = Math.max(0, somaBase * (1 - dPct / 100));
                                await conexao.query(
                                    `UPDATE financeiro_recebimento SET valor = ? WHERE aluno_idaluno = ? AND status_parcela IN ('pendente', 'em_analise')`,
                                    [valorFinal, idAluno]
                                );
                            }
                        }
                    }
                } else {
                    await conexao.query(
                        `INSERT INTO aluno (CPF, data_nascimento, usuario_login_id, curso, desconto_porcentagem)
                         VALUES (?, COALESCE(?, '2000-01-01'), ?, COALESCE(?, 'Piano'), ?)`,
                        [
                            cpfLimpo || `SEM_CPF_${idUsuario}`,
                            dataNasc,
                            idUsuario,
                            cursosFinal || "Piano",
                            isOwner && desconto_porcentagem ? parseFloat(desconto_porcentagem) : 0,
                        ]
                    );
                }
            }

            if (novoTipo === "professor") {
                const [profExistente] = await conexao.query(
                    "SELECT idprofessor FROM professor WHERE usuario_login_id = ?",
                    [idUsuario]
                );
                if (profExistente.length === 0) {
                    await conexao.query(
                        "INSERT INTO professor (CPF, usuario_login_id) VALUES (?, ?)",
                        [cpfLimpo || `SEM_CPF_${idUsuario}`, idUsuario]
                    );
                } else if (cpfLimpo) {
                    await conexao.query(
                        "UPDATE professor SET CPF = ? WHERE usuario_login_id = ?",
                        [cpfLimpo, idUsuario]
                    );
                }
            }

            await conexao.commit();
            return res.json({ sucesso: true, mensagem: "Dados do usuário atualizados com sucesso!" });
        } catch (err) {
            await conexao.rollback();
            throw err;
        } finally {
            conexao.release();
        }
    } catch (error) {
        console.error("Erro ao editar usuário:", error);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao editar usuário no banco de dados." });
    }
}

// Deletar conta (Owner pode deletar qualquer um exceto ele mesmo; Admin só pode deletar contas normais)
async function deletarConta(req, res) {
    try {
        const { id } = req.params;
        const usuarioLogado = req.user || req.session?.usuario;
        const isOwner = ehOwner(usuarioLogado);
        const isAdmin = ehAdmin(usuarioLogado);

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ sucesso: false, mensagem: "Permissão negada." });
        }

        const [alvos] = await pool.query("SELECT id_usuario, tipo_usuario FROM usuario_login WHERE id_usuario = ?", [id]);
        if (alvos.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: "Usuário não encontrado." });
        }

        const alvo = alvos[0];

        if (alvo.tipo_usuario === "owner") {
            return res.status(403).json({ sucesso: false, mensagem: "A conta Owner não pode ser excluída." });
        }

        if (!isOwner && alvo.tipo_usuario === "admin") {
            return res.status(403).json({
                sucesso: false,
                mensagem: "Administradores não têm permissão para excluir outros administradores.",
            });
        }

        const conexao = await pool.getConnection();
        try {
            await conexao.beginTransaction();

            // Desvincula e remove registros vinculados de aluno
            await conexao.query(
                "DELETE FROM aluno_responsavel WHERE aluno_idaluno IN (SELECT idaluno FROM aluno WHERE usuario_login_id = ?)",
                [id]
            );
            await conexao.query(
                "DELETE FROM financeiro_recebimento WHERE aluno_idaluno IN (SELECT idaluno FROM aluno WHERE usuario_login_id = ?)",
                [id]
            );
            await conexao.query(
                "DELETE FROM aula WHERE aluno_idaluno IN (SELECT idaluno FROM aluno WHERE usuario_login_id = ?)",
                [id]
            );
            await conexao.query(
                "DELETE FROM aluno WHERE usuario_login_id = ?",
                [id]
            );

            // Desvincula e remove registros vinculados de professor
            await conexao.query(
                "DELETE FROM financeiro_pagamento WHERE professor_idprofessor IN (SELECT idprofessor FROM professor WHERE usuario_login_id = ?)",
                [id]
            );
            await conexao.query(
                "DELETE FROM aula WHERE professor_idprofessor IN (SELECT idprofessor FROM professor WHERE usuario_login_id = ?)",
                [id]
            );
            await conexao.query(
                "DELETE FROM professor WHERE usuario_login_id = ?",
                [id]
            );

            // Por fim remove a conta em usuario_login
            await conexao.query("DELETE FROM usuario_login WHERE id_usuario = ?", [id]);

            await conexao.commit();

            return res.status(200).json({ sucesso: true, mensagem: "Usuário e todos os seus registros foram excluídos com sucesso!" });
        } catch (e) {
            await conexao.rollback();
            throw e;
        } finally {
            conexao.release();
        }
    } catch (error) {
        console.error("Erro ao excluir conta:", error);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao excluir conta." });
    }
}

async function atualizarPerfil(req, res) {
    try {
        const idUsuario = req.user?.id_usuario || req.session?.usuario?.id_usuario;
        if (!idUsuario) {
            return res.status(401).json({ sucesso: false, mensagem: "Usuário não autenticado." });
        }

        const { descricao, telefone } = req.body;

        let fotoUrl = null;
        if (req.file) {
            fotoUrl = `/uploads/perfis/${req.file.filename}`;
        }

        const dashboardModel = require("../models/dashboardModel");
        await dashboardModel.atualizarPerfil(idUsuario, { fotoUrl, descricao, telefone });

        if (req.session && req.session.usuario) {
            if (fotoUrl) req.session.usuario.foto_url = fotoUrl;
            if (descricao !== undefined) req.session.usuario.descricao = descricao;
            if (telefone) req.session.usuario.telefone = telefone;
        }

        return res.json({
            sucesso: true,
            mensagem: "Perfil atualizado com sucesso!",
            fotoUrl,
            descricao,
        });
    } catch (err) {
        console.error("Erro ao atualizar perfil:", err);
        return res.status(500).json({ sucesso: false, mensagem: "Erro ao atualizar perfil." });
    }
}

module.exports = {
    criarConta,
    listarContas,
    alterarCargo,
    editarUsuario,
    deletarConta,
    atualizarPerfil,
};
