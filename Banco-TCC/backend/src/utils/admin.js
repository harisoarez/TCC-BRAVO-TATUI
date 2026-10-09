function ehAdmin(usuario) {
    if (!usuario) return false;
    const tipo = typeof usuario === "string" ? usuario : (usuario.tipo_usuario || usuario.tipo);
    return tipo === "admin" || tipo === "owner";
}

function ehOwner(usuario) {
    if (!usuario) return false;
    const tipo = typeof usuario === "string" ? usuario : (usuario.tipo_usuario || usuario.tipo);
    return tipo === "owner";
}

module.exports = { ehAdmin, ehOwner };