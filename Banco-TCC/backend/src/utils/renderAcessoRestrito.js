/**
 * Módulo para renderizar a página estilizada de "Acesso Restrito / Autenticação Necessária"
 * Mantém total coerência visual com a identidade do Instituto Musical Bravo Tatuí (Dark Luxury & Gold).
 */

function gerarHtmlAcessoRestrito(opcoes = {}) {
    const {
        titulo = "Acesso Restrito",
        subtitulo = "Identificação Necessária",
        mensagem = "É necessário realizar login como Administrador ou Owner para acessar este recurso.",
        usuario = null,
        tipo = "login_necessario", // 'login_necessario' | 'permissao_insuficiente'
        urlLogin = "/site/login.html",
        urlInicio = "/site/index.html",
    } = opcoes;

    let badgeTipoHtml = "";
    let botaoLoginTexto = "Fazer Login";
    let usuarioConectadoHtml = "";

    if (tipo === "permissao_insuficiente" && usuario) {
        const cargoFormatado = (usuario.tipo_usuario || usuario.tipo || "Aluno").toUpperCase();
        badgeTipoHtml = `<div class="badge-tag alerta">NÍVEL DE PERMISSÃO INSUFICIENTE</div>`;
        botaoLoginTexto = "Entrar com Outra Conta";
        usuarioConectadoHtml = `
            <div class="usuario-conectado-box">
                <div class="usuario-conectado-avatar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                </div>
                <div class="usuario-conectado-info">
                    <span class="usuario-conectado-nome">${usuario.nome || "Usuário"}</span>
                    <span class="usuario-conectado-cargo">${cargoFormatado}</span>
                </div>
            </div>
        `;
    } else {
        badgeTipoHtml = `<div class="badge-tag">ÁREA RESTRITA • INSTITUTO BRAVO TATUÍ</div>`;
    }

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titulo} | Instituto Musical Bravo Tatuí</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-font-smoothing: antialiased;
        }

        body {
            background-color: #07090e;
            background-image: 
                radial-gradient(circle at 50% 20%, rgba(245, 214, 150, 0.08) 0%, transparent 45%),
                radial-gradient(circle at 80% 80%, rgba(212, 175, 55, 0.04) 0%, transparent 50%),
                radial-gradient(circle at 20% 80%, rgba(13, 17, 27, 0.9) 0%, transparent 60%);
            color: #ffffff;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            position: relative;
            overflow-x: hidden;
        }

        /* Linhas sutis decorativas de fundo */
        body::before {
            content: "";
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(rgba(245, 214, 150, 0.04) 1px, transparent 1px);
            background-size: 32px 32px;
            pointer-events: none;
            z-index: 0;
            opacity: 0.6;
        }

        .cartao-restrito {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 520px;
            background: rgba(14, 18, 28, 0.9);
            border: 1px solid rgba(245, 214, 150, 0.28);
            border-radius: 24px;
            padding: 44px 36px 36px 36px;
            text-align: center;
            box-shadow: 
                0 25px 60px rgba(0, 0, 0, 0.8),
                0 0 50px rgba(245, 214, 150, 0.08);
            backdrop-filter: blur(16px);
            animation: cardEntrada 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes cardEntrada {
            from {
                opacity: 0;
                transform: translateY(24px) scale(0.97);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        /* Topo: Logo & Ícone */
        .topo-icones {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 24px;
        }

        .logo-marca {
            display: flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
            margin-bottom: 22px;
            transition: opacity 0.2s ease;
        }

        .logo-marca:hover {
            opacity: 0.85;
        }

        .logo-marca img {
            width: 36px;
            height: 36px;
            object-fit: contain;
            filter: drop-shadow(0 0 8px rgba(245, 214, 150, 0.4));
        }

        .logo-marca span {
            font-family: 'Cinzel', serif;
            font-size: 15px;
            font-weight: 700;
            letter-spacing: 2px;
            color: #F5D696;
        }

        .cadeado-circulo {
            width: 76px;
            height: 76px;
            border-radius: 50%;
            background: radial-gradient(circle at center, rgba(245, 214, 150, 0.18) 0%, rgba(20, 25, 40, 0.9) 70%);
            border: 2px solid rgba(245, 214, 150, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 
                0 0 25px rgba(245, 214, 150, 0.25),
                inset 0 0 15px rgba(245, 214, 150, 0.15);
            animation: pulseGlow 3s infinite alternate ease-in-out;
        }

        @keyframes pulseGlow {
            0% {
                box-shadow: 0 0 20px rgba(245, 214, 150, 0.2), inset 0 0 12px rgba(245, 214, 150, 0.1);
                border-color: rgba(245, 214, 150, 0.35);
            }
            100% {
                box-shadow: 0 0 35px rgba(245, 214, 150, 0.4), inset 0 0 20px rgba(245, 214, 150, 0.25);
                border-color: rgba(245, 214, 150, 0.6);
            }
        }

        .cadeado-circulo svg {
            color: #F5D696;
        }

        /* Badges */
        .badge-tag {
            display: inline-block;
            font-size: 10.5px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            padding: 5px 14px;
            border-radius: 20px;
            background: rgba(245, 214, 150, 0.1);
            color: #F5D696;
            border: 1px solid rgba(245, 214, 150, 0.25);
            margin-bottom: 14px;
        }

        .badge-tag.alerta {
            background: rgba(239, 68, 68, 0.12);
            color: #f87171;
            border-color: rgba(239, 68, 68, 0.3);
        }

        /* Títulos e Textos */
        .titulo-pagina {
            font-family: 'Cinzel', serif;
            font-size: clamp(22px, 3.5vw, 26px);
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
        }

        .subtitulo-pagina {
            font-family: 'Playfair Display', serif;
            font-style: italic;
            font-size: 15px;
            color: #F5D696;
            margin-bottom: 18px;
        }

        .mensagem-corpo {
            font-size: 14px;
            line-height: 1.6;
            color: #94a3b8;
            margin-bottom: 24px;
            padding: 0 10px;
        }

        .mensagem-corpo strong {
            color: #e2e8f0;
        }

        /* Caixa de usuário conectado */
        .usuario-conectado-box {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 10px 16px;
            margin-bottom: 24px;
        }

        .usuario-conectado-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #1e293b;
            color: #F5D696;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(245, 214, 150, 0.3);
        }

        .usuario-conectado-info {
            text-align: left;
            display: flex;
            flex-direction: column;
        }

        .usuario-conectado-nome {
            font-size: 13.5px;
            font-weight: 600;
            color: #ffffff;
        }

        .usuario-conectado-cargo {
            font-size: 11px;
            color: #94a3b8;
            font-weight: 500;
        }

        /* Botões de Ação */
        .botoes-acoes {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 24px;
        }

        .btn-principal {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            width: 100%;
            padding: 13px 24px;
            border-radius: 12px;
            background: linear-gradient(135deg, #F5D696 0%, #e0bd73 100%);
            color: #0d111b;
            font-size: 14.5px;
            font-weight: 700;
            text-decoration: none;
            letter-spacing: 0.3px;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 18px rgba(245, 214, 150, 0.25);
        }

        .btn-principal:hover {
            background: linear-gradient(135deg, #ffe0a3 0%, #eec97f 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(245, 214, 150, 0.45);
        }

        .btn-secundario {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            padding: 11px 24px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: #cbd5e1;
            font-size: 13.5px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .btn-secundario:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(245, 214, 150, 0.4);
            color: #F5D696;
            transform: translateY(-1px);
        }

        /* Rodapé do Cartão */
        .rodape-info {
            padding-top: 18px;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
            font-size: 12px;
            color: #64748b;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .rodape-info a {
            color: #F5D696;
            text-decoration: none;
            transition: color 0.2s ease;
        }

        .rodape-info a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="cartao-restrito">
        <div class="topo-icones">
            <a href="${urlInicio}" class="logo-marca" title="Instituto Musical Bravo Tatuí">
                <img src="/images/logo_bravo.png" alt="Instituto Musical Bravo Tatuí" onerror="this.style.display='none'">
                <span>BRAVO TATUÍ</span>
            </a>

            <div class="cadeado-circulo">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    <circle cx="12" cy="16" r="1.5"></circle>
                </svg>
            </div>
        </div>

        ${badgeTipoHtml}

        <h1 class="titulo-pagina">${titulo}</h1>
        <p class="subtitulo-pagina">${subtitulo}</p>

        <p class="mensagem-corpo">
            ${mensagem}
        </p>

        ${usuarioConectadoHtml}

        <div class="botoes-acoes">
            <a href="${urlLogin}" class="btn-principal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                <span>${botaoLoginTexto}</span>
            </a>

            <a href="${urlInicio}" class="btn-secundario">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>Voltar à Página Inicial</span>
            </a>
        </div>

        <div class="rodape-info">
            <span>Instituto Musical Bravo Tatuí • Excelência e Tradição Musical</span>
            <span>Dúvidas ou suporte? WhatsApp: <a href="https://wa.me/5515996257683" target="_blank">(15) 99625-7683</a></span>
        </div>
    </div>
</body>
</html>`;
}

module.exports = {
    gerarHtmlAcessoRestrito,
};
