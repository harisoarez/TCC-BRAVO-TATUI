function ehAdmin(firebaseUid) {
    return Boolean(process.env.ADMIN_FIREBASE_UID) && firebaseUid === process.env.ADMIN_FIREBASE_UID;
}

module.exports = { ehAdmin };