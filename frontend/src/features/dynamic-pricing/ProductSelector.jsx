import React from 'react';

const ProductSelector = ({ products = [], selectedProduct, onSelect, loading }) => {
  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : [];
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-[#9B177E] mb-4">Select Product</h2>
      {loading && safeProducts.length === 0 ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#9B177E]"></div>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {safeProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => onSelect(product)}
              className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center ${
                selectedProduct?.id === product.id
                  ? 'border-[#9B177E] bg-[#f3e8ff]'
                  : 'border-gray-200 hover:border-[#9B177E]'
              }`}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-12 rounded-md object-cover mr-3"
              />
              <div>
                <h3 className="font-medium text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-500">₹{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductSelector;