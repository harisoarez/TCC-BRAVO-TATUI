const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

function uploadImagem(fileBuffer, folder = "alunos") {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "auto"
            },
            (erro, result) => {
                if (erro) return reject(erro);
                resolve(result);
            }
        );

        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
}

module.exports = { uploadImagem };