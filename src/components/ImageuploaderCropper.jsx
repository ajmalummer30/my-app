import React, { useState, useRef } from "react";

export default function ImageUploaderCropper() {
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedSrc, setCroppedSrc] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [rect, setRect] = useState(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
    setCroppedSrc(null);
    setRect(null);
  };

  const onMouseDown = (e) => {
    if (!imageSrc) return;
    const rectBounds = containerRef.current.getBoundingClientRect();
    setStartPos({ x: e.clientX - rectBounds.left, y: e.clientY - rectBounds.top });
    setRect({ x: e.clientX - rectBounds.left, y: e.clientY - rectBounds.top, width: 0, height: 0 });
    setDragging(true);
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    const rectBounds = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rectBounds.left;
    const currentY = e.clientY - rectBounds.top;

    const x = Math.min(currentX, startPos.x);
    const y = Math.min(currentY, startPos.y);
    const width = Math.abs(currentX - startPos.x);
    const height = Math.abs(currentY - startPos.y);

    setRect({ x, y, width, height });
  };

  const onMouseUp = () => {
    setDragging(false);
  };

  const handleCrop = () => {
    if (!rect || !imageRef.current) return;

    const image = imageRef.current;
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;
    const displayedWidth = image.width;
    const displayedHeight = image.height;

    const scaleX = naturalWidth / displayedWidth;
    const scaleY = naturalHeight / displayedHeight;

    const cropX = rect.x * scaleX;
    const cropY = rect.y * scaleY;
    const cropWidth = rect.width * scaleX;
    const cropHeight = rect.height * scaleY;
     console.log('rect:', rect);
  console.log('naturalWidth:', naturalWidth, 'naturalHeight:', naturalHeight);
  console.log('displayedWidth:', displayedWidth, 'displayedHeight:', displayedHeight);
  console.log('cropX:', cropX, 'cropY:', cropY, 'cropWidth:', cropWidth, 'cropHeight:', cropHeight);

  if (cropWidth <= 0 || cropHeight <= 0) {
    alert("Crop width or height is zero or negative.");
    return;
  }

    const canvas = document.createElement("canvas");
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    const croppedImageUrl = canvas.toDataURL();
    setCroppedSrc(croppedImageUrl);

    
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", fontFamily: "Arial, sans-serif" }}>
      <h2>Image Upload & Crop</h2>

      {/* Styled Upload Button */}
      <label
        htmlFor="imageUpload"
        style={{
          display: "inline-block",
          padding: "8px 16px",
          backgroundColor: "#007bff",
          color: "white",
          cursor: "pointer",
          borderRadius: 4,
          marginBottom: 10,
        }}
      >
        Upload Image
      </label>
      <input
        type="file"
        id="imageUpload"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: "none" }}
      />

      {imageSrc && (
        <div
          ref={containerRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          style={{
            position: "relative",
            marginTop: 20,
            cursor: dragging ? "crosshair" : "default",
            display: "inline-block",
            userSelect: "none",
            maxWidth: "100%",
            border: "1px solid #ccc",
          }}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="To crop"
            style={{ display: "block", maxWidth: "100%", maxHeight: 400 }}
          />
          {rect && (
            <div
              style={{
                position: "absolute",
                left: rect.x,
                top: rect.y,
                width: rect.width,
                height: rect.height,
                border: "2px dashed #007bff",
                backgroundColor: "rgba(0, 123, 255, 0.2)",
                pointerEvents: "none",
              }}
            />
          )}
        </div>
      )}

      {rect && (
        <div style={{ marginTop: 10 }}>
          <button
            onClick={handleCrop}
            style={{ padding: "8px 16px", cursor: "pointer", borderRadius: 4 }}
          >
            Crop Image
          </button>
        </div>
      )}

      {croppedSrc && (
        <div style={{ marginTop: 20 }}>
          <h3>Cropped Image Preview:</h3>
          <img src={croppedSrc} alt="Cropped result" style={{ maxWidth: "100%" }} />
        </div>
      )}
    </div>
  );
}
