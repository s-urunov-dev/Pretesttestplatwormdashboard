import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
}

export function ImageUploader({ imageUrl, onImageChange }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState(imageUrl);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        onImageChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (url: string) => {
    setPreviewUrl(url);
    onImageChange(url);
  };

  const clearImage = () => {
    setPreviewUrl('');
    onImageChange('');
  };

  return (
    <div className="space-y-3">
      {previewUrl ? (
        <div className="relative border-2 border-slate-300 rounded-xl overflow-hidden shadow-md">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full max-h-96 object-contain bg-slate-50"
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-slate-600 mb-4">Rasm yuklang yoki URL kiriting</p>
          <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#042d62] text-white rounded-xl hover:bg-[#053a75] cursor-pointer transition-all shadow-md hover:shadow-lg">
            <Upload className="w-4 h-4" />
            Fayl Tanlash
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      )}
      
      <div>
        <label className="block text-slate-700 mb-2 text-sm">
          Yoki rasm URL kiriting:
        </label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://example.com/image.png"
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] focus:border-transparent bg-white"
        />
      </div>
    </div>
  );
}