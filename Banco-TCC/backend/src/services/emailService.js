const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,    
    },
});

async function enviarEmailCadastrado(emailAluno, nomeAluno, senha) {

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: emailAluno,
        subject: "Acesso ao Instituto Bravo",
        html: `
            <h2>Bem-vindo ao Instituto Bravo, ${nomeAluno}!</h2>
            <p>Parabéns!! Você agora é um aluno(a) do Instituto Bravo!</p>

            <p>Siga as istruçôes abaixo para fazer login:</p>

            <p>
                <strong>Email:</strong> ${emailAluno}
                <br>
                <strong>Senha Temporária:</strong> ${senha}
            </p>

            <p>Após o primeiro login, você será solicitado a alterar sua senha.</p>
        `
    });
}

async function enviarEmailRecuperacaoSenha(emailAluno, nomeAluno, link) {
    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: emailAluno,
        subject: "Recuperação de Senha - Instituto Bravo",
        html: `
            <h2>Recuperação de Senha - Instituto Bravo</h2>
            <p>Olá ${nomeAluno},</p>
            <p>Recebemos uma solicitação para redefinir sua senha.</p>
            <p>Clique no link abaixo para criar uma nova senha:</p>
            <p><a href="${link}">${link}</a></p>
            <p>Se você não solicitou a redefinição de senha, por favor ignore este e-mail.</p>
        `
    });
}

async function enviarEmailCadastroProfessor(emailProfessor, nomeProfessor, senha) {

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: emailProfessor,
        subject: "Acesso ao Instituto Bravo",
        html: `
            <h2>Bem-vindo ao Instituto Bravo, ${nomeProfessor}!</h2>
            <p>Você agora faz parte do corpo docente do Instituto Bravo!</p>

            <p>Siga as instruções abaixo para fazer login:</p>

            <p>
                <strong>Email:</strong> ${emailProfessor}
                <br>
                <strong>Senha Temporária:</strong> ${senha}
            </p>

            <p>Após o primeiro login, você será solicitado a alterar sua senha.</p>
        `
    });
}

module.exports = {
    enviarEmailCadastrado,
    enviarEmailCadastroProfessor,
    enviarEmailRecuperacaoSenha 
};