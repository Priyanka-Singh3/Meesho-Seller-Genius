import { OpenAI } from 'openai';

const openai = new OpenAI(process.env.OPENAI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { product, regions, festivals } = req.body;

    const prompt = `Act as an expert e-commerce pricing analyst. Recommend prices for:
    
    Product: ${product.name} (₹${product.price})
    Category: ${product.category}
    
    Regional Factors:
    ${regions.map(r => `- ${r.name}: Demand ${r.demandFactor}, ${r.population ? `Pop. ${r.population}` : ''}`).join('\n')}
    
    Festival Impacts:
    ${festivals.map(f => `- ${f.name}: ${f.impactFactor}x impact`).join('\n')}
    
    Provide specific price recommendations in JSON format with:
    - region
    - currentPrice
    - suggestedPrice
    - reason (short explanation)
    - confidenceScore (0-1)`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an AI pricing expert that provides data-driven price recommendations for e-commerce products."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const content = response.choices[0].message.content;
    const recommendations = JSON.parse(content);

    res.status(200).json({ recommendations });
  } catch (error) {
    console.error('AI pricing error:', error);
    res.status(500).json({ error: 'Failed to generate pricing recommendations' });
  }
}