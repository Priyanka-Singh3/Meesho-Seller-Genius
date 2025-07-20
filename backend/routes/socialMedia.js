const express = require('express');
const router = express.Router();
const { upload, cloudinaryUploadMiddleware } = require('../storage/imageStorage');
const { enhanceDescription, generateCatchyCaption, translateDescription, translateCaption } = require('../services/aiService');

// POST /api/social-media/generate
router.post('/generate', upload.single('image'), cloudinaryUploadMiddleware, async (req, res) => {
  try {
    const { title, description, language } = req.body;
    if (!title || !description || !req.fileUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // 1. Store image and get URL
    const imageUrl = req.fileUrl;

    // 2. Enhance description using LLM (always in English)
    const improvedDescription = await enhanceDescription(description);

    // 3. Generate catchy caption using text LLM (always English, with hashtags)
    const catchyCaption = await generateCatchyCaption(title, improvedDescription);

    // 4. Translate improved description and caption if non-English language is selected
    let improvedDescriptionTranslations = {};
    let catchyCaptionTranslations = {};
    if (language && language !== 'en') {
      improvedDescriptionTranslations[language] = await translateDescription(improvedDescription, language);
      catchyCaptionTranslations[language] = await translateCaption(catchyCaption, language);
    }

    // 5. Return all data
    return res.json({
      imageUrl,
      improvedDescription,
      improvedDescriptionTranslations,
      catchyCaption,
      catchyCaptionTranslations,
      productLink: 'https://meesho.com/product/123'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/social-media/refine-description
router.post('/refine-description', async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }
    const refinedDescription = await enhanceDescription(description);
    res.json({ refinedDescription });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to refine description' });
  }
});

// POST /api/social-media/refine-caption
router.post('/refine-caption', async (req, res) => {
  try {
    const { caption, description } = req.body;
    if (!caption || !description) {
      return res.status(400).json({ error: 'Caption and description are required' });
    }
    const refinedCaption = await generateCatchyCaption(caption, description);
    res.json({ refinedCaption });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to refine caption' });
  }
});

// POST /api/social-media/custom-ai
router.post('/custom-ai', async (req, res) => {
  const { text, customPrompt } = req.body;
  if (!text || !customPrompt) return res.status(400).json({ error: 'Missing fields' });
  const strictInstruction = "ONLY return the refined text itself, with no preamble, explanation, or extra text. Do not include the original input or the word 'Translation:'.";
  const prompt = `${customPrompt}\n\n${strictInstruction}\n\nText: ${text}`;
  try {
    const result = await require('../services/aiService').groqGenerate(prompt);
    res.json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process custom AI prompt' });
  }
});

module.exports = router; 