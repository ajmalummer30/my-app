import { ChevronDownIcon } from "@heroicons/react/16/solid";
import React, { useState } from "react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function AddvisitorTab({
  documents,
  onDocumentChange,
  handleFileChange,
  currentTab,
  setCurrentTab,
}) {
  const tabs = [
    { name: "Passport", key: "passport" },
    { name: "Iqama", key: "iqama" },
    { name: "National ID", key: "nationalId" },
  ];

  /* const [currentTab, setCurrentTab] = useState("iqama");*/
  const doc = documents[currentTab]; // current document state

  return (
    <div>
      {/* Mobile dropdown */}
      <div className="grid grid-cols-1 sm:hidden">
        <select
          value={currentTab}
          onChange={(e) => setCurrentTab(e.target.value)}
          aria-label="Select a tab"
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
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {/* Fields for current tab */}
      <div className="space-y-4">
        {/* Document Type Heading */}
        <h3 className="text-xl font-semibold capitalize text-gray-800">
          {currentTab.replace(/([A-Z])/g, " $1")}
        </h3>

        {/* Document Number Input */}
        <input
          name="documentNumber"
          value={doc.documentNumber}
          onChange={(e) => onDocumentChange(e, currentTab)}
          placeholder="Document Number"
          className="w-full px-4 py-2 border rounded"
        />

        {/* Expiry Date Input */}
        <input
          name="expiryDate"
          type="date"
          value={doc.expiryDate}
          onChange={(e) => onDocumentChange(e, currentTab)}
          className="w-full px-4 py-2 border rounded"
        />
      </div>
      {/* File Upload Section */}
      {/* File Upload Section */}
      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Upload {currentTab.replace(/([A-Z])/g, " $1")} file
        </label>

        <div className="relative w-full">
          {/* Hidden file input */}
          <input
            id={`file-upload-${currentTab}`}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, currentTab)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {/* Styled "Browse" button */}
          <button
            type="button"
            className="inline-block w-full text-left px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onClick={() =>
              document.getElementById(`file-upload-${currentTab}`).click()
            }
          >
            Browse...
          </button>
        </div>

        {/* Preview image */}
        {documents[currentTab].previewURL && (
          <img
            src={documents[currentTab].previewURL}
            alt={`${currentTab} preview`}
            className="mt-2 w-48 h-36 object-contain border rounded"
          />
        )}
      </div>
    </div>
  );
}
