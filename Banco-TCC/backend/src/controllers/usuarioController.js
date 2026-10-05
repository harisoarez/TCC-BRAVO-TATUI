const bcrypt = require("bcryptjs");
const pool = require("../config/database");
const { ehOwner, ehAdmin } = require("../utils/admin");

async function criarConta(req, res) {
    try {
        const { nome, cpf, email, telefone, senha, tipo_usuario } = req.body;
        const usuarioLogado = req.user;

        if (!email || !senha) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "E-mail e senha são obrigatórios.",
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

        // Regra essencial: Administrador normal NÃO pode criar outros administradores ou conta owner
        if (!isOwner) {
            if (tipoFinal === "admin" || tipoFinal === "owner") {
                return res.status(403).json({
                    sucesso: false,
                    mensagem: "Administradores não têm permissão para criar outros administradores ou contas owner.",
                });
            }
            tipoFinal = "normal";
        } else {
            // Owner pode escolher 'admin' ou 'normal' (aluno)
            if (tipoFinal !== "admin" && tipoFinal !== "normal" && tipoFinal !== "aluno" && tipoFinal !== "professor") {
                tipoFinal = "normal";
            }
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
                (senha, tipo_usuario, email, nome, telefone, cpf, primeiro_acesso, data_cadastro)
                VALUES (?, ?, ?, ?, ?, ?, 1, NOW())`,
                [
                    senhaHash,
                    tipoFinal,
                    email.trim().toLowerCase(),
                    nomeFinal,
                    telefone ? telefone.trim() : null,
                    cpfLimpo,
                ]
            );

            const idUsuario = resUsuario.insertId;

            // Se for conta de usuário normal / aluno, vincula na tabela aluno
            if (tipoFinal === "normal" || tipoFinal === "aluno") {
                await conexao.query(
                    `INSERT INTO aluno (CPF, data_nascimento, usuario_login_id)
                     VALUES (?, '2000-01-01', ?)`,
                    [cpfLimpo || `SEM_CPF_${idUsuario}`, idUsuario]
                );
            }

            await conexao.commit();

            return res.status(201).json({
                sucesso: true,
                mensagem: `Conta (${tipoFinal}) criada com sucesso!`,
                usuario: {
                    id_usuario: idUsuario,
                    nome: nomeFinal,
                    email: email.trim().toLowerCase(),
                    tipo_usuario: tipoFinal,
                    cpf: cpfLimpo,
                    telefone: telefone || null,
                    senhaGerada: senha,
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

// Deletar conta (Owner pode deletar qualquer um exceto ele mesmo; Admin só pode deletar contas normais)
async function deletarConta(req, res) {
    try {
        const { id } = req.params;
        const usuarioLogado = req.user;
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
            // Remove registros vinculados em aluno/professor
            await conexao.query("DELETE FROM aluno WHERE usuario_login_id = ?", [id]);
            await conexao.query("DELETE FROM professor WHERE usuario_login_id = ?", [id]);
            await conexao.query("DELETE FROM usuario_login WHERE id_usuario = ?", [id]);
            await conexao.commit();

            return res.status(200).json({ sucesso: true, mensagem: "Usuário excluído com sucesso!" });
        } catch (e) {
            await conexao.rollback();
            throw e;
        } finally {
            conexao.release();
        }
    } catch (error) {
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
    deletarConta,
    atualizarPerfil,
};
