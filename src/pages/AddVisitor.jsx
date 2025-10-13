import React, { useState } from "react";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../components/Firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ImageCropper from "../components/ImageCropper"; // External component
import AddvisitorTab from "../components/AddvisitorTab";
import { MuiTelInput } from "mui-tel-input";
import CountrySelect from "../components/country";
import { CountrySelector } from "react-international-phone";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../Helperfunctions/languageswitcher";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import TextField from "@mui/material/TextField";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { Box } from "@mui/material";
import { getAuth, signOut } from "firebase/auth";
import SaudiPlateInput from "../components/SaudiPlateInput";
import { Stack, Typography, FormControl, InputLabel } from "@mui/material";
import { FormHelperText } from "@mui/material";
import VehicleTypeDropdown from "../components/VehicleTypeDropdown";
import "react-phone-input-2/lib/style.css";
import "react-phone-input-2/lang/ar.json"; // Language file
import PhoneInput from "react-phone-input-2";
import ar from "react-phone-input-2/lang/ar.json";
import { arSA, enUS } from "date-fns/locale";
import GetVisitorData from "../components/GetVisitorData";
import CameraCapture from "../components/CameraCapture";
import FaceCapture from "../components/FaceCapture";
import RowRadioButtonsGroup from "../components/GenderRadioButton";


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

    console.log("currentloggied in user");
    console.log(getAuth().currentUser);

    // handleSubmit(e);
    let newErrors = {};

    // Check visitor fields

    if (!visitor.name) newErrors.name = t("This field is required");
    if (!visitor.visitReason)
      newErrors.visitReason = t("This field is required");
    if (!visitor.dateofbirth) {
      newErrors.dateOfBirth = t("This field is required");
    }
    if (!visitor.nationality)
      newErrors.nationality = t("This field is required");
    if (!visitor.Mobile) {
      newErrors.Mobile = t("This field is required");
    } else {
      // Saudi mobile validation
      let mobile = visitor.Mobile;
      if (mobile.startsWith("+966")) {
        mobile = mobile.slice(4); // remove country code
      }
      const ksaMobileRegex = /^5[0-9]{8}$/;
      if (!ksaMobileRegex.test(mobile)) {
        newErrors.Mobile = t("Invalid Saudi mobile number");
      }
    }

    if (!gender) {
  newErrors.gender = t("This field is required");
}

    

    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      console.log("Erros", error);
      setLoading(false);
      return; // stop submission if errors
    } else {
      console.log("ajmal");
    }

    const doc = documents[currentTab];
    const newDocErrors = {};

    if (!doc.documentNumber) {
      newDocErrors.documentNumber = t("Document number is required");
    }
    if (!doc.expiryDate) {
      newDocErrors.expiryDate = t("Expiry date is required");
    }

    if (Object.keys(newDocErrors).length > 0) {
      setDocErrors({ [currentTab]: newDocErrors }); // scoped to current tab
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage("");

    const { passport, iqama, nationalId, gccId } = documents;
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
      const gccIdURL = await uploadFileAndGetURL(gccId.fileBlob, "iqama");
      const nationalIdURL = await uploadFileAndGetURL(
        nationalId.fileBlob,
        "nationalId"
      );

      const payload = {
        ...visitor,
        gender :gender,
        // VehicleType: vehicleType,
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
          gccId: {
            documentNumber: gccId.documentNumber,
            expiryDate: gccId.expiryDate,
            fileURL: gccIdURL,
          },
        },
        createdAt: new Date(),
      };

      await addDoc(visitorsRef, payload);
      console.log("All required fields are filled!", visitor, documents);
      setMessage("✅ Visitor and documents submitted successfully!");

      // Reset
      setVisitor({
        name: "",
        email: "",
        visitReason: "",
        Mobile: "",
        nationality: "",
        dateofbirth: "",
        companyname:"",
        
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
        gccId: {
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
    setError({});
    setTimeout(() => {
      setMessage("");
    }, 5000);
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
  };

   const handleGenderChange = (event) => {
    setGender(event.target.value);
     console.log("Selected gender:", event.target.value);
    // You can also do other things here when the value changes
  }

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
                    onChange={(phone) =>
                      setVisitor((prev) => ({ ...prev, Mobile: phone }))
                    }
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
              <FaceCapture onCapture={handleImageCapture} />
            </div>

            <AddvisitorTab
              documents={documents}
              onDocumentChange={handleDocumentChange}
              handleFileChange={handleFileChange}
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              error={docErrors[currentTab] || {}}
              handleImageRemove={handleImageRemove}
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

     {/*  <div className="bg-white p-6 rounded-md shadow-md xl:w-auto w-auto h-full">
        <div className="text-lg font-semibold">Dummy Data</div>
        <GetVisitorData visitors={visitor} />
      </div> */}
    </div>
  );
};

export default VisitorForm;
