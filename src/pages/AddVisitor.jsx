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
import { Stack, Typography, FormControl, FormLabel } from "@mui/material";
import VehicleTypeDropdown from "../components/VehicleTypeDropdown";
import "react-phone-input-2/lib/style.css";
import "react-phone-input-2/lang/ar.json"; // Language file
import PhoneInput from "react-phone-input-2";
import ar from "react-phone-input-2/lang/ar.json";
import { arSA, enUS } from "date-fns/locale";
import GetVisitorData from "../components/GetVisitorData";

const VisitorForm = () => {
  const storage = getStorage();
  const { i18n, t } = useTranslation();
  const isArabic = i18n.language === "ar" || i18n.language === "ar-SA";
  const [error, setError] = useState({});
  const [value, setValue] = React.useState(null);
  const [plateValue, setPlateValue] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [currentTab, setCurrentTab] = useState("passport");

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
    // Handle email separately
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

    // Clear error for the current field
    setError((prev) => ({
      ...prev,
      [name]: "", // clear only this field's error
    }));

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

    const submitter = e.nativeEvent?.submitter;
    if (!submitter || submitter.type !== "submit") {
      console.warn("Blocked unintended form submission from:", submitter);
      return;
    }

    console.log("Form submitted by:", e.nativeEvent.submitter);

    // handleSubmit(e);

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
        VehicleType: vehicleType,
        VehiclePlate: plateValue,
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
  };

  const onCropCancel = () => {
    setCropModal({ open: false, type: null, imageSrc: null });
  };

  const handleChange = (newValue) => {
    setValue(newValue);
  };

  const handleVehicleTypeChange = (event) => {
    setVehicleType(event.target.value);
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
      <div className="bg-white p-6 rounded-md shadow-md">
        <div className="flex-1 auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Visitor Inputs */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <TextField
                  id="fullName"
                  name="name"
                  label={i18n.language === "ar" ? "الاسم الكامل" : "Full Name"}
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

              <div className="w-full">
                <TextField
                  type="email"
                  name="email" // Sets the name attribute, useful for forms
                  value={visitor.email} // Controlled component’s current value
                  onChange={handleVisitorChange} // Function called when input changes
                  placeholder={t("email")}
                  label={t("email")}
                  id="outlined-basic"
                  variant="outlined"
                  fullWidth
                  error={!!error.email}
                  helperText={error.email}
                />
              </div>

              <div>
                <TextField
                  type="text"
                  name="visitReason"
                  value={visitor.visitReason}
                  label={t("Reason For Visit")}
                  onChange={handleVisitorChange}
                  placeholder={t("Reason For Visit")}
                  fullWidth
                  variant="outlined"
                  error={!!error.visitReason}
                  helperText={error.visitReason}
                />
              </div>
              <div>
                <MuiTelInput
                  defaultCountry="SA"
                  //onlyCountries={["SA"]}
                  value={visitor.Mobile}
                  dir={i18n.language === "ar" ? "rtl" : "ltr"}
                  onChange={(phone) =>
                    setVisitor((prev) => ({ ...prev, Mobile: phone }))
                  }
                  placeholder={
                    isArabic ? "أدخل رقم الجوال" : "Enter phone number"
                  }
                  forceCallingCode
                  focusOnSelectCountry
                  disableFormatting={true}
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
                  label={t("Date Of Birth")}
                  value={value}
                  onChange={handleChange}
                  format="dd/MM/yyyy"
                  renderInput={(params) => (
                    <TextField {...params} fullWidth variant="outlined" />
                  )}
                />

                {/* Country Select */}
                <CountrySelect
                  value={visitor.nationality}
                  onChange={(selectedCountry) => {
                    console.log("Selected Country from form:", selectedCountry);
                    setVisitor((prev) => ({
                      ...prev,
                      nationality: selectedCountry,
                    }));
                  }}
                />
              </div>
            </LocalizationProvider>

            <div className="w-full">
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2, // equals 16px spacing
                  mb: 2,
                  width: "100%",
                  alignItems: "flex-end", // vertical alignment for form labels/inputs
                }}
              >
                {/* Saudi Plate input */}
                <FormControl fullWidth>
                  <FormLabel>{t("Vehicle Plate number")}</FormLabel>
                  <SaudiPlateInput
                    lang={i18n.language}
                    onChange={setPlateValue}
                  />
                  {plateValue}
                </FormControl>

                {/* Vehicle type dropdown */}
                <FormControl fullWidth>
                  <FormLabel>{t("Vehicle Type")}</FormLabel>
                  <VehicleTypeDropdown
                    value={vehicleType}
                    onChange={handleVehicleTypeChange}
                  />
                </FormControl>
              </Box>
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

      <div className="bg-white p-6 rounded-md shadow-md h-full">
        <div className="text-lg font-semibold">Dummy Data</div>
        <GetVisitorData />
      </div>
    </div>
  );
};

export default VisitorForm;
