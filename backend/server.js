const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
require('dotenv').config();
const HF_API_KEY = process.env.HF_API_KEY;

const app = express();
const PORT = process.env.PORT || 3000;

console.log('Starting backend server...');

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const socialMediaRoutes = require('./routes/socialMedia');
app.use('/api/social-media', socialMediaRoutes);

// Test route to verify backend is running
app.get('/test', (req, res) => {
  console.log('Received request on /test');
  res.send('Backend is working!');
});

// Test HuggingFace API route
app.get('/test-hf', async (req, res) => {
  try {
    const MODEL_ID = "gpt2";
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${MODEL_ID}`,
      { inputs: "Test prompt" },
      { headers: { Authorization: `Bearer ${HF_API_KEY}` } }
    );
    console.log('HuggingFace API response:', response.data);
    res.json(response.data);
  } catch (err) {
    console.error('HuggingFace API error:', err?.response?.data || err.message);
    res.status(500).json({ error: err?.response?.data || err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
