/*const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const path = require('path');
const axios = require('axios');
const upload = multer(); 
require('dotenv').config();

const HF_API_KEY = process.env.HF_API_KEY;

const corsOptions = {
  // origin: 'https://meesho-eight.vercel.app',
  origin: 'https://meesho1-one.vercel.app',
  credentials: true,
};

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 5050;

console.log('Starting backend server...');

// Social Media Routes
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


// POST: Remove Background
app.post('/remove-background', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).send('No image uploaded');
  const bgColor = req.body.bg_color || '#ffffff';
  const python = spawn('python', [path.join(__dirname, 'python', 'rm_bg.py'), bgColor]);

  python.stdin.write(req.file.buffer);
  python.stdin.end();

  let base64Image = '';
  python.stdout.on('data', (data) => (base64Image += data.toString()));
  python.stderr.on('data', (data) => console.error(`Python error: ${data.toString()}`));

  python.on('close', (code) => {
    if (code !== 0) return res.status(500).send('Python script failed');
    const imgBuffer = Buffer.from(base64Image, 'base64');
    res.set('Content-Type', 'image/png');
    res.send(imgBuffer);
  });
});

// // POST: Generate Product Copy
app.post('/generate-copy', (req, res) => {
  const scriptPath = path.join(__dirname, 'python', 'generate_copy.py');
  const python = spawn('python', [scriptPath]);

  let output = '', errorOutput = '';
  python.stdout.on('data', (data) => (output += data.toString()));
  python.stderr.on('data', (data) => (errorOutput += data.toString()));

  python.on('close', (code) => {
    if (code !== 0 || errorOutput) {
      try {
        const partialResult = JSON.parse(output.trim());
        if (partialResult.title || partialResult.description) return res.json(partialResult);
      } catch {}
      return res.status(500).json({
        error: 'Failed to generate product copy',
        details: errorOutput || 'Unknown error occurred',
      });
    }

    try {
      const result = JSON.parse(output.trim());
      const requiredFields = ['title', 'tagline', 'description', 'keywords', 'features', 'hashtags'];
      const missingFields = requiredFields.filter((field) => !result[field]);

      if (missingFields.length > 0) {
        missingFields.forEach((field) => {
          switch (field) {
            case 'title': result[field] = `${req.body.brand || ''} ${req.body.productType || 'Product'}`.trim(); break;
            case 'tagline': result[field] = 'Premium Quality Product'; break;
            case 'description': result[field] = 'High-quality product with excellent features.'; break;
            case 'keywords': result[field] = 'quality, premium, durable'; break;
            case 'features': result[field] = '• High-quality materials\n• Great value for money\n• Reliable performance'; break;
            case 'hashtags': result[field] = '#quality #premium #style #fashion #trendy'; break;
          }
        });
      }

      res.json(result);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      const fallback = {
        title: `${req.body.brand || ''} ${req.body.productType || 'Product'}`.trim(),
        tagline: 'Premium Quality Product',
        description: 'High-quality product with excellent features and great value for money.',
        keywords: 'quality, premium, durable, stylish, comfortable',
        features: '• High-quality materials\n• Great value for money\n• Reliable performance\n• Stylish design',
        hashtags: '#quality #premium #style #fashion #trendy #lifestyle',
        error: 'Generated copy with fallback data due to parsing error'
      };
      res.json(fallback);
    }
  });

  python.stdin.write(JSON.stringify(req.body));
  python.stdin.end();
});

// // POST: Upload Final Product
app.post('/upload-product', (req, res) => {
  try {
    const requiredFields = ['brand', 'productType', 'sellingPrice'];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}`, missingFields });
    }

    if (!req.body.generatedCopy || !req.body.generatedCopy.title) {
      return res.status(400).json({ error: 'Generated copy is required. Please generate copy first.', missingCopy: true });
    }

    setTimeout(() => {
      res.json({
        success: true,
        message: 'Product uploaded successfully!',
        productId: Date.now(),
        uploadedData: {
          productInfo: {
            brand: req.body.brand,
            productType: req.body.productType,
            sku: req.body.sku,
            sellingPrice: req.body.sellingPrice,
            category: req.body.category
          },
          generatedCopy: req.body.generatedCopy,
          uploadedAt: req.body.uploadedAt
        }
      });
    }, 1000);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload product', details: error.message });
  }
});

// // GET: Fetch uploaded products (mock)
app.get('/products', (req, res) => {
  res.json({
    message: 'Products endpoint - would return list of uploaded products',
    note: 'This is a mock endpoint for testing purposes'
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});*/

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const path = require('path');
const axios = require('axios');
const upload = multer(); 
require('dotenv').config();

