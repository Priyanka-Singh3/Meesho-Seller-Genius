require('dotenv').config();
const axios = require('axios');

const HF_API_KEY = process.env.HF_API_KEY;
const HF_API_URL = 'https://api-inference.huggingface.co/models';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// Helper to call Groq API
async function groqGenerate(prompt, model = GROQ_MODEL, max_tokens = 120) {
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens,
        temperature: 0.8,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        timeout: 30000,
      }
    );
    return response.data.choices[0].message.content.trim();
  } catch (err) {
    console.error('Groq API error:', err.message, err.response?.data);
    return null;
  }
}

// Enhance description using Groq
async function enhanceDescription(description) {
    const prompt = `Creat a short, catchy, one-line product description to attract online shoppers. ONLY return the description itself, with no preamble, explanation, or extra text. Do not write anything else like this is the translation or anything like that.DO Not add any tags here.\nProduct: ${description}`;
    const result = await groqGenerate(prompt, GROQ_MODEL, 60);
    return result || `Short description: ${description}`;
}
  

// Generate catchy caption using Groq
async function generateCatchyCaption(title, description) {
    const prompt = `Create a short, creative Instagram caption for this product. Include 2-3 relevant one word hashtags with # .\nTitle: ${title}\nDescription: ${description}`;
    const result = await groqGenerate(prompt, GROQ_MODEL, 60);
    return result || `Caption for ${title}`;
  }
  
// Use Llama (Groq) for all translations
async function translateDescription(description, lang) {
  if (!lang || lang === 'en') return description;
  const prompt = `Translate the following product description into ${lang}. ONLY return the translated description itself, in pure ${lang} script, with no preamble, explanation, extra text, or the original English. Do not include the word 'Translation:'. Do not use any English words or phrases. Do not use any tags.\n${description}`;
  const result = await groqGenerate(prompt, GROQ_MODEL, 120);
  return result || description;
}

// Translate caption (excluding hashtags/tags)
async function translateCaption(caption, lang) {
  if (!lang || lang === 'en') return caption;
  const prompt = `Translate the following product caption into ${lang}. ONLY return the translated caption itself, in pure ${lang} script, with no preamble, explanation, extra text, or the original English. Do not include the word 'Translation:'. Do not use any English words or phrases except for hashtags, which should remain in English.But yes keep all the tags present as it is. Use neutral and positive language only. \nCaption: ${caption}`;
  const result = await groqGenerate(prompt, GROQ_MODEL, 120);
  return result || caption;
}

module.exports = {
  enhanceDescription,
  generateCatchyCaption,
  translateDescription,
  translateCaption,
  groqGenerate,
}; 