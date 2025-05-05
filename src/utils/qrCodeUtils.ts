
/**
 * Utility functions for QR code processing
 */

/**
 * Checks if a string is a valid URL
 */
export const isURL = (text: string): boolean => {
  try {
    new URL(text || "");
    return true;
  } catch {
    return false;
  }
};

/**
 * Process an image to detect QR codes
 */
export const processQrFromImage = (
  img: HTMLImageElement, 
  onSuccess: (result: string) => void,
  onError: (message: string) => void
): void => {
  // Create a canvas to draw the image
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    onError('Could not process image.');
    return;
  }
  
  // Set canvas dimensions to image dimensions
  canvas.width = img.width;
  canvas.height = img.height;
  
  // Draw the image to the canvas
  ctx.drawImage(img, 0, 0);
  
  try {
    // Get image data from the canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Use jsQR to detect QR code
    const jsQR = require('jsqr');
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
      onSuccess(code.data);
    } else {
      onError('No QR code found in this image.');
    }
  } catch (error) {
    onError('Error processing image data.');
  }
};
