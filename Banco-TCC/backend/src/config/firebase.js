const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const serviceAccount = require("../../firebase-admin.json");
require("dotenv").config();

const app = initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth(app);

console.log("✅ Firebase conectado");

module.exports = { auth };