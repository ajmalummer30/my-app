const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

admin.initializeApp();

exports.addUserToFirestore = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName, photoURL } = user;

  const userRef = admin.firestore().collection("users").doc(uid);
  const snapshot = await userRef.get();

  if (!snapshot.exists) {
    await userRef.set({
      displayName: displayName || null,
      email,
      photoURL: photoURL || null,
      role: "user",
      isAdminApproved: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`Firestore document created for: ${email}`);
  } else {
    console.log(`User document already exists for: ${email}`);
  }
});
