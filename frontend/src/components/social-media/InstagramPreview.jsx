import React from 'react';
import meeshoLogo from '../../assets/meesho-logo.png';
import { safeText } from '../../utils/socialMediaHelpers';

const InstagramPreview = ({ imageUrls, collageLayout, caption, description, productLink }) => {
  // Collage rendering logic
  let collageContent;
  if (!imageUrls || imageUrls.length === 0) {
    collageContent = <span className="text-gray-400">No Image</span>;
  } else if (imageUrls.length === 1) {
    collageContent = <img src={imageUrls[0]} alt="Instagram preview" className="object-cover w-full h-full" />;
  } else if (imageUrls.length === 2) {
    if (collageLayout === 'vertical') {
      collageContent = (
        <div className="flex flex-col w-full h-full gap-1">
          <img src={imageUrls[0]} className="object-cover w-full h-1/2" style={{height:'50%'}} alt="1" />
          <img src={imageUrls[1]} className="object-cover w-full h-1/2" style={{height:'50%'}} alt="2" />
        </div>
      );
    } else {
      // side-by-side default
      collageContent = (
        <div className="flex w-full h-full gap-1">
          <img src={imageUrls[0]} className="object-cover w-1/2 h-full" style={{width:'50%'}} alt="1" />
          <img src={imageUrls[1]} className="object-cover w-1/2 h-full" style={{width:'50%'}} alt="2" />
        </div>
      );
    }
  } else if (imageUrls.length === 3) {
    if (collageLayout === 'vertical') {
      collageContent = (
        <div className="flex flex-col w-full h-full gap-1">
          <img src={imageUrls[0]} className="object-cover w-full h-1/3" style={{height:'33.33%'}} alt="1" />
          <img src={imageUrls[1]} className="object-cover w-full h-1/3" style={{height:'33.33%'}} alt="2" />
          <img src={imageUrls[2]} className="object-cover w-full h-1/3" style={{height:'33.33%'}} alt="3" />
        </div>
      );
    } else if (collageLayout === 'grid') {
      collageContent = (
        <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-1">
          <img src={imageUrls[0]} className="object-cover w-full h-full col-span-1 row-span-1" alt="1" />
          <img src={imageUrls[1]} className="object-cover w-full h-full col-span-1 row-span-1" alt="2" />
          <img src={imageUrls[2]} className="object-cover w-full h-full col-span-2 row-span-1" style={{gridColumn:'1/3'}} alt="3" />
        </div>
      );
    } else {
      // side-by-side: all 3 in a row
      collageContent = (
        <div className="flex w-full h-full gap-1">
          <img src={imageUrls[0]} className="object-cover w-1/3 h-full" style={{width:'33.33%'}} alt="1" />
          <img src={imageUrls[1]} className="object-cover w-1/3 h-full" style={{width:'33.33%'}} alt="2" />
          <img src={imageUrls[2]} className="object-cover w-1/3 h-full" style={{width:'33.33%'}} alt="3" />
        </div>
      );
    }
  }
  return (
    <div className="bg-white border shadow-lg p-0 max-w-xs mx-auto flex flex-col items-center animate-fade-in rounded-xl" style={{borderColor: '#e0e0e0' }}>
      {/* Header */}
      <div className="flex items-center w-full px-4 py-3 border-b" style={{ borderColor: '#f0f0f0' }}>
        <img src={meeshoLogo} alt="Meesho avatar" className="w-9 h-9 rounded-full border mr-3" />
        <div className="flex flex-col flex-1">
          <span className="font-semibold text-[#9B177E] text-sm">meesho_seller</span>
          <span className="text-xs text-gray-400">Sponsored</span>
        </div>
        <span className="text-gray-400 text-xl font-bold">•••</span>
      </div>
      {/* Collage Images */}
      <div className="w-full h-96 bg-gray-100 flex items-center justify-center overflow-hidden">
        {collageContent}
      </div>
      {/* Actions */}
      <div className="flex items-center w-full px-4 py-2 gap-4 border-b" style={{ borderColor: '#f0f0f0' }}>
        <span className="text-2xl cursor-pointer" title="Like">❤️</span>
        <span className="text-2xl cursor-pointer" title="Comment">💬</span>
        <span className="text-2xl cursor-pointer" title="Share">📤</span>
      </div>
      {/* Caption, Description, and Link */}
      <div className="w-full px-4 py-3 text-left flex flex-col gap-2 relative">
        <span className="font-semibold text-[#9B177E]">meesho_seller</span>
        {/* Caption */}
        <span className="text-gray-800 whitespace-pre-line block text-sm leading-snug">
          {(() => {
            const parts = safeText(caption).split(/(#[\w]+)/g);
            let firstTagIdx = parts.findIndex(p => p.match(/^#[\w]+$/));
            if (firstTagIdx === -1) firstTagIdx = parts.length;
            // Join all parts before the first hashtag
            const beforeTags = parts.slice(0, firstTagIdx).join("");
            const afterTags = parts.slice(firstTagIdx);
            return (
              <>
                {beforeTags && <span className="font-semibold">{beforeTags.replace(/^"|"$/g, '')}</span>}
                {afterTags.map((part, idx) =>
                  part.match(/^#[\w]+$/) ? (
                    <span key={idx} className="italic text-blue-500">{part}</span>
                  ) : (
                    <span key={idx}>{part}</span>
                  )
                )}
              </>
            );
          })()}
        </span>
        {/* Improved Description */}
        <span className="text-gray-700 whitespace-pre-line block text-sm leading-snug">{safeText(description).replace(/^"|"$/g, '')}</span>
        {/* Product Link */}
        {productLink && (
          <span className="mt-2 inline-block text-xs text-[#9B177E] font-medium select-none" style={{ cursor: 'default' }}>
            Buy the product now :
            <span className="block text-blue-500 underline mt-1" style={{ fontSize: '10px', wordBreak: 'break-all' }}>{productLink}</span>
          </span>
        )}
        <div className="text-xs text-gray-400 mt-2">View all 128 comments</div>
        <div className="text-xs text-gray-300 mt-1">2 hours ago</div>
      </div>
    </div>
  );
};

export default InstagramPreview; 