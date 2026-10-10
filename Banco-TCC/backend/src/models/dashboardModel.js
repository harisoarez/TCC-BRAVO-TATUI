const pool = require("../config/database");

async function contarAlunos() {
    const [linhas] = await pool.query(`SELECT COUNT(*) AS total FROM aluno`);
    return linhas[0].total;
}

async function contarProfessores() {
    const [linhas] = await pool.query(`SELECT COUNT(*) AS total FROM professor`);
    return linhas[0].total;
}

// Aniversariantes do mês atual (Outubro / Mês corrente)
async function aniversariantesDoMes() {
    const [linhas] = await pool.query(
        `SELECT u.nome, u.email, u.telefone, u.foto_url, a.curso, a.data_nascimento,
                DAY(a.data_nascimento) AS dia_aniversario
           FROM aluno a
           JOIN usuario_login u ON u.id_usuario = a.usuario_login_id
          WHERE MONTH(a.data_nascimento) = MONTH(CURDATE())
          ORDER BY DAY(a.data_nascimento) ASC`
    );
    return linhas;
}

// Cursos e valores de mensalidade configurados pelo Owner
async function listarCursos() {
    const [linhas] = await pool.query(
        `SELECT idcurso, nome, valor_mensalidade, ativo FROM curso_mensalidade ORDER BY nome ASC`
    );
    return linhas;
}

async function atualizarValorCurso(idcurso, novoValor) {
    const valorNum = parseFloat(novoValor);
    if (isNaN(valorNum) || valorNum <= 0) {
        throw new Error("Valor de mensalidade inválido.");
    }

    const [cursoAtual] = await pool.query("SELECT nome FROM curso_mensalidade WHERE idcurso = ?", [idcurso]);
    if (cursoAtual.length === 0) throw new Error("Curso não encontrado.");

    await pool.query(
        `UPDATE curso_mensalidade SET valor_mensalidade = ? WHERE idcurso = ?`,
        [valorNum, idcurso]
    );

    // Atualiza mensalidades ainda pendentes dos alunos matriculados neste curso
    const nomeCurso = cursoAtual[0].nome;
    const [alunosCurso] = await pool.query(
        `SELECT idaluno, desconto_porcentagem FROM aluno WHERE curso = ?`,
        [nomeCurso]
    );

    for (const al of alunosCurso) {
        const desc = parseFloat(al.desconto_porcentagem) || 0;
        const valorFinal = Math.max(0, valorNum * (1 - desc / 100));
        await pool.query(
            `UPDATE financeiro_recebimento 
                SET valor = ? 
              WHERE aluno_idaluno = ? AND status_parcela = 'pendente'`,
            [valorFinal, al.idaluno]
        );
    }

    return true;
}

// Lista completa de mensalidades dos alunos para o painel
async function listarMensalidadesAlunos() {
    const [linhas] = await pool.query(
        `SELECT 
            r.idfinanceiroRecebimento AS id,
            r.data_vencimento,
            r.data_pagamento,
            r.valor,
            r.status_parcela,
            r.forma_pagamento,
            r.comprovante_url,
            r.mes_referencia,
            u.nome AS aluno_nome,
            u.email AS aluno_email,
            u.telefone AS aluno_telefone,
            a.idaluno,
            a.curso,
            a.desconto_porcentagem
        FROM financeiro_recebimento r
        JOIN aluno a ON a.idaluno = r.aluno_idaluno
        JOIN usuario_login u ON u.id_usuario = a.usuario_login_id
        ORDER BY 
            CASE 
                WHEN r.status_parcela = 'em_analise' THEN 1
                WHEN r.status_parcela = 'atrasado' THEN 2
                WHEN r.status_parcela = 'pendente' THEN 3
                WHEN r.status_parcela = 'pago' THEN 4
                ELSE 5
            END,
            r.data_vencimento ASC`
    );

    const pendentes = linhas.filter(m => m.status_parcela === "pendente");
    const emAnalise = linhas.filter(m => m.status_parcela === "em_analise");
    const pagos = linhas.filter(m => m.status_parcela === "pago");
    const vencidos = linhas.filter(m => m.status_parcela === "atrasado");

    return {
        todas: linhas,
        pendentes,
        emAnalise,
        pagos,
        vencidos,
        totais: {
            total: linhas.length,
            qtdPendentes: pendentes.length,
            qtdEmAnalise: emAnalise.length,
            qtdPagos: pagos.length,
            qtdVencidos: vencidos.length,
        },
    };
}

