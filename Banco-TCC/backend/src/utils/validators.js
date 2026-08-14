function validarCPF(cpf) {
    if (!cpf) return false;

    const digitos = cpf.replace(/\D/g, "");

    if (digitos.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(digitos)) return false; // todos os dígitos iguais

    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(digitos[i]) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(digitos[9])) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(digitos[i]) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(digitos[10])) return false;

    return true;
}

function validarCNPJ(cnpj) {
    if (!cnpj) return false;

    const digitos = cnpj.replace(/\D/g, "");

    if (digitos.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(digitos)) return false;

    const calcularDigito = (base, pesos) => {
        const soma = pesos.reduce((acc, peso, i) => acc + parseInt(base[i]) * peso, 0);
        const resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    };

    const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const digito1 = calcularDigito(digitos, pesos1);
    if (digito1 !== parseInt(digitos[12])) return false;

    const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const digito2 = calcularDigito(digitos, pesos2);
    if (digito2 !== parseInt(digitos[13])) return false;

    return true;
}

function validarTelefone(telefone) {
    if (!telefone) return false;

    const digitos = telefone.replace(/\D/g, "");
    return digitos.length === 10 || digitos.length === 11;
}

function validarCEP(cep) {
    if (!cep) return false;

    const digitos = cep.replace(/\D/g, "");
    return digitos.length === 8;
}

function validarEmail(email) {
    if (!email) return false;

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = {
    validarCPF,
    validarCNPJ,
    validarTelefone,
    validarCEP,
    validarEmail,
};