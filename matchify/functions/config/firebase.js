const path = require("path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

const isLocal = !!process.env.FUNCTIONS_EMULATOR;  // 'true' if running in emulator

let app;
if (isLocal) {
  // Local dev with service account
  const serviceAccountPath = path.resolve(__dirname, "../../ked225-firebase-adminsdk-twon8-d3560c296d.json");
  app = initializeApp({
    credential: cert(require(serviceAccountPath)),
  });
} else {
  // In production, rely on default credentials
  app = initializeApp();
}

const db = getFirestore(app);
const auth = getAuth(app);

module.exports = { db, auth, isLocal };
