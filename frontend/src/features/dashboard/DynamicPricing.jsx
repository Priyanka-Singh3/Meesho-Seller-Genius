import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import IndiaMap from '../dynamic-pricing/IndiaMap';
import FestivalCalendar from '../dynamic-pricing/FestivalCalendar';
import PriceAdjustmentChart from '../dynamic-pricing/PriceAdjustmentChart';
import ProductSelector from '../dynamic-pricing/ProductSelector';
import PriceRecommendations from '../dynamic-pricing/PriceRecommendations';
import AIInsights from '../dynamic-pricing/AIPriceInsights';
import { 
  fetchProductList, 
  fetchRegionData, 
  fetchFestivalData, 
  applyPriceChanges,
  getDynamicPricingRecommendations
} from '../../services/dynamicPricingService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DynamicPricing = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [regionData, setRegionData] = useState([]);
  const [festivalData, setFestivalData] = useState([]);
  const [priceAdjustments, setPriceAdjustments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('region');
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedFestival, setSelectedFestival] = useState(null);
  const [mapMode, setMapMode] = useState('demand');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [products, regions, festivals] = await Promise.all([
          fetchProductList(),
          fetchRegionData(),
          fetchFestivalData()
        ]);
        
        setProducts(products);
        setRegionData(regions);
        setFestivalData(festivals);
        
        if (products.length > 0) {
          handleProductSelect(products[0]);
        }
        
      } catch (error) {
        toast.error('Failed to load data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleProductSelect = async (product) => {
    setSelectedProduct(product);
    setAiLoading(true);
    try {
      const recommendations = await getDynamicPricingRecommendations(
        product, 
        regionData, 
        festivalData
      );
      setPriceAdjustments(recommendations);
    } catch (error) {
      toast.error('Failed to generate recommendations: ' + error.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleRegionSelect = (region) => {
    setSelectedRegion(region);
  };

  const handleFestivalSelect = (festival) => {
    setSelectedFestival(festival);
    if (selectedProduct) {
      setAiLoading(true);
      setTimeout(() => {
        const recommendations = regionData.map(r => ({
          region: r.name,
          stateCode: r.stateCode,
          currentPrice: selectedProduct.price,
          suggestedPrice: Math.round(selectedProduct.price * r.demandFactor * (festival ? festival.impactFactor : 1)),
          demand: r.demandFactor > 1.3 ? 'Very High' : 
                 r.demandFactor > 1.1 ? 'High' : 'Normal',
          reason: festival ? `${festival.name} effect` : 'Regional demand',
          confidenceScore: 0.85
        }));
        setPriceAdjustments(recommendations);
        setAiLoading(false);
      }, 500);
    }
  };

  const handleApplyChanges = async () => {
    if (!selectedProduct) {
      toast.warning('Please select a product first');
      return;
    }
    try {
      setLoading(true);
      await applyPriceChanges(selectedProduct.id, priceAdjustments);
      toast.success('Price changes applied successfully!');
    } catch (error) {
      toast.error('Failed to apply changes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar showLogout={true} />
      <div className="flex-1 bg-gradient-to-br from-[#f8f7fa] to-[#ffe4fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-[#9B177E]">AI Dynamic Pricing</h1>
              <p className="mt-2 text-lg text-gray-600">
                Optimize prices using AI-powered regional and festival analysis
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={handleApplyChanges}
                disabled={loading || !selectedProduct}
                className={`px-6 py-3 rounded-lg font-semibold text-white ${
                  loading || !selectedProduct 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-[#9B177E] hover:bg-[#7a125f]'
                }`}
              >
                {loading ? 'Applying...' : 'Apply AI Recommendations'}
              </button>
            </div>
          </div>

          {selectedProduct && (
            <AIInsights 
              selectedProduct={selectedProduct}
              selectedRegion={selectedRegion}
              selectedFestival={selectedFestival}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <ProductSelector
                products={products}
                selectedProduct={selectedProduct}
                onSelect={handleProductSelect}
                loading={loading}
              />
              
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-[#9B177E] mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button
                    className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'region'
                        ? 'bg-[#9B177E] text-white'
                        : 'bg-[#f3e8ff] hover:bg-[#e5d5f7] text-[#9B177E]'
                    }`}
                    onClick={() => setActiveTab('region')}
                  >
                    Region-based Pricing
                  </button>
                  <button
                    className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'festival'
                        ? 'bg-[#9B177E] text-white'
                        : 'bg-[#f3e8ff] hover:bg-[#e5d5f7] text-[#9B177E]'
                    }`}
                    onClick={() => setActiveTab('festival')}
                  >
                    Festival-based Pricing
                  </button>
                  <button
                    className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${
                      activeTab === 'history'
                        ? 'bg-[#9B177E] text-white'
                        : 'bg-[#f3e8ff] hover:bg-[#e5d5f7] text-[#9B177E]'
                    }`}
                    onClick={() => setActiveTab('history')}
                  >
                    Pricing History
                  </button>
                </div>
              </div>

              {selectedProduct && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold text-[#9B177E] mb-4">Current Pricing</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Price:</span>
                      <span className="font-semibold">₹{selectedProduct.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Your Margin:</span>
                      <span className="font-semibold">20%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Sales:</span>
                      <span className="font-semibold">120/month</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex border-b border-gray-200 mb-6">
                  <button
                    className={`px-4 py-2 font-medium ${
                      activeTab === 'region' 
                        ? 'text-[#9B177E] border-b-2 border-[#9B177E]' 
                        : 'text-gray-500'
                    }`}
                    onClick={() => setActiveTab('region')}
                  >
                    Regional Demand
                  </button>
                  <button
                    className={`px-4 py-2 font-medium ${
                      activeTab === 'festival' 
                        ? 'text-[#9B177E] border-b-2 border-[#9B177E]' 
                        : 'text-gray-500'
                    }`}
                    onClick={() => setActiveTab('festival')}
                  >
                    Festival Impact
                  </button>
                  <button
                    className={`px-4 py-2 font-medium ${
                      activeTab === 'history' 
                        ? 'text-[#9B177E] border-b-2 border-[#9B177E]' 
                        : 'text-gray-500'
                    }`}
                    onClick={() => setActiveTab('history')}
                  >
                    Price History
                  </button>
                </div>

                {activeTab === 'region' && (
                  <div>
                    <div className="flex space-x-2 mb-4">
                      <button
                        onClick={() => setMapMode('demand')}
                        className={`px-4 py-2 rounded transition-colors ${
                          mapMode === 'demand'
                            ? 'bg-[#9B177E] text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        Show Demand
                      </button>
                      <button
                        onClick={() => setMapMode('pricing')}
                        className={`px-4 py-2 rounded transition-colors ${
                          mapMode === 'pricing'
                            ? 'bg-[#9B177E] text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        Show Pricing
                      </button>
                    </div>
                    
                    {aiLoading ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9B177E]"></div>
                      </div>
                    ) : (
                      <>
                        <IndiaMap
                          regions={regionData}
                          recommendations={priceAdjustments}
                          onSelect={handleRegionSelect}
                          selectedRegion={selectedRegion}
                          mapMode={mapMode}
                        />
                        {selectedRegion && (
                          <div className="mt-4 p-4 bg-[#f9f5ff] rounded-lg">
                            <h4 className="font-medium text-[#9B177E]">{selectedRegion.name}</h4>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                              <div>
                                <span className="text-sm text-gray-600">Demand Level:</span>
                                <span className="block font-medium">
                                  {selectedRegion.demandFactor > 1.3 ? 'Very High' :
                                   selectedRegion.demandFactor > 1.1 ? 'High' : 'Normal'}
                                </span>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Population:</span>
                                <span className="block font-medium">
                                  {selectedRegion.population?.toLocaleString() || '--'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'festival' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Festivals</h3>
                    {aiLoading ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9B177E]"></div>
                      </div>
                    ) : (
                      <>
                        <FestivalCalendar
                          festivals={festivalData}
                          onSelect={handleFestivalSelect}
                          selectedFestival={selectedFestival}
                        />
                        {selectedFestival && (
                          <div className="mt-4 p-4 bg-gradient-to-r from-[#f3e8ff] to-[#ffe4fa] rounded-lg border-l-4 border-[#9B177E]">
                            <h4 className="font-medium text-[#9B177E] flex items-center">
                              <span className="mr-2">{selectedFestival.icon}</span>
                              {selectedFestival.name}
                            </h4>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                              <div>
                                <span className="text-sm text-gray-600">Date:</span>
                                <span className="block font-medium">{selectedFestival.date}</span>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Impact:</span>
                                <span className="block font-medium">
                                  {selectedFestival.impactFactor > 1.5 ? 'Very High' :
                                   selectedFestival.impactFactor > 1.2 ? 'High' : 'Moderate'}
                                </span>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Affected Regions:</span>
                                <span className="block font-medium">
                                  {selectedFestival.regions === 'all' ? 'All India' :
                                   Array.isArray(selectedFestival.regions) ? selectedFestival.regions.join(', ') : 
                                   selectedFestival.regions}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'history' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Price History</h3>
                    {selectedProduct ? (
                      <PriceAdjustmentChart product={selectedProduct} />
                    ) : (
                      <p className="text-gray-500">Select a product to view price history</p>
                    )}
                  </div>
                )}
              </div>

              {selectedProduct && priceAdjustments.length > 0 && (
                <PriceRecommendations
                  adjustments={priceAdjustments}
                  currentPrice={selectedProduct.price}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default DynamicPricing;