import React, { useState,useEffect } from "react";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../components/Firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ImageCropper from "../components/ImageCropper"; // External component
import AddvisitorTab from "../components/AddvisitorTab";
import { MuiTelInput } from "mui-tel-input";
import CountrySelect from "../components/country";
import { useTranslation } from "react-i18next";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import TextField from "@mui/material/TextField";
import {  Typography, FormControl  } from "@mui/material";
import { FormHelperText } from "@mui/material";
import "react-phone-input-2/lib/style.css";
import "react-phone-input-2/lang/ar.json"; // Language file
import { arSA, enUS } from "date-fns/locale";
import FaceCapture from "../components/FaceCapture";
import RowRadioButtonsGroup from "../components/GenderRadioButton";
import { Dialog, DialogContent, DialogActions, Button } from "@mui/material";



const VisitorForm = () => {
  const storage = getStorage();
  const { i18n, t } = useTranslation();
  const isArabic = i18n.language === "ar" || i18n.language === "ar-SA";
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [currentTab, setCurrentTab] = useState("passport");
  const [docErrors, setDocErrors] = useState({});
  const [capturedImage, setCapturedImage] = useState(null);
   const [gender, setGender] = useState('');
   const [faceError, setFaceError] = useState("");
   const [faceResetKey, setFaceResetKey] = useState(0);
   const [errorModal, setErrorModal] = useState({
  open: false,
  message: "",
});

  const [visitor, setVisitor] = useState({
    name: "",
    email: "",
    visitReason: "",
    Mobile: "",
    nationality: "",
    dateofbirth: "",
    companyname:"",
 
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
    gccId: {
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



  const handleVisitorChange = (e) => {
    const { name, value } = e.target;

    const fieldsToValidate = ["name", "nationality", "visitReason"];

    const isArabic = i18n.language === "ar";
    const arabicRegex = /^[\u0600-\u06FF\s]*$/;
    const englishRegex = /^[A-Za-z\s]*$/;
    const emailRegex = /^[a-zA-Z0-9@._\-+]*$/;
   
   
    if (name === "email") {
      const isValidEmailChars = emailRegex.test(value);
      if (!isValidEmailChars) {
        setError((prev) => ({
          ...prev,
          [name]: t("Only English alphanumeric and email characters allowed"),
        }));
        return;
      }
    }

    if (fieldsToValidate.includes(name)) {
      const isValid = isArabic
        ? arabicRegex.test(value)
        : englishRegex.test(value);

      if (!isValid) {
        setError((prev) => ({
          ...prev,
          [name]: isArabic
            ? "يرجى كتابة الأحرف العربية فقط"
            : "Please use English letters only",
        }));
        return;
      }
    }

    // Update the visitor field
    setError((prev) => ({ ...prev, [name]: "" }));
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

  const handleImageRemove = (docType) => {
    setDocuments((prev) => ({
      ...prev,
      [docType]: {
        ...prev[docType],
        file: null,
        fileBlob: null,
        previewURL: null,
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
  setLoading(true);
  setMessage("");

  // Clear previous errors
  setError({});
  setDocErrors({});
  setFaceError("");

  const newErrors = {};
  const newDocErrors = {};

  // ---- Visitor Fields Validation ----
  if (!visitor.name) newErrors.name = t("This field is required");
  if (!visitor.visitReason) newErrors.visitReason = t("This field is required");
  if (!visitor.dateofbirth) newErrors.dateOfBirth = t("This field is required");
  if (!visitor.nationality) newErrors.nationality = t("This field is required");
  const saudiMobileRegex = /^(?:\+9665|05)[0-9]{8}$/;

if (!visitor.Mobile) {
  newErrors.Mobile = t("This field is required");
} else if (!saudiMobileRegex.test(visitor.Mobile)) {
  newErrors.Mobile = t("Please enter a valid Saudi mobile number");
}console.log("🧩 capturedImage value:", capturedImage);
  if (!gender) newErrors.gender = t("This field is required");
  if (!capturedImage) setFaceError(t("Please capture a face image before submitting"));

  // ---- Document Validation ----
  const doc = documents[currentTab];
  if (!doc.documentNumber) newDocErrors.documentNumber = t("Document number is required");
  if (!doc.expiryDate) newDocErrors.expiryDate = t("Expiry date is required");

  // ---- Combine errors and stop if any ----
  setError(newErrors);
  setDocErrors({ [currentTab]: newDocErrors });

  if (
    Object.keys(newErrors).length > 0 ||
    Object.keys(newDocErrors).length > 0 ||
    !capturedImage
  ) {
    setLoading(false);
    setErrorModal({
      open: true,
      message: "❌ Please correct all errors.",
    });
    return;
  }

  try {
    const visitorsRef = collection(db, "visitors");
    const documentTypes = ["passport", "iqama", "nationalId"];

    // ---- Check if mobile already exists ----
    const mobileQuery = query(visitorsRef, where("Mobile", "==", visitor.Mobile.trim()));
    const mobileSnapshot = await getDocs(mobileQuery);
    if (!mobileSnapshot.empty) {
      setError((prev) => ({ ...prev, Mobile: t("Mobile number already exists or registered. Please check.") }));
      setLoading(false);
      setErrorModal({
        open: true,
        message: "❌ Please correct all errors.",
      });
      return;
    }

    // ---- Check document numbers ----
    for (const type of documentTypes) {
      const docNumber = documents[type]?.documentNumber?.trim();
      if (!docNumber) continue;

      const q = query(visitorsRef, where(`documents.${type}.documentNumber`, "==", docNumber));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        setDocErrors((prev) => ({
          ...prev,
          [type]: {
            ...(prev[type] || {}),
            documentNumber: t(`${type} number already exists`),
          },
        }));
        setLoading(false);
        setErrorModal({
          open: true,
          message: "❌ Please correct all errors.",
        });
        return;
      }
    }

    // ---- Upload files ----
    const passportURL = await uploadFileAndGetURL(documents.passport.fileBlob, "passport");
    const iqamaURL = await uploadFileAndGetURL(documents.iqama.fileBlob, "iqama");
    const gccIdURL = await uploadFileAndGetURL(documents.gccId.fileBlob, "iqama");
    const nationalIdURL = await uploadFileAndGetURL(documents.nationalId.fileBlob, "nationalId");

    // ---- Upload face image ----
    const uploadFaceImage = async (base64Data) => {
      if (!base64Data) return "";
      const res = await fetch(base64Data);
      const blob = await res.blob();
      const fileRef = ref(storage, `faces/face_${Date.now()}.jpg`);
      await uploadBytes(fileRef, blob);
      return await getDownloadURL(fileRef);
    };
    const faceURL = await uploadFaceImage(capturedImage);

   

    // ---- Prepare payload ----
    const payload = {
      ...visitor,
      gender,
      capturedFaceURL: faceURL,
      documents: {
        passport: {
          documentNumber: documents.passport.documentNumber,
          expiryDate: documents.passport.expiryDate,
          fileURL: passportURL,
        },
        iqama: {
          documentNumber: documents.iqama.documentNumber,
          expiryDate: documents.iqama.expiryDate,
          fileURL: iqamaURL,
        },
        nationalId: {
          documentNumber: documents.nationalId.documentNumber,
          expiryDate: documents.nationalId.expiryDate,
          fileURL: nationalIdURL,
        },
        gccId: {
          documentNumber: documents.gccId.documentNumber,
          expiryDate: documents.gccId.expiryDate,
          fileURL: gccIdURL,
        },
      },
      createdAt: new Date(),
    };

    await addDoc(visitorsRef, payload);
   
    setMessage("✅ Visitor and documents submitted successfully!");
    setErrorModal({
      open: true,
      message: "✅ Visitor and documents submitted successfully.",
    });

    // ---- Reset form ----
    setVisitor({
      name: "",
      email: "",
      visitReason: "",
      Mobile: "",
      nationality: "",
      dateofbirth: "",
      companyname: "",
    });
    setDocuments({
      passport: { documentNumber: "", expiryDate: "", file: null, previewURL: null },
      iqama: { documentNumber: "", expiryDate: "", file: null, previewURL: null },
      nationalId: { documentNumber: "", expiryDate: "", file: null, previewURL: null },
      gccId: { documentNumber: "", expiryDate: "", file: null, previewURL: null },
    });
    setCapturedImage(null);
    setFaceError("");
    setGender("");
    setError({});
    setDocErrors({});
  } catch (error) {
    setMessage("❌ Error: " + error.message);
  }

  setLoading(false);
  setTimeout(() => setMessage(""), 5000);
};


  const onCropCancel = () => {
    setCropModal({ open: false, type: null, imageSrc: null });
  };

  const handleChange = (newValue) => {
    setVisitor((prev) => {
      return { ...prev, dateofbirth: newValue };
    });
    setError((prev) => ({ ...prev, dateOfBirth: "" })); // clear DOB error on change
  };

  const handleImageCapture = (imageUrl) => {
    setCapturedImage(imageUrl); // Save the captured image URL

     if (imageUrl) setFaceError("");
  };

   const handleGenderChange = (event) => {
    setGender(event.target.value);
    setError((prev) => ({ ...prev, gender: "" }));
    // You can also do other things here when the value changes
  }



const clearError = (field, tab) => {
  setDocErrors((prev) => ({
    ...prev,
    [tab]: {
      ...prev[tab],
      [field]: "",
    },
  }));
};

  return (
    <div className="w-full grid grid-cols-1  gap-4 px-4">
      <div className="bg-white p-6 rounded-md shadow-md">
        <div className="max-h-auto  w-full  px-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Visitor Inputs */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <TextField
                  id="fullName"
                  name="name"
                  label={
                    <span
                      style={{
                        direction: i18n.language === "ar" ? "rtl" : "ltr",
                      }}
                    >
                      {i18n.language === "ar" ? "الاسم الكامل" : "Full Name"}{" "}
                      <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  value={visitor.name}
                  onChange={handleVisitorChange}
                  placeholder={
                    i18n.language === "ar" ? "الاسم الكامل" : "Full Name"
                  }
                  fullWidth
                  variant="outlined"
                  inputProps={{ dir: i18n.language === "ar" ? "rtl" : "ltr" }}
                  error={!!error.name}
                  helperText={error.name}
                />
              </div>

              <div>
                {/* Country Select */}
                <FormControl fullWidth error={!!error.nationality}>
                  <CountrySelect
                    value={visitor.nationality}
                    error={!!error.nationality} // <-- Pass error prop here
                    onChange={(selectedCountry) => {
                      setVisitor((prev) => ({
                        ...prev,
                        nationality: selectedCountry,
                      }));
                      setError((prev) => ({ ...prev, nationality: "" })); // clear error on change
                    }}
                  />

                  {error.nationality && (
                    <FormHelperText>{error.nationality}</FormHelperText>
                  )}
                </FormControl>
              </div>

             
               <div>
                <TextField
                  type="text"
                  name="companyname"
                  value={visitor.companyname}
                  label={
                    <span
                      style={{
                        direction: i18n.language === "ar" ? "rtl" : "ltr",
                      }}
                    >
                      {t("Company Name")}{" "}
                      <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  onChange={handleVisitorChange}
                  placeholder={t("Company Name")}
                  fullWidth
                  variant="outlined"
                  error={!!error.companyname}
                  helperText={error.companyname}
                />
              </div>

              <div>
                <TextField
                  type="text"
                  name="visitReason"
                  value={visitor.visitReason}
                  label={
                    <span
                      style={{
                        direction: i18n.language === "ar" ? "rtl" : "ltr",
                      }}
                    >
                      {t("Reason For Visit")}{" "}
                      <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  onChange={handleVisitorChange}
                  placeholder={t("Reason For Visit")}
                  fullWidth
                  variant="outlined"
                  error={!!error.visitReason}
                  helperText={error.visitReason}
                />
              </div>
               <div className="w-full">
                <TextField
                  type="email"
                  name="email" // Sets the name attribute, useful for forms
                  value={visitor.email} // Controlled component’s current value
                  onChange={handleVisitorChange} // Function called when input changes
                  placeholder={t("email")}
                  label={
                    <span
                      style={{
                        direction: i18n.language === "ar" ? "rtl" : "ltr",
                      }}
                    >
                      {t("email")} <span style={{ color: "red" }}></span>
                    </span>
                  }
                  id="outlined-basic"
                  variant="outlined"
                  fullWidth
                  error={!!error.email}
                  helperText={error.email}
                />
              </div>
              <div>
                <FormControl fullWidth error={!!error.Mobile}>
                  <MuiTelInput
                    defaultCountry="SA"
                    value={visitor.Mobile}
                    dir={i18n.language === "ar" ? "rtl" : "ltr"}
                    onChange={(phone) => {
      setVisitor((prev) => ({ ...prev, Mobile: phone }));
      setError((prev) => ({ ...prev, Mobile: "" })); // ✅ Clear error as user types
    }}
                    placeholder={
                      isArabic ? "أدخل رقم الجوال" : "Enter phone number *"
                    }
                    forceCallingCode
                    focusOnSelectCountry
                    disableFormatting={true}
                    fullWidth
                    variant="outlined"
                    error={!!error.Mobile} // ✅ This line enables red border
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
                  {error.Mobile && (
                    <FormHelperText>{error.Mobile}</FormHelperText>
                  )}
                </FormControl>
              </div>
                  
              
            </div>
            {/* <PhoneInput
              country={"sa"}
              value={visitor.Mobile}
              onChange={(phone) =>
                setVisitor((prev) => ({ ...prev, Mobile: phone }))
              }
              localization={ar} // ✅ Correct: pass object as prop
              enableSearch
              inputStyle={{ width: "100%" }}
              placeholder={
                i18n.language === "ar"
                  ? "أدخل رقم الجوال"
                  : "Enter phone number"
              }
            /> */}
        
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={i18n.language === "ar" ? arSA : enUS}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {/* Date Picker */}
                <DatePicker
                  label={
                    <span>
                      {t("Date Of Birth")}{" "}
                      <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  value={visitor.dateofbirth}
                  onChange={handleChange}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: "outlined",
                      error: !!error.dateOfBirth,
                      helperText: error.dateOfBirth,
                    },
                  }}
                />
                
              <RowRadioButtonsGroup onChange={handleGenderChange}  error={error.gender} />
            

                
              </div>
            </LocalizationProvider>

                 
            {/* --- End Camera Integration --- */}
            {/*  <div>
              <FaceCamera />
            </div> */}
            <div>
              <FaceCapture onCapture={handleImageCapture} reset={capturedImage === null} />
              {faceError && (
    <p className="text-sm text-red-600 font-medium">
      {faceError}
    </p>
  )}
            </div>

            <AddvisitorTab
              documents={documents}
              onDocumentChange={handleDocumentChange}
              handleFileChange={handleFileChange}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              error={docErrors[currentTab] || {}}
              handleImageRemove={handleImageRemove}
               clearError={clearError}
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
                  message.includes("success")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}
          </form>
        </div>

        {/* Cropper Modal */}
        {cropModal.open && (
          <ImageCropper
            imageSrc={cropModal.imageSrc}
            onCancel={onCropCancel}
            onComplete={onCropComplete}
          />
        )}
      </div>

      {/* Error Modal */}
<Dialog
  open={errorModal.open}
  onClose={() => setErrorModal({ ...errorModal, open: false })}
  maxWidth="xs"
  fullWidth
>
  <DialogContent className="flex flex-col items-center justify-center py-6">
    <Typography variant="h4" color="error">
      
    </Typography>
    <Typography variant="body1" className="mt-2 text-center">
      {errorModal.message}
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button
      onClick={() => setErrorModal({ ...errorModal, open: false })}
      color="primary"
      variant="contained"
      fullWidth
    >
      Close
    </Button>
  </DialogActions>
</Dialog>

     {/*  <div className="bg-white p-6 rounded-md shadow-md xl:w-auto w-auto h-full">
        <div className="text-lg font-semibold">Dummy Data</div>
        <GetVisitorData visitors={visitor} />
      </div> */}
    </div>
  );
};

export default VisitorForm;
