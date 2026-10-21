
import React, { useState, useRef, useCallback } from 'react';
import type { ImageFile } from '../types';

interface ImageUploaderProps {
  onFileSelected: (imageFile: ImageFile) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelected }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((files: FileList | (File | null)[] | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && typeof e.target.result === 'string') {
            onFileSelected({ dataUrl: e.target.result, mimeType: file.type });
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert("Please upload a valid image file.");
      }
    }
  }, [onFileSelected]);

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    let imageFile: File | null = null;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
        imageFile = items[i].getAsFile();
        break; // Use the first image found
      }
    }

    if (imageFile) {
      e.preventDefault();
      handleFile([imageFile]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files);
    }
  };

  const handleUploadClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    inputRef.current?.click();
  };

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        ref={inputRef}
        type="file"
        id="dropzone-file"
        className="hidden"
        accept="image/*"
        onChange={handleChange}
      />
      <div
        tabIndex={0}
        className={`flex flex-col items-center justify-center w-full min-h-[160px] p-4 text-center transition-colors duration-200 border-2 border-dashed rounded-lg cursor-pointer ${
          dragActive ? 'border-amber-600 bg-amber-50' : 'border-stone-300 bg-white'
        } focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onPaste={handlePaste}
        aria-label="Image uploader: Click to upload, drag and drop, or click to focus and paste an image"
      >
        <svg
          className="w-10 h-10 mb-3 text-stone-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          ></path>
        </svg>
        <p className="mb-2 text-sm text-stone-500">
          <span
            className="font-semibold text-amber-600 hover:underline"
            onClick={handleUploadClick}
          >
            Click to upload
          </span>
          , drag & drop, or paste
        </p>
        <p className="text-xs text-stone-400">PNG, JPG, GIF or WEBP</p>
      </div>
    </form>
  );
};

export default ImageUploader;