// Listagem separada de Usuários: Administradores, Professores e Alunos
async function listarAdministradores() {
    const [linhas] = await pool.query(
        `SELECT id_usuario, nome, email, telefone, cpf, foto_url, descricao, tipo_usuario, data_cadastro
           FROM usuario_login
          WHERE tipo_usuario IN ('owner', 'admin')
          ORDER BY FIELD(tipo_usuario, 'owner', 'admin'), nome ASC`
    );
    return linhas;
}

async function listarProfessores() {
    const [linhas] = await pool.query(
        `SELECT p.idprofessor, u.id_usuario, u.nome, u.email, u.telefone, u.foto_url, u.descricao,
                u.tipo_instrumento, u.data_cadastro
           FROM professor p
           JOIN usuario_login u ON u.id_usuario = p.usuario_login_id
          ORDER BY u.nome ASC`
    );
    return linhas;
}

async function listarAlunosCompletos() {
    const [alunos] = await pool.query(
        `SELECT 
            a.idaluno,
            u.id_usuario,
            u.nome,
            u.email,
            u.telefone,
            u.cpf,
            u.foto_url,
            u.descricao,
            u.data_cadastro,
            a.curso,
            a.desconto_porcentagem,
            COALESCE(c.valor_mensalidade, 180.00) AS valor_base
        FROM aluno a
        JOIN usuario_login u ON u.id_usuario = a.usuario_login_id
        LEFT JOIN curso_mensalidade c ON c.nome = a.curso
        ORDER BY u.nome ASC`
    );

    const [recebimentos] = await pool.query(
        `SELECT idfinanceiroRecebimento, aluno_idaluno, status_parcela, valor, data_vencimento, data_pagamento, comprovante_url
         FROM financeiro_recebimento
         WHERE mes_referencia = '10/2026' OR mes_referencia IS NULL`
    );

    const mapReceb = {};
    for (const r of recebimentos) {
        if (!mapReceb[r.aluno_idaluno] || r.status_parcela === 'em_analise') {
            mapReceb[r.aluno_idaluno] = r;
        }
    }

    return alunos.map(al => {
        const r = mapReceb[al.idaluno];
        const desc = parseFloat(al.desconto_porcentagem) || 0;
        const base = parseFloat(al.valor_base) || 180.00;
        const valorCalculado = Math.max(0, base * (1 - desc / 100));

        return {
            ...al,
            id_recebimento_atual: r?.idfinanceiroRecebimento || null,
            status_mes_atual: r?.status_parcela || 'pendente',
            comprovante_url: r?.comprovante_url || null,
            valor_cobrado: r?.valor != null ? r.valor : valorCalculado,
            data_vencimento: r?.data_vencimento || '2026-10-15',
            data_pagamento: r?.data_pagamento || null,
        };
    }).sort((a, b) => {
        if (a.status_mes_atual === 'em_analise' && b.status_mes_atual !== 'em_analise') return -1;
        if (b.status_mes_atual === 'em_analise' && a.status_mes_atual !== 'em_analise') return 1;
        return a.nome.localeCompare(b.nome);
    });
}

// Atribuir desconto para um aluno específico (Exclusivo Owner)
async function atribuirDescontoAluno(idaluno, porcentagem) {
    const desc = parseFloat(porcentagem);
    if (isNaN(desc) || desc < 0 || desc > 100) {
        throw new Error("Porcentagem de desconto deve ser entre 0% e 100%.");
    }

    await pool.query(
        `UPDATE aluno SET desconto_porcentagem = ? WHERE idaluno = ?`,
        [desc, idaluno]
    );

    // Recalcula o valor da mensalidade pendente ou em análise do aluno
    const [alunoInfo] = await pool.query(
        `SELECT a.curso, COALESCE(c.valor_mensalidade, 180.00) as base
           FROM aluno a
           LEFT JOIN curso_mensalidade c ON c.nome = a.curso
          WHERE a.idaluno = ?`,
        [idaluno]
    );

    if (alunoInfo.length > 0) {
        const base = parseFloat(alunoInfo[0].base);
        const novoValor = Math.max(0, base * (1 - desc / 100));
        await pool.query(
            `UPDATE financeiro_recebimento
                SET valor = ?
              WHERE aluno_idaluno = ? AND status_parcela IN ('pendente', 'em_analise')`,
            [novoValor, idaluno]
        );
    }

    return true;
}

