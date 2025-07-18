import React from 'react';

const ImageUploader = ({ images, setImages, imagePreviews, setImagePreviews, fileInputRef, dragActive, setDragActive, handleRemoveImage }) => {
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange({ target: { files: [e.dataTransfer.files[0]] } });
    }
  };
  const handleImageChange = (e) => {
    let files = Array.from(e.target.files);
    let combinedFiles = [...images, ...files].slice(-3);
    const newPreviews = combinedFiles.map(file => URL.createObjectURL(file));
    setImages(combinedFiles);
    setImagePreviews(newPreviews);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  return (
    <div
      className={`border-2 border-dashed p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${dragActive ? 'border-[#9B177E] bg-[#f3e0f5]' : 'border-gray-300 bg-gray-50'}`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current && fileInputRef.current.click()}
      style={{ minHeight: '120px', borderRadius: 0 }}
    >
      {imagePreviews.length > 0 ? (
        <div className="flex gap-2 w-full flex-wrap">
          {imagePreviews.map((src, idx) => (
            <div key={idx} className="relative w-24 h-24 flex items-center justify-center">
              <img src={src} alt={`Preview ${idx+1}`} className="w-full h-full object-contain border border-[#f3e0f5]" style={{ borderRadius: 0 }} />
              <button type="button" className="absolute top-1 right-1 bg-white border border-gray-300 p-1 text-gray-600 hover:bg-gray-100" style={{ borderRadius: 0 }} onClick={e => { e.stopPropagation(); handleRemoveImage(idx); }} title="Remove image">&times;</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center text-gray-400">
          <span className="text-4xl mb-2">📷</span>
          <span>Drag & drop or click to upload (max 3)</span>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        ref={fileInputRef}
        className="hidden"
        multiple
        disabled={images.length >= 3}
        required={images.length === 0}
      />
    </div>
  );
};

export default ImageUploader; 