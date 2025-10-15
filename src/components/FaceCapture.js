import React, { useRef, useState, useEffect } from "react";
import * as blazeface from "@tensorflow-models/blazeface";
import "@tensorflow/tfjs";

const FaceCapture = ({ onCapture ,reset }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [previewing, setPreviewing] = useState(false);
  const [croppedFace, setCroppedFace] = useState(null);

   // Reset cropped face if parent triggers reset
  useEffect(() => {
    if (reset) {
      setCroppedFace(null);
      setPreviewing(false);
      // Stop webcam if running
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [reset]);

  // Start webcam preview: just set previewing true, actual stream setup in useEffect
  const startPreview = () => {
    setPreviewing(true);
  };

  // When previewing turns true, start the webcam stream
  useEffect(() => {
    if (!previewing) return;

    const enableWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          width: { ideal: 640 },
          height: { ideal: 480 },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (error) {
        //console.log("error is" ,error)
        alert("error is " + error);
      }
    };

    enableWebcam();

    // Cleanup: stop webcam when component unmounts or previewing stops
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [previewing]);

  const captureFace = async () => {
   
     const video = videoRef.current;
  const canvas = canvasRef.current;

  // Safety checks
  if (!video || !canvas) {
    alert("Camera or canvas not ready. Please try again.");
    return;
  }

  // Ensure video is ready (enough data)
  if (video.readyState < 2) {
    alert("Video stream not ready. Wait a moment and try again.");
    return;
  }

     if (!videoRef.current) return;

    //const model = await blazeface.load();
    const model = await blazeface.load({ fromTFHub: true });

    const predictions = await model.estimateFaces(videoRef.current, false);

    if (predictions.length > 0) {
      const ctx = canvasRef.current.getContext("2d");
      const [x, y, width, height] = getBoundingBox(predictions[0]);

      // Dynamic padding based on face size
      const paddingX = width * 0.3; // 30% width padding left/right
      const paddingTop = height * 0.6; // 60% height padding on top for hair
      const paddingBottom = height * 0.2; // 20% padding below chin

      const sx = Math.max(0, x - paddingX);
      const sy = Math.max(0, y - paddingTop);
      const sw = Math.min(
        videoRef.current.videoWidth - sx,
        width + paddingX * 2
      );
      const sh = Math.min(
        videoRef.current.videoHeight - sy,
        height + paddingTop + paddingBottom
      );

      canvasRef.current.width = sw;
      canvasRef.current.height = sh;

      ctx.drawImage(videoRef.current, sx, sy, sw, sh, 0, 0, sw, sh);

      const faceDataUrl = canvasRef.current.toDataURL("image/jpeg");
      setCroppedFace(faceDataUrl);

      // Hide the live preview
      setPreviewing(false);

      // Stop webcam stream
      if (videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }

      if (onCapture) {
        onCapture(faceDataUrl);
      }
    } else {
      alert("No face detected. Try again.");
    }
  };

  const getBoundingBox = (prediction) => {
    const start = prediction.topLeft;
    const end = prediction.bottomRight;
    const x = start[0];
    const y = start[1];
    const width = end[0] - start[0];
    const height = end[1] - start[1];
    return [x, y, width, height];
  };

  return (
    <div>
      {!previewing && !croppedFace && (
        <button
          type="button"
          onClick={startPreview}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
         Capture Face
        </button>
      )}

     {previewing && (
  <div className="mt-4 relative w-full max-w-[640px] mx-auto">
    {/* Video wrapper */}
    <div className="relative">
      <video
        ref={videoRef}
        className="w-full aspect-video rounded-lg border border-gray-300"
        style={{ transform: "scaleX(-1)" }}
        autoPlay
        muted
      />

      {/* Circular overlay on top of video only */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none", // lets clicks pass through
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            border: "3px solid rgba(255, 255, 255, 0.9)",
            transform: "translate(-50%, -50%)",
            background: "transparent",
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)", // darkens outside circle
          }}
        />
      </div>
    </div>

    {/* Buttons stay outside the overlay */}
    <div className="mt-3 flex space-x-3">
      <button
        type="button"
        onClick={captureFace}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
      >
        Capture & Crop Face
      </button>
      <button
        type="button"
        onClick={() => {
          if (videoRef.current?.srcObject) {
            videoRef.current.srcObject
              .getTracks()
              .forEach((track) => track.stop());
            videoRef.current.srcObject = null;
          }
          setPreviewing(false);
        }}
        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
      >
        Cancel Preview
      </button>
    </div>
  </div>
)}


      <canvas ref={canvasRef} style={{ display: "none" }} />

      {croppedFace && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Cropped Face:</h3>
          <img
            src={croppedFace}
            alt="Cropped Face"
            className="rounded-lg border border-gray-300 max-w-xs"
          />
          <div className="mt-3 flex space-x-3">
            <button
              type="button"
             onClick={() => {
    setCroppedFace(null);       // clear child state
    if (onCapture) onCapture(null); // clear parent state
  }}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
            >
              Remove Captured Image
            </button>
            <button
              type="button"
             onClick={async () => {
  // 1. Clear child local state
  setCroppedFace(null);
   if (onCapture) onCapture("null"); // notify parent

  // 2. Notify parent
 

  // 3. Restart preview
  startPreview();
}}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            >
              Capture Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceCapture;