const HF_API_KEY = process.env.HF_API_KEY;

// CORS configuration - Allow all origins
const corsOptions = {
  origin: true, // This allows all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 5050;

console.log('Starting backend server...');

// Social Media Routes
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


// POST: Remove Background
app.post('/remove-background', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).send('No image uploaded');
  const bgColor = req.body.bg_color || '#ffffff';
  const python = spawn('python', [path.join(__dirname, 'python', 'rm_bg.py'), bgColor]);

  python.stdin.write(req.file.buffer);
  python.stdin.end();

  let base64Image = '';
  python.stdout.on('data', (data) => (base64Image += data.toString()));
  python.stderr.on('data', (data) => console.error(`Python error: ${data.toString()}`));

  python.on('close', (code) => {
    if (code !== 0) return res.status(500).send('Python script failed');
    const imgBuffer = Buffer.from(base64Image, 'base64');
    res.set('Content-Type', 'image/png');
    res.send(imgBuffer);
  });
});

// // POST: Generate Product Copy
app.post('/generate-copy', (req, res) => {
  const scriptPath = path.join(__dirname, 'python', 'generate_copy.py');
  const python = spawn('python', [scriptPath]);

  let output = '', errorOutput = '';
  python.stdout.on('data', (data) => (output += data.toString()));
  python.stderr.on('data', (data) => (errorOutput += data.toString()));

  python.on('close', (code) => {
    if (code !== 0 || errorOutput) {
      try {
        const partialResult = JSON.parse(output.trim());
        if (partialResult.title || partialResult.description) return res.json(partialResult);
      } catch {}
      return res.status(500).json({
        error: 'Failed to generate product copy',
        details: errorOutput || 'Unknown error occurred',
      });
    }

    try {
      const result = JSON.parse(output.trim());
      const requiredFields = ['title', 'tagline', 'description', 'keywords', 'features', 'hashtags'];
      const missingFields = requiredFields.filter((field) => !result[field]);

      if (missingFields.length > 0) {
        missingFields.forEach((field) => {
          switch (field) {
            case 'title': result[field] = `${req.body.brand || ''} ${req.body.productType || 'Product'}`.trim(); break;
            case 'tagline': result[field] = 'Premium Quality Product'; break;
            case 'description': result[field] = 'High-quality product with excellent features.'; break;
            case 'keywords': result[field] = 'quality, premium, durable'; break;
            case 'features': result[field] = '• High-quality materials\n• Great value for money\n• Reliable performance'; break;
            case 'hashtags': result[field] = '#quality #premium #style #fashion #trendy'; break;
          }
        });
      }

      res.json(result);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      const fallback = {
        title: `${req.body.brand || ''} ${req.body.productType || 'Product'}`.trim(),
        tagline: 'Premium Quality Product',
        description: 'High-quality product with excellent features and great value for money.',
        keywords: 'quality, premium, durable, stylish, comfortable',
        features: '• High-quality materials\n• Great value for money\n• Reliable performance\n• Stylish design',
        hashtags: '#quality #premium #style #fashion #trendy #lifestyle',
        error: 'Generated copy with fallback data due to parsing error'
      };
      res.json(fallback);
    }
  });

  python.stdin.write(JSON.stringify(req.body));
  python.stdin.end();
});

// // POST: Upload Final Product
app.post('/upload-product', (req, res) => {
  try {
    const requiredFields = ['brand', 'productType', 'sellingPrice'];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}`, missingFields });
    }

    if (!req.body.generatedCopy || !req.body.generatedCopy.title) {
      return res.status(400).json({ error: 'Generated copy is required. Please generate copy first.', missingCopy: true });
    }

    setTimeout(() => {
      res.json({
        success: true,
        message: 'Product uploaded successfully!',
        productId: Date.now(),
        uploadedData: {
          productInfo: {
            brand: req.body.brand,
            productType: req.body.productType,
            sku: req.body.sku,
            sellingPrice: req.body.sellingPrice,
            category: req.body.category
          },
          generatedCopy: req.body.generatedCopy,
          uploadedAt: req.body.uploadedAt
        }
      });
    }, 1000);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload product', details: error.message });
  }
});

// // GET: Fetch uploaded products (mock)
app.get('/products', (req, res) => {
  res.json({
    message: 'Products endpoint - would return list of uploaded products',
    note: 'This is a mock endpoint for testing purposes'
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
