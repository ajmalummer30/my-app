import React, { useRef, useState, useEffect } from "react";
import * as blazeface from "@tensorflow-models/blazeface";
import "@tensorflow/tfjs";

const FaceCapture = ({ onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [previewing, setPreviewing] = useState(false);
  const [croppedFace, setCroppedFace] = useState(null);

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
        alert("Could not access webcam. Please allow webcam permissions.");
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
    if (!videoRef.current) return;

    const model = await blazeface.load();
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
          Start Webcam Preview
        </button>
      )}

      {previewing && (
        <div className="mt-4">
          <video
            ref={videoRef}
            className="w-full max-w-[640px] aspect-video rounded-lg border border-gray-300 mx-auto"
            style={{ transform: "scaleX(-1)" }} // mirror preview
            autoPlay
            muted
          />
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
                // Stop stream and hide preview
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
              onClick={() => setCroppedFace(null)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
            >
              Remove Captured Image
            </button>
            <button
              type="button"
              onClick={() => {
                setCroppedFace(null);
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
