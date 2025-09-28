export default async function getCroppedImg(
  imageSrc,
  cropPixels,
  rotation = 0,
  zoom = 1
) {
  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.setAttribute("crossOrigin", "anonymous"); // to avoid CORS if possible
      image.onload = () => resolve(image);
      image.onerror = (error) => reject(error);
      image.src = url;
    });

  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Adjust canvas size to cropped area size
  canvas.width = cropPixels.width;
  canvas.height = cropPixels.height;

  // Convert degrees to radians
  const radians = (rotation * Math.PI) / 180;

  // Calculate the size of the original image with rotation
  const rotatedWidth =
    Math.abs(Math.cos(radians) * image.width) +
    Math.abs(Math.sin(radians) * image.height);
  const rotatedHeight =
    Math.abs(Math.sin(radians) * image.width) +
    Math.abs(Math.cos(radians) * image.height);

  ctx.save();

  // Move context to center of canvas (for rotation)
  ctx.translate(canvas.width / 2, canvas.height / 2);

  // Rotate the canvas
  ctx.rotate(radians);

  // Move back by half of the rotated image size scaled by zoom
  ctx.scale(zoom, zoom);

  ctx.translate(
    -image.width / 2 - cropPixels.x / zoom,
    -image.height / 2 - cropPixels.y / zoom
  );

  // Draw the image
  ctx.drawImage(image, 0, 0);

  ctx.restore();

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      resolve(blob);
    }, "image/jpeg");
  });
}
