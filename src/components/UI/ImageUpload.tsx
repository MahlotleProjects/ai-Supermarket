import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value);

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      onChange(publicUrl);
      setPreview(publicUrl);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      toast.error('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    uploadImage(file);
  };

  const handleRemove = () => {
    onChange('');
    setPreview('');
  };

  return (
    <div className="relative">
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="h-32 w-32 object-cover rounded-lg"
            onError={() => setPreview('')}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload size={24} className="text-gray-400 mb-2" />
            <p className="text-xs text-gray-500 text-center">
              {uploading ? 'Uploading...' : 'Click to upload'}
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
};

export default ImageUpload;