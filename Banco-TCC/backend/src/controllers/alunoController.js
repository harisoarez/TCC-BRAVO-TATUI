const bcrypt = require("bcryptjs");
const pool = require("../config/database");
const usuarioModel = require("../models/usuarioModel");
const alunoModel = require("../models/alunoModel");
const responsavelModel = require("../models/responsavelModel");
const gerarSenhaTemporaria = require("../utils/gerarSenha");
const { enviarEmailCadastrado } = require("../services/emailService");
const { ehAdmin } = require("../utils/admin");
const { validarCPF, validarEmail, validarTelefone, validarCEP } = require("../utils/validators");

function calcularIdade(data_nascimento) {
    const hoje = new Date();
    const nascimento = new Date(data_nascimento);

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const aindaNaoFezAniversarioEsteAno =
        hoje.getMonth() < nascimento.getMonth() ||
        (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());

    if (aindaNaoFezAniversarioEsteAno) {
        idade--;
    }

    return idade;
}

function validarResponsaveis(responsaveis, menorDeIdade) {
    if (menorDeIdade && (!Array.isArray(responsaveis) || responsaveis.length === 0)) {
        return "Aluno menor de idade: é obrigatório informar ao menos um responsável legal.";
    }

    if (!responsaveis) {
        return null;
    }

    if (!Array.isArray(responsaveis)) {
        return "O campo 'responsaveis' deve ser uma lista.";
    }

    for (const responsavel of responsaveis) {
        if (!responsavel.nome || !responsavel.telefone || !responsavel.email || !responsavel.parentesco) {
            return "Cada responsável precisa de nome, telefone, email e parentesco.";
        }
    }

    return null;
}

async function cadastrar(req, res) {
    const {
        nome,
        email,
        telefone,
        tipo_instrumento,
        curso,
        cursos,
        desconto_porcentagem,
        autorizacao_imagem,
        foto_url,
        CPF,
        endereco_rua,
        endereco_numero,
        endereco_bairro,
        endereco_cidade,
        endereco_cep,
        data_nascimento,
        responsaveis,
    } = req.body;

    if (!nome || !email || !data_nascimento) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "Nome, email e data de nascimento são obrigatórios.",
        });
    }

    if (!validarEmail(email)) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "E-mail inválido.",
        });
    }

    if (CPF && !validarCPF(CPF)) {
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

    if (endereco_cep && !validarCEP(endereco_cep)) {
        return res.status(400).json({
            sucesso: false,
            mensagem: "CEP informado é inválido.",
        });
    }

    const menorDeIdade = calcularIdade(data_nascimento) < 18;

    const erroValidacao = validarResponsaveis(responsaveis, menorDeIdade);
    if (erroValidacao) {
        return res.status(400).json({
            sucesso: false,
            mensagem: erroValidacao,
        });
    }

    const conexao = await pool.getConnection();

    try {
        const usuarioExistente = await usuarioModel.buscarPorEmail(email);
        if (usuarioExistente) {
            conexao.release();
            return res.status(409).json({
                sucesso: false,
                mensagem: "Já existe um usuário cadastrado com este e-mail.",
            });
        }

        const senhaTemporaria = gerarSenhaTemporaria();
        const senhaHash = await bcrypt.hash(senhaTemporaria, 10);

        await conexao.beginTransaction();

        const entradaCursos = cursos || curso || tipo_instrumento;
        let cursosFinal = "Piano";
        if (Array.isArray(entradaCursos)) {
            cursosFinal = entradaCursos.filter(Boolean).map(c => String(c).trim()).join(", ");
        } else if (typeof entradaCursos === "string" && entradaCursos.trim() !== "") {
            cursosFinal = entradaCursos.trim();
        }

        const idUsuario = await usuarioModel.inserir(conexao, {
            senha: senhaHash,
            tipo_usuario: "aluno",
            email,
            nome,
            telefone,
            tipo_instrumento: cursosFinal,
            autorizacao_imagem,
            foto_url,
            primeiro_acesso: 1,
        });

        const idAluno = await alunoModel.cadastrar(conexao, {
            CPF,
            endereco_rua,
            endereco_numero,
            endereco_bairro,
            endereco_cidade,
            endereco_cep,
            data_nascimento,
            usuario_login_id: idUsuario,
            curso: cursosFinal,
            desconto_porcentagem,
        });

        if (Array.isArray(responsaveis)) {
            for (const dadosResponsavel of responsaveis) {
                const idResponsavel = await responsavelModel.criarOuBuscarPorEmailResponsavel(
                    conexao,
                    dadosResponsavel
                );

                await responsavelModel.vincularAluno(conexao, {
                    aluno_idaluno: idAluno,
                    idResponsavel,
                    parentesco: dadosResponsavel.parentesco,
                    responsavel_principal: dadosResponsavel.responsavel_principal ?? false,
                });
            }
        }

        await conexao.commit();

        try {
            await enviarEmailCadastrado(email, nome, senhaTemporaria);
        } catch (emailErr) {
            console.error("Aviso: Falha ao enviar e-mail de boas-vindas com senha temporária:", emailErr.message);
        }

        return res.status(201).json({
            sucesso: true,
            mensagem: "Aluno cadastrado com sucesso! As instruções de acesso foram enviadas por e-mail.",
            idAluno,
            menorDeIdade,
        });
    } catch (error) {
        await conexao.rollback();
        console.error("Erro ao cadastrar aluno:", error);

        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao cadastrar aluno.",
        });
    } finally {
        conexao.release();
    }
}

