import React from "react";

const FeatureCard = ({ image, bgColor = "#F3E8FF" }) => {
  return (
    <div className="relative flex flex-col items-center">
      <div
        className="w-40 h-40 rounded-full flex items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        <img
          src={image}
          alt="Feature"
          className="w-32 h-32 rounded-full object-cover shadow-md border-4 border-white"
        />
      </div>
    </div>
  );
};

export default FeatureCard; 