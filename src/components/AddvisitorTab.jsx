import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { arSD, enUS } from "dayjs/locale";
import dayjs from "dayjs";
import "dayjs/locale/ar"; // import Arabic locale
import FileUploadSection from "./Fileupload";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function AddvisitorTab({
  documents,
  onDocumentChange,
  handleFileChange,
  currentTab,
  setCurrentTab,
  error,
  handleImageRemove,
  clearError
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar" || i18n.language === "ar-SA";
  const [inputError, setInputError] = useState("");
  //const [submitted, setSubmitted] = useState(false);

  const tabs = [
    { name: t("passport"), key: "passport" },
    { name: t("iqama"), key: "iqama" },
    { name: t("nationalId"), key: "nationalId" },
    { name: t("gccId"), key: "gccId" },
  ];

  const doc = documents[currentTab]; // current document state

  return (
    <div>
      {/* Mobile dropdown */}
      <div className="grid grid-cols-1 sm:hidden sm:h-auto">
        <select
          value={currentTab}
          onChange={(e) => setCurrentTab(e.target.value)}
          aria-label={t("Select a tab")}
          className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-gray-100 dark:outline-white/10 dark:*:bg-gray-800 dark:focus:outline-indigo-500"
        >
          {tabs.map((tab) => (
            <option key={tab.key} value={tab.key}>
              {tab.name}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-gray-500 dark:fill-gray-400"
        />
      </div>

      {/* Desktop tabs */}
      <div className="hidden sm:block">
        <nav
          aria-label="Tabs"
          className="isolate flex divide-x divide-gray-200 rounded-lg bg-white shadow-sm dark:divide-white/10 dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10"
        >
          {tabs.map((tab, tabIdx) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setCurrentTab(tab.key)}
              className={classNames(
                currentTab === tab.key
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white",
                tabIdx === 0 ? "rounded-l-lg" : "",
                tabIdx === tabs.length - 1 ? "rounded-r-lg" : "",
                "group relative min-w-0 flex-1 overflow-hidden px-4 py-4 text-center text-sm font-medium hover:bg-gray-50 focus:z-10 dark:hover:bg-white/5"
              )}
            >
              <div>
                <span>{tab.name}</span>
                <span
                  aria-hidden="true"
                  className={classNames(
                    currentTab === tab.key
                      ? "bg-indigo-500 dark:bg-indigo-400"
                      : "bg-transparent",
                    "absolute inset-x-0 bottom-0 h-0.5"
                  )}
                />
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {/* Fields for current tab */}
      <div className="space-y-4">
        {/* Document Type Heading */}

        <h3 className="text-xl font-semibold capitalize text-gray-800 py-2">
          {t(currentTab)}
        </h3>

        <div>
          <TextField
            name="documentNumber"
            value={doc.documentNumber}
            onChange={(e) => {
              const rawValue = e.target.value;
              // Remove all characters that are NOT a-z, A-Z, or 0-9
              const filteredValue = rawValue.replace(/[^a-zA-Z0-9]/g, "");

              // If filtered value differs, it means invalid chars were removed
              if (rawValue !== filteredValue) {
                setInputError(
                  t("Only English alphanumeric characters allowed")
                );
              } else {
                setInputError("");
              }

               // ✅ Clear parent error dynamically
              if (error?.documentNumber && clearError) {
                clearError("documentNumber", currentTab);
              }

              // Create a synthetic event with filtered value to pass upward
              onDocumentChange(
                {
                  target: {
                    name: e.target.name,
                    value: filteredValue,
                  },
                },
                currentTab
              );
            }}
            placeholder={t("Document Number")}
            label={
              <span>
                {t("Document Number")} <span className="text-red-500">*</span>
              </span>
            }
            error={!!inputError || !!error?.documentNumber}
            helperText={inputError || error?.documentNumber}
            fullWidth
            variant="outlined"
            inputProps={{
              dir: isRTL ? "rtl" : "ltr",
            }}
          />
        </div>

        <div>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale={i18n.language === "ar" ? "ar" : "en"}
          >
            <DatePicker
              label={
                <span>
                  {t("Expiry Date", { doc: t(currentTab) })}{" "}
                  <span style={{ color: "red" }}>*</span>
                </span>
              }
              value={doc.expiryDate ? dayjs(doc.expiryDate) : null}
              format="DD/MM/YYYY"
              onChange={(newValue) => {

                 // ✅ Clear expiry date error once valid date chosen
                if (error?.expiryDate && clearError) {
                  clearError("expiryDate", currentTab);
                }
                onDocumentChange(
                  {
                    target: {
                      name: "expiryDate",
                      value: newValue?.format("YYYY-MM-DD"),
                    },
                  },
                  currentTab
                );
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: "outlined",
                  error: !!error?.expiryDate,
                  helperText: error?.expiryDate,
                  InputLabelProps: { shrink: true },
                  inputProps: {
                    dir: isRTL ? "rtl" : "ltr",
                    style: { textAlign: isRTL ? "right" : "left" },
                  },
                },
              }}
            />
          </LocalizationProvider>
        </div>
        <div className="mt-2">
          <FileUploadSection
            currentTab={currentTab}
            handleFileChange={handleFileChange}
            documents={documents}
            t={t}
            handleImageRemove={handleImageRemove}
            //submitted={submitted}
          />
        </div>
      </div>
    </div>
  );
}
