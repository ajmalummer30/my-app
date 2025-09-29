import React, { useState } from "react";
import { useEffect } from "react";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../components/Firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ImageCropper from "../components/ImageCropper"; // External component
import AddvisitorTab from "../components/AddvisitorTab";
import { MuiTelInput } from "mui-tel-input";
import CountrySelect from "../components/country";
import { CountrySelector } from "react-international-phone";
import TextField from "@mui/material/TextField";

const storage = getStorage();

const VisitorForm = () => {
  const [visitor, setVisitor] = useState({
    name: "",
    email: "",
    visitReason: "",
    Mobile: "",
    nationality: "",
  });

  const [documents, setDocuments] = useState({
    passport: {
      documentNumber: "",
      expiryDate: "",
      file: null,
      previewURL: null,
    },
    iqama: {
      documentNumber: "",
      expiryDate: "",
      file: null,
      previewURL: null,
    },
    nationalId: {
      documentNumber: "",
      expiryDate: "",
      file: null,
      previewURL: null,
    },
  });

  const [cropModal, setCropModal] = useState({
    open: false,
    type: null,
    imageSrc: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [currentTab, setCurrentTab] = useState("passport");

  // Handle visitor field change
  const handleVisitorChange = (e) => {
    const { name, value } = e.target;
    setVisitor((prev) => ({ ...prev, [name]: value }));
  };

  // Handle document fields
  const handleDocumentChange = (e, type) => {
    const { name, value } = e.target;
    setDocuments((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [name]: value,
      },
    }));
  };

  // When file selected:
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const imageSrc = URL.createObjectURL(file);
    setCropModal({ open: true, type, imageSrc });
  };

  // When crop is confirmed:
  const onCropComplete = (croppedBlob) => {
    const previewURL = URL.createObjectURL(croppedBlob);
    setDocuments((prev) => ({
      ...prev,
      [cropModal.type]: {
        ...prev[cropModal.type],
        fileBlob: croppedBlob,
        previewURL,
      },
    }));
    setCropModal({ open: false, type: null, imageSrc: null });
  };

  // Upload file and get download URL
  const uploadFileAndGetURL = async (file, docType) => {
    if (!file) return "";
    const fileRef = ref(
      storage,
      `visitor_documents/${docType}/${Date.now()}_${docType}.jpg`
    );
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitter = e.nativeEvent?.submitter;
    if (!submitter || submitter.type !== "submit") {
      console.warn("Blocked unintended form submission from:", submitter);
      return;
    }

    console.log("Form submitted by:", e.nativeEvent.submitter);

    // handleSubmit(e);

    setLoading(true);
    setMessage("");

    const { passport, iqama, nationalId } = documents;
    try {
      const visitorsRef = collection(db, "visitors");

      const documentTypes = ["passport", "iqama", "nationalId"];
      const queries = [];

      documentTypes.forEach((type) => {
        const docNumber = documents[type]?.documentNumber?.trim();
        if (docNumber) {
          queries.push(
            query(
              visitorsRef,
              where(`documents.${type}.documentNumber`, "==", docNumber)
            )
          );
        }
      });

      // Check all queries in parallel
      for (const q of queries) {
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setMessage("❌ Duplicate document number found.");
          setLoading(false);
          return;
        }
      }

      // Upload files
      const passportURL = await uploadFileAndGetURL(
        passport.fileBlob,
        "passport"
      );
      const iqamaURL = await uploadFileAndGetURL(iqama.fileBlob, "iqama");
      const nationalIdURL = await uploadFileAndGetURL(
        nationalId.fileBlob,
        "nationalId"
      );

      const payload = {
        ...visitor,
        documents: {
          passport: {
            documentNumber: passport.documentNumber,
            expiryDate: passport.expiryDate,
            fileURL: passportURL,
          },
          iqama: {
            documentNumber: iqama.documentNumber,
            expiryDate: iqama.expiryDate,
            fileURL: iqamaURL,
          },
          nationalId: {
            documentNumber: nationalId.documentNumber,
            expiryDate: nationalId.expiryDate,
            fileURL: nationalIdURL,
          },
        },
        createdAt: new Date(),
      };

      await addDoc(visitorsRef, payload);
      setMessage("✅ Visitor and documents submitted successfully!");

      // Reset
      setVisitor({
        name: "",
        email: "",
        visitReason: "",
        Mobile: "",
        nationality: "",
      });
      setDocuments({
        passport: {
          documentNumber: "",
          expiryDate: "",
          file: null,
          previewURL: null,
        },
        iqama: {
          documentNumber: "",
          expiryDate: "",
          file: null,
          previewURL: null,
        },
        nationalId: {
          documentNumber: "",
          expiryDate: "",
          file: null,
          previewURL: null,
        },
      });
    } catch (error) {
      setMessage("❌ Error: " + error.message);
    }

    setLoading(false);
  };

  const onCropCancel = () => {
    setCropModal({ open: false, type: null, imageSrc: null });
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Visitor Information</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Visitor Inputs */}
        <input
          type="text"
          name="name"
          value={visitor.name}
          onChange={handleVisitorChange}
          placeholder="Full Name"
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-400"
        />

        <div className="w-full">
          <TextField
            type="email"
            name="email" // Sets the name attribute, useful for forms
            value={visitor.email} // Controlled component’s current value
            onChange={handleVisitorChange} // Function called when input changes
            placeholder="Email" // Placeholder text inside the input
            label="Email"
            id="outlined-basic"
            variant="outlined"
            fullWidth
          />
        </div>

        <input
          type="text"
          name="visitReason"
          value={visitor.visitReason}
          onChange={handleVisitorChange}
          placeholder="Reason for Visit"
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-400"
        />
        <div>
          <MuiTelInput
            defaultCountry="SA"
            value={visitor.Mobile}
            onChange={(phone) =>
              setVisitor((prev) => ({ ...prev, Mobile: phone }))
            }
            forceCallingCode
            focusOnSelectCountry
            fullWidth
            variant="outlined"
            InputProps={{
              sx: {
                borderRadius: 2,
                backgroundColor: "#fff",
                "& .MuiInputBase-input": {
                  paddingY: 1.5,
                },
              },
            }}
          />
        </div>
        <div>
          <CountrySelect
            value={visitor.nationality}
            onChange={(selectedCountry) => {
              console.log("Selected Country from form:", selectedCountry); // ✅ Console works
              setVisitor((prev) => ({ ...prev, nationality: selectedCountry }));
            }}
          />
        </div>

        <AddvisitorTab
          documents={documents}
          onDocumentChange={handleDocumentChange}
          handleFileChange={handleFileChange}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
        />
        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-md hover:bg-indigo-700 transition"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
        {/* Status Message */}
        {message && (
          <p
            className={`text-center font-medium ${
              message.includes("success") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>

      {/* Cropper Modal */}
      {cropModal.open && (
        <ImageCropper
          imageSrc={cropModal.imageSrc}
          onCancel={onCropCancel}
          onComplete={onCropComplete}
        />
      )}
    </div>
  );
};

export default VisitorForm;
