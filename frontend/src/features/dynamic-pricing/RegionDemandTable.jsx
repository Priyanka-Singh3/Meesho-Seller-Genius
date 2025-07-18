import React from 'react';
import { FiArrowUp, FiArrowDown, FiMinus } from 'react-icons/fi';

const RegionDemandTable = ({ regions, product, festival }) => {
  if (!product) return null;

  const getPriceChangeIcon = (change) => {
    if (change > 0) return <FiArrowUp className="text-green-500" />;
    if (change < 0) return <FiArrowDown className="text-red-500" />;
    return <FiMinus className="text-gray-500" />;
  };

  const calculateSuggestedPrice = (region) => {
    const baseIncrease = region.demandLevel === 'high' ? 0.15 : 0;
    const festivalIncrease = festival ? festival.expectedIncrease / 100 : 0;
    const totalIncrease = baseIncrease + festivalIncrease;
    return product.price * (1 + totalIncrease);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-[#f3e8ff]">
      <h2 className="text-xl font-semibold text-[#9B177E] mb-4">
        Regional Demand & Pricing
      </h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Region
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Demand Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Suggested Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Increase
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {regions.map((region) => {
              const suggestedPrice = calculateSuggestedPrice(region);
              const increase = ((suggestedPrice - product.price) / product.price) * 100;
              
              return (
                <tr key={region.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {region.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      region.demandLevel === 'high'
                        ? 'bg-[#f3e8ff] text-[#9B177E]'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {region.demandLevel.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                    suggestedPrice > product.price ? 'text-green-600' : 
                    suggestedPrice < product.price ? 'text-red-600' : 'text-gray-600'
                  }">
                    ₹{suggestedPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                    {getPriceChangeIcon(increase)}
                    <span className="ml-1">
                      {Math.abs(increase).toFixed(1)}%
                    </span>
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

export default RegionDemandTable;