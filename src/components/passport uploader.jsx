import React, { useState, useRef } from "react";

const PassportUploader = () => {
  const [file, setFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputFileRef = useRef(null);

  const FUNCTION_URL =
    "https://us-central1-visitor-management-f46e8.cloudfunctions.net/processDocument";

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setExtractedData(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        const base64Content = reader.result.split(",")[1];

        const response = await fetch(FUNCTION_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileContent: base64Content,
            mimeType: file.type || "application/pdf",
            docType: "iqama",
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Something went wrong");
        }

        setExtractedData(result.extracted || {});
      } catch (err) {
        console.error("Upload failed:", err);
        setError(err.message || "Failed to process document");
      } finally {
        setLoading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  // Trigger file input click
  const openFileDialog = () => {
    inputFileRef.current?.click();
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-4">
        Passport Upload and Extraction
      </h2>

      {/* Hidden input */}
      <input
        ref={inputFileRef}
        type="file"
        accept=".pdf,image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Button to open file picker */}
      <button
        onClick={openFileDialog}
        className="px-5 py-2 mb-4 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none"
      >
        Select File
      </button>

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className={`ml-2 px-5 py-2 text-white rounded 
          ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 cursor-pointer"}
        `}
      >
        {loading ? "Processing..." : "Upload & Extract"}
      </button>

      {file && (
        <p className="mt-2">
          Selected file: <strong>{file.name}</strong>
        </p>
      )}

      {error && <p className="text-red-600 mt-4">❌ Error: {error}</p>}

      {extractedData && (
        <div className="mt-6 bg-gray-100 p-4 rounded shadow">
          <h4 className="text-lg font-medium mb-2">📄 Extracted Data:</h4>
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(extractedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default PassportUploader;
