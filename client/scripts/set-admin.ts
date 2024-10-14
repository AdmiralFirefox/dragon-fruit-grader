/* eslint-disable @typescript-eslint/no-require-imports */
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const serviceAccount = require("../serviceAccount.json");

const adminConfig = {
  credential: cert(serviceAccount),
};

// Initialize Firebase Admin
initializeApp(adminConfig);

const adminAuth = getAuth();

// Setting Admin Privileges
const setAdmin = async (uid: string) => {
  try {
    // Set custom claims for the user to make them an admin
    await adminAuth.setCustomUserClaims(uid, { admin: true });
    console.log(`User ${uid} is now an admin.`);

    // Revoke the user's refresh tokens to sign them out
    await adminAuth.revokeRefreshTokens(uid);
    console.log(`User ${uid} has been signed out.`);
  } catch (error) {
    console.error("Error setting admin claims:", error);
  }
};

// Remove Admin Privileges
// const removeAdmin = async (uid: string) => {
//   try {
//     // Remove custom claims for the user to revoke their admin rights
//     await adminAuth.setCustomUserClaims(uid, { admin: false });
//     console.log(`Admin rights removed from user ${uid}.`);

//     // Revoke the user's refresh tokens to sign them out
//     await adminAuth.revokeRefreshTokens(uid);
//     console.log(`User ${uid} has been signed out.`);
//   } catch (error) {
//     console.error("Error removing admin claims:", error);
//   }
// };

// Replace this UID with the user's Firebase UID you want to make an admin
const userUid = "USER_UID";
setAdmin(userUid);
// removeAdmin(userUid);
