import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop';
import type { ImageFile } from '../types';

interface ImageEditorModalProps {
  imageFile: ImageFile;
  onClose: () => void;
  onSave: (editedImage: ImageFile) => void;
}

const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ imageFile, onClose, onSave }) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [aspect, setAspect] = useState(1); // Default to square aspect ratio

  useEffect(() => {
    if (imageFile?.dataUrl) {
        const img = new Image();
        img.src = imageFile.dataUrl;
        img.onload = () => {
            setAspect(img.width / img.height);
        };
        img.onerror = () => {
            console.error("Failed to load image to calculate aspect ratio.");
            // Fallback to a default if the image can't be loaded
            setAspect(1);
        }
    }
  }, [imageFile]);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);
  
  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedImage = await getCroppedImg(imageFile.dataUrl, croppedAreaPixels, rotation);
      if (croppedImage) {
        onSave({ dataUrl: croppedImage, mimeType: imageFile.mimeType });
      }
    } catch (e) {
      console.error(e);
      alert('An error occurred while cropping the image.');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" 
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-stone-800 rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col text-white"
      >
        <h2 className="text-lg font-semibold p-4 border-b border-stone-700">Edit Image</h2>
        <div className="relative flex-grow">
          <Cropper
            image={imageFile.dataUrl}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="p-4 space-y-4 bg-stone-900/50 rounded-b-lg">
            <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                    <label className="block text-sm font-medium text-stone-300 mb-1">Zoom</label>
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer range-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-stone-300 mb-1">Rotate</label>
                    <div className="flex gap-2">
                        <button onClick={() => setRotation(r => r - 90)} className="w-full text-sm bg-stone-700 text-white px-3 py-2 rounded-md hover:bg-stone-600 font-semibold">Rotate Left</button>
                        <button onClick={() => setRotation(r => r + 90)} className="w-full text-sm bg-stone-700 text-white px-3 py-2 rounded-md hover:bg-stone-600 font-semibold">Rotate Right</button>
                    </div>
                </div>
            </div>
        </div>
        <div className="flex justify-end gap-3 p-4 border-t border-stone-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-600 text-white rounded-md hover:bg-stone-500 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 font-semibold transition-colors"
          >
            Save Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditorModal;


// --- Image Processing Utilities ---

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<string | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  ctx.drawImage(image, 0, 0);

  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(data, 0, 0);

  return new Promise((resolve, reject) => {
    // get mime type from original src
    const mimeType = imageSrc.substring(imageSrc.indexOf(':') + 1, imageSrc.indexOf(';'));
    resolve(canvas.toDataURL(mimeType));
  });
}
