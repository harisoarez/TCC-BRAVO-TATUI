function formatarCPF(cpf) {
    if (!cpf) return "";

    const digitos = cpf.replace(/\D/g, "");
    if (digitos.length !== 11) return cpf;

    return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatarCNPJ(cnpj) {
    if (!cnpj) return "";

    const digitos = cnpj.replace(/\D/g, "");
    if (digitos.length !== 14) return cnpj;

    return digitos.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

function formatarTelefone(telefone) {
    if (!telefone) return "";

    const digitos = telefone.replace(/\D/g, "");

    if (digitos.length === 11) {
        return digitos.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }

    if (digitos.length === 10) {
        return digitos.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }

    return telefone;
}

function formatarCEP(cep) {
    if (!cep) return "";

    const digitos = cep.replace(/\D/g, "");
    if (digitos.length !== 8) return cep;

    return digitos.replace(/(\d{5})(\d{3})/, "$1-$2");
}

function formatarMoeda(valor) {
    const numero = Number(valor) || 0;
    return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(data) {
    if (!data) return "";

    return new Date(data).toLocaleDateString("pt-BR");
}

function formatarDataHora(data) {
    if (!data) return "";

    return new Date(data).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

module.exports = {
    formatarCPF,
    formatarCNPJ,
    formatarTelefone,
    formatarCEP,
    formatarMoeda,
    formatarData,
    formatarDataHora,
};