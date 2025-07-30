import React from 'react';

const AIInsights = ({ selectedProduct, selectedRegion, selectedFestival }) => {
  if (!selectedProduct) return null;

  const getInsights = () => {
    const insights = [];
    
    if (selectedRegion) {
      insights.push({
        icon: '📍',
        text: `In ${selectedRegion.name}, market conditions suggest ${selectedRegion.demandFactor > 1 ? 'increasing' : 'decreasing'} prices by ${Math.abs(selectedRegion.demandFactor - 1) * 15}%`
      });
    }
    
    if (selectedFestival) {
      insights.push({
        icon: '🎉',
        text: `During ${selectedFestival.name}, historical data shows a ${selectedFestival.impactFactor * 20}% average demand increase`
      });
    }
    
    if (insights.length === 0) {
      insights.push({
        icon: '🤖',
        text: 'AI is analyzing regional trends to optimize your pricing strategy'
      });
    }
    
    return insights;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-[#f3e8ff]">
      <div className="flex items-center mb-4">
        <h3 className="text-xl font-semibold text-[#9B177E]">AI Pricing Insights</h3>
        <span className="ml-2 px-2 py-1 bg-[#f3e8ff] text-[#9B177E] rounded-full text-xs">
          Beta
        </span>
      </div>
      <div className="space-y-3">
        {getInsights().map((insight, i) => (
          <div key={i} className="flex items-start">
            <span className="text-xl mr-3 mt-1">{insight.icon}</span>
            <p className="text-gray-700">{insight.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIInsights;