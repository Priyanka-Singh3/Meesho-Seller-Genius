export const fetchProducts = async () => {
  return [
    { id: 1, name: "Women's Ethnic Dress", price: 599, category: "Fashion", image: "/products/ethnic-dress.jpg" },
    { id: 2, name: "Men's Casual Shirt", price: 399, category: "Fashion", image: "/products/casual-shirt.jpg" },
    { id: 3, name: "Kitchen Storage Set", price: 799, category: "Home", image: "/products/kitchen-set.jpg" }
  ];
};

export const fetchRegions = async () => {
  return [
    { id: 1, name: 'Delhi', latitude: 28.7041, longitude: 77.1025, demand: 9, sales: 12500 },
    { id: 2, name: 'Maharashtra', latitude: 19.7515, longitude: 75.7139, demand: 8, sales: 18200 },
    { id: 3, name: 'Karnataka', latitude: 12.9716, longitude: 77.5946, demand: 7, sales: 9800 },
    { id: 4, name: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707, demand: 6, sales: 8700 },
    { id: 5, name: 'West Bengal', latitude: 22.5726, longitude: 88.3639, demand: 4, sales: 5200 }
  ];
};

export const fetchFestivals = async () => {
  const currentYear = new Date().getFullYear();
  return [
    { 
      id: 1, 
      name: "Diwali Festival", 
      date: `${currentYear}-11-12`, 
      expectedIncrease: 25,
      impactDuration: 15
    },
    { 
      id: 2, 
      name: "Holi Festival", 
      date: `${currentYear}-03-08`, 
      expectedIncrease: 18,
      impactDuration: 5
    }
  ];
};