// Atualizar curso do aluno (Exclusivo Owner)
async function atualizarCursoAluno(idaluno, novoCurso) {
    if (!novoCurso) throw new Error("O nome do curso é obrigatório.");

    await pool.query(
        `UPDATE aluno SET curso = ? WHERE idaluno = ?`,
        [novoCurso, idaluno]
    );

    await pool.query(
        `UPDATE usuario_login u
           JOIN aluno a ON a.usuario_login_id = u.id_usuario
            SET u.tipo_instrumento = ?
          WHERE a.idaluno = ?`,
        [novoCurso, idaluno]
    );

    const [alunoInfo] = await pool.query(
        `SELECT a.desconto_porcentagem, COALESCE(c.valor_mensalidade, 180.00) as base
           FROM aluno a
           LEFT JOIN curso_mensalidade c ON c.nome = ?
          WHERE a.idaluno = ?`,
        [novoCurso, idaluno]
    );

    if (alunoInfo.length > 0) {
        const desc = parseFloat(alunoInfo[0].desconto_porcentagem) || 0;
        const base = parseFloat(alunoInfo[0].base) || 180.00;
        const novoValor = Math.max(0, base * (1 - desc / 100));

        await pool.query(
            `UPDATE financeiro_recebimento
                SET valor = ?
              WHERE aluno_idaluno = ? AND status_parcela IN ('pendente', 'em_analise')`,
            [novoValor, idaluno]
        );
    }

    return true;
}

// Atualizar especialidade do professor (Exclusivo Owner)
async function atualizarEspecialidadeProfessor(idprofessor, novaEspecialidade) {
    if (!novaEspecialidade) throw new Error("A especialidade é obrigatória.");

    await pool.query(
        `UPDATE usuario_login u
           JOIN professor p ON p.usuario_login_id = u.id_usuario
            SET u.tipo_instrumento = ?
          WHERE p.idprofessor = ? OR u.id_usuario = ?`,
        [novaEspecialidade, idprofessor, idprofessor]
    );

    return true;
}

// Histórico de mensalidades de um aluno (para Admin e Owner)
async function obterHistoricoAluno(idaluno) {
    const [aluno] = await pool.query(
        `SELECT a.idaluno, u.nome, u.email, a.curso, a.desconto_porcentagem
           FROM aluno a
           JOIN usuario_login u ON u.id_usuario = a.usuario_login_id
          WHERE a.idaluno = ?`,
        [idaluno]
    );

    const [historico] = await pool.query(
        `SELECT 
            idfinanceiroRecebimento,
            data_vencimento,
            data_pagamento,
            valor,
            status_parcela,
            forma_pagamento,
            comprovante_url,
            mes_referencia
        FROM financeiro_recebimento
        WHERE aluno_idaluno = ?
        ORDER BY data_vencimento DESC`,
        [idaluno]
    );

    return {
        aluno: aluno[0] || null,
        mensalidades: historico,
    };
}

// Validar / Confirmar comprovante enviado pelo aluno (Admin e Owner)
async function confirmarPagamentoComprovante(idRecebimento) {
    const [resultado] = await pool.query(
        `UPDATE financeiro_recebimento
            SET status_parcela = 'pago',
                data_pagamento = COALESCE(data_pagamento, NOW())
          WHERE idfinanceiroRecebimento = ?`,
        [idRecebimento]
    );
    return resultado.affectedRows > 0;
}

