const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const { setGlobalOptions } = require("firebase-functions/v2");

const admin = require("firebase-admin");
admin.initializeApp();

// 🔐 Optional: set default region to `me-central2`
setGlobalOptions({ region: "me-central2", maxInstances: 10 });

exports.syncUserRoleToClaims = onDocumentWritten(
  {
    region: "me-central2", // ✅ Set to match your Firebase default region
    document: "users/{userId}",
  },
  async (event) => {
    const userId = event.params.userId;
    const userDoc = event.data?.after?.exists ? event.data.after.data() : null;

    if (!userDoc) return null;

    const role = userDoc.role || "user";

    try {
      const adminClaim = role === "admin";
      const user = await admin.auth().getUser(userId);
      const currentClaims = user.customClaims || {};

      if (currentClaims.admin !== adminClaim) {
        await admin.auth().setCustomUserClaims(userId, { admin: adminClaim });
        console.log(`Updated admin claim = ${adminClaim} for ${userId}`);
      } else {
        console.log(`No change in claims for ${userId}`);
      }
    } catch (err) {
      console.error("Error setting custom claims:", err);
    }

    return null;
  }
);
