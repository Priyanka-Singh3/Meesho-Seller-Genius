// backend/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// POST endpoint to receive image + background color
app.post('/remove-background', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No image uploaded');
  }

  const bgColor = req.body.bg_color || '#ffffff';

  // Spawn Python script
  const python = spawn('python', [
    path.join(__dirname, 'python', 'rm_bg.py'),
    bgColor
  ]);

  // Send image buffer to Python script via stdin
  python.stdin.write(req.file.buffer);
  python.stdin.end();

  let base64Image = '';

  python.stdout.on('data', (data) => {
    base64Image += data.toString();
  });

  python.stderr.on('data', (data) => {
    console.error(`Python error: ${data.toString()}`);
  });

  python.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).send('Python script failed');
    }

    const imgBuffer = Buffer.from(base64Image, 'base64');
    res.set('Content-Type', 'image/png');
    res.send(imgBuffer);
  });
});

// POST endpoint to generate product copy
app.post('/generate-copy', (req, res) => {
  const scriptPath = path.join(__dirname, 'python', 'generate_copy.py');
  const python = spawn('python', [scriptPath]);

  let output = '';
  let errorOutput = '';

  python.stdout.on('data', (data) => {
    output += data.toString();
  });

  python.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  python.on('close', (code) => {
    if (code !== 0 || errorOutput) {
      console.error('Python script error:', errorOutput || `Exited with code ${code}`);
      
      // Try to parse any partial output even if there was an error
      try {
        const partialResult = JSON.parse(output.trim());
        // If we got some data despite error, return it
        if (partialResult.title || partialResult.description) {
          return res.json(partialResult);
        }
      } catch (parseError) {
        // If parsing fails, continue to error response
      }
      
      return res.status(500).json({ 
        error: 'Failed to generate product copy',
        details: errorOutput || 'Unknown error occurred'
      });
    }

    try {
      // Parse the JSON output from Python script
      const result = JSON.parse(output.trim());
      
      // Validate that we have the required fields
      const requiredFields = ['title', 'tagline', 'description', 'keywords', 'features', 'hashtags'];
      const missingFields = requiredFields.filter(field => !result[field]);
      
      if (missingFields.length > 0) {
        console.warn('Missing fields in generated copy:', missingFields);
        // Fill in missing fields with defaults
        missingFields.forEach(field => {
          switch(field) {
            case 'title':
              result[field] = `${req.body.brand || ''} ${req.body.productType || 'Product'}`.trim();
              break;
            case 'tagline':
              result[field] = 'Premium Quality Product';
              break;
            case 'description':
              result[field] = 'High-quality product with excellent features.';
              break;
            case 'keywords':
              result[field] = 'quality, premium, durable';
              break;
            case 'features':
              result[field] = '• High-quality materials\n• Great value for money\n• Reliable performance';
              break;
            case 'hashtags':
              result[field] = '#quality #premium #style #fashion #trendy';
              break;
          }
        });
      }
      
      res.json(result);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw output:', output);
      
      // Return a fallback response with basic product info
      const fallbackResponse = {
        title: `${req.body.brand || ''} ${req.body.productType || 'Product'}`.trim(),
        tagline: 'Premium Quality Product',
        description: 'High-quality product with excellent features and great value for money.',
        keywords: 'quality, premium, durable, stylish, comfortable',
        features: '• High-quality materials\n• Great value for money\n• Reliable performance\n• Stylish design',
        hashtags: '#quality #premium #style #fashion #trendy #lifestyle',
        error: 'Generated copy with fallback data due to parsing error'
      };
      
      res.json(fallbackResponse);
    }
  });

  // Send JSON to Python via stdin
  python.stdin.write(JSON.stringify(req.body));
  python.stdin.end();
});

// POST endpoint to upload final product
app.post('/upload-product', (req, res) => {
  try {
    // Here you would typically save to database
    console.log('Final product data received:', {
      ...req.body,
      // Log structure without sensitive data
      formFields: Object.keys(req.body).filter(key => key !== 'mainImageUrl'),
      generatedCopyFields: req.body.generatedCopy ? Object.keys(req.body.generatedCopy) : [],
      hasImage: !!req.body.mainImageUrl
    });
    
    // Validate required fields
    const requiredFields = ['brand', 'productType', 'sellingPrice'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields
      });
    }
    
    // Validate generated copy
    if (!req.body.generatedCopy || !req.body.generatedCopy.title) {
      return res.status(400).json({
        error: 'Generated copy is required. Please generate copy first.',
        missingCopy: true
      });
    }
    
    // Simulate processing time
    setTimeout(() => {
      res.json({
        success: true,
        message: 'Product uploaded successfully!',
        productId: Date.now(), // Mock product ID
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
    res.status(500).json({ 
      error: 'Failed to upload product',
      details: error.message 
    });
  }
});

// GET endpoint to retrieve uploaded products (optional - for testing)
app.get('/products', (req, res) => {
  // This would typically fetch from database
  res.json({
    message: 'Products endpoint - would return list of uploaded products',
    note: 'This is a mock endpoint for testing purposes'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    endpoints: {
      'POST /generate-copy': 'Generate AI product copy',
      'POST /upload-product': 'Upload final product',
      'POST /remove-background': 'Remove image background',
      'GET /products': 'Get uploaded products',
      'GET /health': 'Health check'
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});