export default async function getCroppedImg(
  imageSrc,
  cropPixels,
  rotation = 0
) {
  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });

  const image = await createImage(imageSrc);

  // --- Calculate Setup Values ---
  const radians = (rotation * Math.PI) / 180;
  const centerX = image.width / 2;
  const centerY = image.height / 2;

  const absRotation = Math.abs(rotation) % 360;
  const isPerpendicular = absRotation === 90 || absRotation === 270;

  // These are the dimensions of the final *rotated* image if it were drawn without a safe area
  const rotatedWidth = isPerpendicular ? image.height : image.width;
  const rotatedHeight = isPerpendicular ? image.width : image.height;

  // Safe area dimension for the rotating canvas
  const safeArea = Math.max(rotatedWidth, rotatedHeight) * Math.sqrt(2);

  // --- Rotate Crop Coordinates to find Bounding Box ---

  function rotatePoint(x, y, cx, cy, angle) {
    const dx = x - cx;
    const dy = y - cy;
    return {
      x: cx + dx * Math.cos(angle) - dy * Math.sin(angle),
      y: cy + dx * Math.sin(angle) + dy * Math.cos(angle),
    };
  }

  // Corners of the crop area relative to the original image's top-left (0,0)
  const corners = [
    { x: cropPixels.x, y: cropPixels.y },
    { x: cropPixels.x + cropPixels.width, y: cropPixels.y },
    { x: cropPixels.x, y: cropPixels.y + cropPixels.height },
    { x: cropPixels.x + cropPixels.width, y: cropPixels.y + cropPixels.height },
  ];

  // Rotate corners around the original image center
  const rotatedCorners = corners.map(({ x, y }) =>
    rotatePoint(x, y, centerX, centerY, radians)
  );

  // Get the bounding box (minX/minY are relative to the original image center)
  const xs = rotatedCorners.map((p) => p.x);
  const ys = rotatedCorners.map((p) => p.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const cropWidth = maxX - minX;
  const cropHeight = maxY - minY;

  // --- Canvas 1: Draw Rotated Image ---
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = safeArea;
  canvas.height = safeArea;

  // Perform the rotation transformation
  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(radians);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  // --- Get Image Data (The Crucial Step) ---

  // The minX/minY are relative to the image center.
  // The canvas center is at safeArea/2.
  // The start coordinates for the crop are (Canvas Center) + (minX) - (Image Center)
  const cropXOnRotated = safeArea / 2 + minX - centerX;
  const cropYOnRotated = safeArea / 2 + minY - centerY;

  // IMPORTANT: Use Math.round to avoid issues with sub-pixel rendering and getImageData.
  const data = ctx.getImageData(
    Math.round(cropXOnRotated),
    Math.round(cropYOnRotated),
    Math.round(cropWidth),
    Math.round(cropHeight)
  );

  // --- Canvas 2: Final Output ---

  // Resize canvas to match the cropped area
  canvas.width = data.width; // Use data.width/height which are rounded integers
  canvas.height = data.height;

  // Clear context (though resizing already does this, it's safer)
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Paste cropped image data
  ctx.putImageData(data, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      // You might want to use 'image/png' if the image has transparency
      resolve(blob);
    }, "image/jpeg");
  });
}
