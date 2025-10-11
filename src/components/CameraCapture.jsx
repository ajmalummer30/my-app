import React, { useState, useRef, useEffect, useCallback } from "react";
// Since the CSS is in app.css, no local CSS import needed.

/**
 * CameraCapture Component
 * Captures the FULL camera frame and provides the image data to the parent component via onCapture.
 */
const CameraCapture = ({ onCapture }) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Cleanup the camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      console.log("Stopping camera stream...");
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Effect to handle camera stream when isCameraOpen changes
  useEffect(() => {
    if (isCameraOpen) {
      setCameraError(null);

      const startCamera = async () => {
        try {
          // Request camera access and stream
          const userStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 } },
          });

          console.log("Camera stream obtained and starting live preview.");

          streamRef.current = userStream;

          // Attach the stream to the video element for live preview
          if (videoRef.current) {
            videoRef.current.srcObject = userStream;
          }
        } catch (error) {
          console.error("Error accessing the camera: ", error);

          // Display the error details to guide the user
          let userMessage;

          if (
            error.name === "NotAllowedError" ||
            error.name === "PermissionDeniedError"
          ) {
            userMessage = `🛑 Access Denied (${error.name}). Please check iOS/Chrome permissions and ensure the site is on HTTPS.`;
          } else if (error.name === "SecurityError") {
            userMessage = "🔒 Security Blocked. The site **MUST** be on HTTPS.";
          } else if (error.name === "NotFoundError") {
            userMessage = `⚠️ No Camera Found (${error.name}). Check device availability.`;
          } else {
            // This is the fallback for other TypeErrors or internal failures
            userMessage = `⚠️ Failed to access camera (${error.name || "Unknown Error"}). Please check settings.`;
          }

          setCameraError(userMessage);
          setIsCameraOpen(false);
        }
      };

      startCamera();
    } else {
      // If isCameraOpen is false, ensure the camera is stopped
      stopCamera();
    }

    // Cleanup on unmount or state change
    return () => {
      stopCamera();
    };
  }, [isCameraOpen, stopCamera]);

  // Function to open the camera (start the camera stream)
  const openCamera = () => {
    setCapturedImage(null); // Allow recapturing
    setIsCameraOpen(true);
  };

  // 🌟 REVERTED FUNCTION: Captures the full frame without cropping 🌟
  const captureImage = (event) => {
    event.preventDefault(); // Prevent form submission

    if (!videoRef.current || !streamRef.current) {
      setCameraError("Camera stream not active. Please try again.");
      return;
    }

    try {
      const videoElement = videoRef.current;

      // Use the actual native resolution of the video stream
      const videoWidth = videoElement.videoWidth;
      const videoHeight = videoElement.videoHeight;

      // 1. Create a canvas matching the video's native resolution
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.width = videoWidth;
      canvas.height = videoHeight;

      // 2. Draw the entire video frame onto the canvas (no cropping)
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // 3. Convert canvas to data URL (image)
      const imageUrl = canvas.toDataURL("image/png");

      // Set the captured image and stop the camera
      setCapturedImage(imageUrl);
      setIsCameraOpen(false); // Closes the camera stream via useEffect
      onCapture(imageUrl); // Pass the captured image to the parent component
    } catch (error) {
      console.error("Error capturing frame: ", error);
      // Ensure we catch any unexpected errors here as well
      setCameraError(
        `An error occurred during image capture: ${error.message || "Unknown Capture Error"}`
      );
    }
  };
  // 🌟 END OF REVERTED FUNCTION 🌟

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      {/* Display any camera access errors */}
      {cameraError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md font-medium">
          {cameraError}
        </div>
      )}

      {/* State: Camera Closed, No Image Captured */}
      {!isCameraOpen && !capturedImage && (
        <button
          onClick={openCamera}
          className="w-full p-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition shadow-md"
        >
          Open Camera
        </button>
      )}

      {/* State: Camera Open, Live Preview */}
      {isCameraOpen && (
        <div className="space-y-3">
          {/* Container for Video and Overlay */}
          <div className="video-container relative rounded-lg border-2 border-black overflow-hidden">
            {/* Video element for live preview */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            ></video>

            {/* Overlay Graphic (The mask with the oval hole) */}
            <div className="overlay-graphic">
              {/* This div creates the dark mask with the oval "hole" */}
            </div>
            {/* Overlay Text */}
            <div className="overlay-text">
              <p>Please center your face within the oval boundary.</p>
            </div>
          </div>

          <div className="flex justify-between space-x-2">
            <button
              onClick={captureImage} // Calls the full-frame capture function
              type="button"
              className="flex-1 p-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition shadow-md"
            >
              Capture Photo
            </button>
            <button
              onClick={() => setIsCameraOpen(false)}
              type="button"
              className="flex-1 p-3 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition shadow-md"
            >
              Close Camera
            </button>
          </div>
        </div>
      )}

      {/* State: Image Captured, Show Image and Recapture Button */}
      {!isCameraOpen && capturedImage && (
        <div className="space-y-3">
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="text-md font-semibold mb-2 text-yellow-800">
              Captured Image Preview:
            </h4>
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full max-w-xs h-auto rounded-lg shadow-md border-2 border-yellow-500 mx-auto"
            />
          </div>
          <button
            onClick={openCamera}
            className="w-full p-3 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 transition shadow-md"
          >
            Recapture Photo
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
