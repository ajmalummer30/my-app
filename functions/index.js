const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true }); // Add this line

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

const { DocumentProcessorServiceClient } =
  require("@google-cloud/documentai").v1;
const path = require("path");

// Load Google service account key securely
const client = new DocumentProcessorServiceClient({
  keyFilename: path.join(
    __dirname,
    "queue-management-462616-ab52ad7cbb8c.json"
  ),
});

// Document types config
const PROCESSOR_CONFIG = {
  iqama: {
    projectId: "64562194088",
    location: "us",
    processorId: "c0c730c26b31e7a5",
  },
  national_id: {
    projectId: "64562194088",
    location: "us",
    processorId: "c0c730c26b31e7a5",
  },
  passport: {
    projectId: "64562194088",
    location: "us",
    processorId: "cf7c7b4d56aadda4",
  },
};

exports.processDocument = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
    try {
      const { fileContent, mimeType, docType } = req.body;

      if (!fileContent || !docType || !PROCESSOR_CONFIG[docType]) {
        return res.status(400).json({ error: "Invalid request" });
      }

      const config = PROCESSOR_CONFIG[docType];
      const name = `projects/${config.projectId}/locations/${config.location}/processors/${config.processorId}`;

      const request = {
        name,
        rawDocument: {
          content: Buffer.from(fileContent, "base64"),
          mimeType: mimeType || "application/pdf",
        },
        fieldMask: { paths: ["entities"] },
      };

      const [result] = await client.processDocument(request);

      // Map entities to simple key-value pairs: { type: mentionText }
      const extracted = {};
      if (result.document && result.document.entities) {
        result.document.entities.forEach((entity) => {
          extracted[entity.type] = entity.mentionText;
        });
      }

      return res.status(200).json({ extracted });
    } catch (err) {
      console.error("Document AI Error:", err);
      res.status(500).json({ error: err.message });
    }
  });
});
