const bcrypt = require("bcryptjs");
const pool = require("../config/database");

async function popularBanco() {
    console.log("Iniciando seed do banco de dados...");
    const conexao = await pool.getConnection();

    try {
        await conexao.beginTransaction();

        // 0. Criar usuário Owner com permissão absoluta se não existir
        const [owners] = await conexao.query(
            "SELECT id_usuario FROM usuario_login WHERE email = ? LIMIT 1",
            ["owner@institutobravo.com.br"]
        );

        if (owners.length === 0) {
            const hashOwner = await bcrypt.hash("D@hl1a_P1nn@t4!", 10);
            await conexao.query(
                `INSERT INTO usuario_login 
                (senha, tipo_usuario, email, nome, telefone, primeiro_acesso, data_cadastro)
                VALUES (?, 'owner', 'owner@institutobravo.com.br', 'Owner', '15999990000', 0, NOW())`,
                [hashOwner]
            );
            console.log("✅ Usuário Owner criado: owner@institutobravo.com.br (senha: D@hl1a_P1nn@t4!)");
        } else {
            console.log("ℹ️ Owner já existe no banco.");
        }

        // 1. Criar usuário Admin se não existir
        const [admins] = await conexao.query(
            "SELECT id_usuario FROM usuario_login WHERE email = ? LIMIT 1",
            ["admin@institutobravo.com.br"]
        );

        let idAdmin;
        if (admins.length === 0) {
            const hashAdmin = await bcrypt.hash("admin123", 10);
            const [resAdmin] = await conexao.query(
                `INSERT INTO usuario_login 
                (senha, tipo_usuario, email, nome, telefone, tipo_instrumento, primeiro_acesso, data_cadastro)
                VALUES (?, 'admin', 'admin@institutobravo.com.br', 'Administrador Bravo', '15999990001', 'Direção', 0, NOW())`,
                [hashAdmin]
            );
            idAdmin = resAdmin.insertId;
            console.log("✅ Usuário Administrador criado: admin@institutobravo.com.br (senha: admin123)");
        } else {
            idAdmin = admins[0].id_usuario;
            console.log("ℹ️ Administrador já existe no banco.");
        }

        // 2. Criar Professor se não existir
        const [professoresUser] = await conexao.query(
            "SELECT id_usuario FROM usuario_login WHERE email = ? LIMIT 1",
            ["professor@institutobravo.com.br"]
        );

        let idProfessorDB;
        if (professoresUser.length === 0) {
            const hashProf = await bcrypt.hash("prof123", 10);
            const [resProfUser] = await conexao.query(
                `INSERT INTO usuario_login 
                (senha, tipo_usuario, email, nome, telefone, tipo_instrumento, primeiro_acesso, data_cadastro)
                VALUES (?, 'professor', 'professor@institutobravo.com.br', 'Carlos Eduardo (Professor)', '15999990002', 'Piano', 0, NOW())`,
                [hashProf]
            );

            const [resProf] = await conexao.query(
                `INSERT INTO professor (CPF, CNPJ, usuario_login_id)
                VALUES ('12345678901', '12345678000199', ?)`,
                [resProfUser.insertId]
            );
            idProfessorDB = resProf.insertId;
            console.log("✅ Professor criado: professor@institutobravo.com.br (senha: prof123)");
        } else {
            const [profCadastrado] = await conexao.query(
                "SELECT idprofessor FROM professor WHERE usuario_login_id = ? LIMIT 1",
                [professoresUser[0].id_usuario]
            );
            idProfessorDB = profCadastrado[0]?.idprofessor || 1;
            console.log("ℹ️ Professor já existe no banco.");
        }

        // 3. Criar Aluno se não existir
        const [alunosUser] = await conexao.query(
            "SELECT id_usuario FROM usuario_login WHERE email = ? LIMIT 1",
            ["aluno@institutobravo.com.br"]
        );

        let idAlunoDB;
        if (alunosUser.length === 0) {
            const hashAluno = await bcrypt.hash("aluno123", 10);
            const [resAlunoUser] = await conexao.query(
                `INSERT INTO usuario_login 
                (senha, tipo_usuario, email, nome, telefone, tipo_instrumento, primeiro_acesso, data_cadastro)
                VALUES (?, 'aluno', 'aluno@institutobravo.com.br', 'Lucas Silva (Aluno)', '15999990003', 'Piano', 0, NOW())`,
                [hashAluno]
            );

            const [resAluno] = await conexao.query(
                `INSERT INTO aluno (CPF, endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, endereco_cep, data_nascimento, usuario_login_id)
                VALUES ('98765432100', 'Rua das Flores', '123', 'Centro', 'Tatuí', '18270000', '2005-04-12', ?)`,
                [resAlunoUser.insertId]
            );
            idAlunoDB = resAluno.insertId;
            console.log("✅ Aluno criado: aluno@institutobravo.com.br (senha: aluno123)");
        } else {
            console.log("ℹ️ Aluno já existe no banco.");
        }

        // 4. Criar Aulas iniciais se não houver nenhuma
        const [aulasExistentes] = await conexao.query("SELECT COUNT(*) AS total FROM aula");
        if (aulasExistentes[0].total === 0) {
            const hoje = new Date();
            const ano = hoje.getFullYear();
            const mes = String(hoje.getMonth() + 1).padStart(2, "0");
            const diaHoje = String(hoje.getDate()).padStart(2, "0");

            const amanha = new Date(hoje);
            amanha.setDate(hoje.getDate() + 1);
            const diaAmanha = String(amanha.getDate()).padStart(2, "0");
            const mesAmanha = String(amanha.getMonth() + 1).padStart(2, "0");
            const anoAmanha = amanha.getFullYear();

            await conexao.query(
                `INSERT INTO aula (titulo, instrumento, professor_idprofessor, sala, data_aula, duracao_minutos, status, observacoes)
                VALUES 
                ('Iniciação ao Piano', 'Piano', ?, 1, ?, 60, 'normal', 'Módulo 1 - Postura e primeiras notas'),
                ('Prática de Escalas e Arpejos', 'Piano', ?, 2, ?, 60, 'reposicao', 'Reposição da aula anterior'),
                ('Iniciação à Bateria', 'Bateria', ?, 3, ?, 60, 'normal', 'Estudo de rítmica básica')`,
                [
                    idProfessorDB,
                    `${ano}-${mes}-${diaHoje} 09:00:00`,
                    idProfessorDB,
                    `${anoAmanha}-${mesAmanha}-${diaAmanha} 14:00:00`,
                    idProfessorDB,
                    `${ano}-${mes}-${diaHoje} 16:30:00`,
                ]
            );
            console.log("✅ 3 Aulas de exemplo cadastradas para o calendário!");
        } else {
            console.log(`ℹ️ O banco já possui ${aulasExistentes[0].total} aulas cadastradas.`);
        }

        await conexao.commit();
        console.log("🎉 Seed finalizado com sucesso!");
    } catch (erro) {
        await conexao.rollback();
        console.error("❌ Erro ao popular banco:", erro.message);
    } finally {
        conexao.release();
        process.exit(0);
    }
}

if (require.main === module) {
    popularBanco();
}

module.exports = popularBanco;
