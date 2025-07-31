export const fetchProductList = async () => {
  try {
    return [
      { 
        id: 1, 
        name: "Silk Saree", 
        price: 2499, 
        image: "https://images.meesho.com/images/products/49030100/j1zmg_512.avif?width=512", 
        category: "Clothing",
        historicalSales: 150,
        history: [
          { date: '2023-01-01', price: 2299 },
          { date: '2023-06-01', price: 2399 },
          { date: '2023-12-01', price: 2499 }
        ]
      },
      { 
        id: 2, 
        name: "Handmade Jewelry", 
        price: 1299, 
        image: "https://images.meesho.com/images/products/456930455/hjost_512.avif?width=512", 
        category: "Accessories",
        historicalSales: 200,
        history: [
          { date: '2023-01-01', price: 1199 },
          { date: '2023-06-01', price: 1250 },
          { date: '2023-12-01', price: 1299 }
        ]
      },
      { 
        id: 3, 
        name: "Spices Gift Set", 
        price: 899, 
        image: "https://images.meesho.com/images/products/554782855/qouih_512.avif?width=360", 
        category: "Food",
        historicalSales: 300,
        history: [
          { date: '2023-01-01', price: 799 },
          { date: '2023-06-01', price: 849 },
          { date: '2023-12-01', price: 899 }
        ]
      }
    ];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const fetchRegionData = async () => {
  try {
    // All Indian states and UTs with realistic data
    return [
      // Northern Region
      { id: 1, name: "Jammu & Kashmir", stateCode: "JK", demandFactor: 1.2, population: 13600000, coordinates: [74.85, 34.08], gdpPerCapita: 1200 },
      { id: 2, name: "Himachal Pradesh", stateCode: "HP", demandFactor: 1.1, population: 7300000, coordinates: [77.17, 31.92], gdpPerCapita: 1800 },
      { id: 3, name: "Punjab", stateCode: "PB", demandFactor: 1.3, population: 30000000, coordinates: [75.34, 31.15], gdpPerCapita: 2200 },
      { id: 4, name: "Uttarakhand", stateCode: "UK", demandFactor: 1.1, population: 11000000, coordinates: [79.0193, 30.0668], gdpPerCapita: 1900 },
      
      // Southern Region
      { id: 5, name: "Kerala", stateCode: "KL", demandFactor: 1.4, population: 35000000, coordinates: [76.27, 10.52], gdpPerCapita: 2800 },
      { id: 6, name: "Tamil Nadu", stateCode: "TN", demandFactor: 1.5, population: 78000000, coordinates: [80.27, 13.08], gdpPerCapita: 2600 },
      { id: 7, name: "Karnataka", stateCode: "KA", demandFactor: 1.3, population: 68000000, coordinates: [76.36, 15.32], gdpPerCapita: 2400 },
      
      // Western Region
      { id: 8, name: "Maharashtra", stateCode: "MH", demandFactor: 1.4, population: 124000000, coordinates: [75.71, 19.75], gdpPerCapita: 2500 },
      { id: 9, name: "Gujarat", stateCode: "GJ", demandFactor: 1.3, population: 70000000, coordinates: [71.19, 22.25], gdpPerCapita: 2300 },
      
      // Eastern Region
      { id: 10, name: "West Bengal", stateCode: "WB", demandFactor: 1.2, population: 98000000, coordinates: [88.36, 22.57], gdpPerCapita: 1500 },
      { id: 11, name: "Odisha", stateCode: "OD", demandFactor: 1.0, population: 46000000, coordinates: [85.09, 20.95], gdpPerCapita: 1400 },
      
      // North-Eastern Region
      { id: 12, name: "Assam", stateCode: "AS", demandFactor: 1.1, population: 35000000, coordinates: [92.94, 26.19], gdpPerCapita: 1300 },
      
      // Central Region
      { id: 13, name: "Madhya Pradesh", stateCode: "MP", demandFactor: 1.0, population: 85000000, coordinates: [78.65, 23.47], gdpPerCapita: 1200 },
      { id: 14, name: "Uttar Pradesh", stateCode: "UP", demandFactor: 1.1, population: 230000000, coordinates: [80.94, 26.85], gdpPerCapita: 1100 },
      
      // Union Territories
      { id: 15, name: "Delhi", stateCode: "DL", demandFactor: 1.5, population: 20000000, coordinates: [77.10, 28.70], gdpPerCapita: 3500 },
      { id: 16, name: "Puducherry", stateCode: "PY", demandFactor: 1.2, population: 1500000, coordinates: [79.81, 11.94], gdpPerCapita: 2800 }
    ];
  } catch (error) {
    console.error('Error fetching regions:', error);
    return [];
  }
};

export const fetchFestivalData = async () => {
  try {
    return [
      // National Festivals
      { id: 1, name: "Diwali", date: "2023-11-12", impactFactor: 1.8, icon: "🪔", regions: "all" },
      { id: 2, name: "Holi", date: "2024-03-25", impactFactor: 1.5, icon: "🎨", regions: "all" },
      { id: 3, name: "Dussehra", date: "2023-10-24", impactFactor: 1.4, icon: "🏹", regions: "all" },
      
      // Regional Festivals
      { id: 4, name: "Pongal", date: "2024-01-15", impactFactor: 1.6, icon: "🌾", regions: ["TN", "AP", "KL"] },
      { id: 5, name: "Onam", date: "2023-08-29", impactFactor: 1.7, icon: "🌼", regions: ["KL"] },
      { id: 6, name: "Bihu", date: "2024-04-14", impactFactor: 1.5, icon: "🌱", regions: ["AS"] },
      { id: 7, name: "Ganesh Chaturthi", date: "2023-09-19", impactFactor: 1.6, icon: "🐘", regions: ["MH", "KA", "AP"] },
      { id: 8, name: "Durga Puja", date: "2023-10-20", impactFactor: 1.7, icon: "🙏", regions: ["WB", "OD", "AS"] },
      { id: 9, name: "Navratri", date: "2023-10-15", impactFactor: 1.5, icon: "💃", regions: ["GJ", "RJ", "MP"] },
      { id: 10, name: "Lohri", date: "2024-01-13", impactFactor: 1.3, icon: "🔥", regions: ["PB", "HR", "HP"] },
      { id: 11, name: "Baisakhi", date: "2024-04-13", impactFactor: 1.4, icon: "🎵", regions: ["PB", "HR"] },
      { id: 12, name: "Christmas", date: "2023-12-25", impactFactor: 1.3, icon: "🎄", regions: ["all"] },
      { id: 13, name: "Eid", date: "2024-04-10", impactFactor: 1.4, icon: "🌙", regions: "all" }
    ];
  } catch (error) {
    console.error('Error fetching festivals:', error);
    return [];
  }
};

export const getDynamicPricingRecommendations = async (product, regions, festivals) => {
  try {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return regions.map(region => {
      // Find festivals affecting this region
      const regionFestivals = festivals.filter(f => 
        f.regions === 'all' || 
        (Array.isArray(f.regions) && f.regions.includes(region.stateCode)) ||
        (f.regions === 'north' && ['JK', 'HP', 'PB', 'HR', 'UK'].includes(region.stateCode))
      );
      
      // Get most impactful festival
      const activeFestival = regionFestivals.reduce((max, f) => 
        f.impactFactor > (max?.impactFactor || 0) ? f : max, null);
      
      // Calculate price adjustment
      const baseAdjustment = region.demandFactor;
      const festivalAdjustment = activeFestival ? activeFestival.impactFactor : 1;
      const price = product.price * baseAdjustment * festivalAdjustment;
      
      // Add some randomness to simulate AI
      const finalPrice = price * (0.95 + Math.random() * 0.1);
      
      return {
        region: region.name,
        stateCode: region.stateCode,
        currentPrice: product.price,
        suggestedPrice: Math.round(finalPrice),
        demand: region.demandFactor > 1.3 ? 'Very High' :
               region.demandFactor > 1.1 ? 'High' : 'Normal',
        reason: activeFestival 
          ? `Festival boost (${activeFestival.name}) + regional demand`
          : 'Regional demand based pricing',
        confidenceScore: 0.8 + Math.random() * 0.15 // Random confidence between 0.8-0.95
      };
    });
  } catch (error) {
    console.error('AI recommendation error:', error);
    throw error;
  }
};

export const applyPriceChanges = async (productId, adjustments) => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200));
    console.log('Applied price changes:', { productId, adjustments });
    return true;
  } catch (error) {
    console.error('Error applying changes:', error);
    throw error;
  }
};