async function listar(req, res) {
    try {
        const alunos = await alunoModel.buscarTodos();

        return res.status(200).json({
            sucesso: true,
            alunos,
        });
    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao listar alunos.",
        });
    }
}

async function buscarPorId(req, res) {
    try {
        const { id } = req.params;
        const aluno = await alunoModel.buscarPorId(id);

        if (!aluno) {
            return res.status(404).json({
                sucesso: false,
                mensagem: "Aluno não encontrado.",
            });
        }

        const usuarioLogado = req.user || req.session?.usuario;
        const isAdmin = ehAdmin(usuarioLogado);
        if (!isAdmin && aluno.usuario_login_id !== usuarioLogado?.id_usuario) {
            return res.status(403).json({
                sucesso: false,
                mensagem: "Você não tem permissão para visualizar os dados deste aluno.",
            });
        }

        return res.status(200).json({
            sucesso: true,
            aluno,
        });
    } catch (error) {
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao buscar aluno.",
        });
    }
}

async function atualizar(req, res) {
    const { id } = req.params;
    const conexao = await pool.getConnection();

    try {
        const alunoExistente = await alunoModel.buscarPorId(id);

        if (!alunoExistente) {
            conexao.release();
            return res.status(404).json({
                sucesso: false,
                mensagem: "Aluno não encontrado.",
            });
        }

        await conexao.beginTransaction();

        const entradaCursos = req.body.cursos || req.body.curso || req.body.tipo_instrumento;
        let cursosFinal = undefined;
        if (entradaCursos !== undefined) {
            if (Array.isArray(entradaCursos)) {
                cursosFinal = entradaCursos.filter(Boolean).map(c => String(c).trim()).join(", ");
            } else if (typeof entradaCursos === "string") {
                cursosFinal = entradaCursos.trim();
            }
        }

        const dadosUsuario = { ...req.body };
        const dadosAluno = { ...req.body };
        if (cursosFinal !== undefined) {
            dadosUsuario.tipo_instrumento = cursosFinal;
            dadosAluno.curso = cursosFinal;
        }

        await usuarioModel.atualizar(conexao, alunoExistente.id_usuario, dadosUsuario);
        await alunoModel.atualizar(conexao, id, dadosAluno);

        // Se alterou cursos ou desconto, recalcula parcelas pendentes / em análise
        if (cursosFinal !== undefined || req.body.desconto_porcentagem !== undefined) {
            const [alInfo] = await conexao.query("SELECT curso, desconto_porcentagem FROM aluno WHERE idaluno = ?", [id]);
            if (alInfo.length > 0) {
                const [cursosDb] = await conexao.query("SELECT nome, valor_mensalidade FROM curso_mensalidade WHERE ativo = 1");
                const precosMap = {};
                cursosDb.forEach(c => precosMap[c.nome.trim().toLowerCase()] = parseFloat(c.valor_mensalidade) || 180.00);
                const listaNomes = String(alInfo[0].curso || "Piano").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
                let somaBase = 0;
                listaNomes.forEach(n => somaBase += (precosMap[n] !== undefined ? precosMap[n] : 180.00));
                if (somaBase === 0) somaBase = 180.00;
                const dPct = parseFloat(alInfo[0].desconto_porcentagem) || 0;
                const valorFinal = Math.max(0, somaBase * (1 - dPct / 100));
                await conexao.query(
                    `UPDATE financeiro_recebimento SET valor = ? WHERE aluno_idaluno = ? AND status_parcela IN ('pendente', 'em_analise')`,
                    [valorFinal, id]
                );
            }
        }

        await conexao.commit();

        const alunoAtualizado = await alunoModel.buscarPorId(id);

        return res.status(200).json({
            sucesso: true,
            mensagem: "Aluno atualizado com sucesso!",
            aluno: alunoAtualizado,
        });
    } catch (error) {
        await conexao.rollback();
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao atualizar aluno.",
        });
    } finally {
        conexao.release();
    }
}

async function deletar(req, res) {
    const { id } = req.params;
    const conexao = await pool.getConnection();

    try {
        const alunoExistente = await alunoModel.buscarPorId(id);

        if (!alunoExistente) {
            conexao.release();
            return res.status(404).json({
                sucesso: false,
                mensagem: "Aluno não encontrado.",
            });
        }

        await conexao.beginTransaction();

        await alunoModel.removerDependencias(conexao, id);
        await alunoModel.excluir(conexao, id);
        await usuarioModel.excluir(conexao, alunoExistente.id_usuario);

        await conexao.commit();

        return res.status(200).json({
            sucesso: true,
            mensagem: "Aluno excluído com sucesso!",
        });
    } catch (error) {
        await conexao.rollback();
        return res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao excluir aluno.",
        });
    } finally {
        conexao.release();
    }
}

module.exports = {
    cadastrar,
    listar,
    buscarPorId,
    atualizar,
    deletar,
};