import React, { useState } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

const ImageUpload = ({ currentImage, onImageUpload, className = "" }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const toast = useToast();

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    
    console.log('Uploading to Cloudinary with:', {
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
      uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
      fileSize: file.size,
      fileType: file.type
    });
    
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      console.log('Cloudinary response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Cloudinary error response:', errorData);
        throw new Error(`Upload failed: ${response.status} - ${errorData}`);
      }
      
      const data = await response.json();
      console.log('Cloudinary success:', data);
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Check if environment variables are set
    if (!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || !import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET) {
      toast.error('Cloudinary configuration missing. Please check your .env file.');
      console.error('Missing Cloudinary config:', {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      });
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadToCloudinary(file);
      onImageUpload(imageUrl);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error details:', error);
      if (error.message.includes('404')) {
        toast.error('Invalid cloud name. Please check your Cloudinary configuration.');
      } else if (error.message.includes('Invalid upload preset')) {
        toast.error('Invalid upload preset. Please check your Cloudinary settings.');
      } else {
        toast.error(`Upload failed: ${error.message}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`relative group cursor-pointer transition-all duration-200 ${
          dragOver ? 'scale-105 border-blue-500' : ''
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Current Image or Placeholder */}
        <div className="relative w-32 h-32 mx-auto">
          {currentImage ? (
            <img
              src={currentImage}
              alt="Profile"
              className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
          )}
          
          {/* Upload Overlay */}
          <div className={`absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center transition-opacity duration-200 ${
            uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            {uploading ? (
              <LoadingSpinner size="sm" className="text-white" />
            ) : (
              <div className="text-center text-white">
                <Upload className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs font-medium">Upload</span>
              </div>
            )}
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
      </div>

      {/* Drag & Drop Overlay */}
      {dragOver && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-2 border-blue-500 border-dashed rounded-full flex items-center justify-center">
          <div className="text-center text-blue-600">
            <Upload className="w-8 h-8 mx-auto mb-2" />
            <span className="text-sm font-medium">Drop image here</span>
          </div>
        </div>
      )}

      {/* Upload Instructions */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Click or drag image to upload
        </p>
        <p className="text-xs text-gray-500 mt-1">
          JPG, PNG, GIF up to 5MB
        </p>
      </div>
    </div>
  );
};

export default ImageUpload;
