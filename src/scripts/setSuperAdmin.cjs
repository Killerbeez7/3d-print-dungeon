const admin = require("firebase-admin");
const serviceAccount = require("./key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const uid = "yhxP3gGtqSUFkM6FUdDQrqZD5lm2"; // plamen


admin
    .auth()
    .setCustomUserClaims(uid, { super: true, admin: true })
    .then(() => {
        console.log(`User ${uid} is now a super admin with both super and admin claims!`);
        
        // Verify the claims were set
        return admin.auth().getUser(uid);
    })
    .then((userRecord) => {
        console.log("User's custom claims:", userRecord.customClaims);
        process.exit(0);
    })
    .catch((error) => {
        console.error("Error setting custom claims:", error);
        process.exit(1);
    });
