import React, { useState, useCallback, useRef } from 'react';
import Icon from './Icon';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  processing: boolean;
  selectedImagePreview: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, processing, selectedImagePreview }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      onImageSelect(files[0]);
    }
  };

  const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!processing) setIsDragging(true);
  }, [processing]);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!processing && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  }, [processing]);

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const baseClasses = "relative group flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300";
  const idleClasses = "border-gray-300 bg-gray-50 hover:bg-gray-100";
  const draggingClasses = "border-indigo-500 bg-indigo-50";
  const disabledClasses = "bg-gray-200 border-gray-400 cursor-not-allowed";

  const getContainerClasses = () => {
    if (processing) return `${baseClasses} ${disabledClasses}`;
    if (isDragging) return `${baseClasses} ${draggingClasses}`;
    return `${baseClasses} ${idleClasses}`;
  };

  return (
    <div 
      className={getContainerClasses()}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onButtonClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        onChange={(e) => handleFileChange(e.target.files)}
        disabled={processing}
      />
      {selectedImagePreview ? (
        <img src={selectedImagePreview} alt="Xem trước ảnh đã chọn" className="object-contain h-full w-full rounded-lg p-2" />
      ) : (
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <Icon name="upload" className="w-10 h-10 mb-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Nhấn để tải lên</span> hoặc kéo và thả</p>
            <p className="text-xs text-gray-500">PNG, JPG, hoặc WEBP</p>
        </div>
      )}
      {processing && <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg"><p className="text-gray-600 font-semibold">Đang xử lý...</p></div>}
    </div>
  );
};

export default ImageUploader;