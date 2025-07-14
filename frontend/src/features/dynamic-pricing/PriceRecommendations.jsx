import React from 'react';

const PriceRecommendations = ({ adjustments, currentPrice }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-[#9B177E] mb-4">Price Recommendations</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suggested Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demand</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {adjustments.map((adjustment, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{adjustment.region}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{currentPrice}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`font-semibold ${
                    adjustment.suggestedPrice > currentPrice ? 'text-green-600' : 
                    adjustment.suggestedPrice < currentPrice ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    ₹{adjustment.suggestedPrice}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {((adjustment.suggestedPrice - currentPrice) / currentPrice * 100).toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    adjustment.demand.includes('High') 
                      ? 'bg-[#f3e8ff] text-[#9B177E]' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {adjustment.demand}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PriceRecommendations;
