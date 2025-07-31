import React from 'react';
import { FiArrowUp, FiArrowDown, FiDollarSign } from 'react-icons/fi';

const PriceRecommendations = ({ adjustments, currentPrice }) => {
  const getChangeIcon = (change) => {
    if (change > 0) return <FiArrowUp className="text-green-500" />;
    if (change < 0) return <FiArrowDown className="text-red-500" />;
    return <FiDollarSign className="text-gray-500" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-[#9B177E] mb-4">
        AI-Generated Price Recommendations
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommended</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Reasoning</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {adjustments.map((adjustment, index) => {
              const change = ((adjustment.suggestedPrice - currentPrice) / currentPrice * 100);
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {adjustment.region}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{currentPrice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    <span className={`inline-flex items-center ${
                      adjustment.suggestedPrice > currentPrice ? 'text-green-600' : 
                      adjustment.suggestedPrice < currentPrice ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {getChangeIcon(change)}
                      <span className="ml-1">₹{adjustment.suggestedPrice}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Math.abs(change).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                        adjustment.confidenceScore > 0.8 ? 'bg-green-400' :
                        adjustment.confidenceScore > 0.6 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}></span>
                      {adjustment.reason || 'Regional demand adjustment'}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PriceRecommendations;