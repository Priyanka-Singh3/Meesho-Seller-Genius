export const fetchProductList = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    {
      id: '1',
      name: "Women's Ethnic Dress",
      price: 599,
      image: 'https://images.meesho.com/images/products/12345678/abcde_512.jpg',
      category: 'Fashion'
    },
    {
      id: '2',
      name: "Men's Casual Shirt",
      price: 399,
      image: 'https://images.meesho.com/images/products/87654321/fghij_512.jpg',
      category: 'Fashion'
    },
    {
      id: '3',
      name: 'Kitchen Storage Set',
      price: 799,
      image: 'https://images.meesho.com/images/products/13579246/klmno_512.jpg',
      category: 'Home'
    },
    {
      id: '4',
      name: 'Wireless Headphones',
      price: 1299,
      image: 'https://images.meesho.com/images/products/24681357/pqrst_512.jpg',
      category: 'Electronics'
    }
  ];
};

export const fetchRegionData = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { name: 'Delhi NCR', stateCode: 'IN-DL', demandFactor: 1.3, coordinates: [77.1025, 28.7041], population: 32000000 },
    { name: 'Maharashtra', stateCode: 'IN-MH', demandFactor: 1.4, coordinates: [73.8567, 18.5204], population: 123000000 },
    { name: 'Karnataka', stateCode: 'IN-KA', demandFactor: 1.2, coordinates: [77.5946, 12.9716], population: 68000000 },
    { name: 'West Bengal', stateCode: 'IN-WB', demandFactor: 0.9, coordinates: [88.3639, 22.5726], population: 97000000 },
    { name: 'Tamil Nadu', stateCode: 'IN-TN', demandFactor: 1.0, coordinates: [80.2707, 13.0827], population: 78000000 },
    { name: 'Gujarat', stateCode: 'IN-GJ', demandFactor: 0.95, coordinates: [72.5714, 23.0225], population: 69000000 },
    { name: 'Telangana', stateCode: 'IN-TG', demandFactor: 1.1, coordinates: [78.4867, 17.3850], population: 40000000 },
    { name: 'Uttar Pradesh', stateCode: 'IN-UP', demandFactor: 1.3, coordinates: [80.9462, 26.8467], population: 230000000 }
  ];
};

export const fetchFestivalData = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const currentYear = new Date().getFullYear();
  return [
    {
      name: 'Diwali',
      date: `${currentYear}-11-12`,
      impactFactor: 1.8,
      description: 'Festival of lights with high shopping demand',
      icon: '🪔',
      color: '#FFD700'
    },
    {
      name: 'Dussehra',
      date: `${currentYear}-10-15`,
      impactFactor: 1.4,
      description: '10-day festival leading up to Diwali',
      icon: '🏹',
      color: '#FF9800'
    },
    {
      name: 'Holi',
      date: `${currentYear}-03-08`,
      impactFactor: 1.3,
      description: 'Festival of colors with increased fashion sales',
      icon: '🎨',
      color: '#FF69B4'
    },
    {
      name: 'Eid',
      date: `${currentYear}-04-21`,
      impactFactor: 1.2,
      description: 'Islamic festival with increased apparel sales',
      icon: '🌙',
      color: '#4CAF50'
    },
    {
      name: 'Christmas',
      date: `${currentYear}-12-25`,
      impactFactor: 1.3,
      description: 'Year-end holiday season',
      icon: '🎄',
      color: '#8BC34A'
    },
    {
      name: 'Navratri',
      date: `${currentYear}-10-03`,
      impactFactor: 1.5,
      description: '9-night festival with high traditional wear demand',
      icon: '💃',
      color: '#E040FB'
    },
    {
      name: 'Raksha Bandhan',
      date: `${currentYear}-08-19`,
      impactFactor: 1.2,
      description: 'Celebration of sibling bonds',
      icon: '🧵',
      color: '#FFB300'
    },
    {
      name: 'Pongal',
      date: `${currentYear}-01-15`,
      impactFactor: 1.1,
      description: 'Harvest festival in Tamil Nadu',
      icon: '🌾',
      color: '#FF7043'
    },
    {
      name: 'Onam',
      date: `${currentYear}-09-05`,
      impactFactor: 1.1,
      description: 'Harvest festival in Kerala',
      icon: '🌼',
      color: '#FFD54F'
    },
    {
      name: 'Ganesh Chaturthi',
      date: `${currentYear}-09-16`,
      impactFactor: 1.2,
      description: 'Celebration of Lord Ganesha',
      icon: '🐘',
      color: '#FF8A65'
    }
  ];
};

export const applyPriceChanges = async (productId, adjustments) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log(`Applying price changes for product ${productId}:`, adjustments);
  return { success: true };
};