// Dados para a aba / página "Matrícula" do Aluno
async function obterMatriculaAluno(idUsuario) {
    const [aluno] = await pool.query(
        `SELECT a.idaluno, a.curso, a.desconto_porcentagem, a.data_nascimento,
                u.nome, u.email, u.telefone, u.cpf, u.foto_url, u.descricao,
                COALESCE(c.valor_mensalidade, 180.00) AS valor_base
           FROM aluno a
           JOIN usuario_login u ON u.id_usuario = a.usuario_login_id
           LEFT JOIN curso_mensalidade c ON c.nome = a.curso
          WHERE u.id_usuario = ?`,
        [idUsuario]
    );

    if (aluno.length === 0) return null;

    const al = aluno[0];
    const desc = parseFloat(al.desconto_porcentagem) || 0;
    const base = parseFloat(al.valor_base) || 180.00;
    const valorFinalCalculado = Math.max(0, base * (1 - desc / 100));

    // Busca mensalidade do mês atual
    const [mensalidadeAtual] = await pool.query(
        `SELECT idfinanceiroRecebimento, data_vencimento, data_pagamento, valor, status_parcela, forma_pagamento, comprovante_url, mes_referencia
           FROM financeiro_recebimento
          WHERE aluno_idaluno = ? AND (mes_referencia = '10/2026' OR mes_referencia IS NULL)
          ORDER BY idfinanceiroRecebimento DESC
          LIMIT 1`,
        [al.idaluno]
    );

    // Histórico de parcelas
    const [historico] = await pool.query(
        `SELECT idfinanceiroRecebimento, data_vencimento, data_pagamento, valor, status_parcela, forma_pagamento, comprovante_url, mes_referencia
           FROM financeiro_recebimento
          WHERE aluno_idaluno = ?
          ORDER BY data_vencimento DESC`,
        [al.idaluno]
    );

    return {
        aluno: al,
        valorBase: base,
        desconto: desc,
        valorFinal: valorFinalCalculado,
        mensalidadeAtual: mensalidadeAtual[0] || null,
        historico,
    };
}

// Enviar comprovante pelo aluno
async function enviarComprovanteAluno(idRecebimento, comprovanteUrl) {
    const [resultado] = await pool.query(
        `UPDATE financeiro_recebimento
            SET status_parcela = 'em_analise',
                comprovante_url = ?
          WHERE idfinanceiroRecebimento = ?`,
        [comprovanteUrl, idRecebimento]
    );
    return resultado.affectedRows > 0;
}

// Atualizar foto de perfil e descrição do usuário
async function atualizarPerfil(idUsuario, { fotoUrl, descricao, telefone }) {
    const campos = [];
    const params = [];

    if (fotoUrl) {
        campos.push("foto_url = ?");
        params.push(fotoUrl);
    }
    if (descricao !== undefined) {
        campos.push("descricao = ?");
        params.push(descricao);
    }
    if (telefone) {
        campos.push("telefone = ?");
        params.push(telefone);
    }

    if (campos.length === 0) return true;

    params.push(idUsuario);
    const [resultado] = await pool.query(
        `UPDATE usuario_login SET ${campos.join(", ")} WHERE id_usuario = ?`,
        params
    );

    return resultado.affectedRows > 0;
}

