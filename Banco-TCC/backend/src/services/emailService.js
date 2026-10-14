const nodemailer = require("nodemailer");

function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

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
    const nomeLimpo = escapeHtml(nomeAluno);
    const emailLimpo = escapeHtml(emailAluno);
    const senhaLimpa = escapeHtml(senha);

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: emailAluno,
        subject: "Acesso ao Instituto Bravo",
        html: `
            <h2>Bem-vindo ao Instituto Bravo, ${nomeLimpo}!</h2>
            <p>Parabéns! Você agora é um aluno(a) do Instituto Bravo!</p>

            <p>Siga as instruções abaixo para fazer login:</p>

            <p>
                <strong>Email:</strong> ${emailLimpo}
                <br>
                <strong>Senha Temporária:</strong> ${senhaLimpa}
            </p>

            <p>Após o primeiro login, você será solicitado a alterar sua senha.</p>
        `
    });
}

async function enviarEmailRecuperacaoSenha(emailAluno, nomeAluno, link) {
    const nomeLimpo = escapeHtml(nomeAluno);
    const linkLimpo = encodeURI(link);

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: emailAluno,
        subject: "Recuperação de Senha - Instituto Bravo",
        html: `
            <h2>Recuperação de Senha - Instituto Bravo</h2>
            <p>Olá ${nomeLimpo},</p>
            <p>Recebemos uma solicitação para redefinir sua senha.</p>
            <p>Clique no link abaixo para criar uma nova senha:</p>
            <p><a href="${linkLimpo}">${escapeHtml(link)}</a></p>
            <p>Se você não solicitou a redefinição de senha, por favor ignore este e-mail.</p>
        `
    });
}

async function enviarEmailCadastroProfessor(emailProfessor, nomeProfessor, senha) {
    const nomeLimpo = escapeHtml(nomeProfessor);
    const emailLimpo = escapeHtml(emailProfessor);
    const senhaLimpa = escapeHtml(senha);

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: emailProfessor,
        subject: "Acesso ao Instituto Bravo",
        html: `
            <h2>Bem-vindo ao Instituto Bravo, ${nomeLimpo}!</h2>
            <p>Você agora faz parte do corpo docente do Instituto Bravo!</p>

            <p>Siga as instruções abaixo para fazer login:</p>

            <p>
                <strong>Email:</strong> ${emailLimpo}
                <br>
                <strong>Senha Temporária:</strong> ${senhaLimpa}
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