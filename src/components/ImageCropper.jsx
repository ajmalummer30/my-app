import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import Slider from "@mui/material/Slider";
import getCroppedImg from "./cropImage";

const ImageCropper = ({ imageSrc, onCancel, onComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.8);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleDone = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        zoom
      );
      onComplete(croppedImageBlob);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center p-4 z-50">
      <div className="relative w-full max-w-lg h-96 bg-white rounded-md overflow-hidden">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={4 / 3}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
        />
      </div>

      <div className="mt-4 w-full max-w-lg bg-white rounded-md p-4 shadow-md flex flex-col space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Zoom</label>
          <Slider
            value={zoom}
            min={0}
            max={3}
            step={0.1}
            onChange={(e, value) => setZoom(value)}
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Rotation</label>
          <Slider
            value={rotation}
            min={0}
            max={360}
            step={90}
            onChange={(e, value) => setRotation(value)}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleDone}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