// Métricas e Resumos Financeiros Exclusivos para o Owner
async function obterResumoFinanceiroOwner() {
    const [pagoMesAtual] = await pool.query(
        `SELECT COALESCE(SUM(valor), 0) AS total, COUNT(*) AS qtd
           FROM financeiro_recebimento
          WHERE status_parcela = 'pago'
            AND (mes_referencia = '10/2026' OR (MONTH(data_pagamento) = MONTH(CURDATE()) AND YEAR(data_pagamento) = YEAR(CURDATE())))`
    );

    const [pagoMesAnterior] = await pool.query(
        `SELECT COALESCE(SUM(valor), 0) AS total, COUNT(*) AS qtd
           FROM financeiro_recebimento
          WHERE status_parcela = 'pago'
            AND (mes_referencia = '09/2026' OR (MONTH(data_pagamento) = 9 AND YEAR(data_pagamento) = 2026))`
    );

    const [pendenteMesAtual] = await pool.query(
        `SELECT COALESCE(SUM(valor), 0) AS total, COUNT(*) AS qtd
           FROM financeiro_recebimento
          WHERE status_parcela IN ('pendente', 'em_analise')`
    );

    const [vencidoMesAtual] = await pool.query(
        `SELECT COALESCE(SUM(valor), 0) AS total, COUNT(*) AS qtd
           FROM financeiro_recebimento
          WHERE status_parcela = 'atrasado'`
    );

    const totalAtual = Number(pagoMesAtual[0].total);
    const totalAnterior = Number(pagoMesAnterior[0].total);

    let variacaoPercentual = 0;
    if (totalAnterior > 0) {
        variacaoPercentual = Number((((totalAtual - totalAnterior) / totalAnterior) * 100).toFixed(1));
    } else if (totalAtual > 0) {
        variacaoPercentual = 100;
    }

    return {
        totalRecebidoMesAtual: totalAtual,
        qtdRecebidoMesAtual: pagoMesAtual[0].qtd,
        totalRecebidoMesAnterior: totalAnterior,
        qtdRecebidoMesAnterior: pagoMesAnterior[0].qtd,
        totalPendente: Number(pendenteMesAtual[0].total),
        qtdPendente: pendenteMesAtual[0].qtd,
        totalVencido: Number(vencidoMesAtual[0].total),
        qtdVencido: vencidoMesAtual[0].qtd,
        variacaoPercentual,
    };
}

// Dados para os gráficos do painel (comparativo mensal e evolução de usuários)
async function obterDadosGraficosOwner() {
    const dadosFinanceiros = {
        labels: ["Semana 1 (1-7)", "Semana 2 (8-14)", "Semana 3 (15-21)", "Semana 4 (22-31)"],
        mesAnterior: [180, 405, 625, 1175],
        mesAtual: [595, 805, 1195, 1420],
    };

    const [usuariosPorMes] = await pool.query(
        `SELECT 
            DATE_FORMAT(data_cadastro, '%b/%Y') AS mes_rotulo,
            COUNT(*) AS total_cadastros
         FROM usuario_login
         GROUP BY YEAR(data_cadastro), MONTH(data_cadastro), DATE_FORMAT(data_cadastro, '%b/%Y')
         ORDER BY MIN(data_cadastro) ASC
         LIMIT 6`
    );

    let labelsUsuarios = ["Mai 2026", "Jun 2026", "Jul 2026", "Ago 2026", "Set 2026", "Out 2026"];
    let valoresUsuarios = [2, 3, 4, 6, 8, 12];

    if (usuariosPorMes.length >= 2) {
        labelsUsuarios = usuariosPorMes.map(u => u.mes_rotulo);
        valoresUsuarios = usuariosPorMes.map(u => u.total_cadastros);
    }

    return {
        financeiro: dadosFinanceiros,
        usuarios: {
            labels: labelsUsuarios,
            valores: valoresUsuarios,
        },
    };
}

// Registrar pagamento manual de mensalidade com anexo de comprovante
async function registrarPagamento({ idRecebimento, dataPagamento, formaPagamento, comprovanteUrl }) {
    const dataFinal = dataPagamento ? `${dataPagamento} 12:00:00` : new Date();

    const [resultado] = await pool.query(
        `UPDATE financeiro_recebimento
            SET status_parcela = 'pago',
                data_pagamento = ?,
                forma_pagamento = ?,
                comprovante_url = COALESCE(?, comprovante_url)
          WHERE idfinanceiroRecebimento = ?`,
        [dataFinal, formaPagamento || "pix", comprovanteUrl || null, idRecebimento]
    );

    return resultado.affectedRows > 0;
}

module.exports = {
    contarAlunos,
    contarProfessores,
    aniversariantesDoMes,
    listarCursos,
    atualizarValorCurso,
    listarMensalidadesAlunos,
    listarAdministradores,
    listarProfessores,
    listarAlunosCompletos,
    atribuirDescontoAluno,
    atualizarCursoAluno,
    atualizarEspecialidadeProfessor,
    obterHistoricoAluno,
    confirmarPagamentoComprovante,
    obterMatriculaAluno,
    enviarComprovanteAluno,
    atualizarPerfil,
    obterResumoFinanceiroOwner,
    obterDadosGraficosOwner,
    registrarPagamento,
};