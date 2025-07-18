import React from 'react';
import CollagePreview from './CollagePreview';
import { getCollageOptions } from '../../utils/socialMediaHelpers';

const CollageLayoutSelector = ({ imagePreviews, collageLayout, setCollageLayout }) => {
  if (imagePreviews.length <= 1) return null;
  return (
    <div className="mt-2 flex items-center gap-6">
      <span className="text-xs text-gray-500 min-w-max">Collage Layout:</span>
      <div className="flex gap-6">
        {getCollageOptions(imagePreviews.length).map(opt => (
          <label key={opt.value} className="flex flex-col items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="collageLayout"
              value={opt.value}
              checked={collageLayout === opt.value}
              onChange={() => setCollageLayout(opt.value)}
              className="accent-[#9B177E]"
            />
            <CollagePreview type={opt.value} imagesCount={imagePreviews.length} />
            <span className="text-xs">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default CollageLayoutSelector; 