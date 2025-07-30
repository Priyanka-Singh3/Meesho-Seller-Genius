import axios from 'axios';

export const getAIRecommendations = async (product, regions, festivals) => {
  try {
    const response = await axios.post('/api/ai/pricing', {
      product,
      regions,
      festivals,
      timestamp: new Date().toISOString()
    });

    return response.data.recommendations.map(rec => ({
      ...rec,
      suggestedPrice: parseFloat(rec.suggestedPrice.toFixed(2))
    }));
  } catch (error) {
    console.error('AI pricing API error:', error);
    throw new Error('Failed to get AI recommendations');
  }
};

// Alternative direct OpenAI implementation (uncomment if using directly)
/*
const { OpenAI } = require('openai');
const openai = new OpenAI(process.env.OPENAI_API_KEY);

export const getAIRecommendations = async (product, regions, festivals) => {
  const prompt = `Generate pricing recommendations for ${product.name} (₹${product.price}) across regions:
  
  Regions: ${regions.map(r => `${r.name} (Demand: ${r.demandFactor})`).join(', ')}
  Festivals: ${festivals.map(f => `${f.name} (Impact: ${f.impactFactor})`).join(', ')}
  
  Provide recommendations in JSON format with: region, currentPrice, suggestedPrice, reason, confidenceScore`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3
  });

  return JSON.parse(response.choices[0].message.content);
};
*/