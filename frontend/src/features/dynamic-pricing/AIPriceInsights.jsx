import React from 'react';

const AIInsights = ({ selectedProduct, selectedRegion, selectedFestival }) => {
  // In a real app, fetch these from an LLM API
  if (!selectedProduct) return null;

  let tips = [];
  if (selectedRegion) {
    tips.push(`Your product "${selectedProduct.name}" sells best in ${selectedRegion.name} during high demand. Consider a ${selectedRegion.demandFactor > 1 ? '15%' : '5%'} price increase.`);
  }
  if (selectedFestival) {
    tips.push(`During ${selectedFestival.name}, demand is high. Increase price by up to ${(selectedFestival.impactFactor * 10).toFixed(0)}% for maximum profit.`);
  }
  if (!selectedRegion && !selectedFestival) {
    tips.push(`Select a region or festival to get personalized AI insights.`);
  }

  return (
    <div className="bg-[#f3e8ff] rounded-lg p-4 my-6">
      <h3 className="font-bold text-[#9B177E] mb-2">AI Insights</h3>
      <ul className="list-disc pl-6 text-gray-700">
        {tips.map((tip, i) => <li key={i}>{tip}</li>)}
      </ul>
    </div>
  );
};

export default AIInsights;
