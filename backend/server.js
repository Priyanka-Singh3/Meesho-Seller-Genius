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

app.post('/remove-background', upload.single('image'), async (req, res) => {
  let imageBuffer;
  
  // Check if image was uploaded as file or provided as URL
  if (req.file) {
    // File upload
    imageBuffer = req.file.buffer;
    console.log(`Processing uploaded file, size: ${imageBuffer.length} bytes`);
  } else if (req.body.image_url) {
    // URL provided
    try {
      console.log(`Downloading image from URL: ${req.body.image_url}`);
      const response = await axios.get(req.body.image_url, {
        responseType: 'arraybuffer',
        timeout: 10000, // 10 second timeout
        maxContentLength: 10 * 1024 * 1024, // 10MB max
      });
      
      imageBuffer = Buffer.from(response.data);
      console.log(`Downloaded image, size: ${imageBuffer.length} bytes`);
    } catch (downloadError) {
      console.error(`Failed to download image: ${downloadError.message}`);
      return res.status(400).json({ 
        error: 'Failed to download image from URL. Please check the URL is valid and accessible.' 
      });
    }
  } else {
    return res.status(400).json({ 
      error: 'No image provided. Send either a file upload or image_url in the request body.' 
    });
  }

  const bgColor = req.body.bg_color || '#ffffff';
  
  // Validate color format
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!colorRegex.test(bgColor)) {
    return res.status(400).json({ error: 'Invalid color format. Use hex format like #ffffff' });
  }

  console.log(`Processing background removal with color: ${bgColor}`);

  // Python command detection
  let pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
  
  // Flag to prevent multiple responses
  let responseHandled = false;
  
  const sendResponse = (statusCode, data) => {
    if (!responseHandled && !res.headersSent) {
      responseHandled = true;
      if (statusCode === 200) {
        res.set({
          'Content-Type': 'image/png',
          'Content-Length': data.length,
          'Cache-Control': 'no-cache'
        });
        res.send(data);
      } else {
        res.status(statusCode).json(data);
      }
    }
  };

  const python = spawn(pythonCmd, [path.join(__dirname, 'python', 'rm_bg.py'), bgColor]);
  
  // Increased timeout for rembg processing
  const timeout = setTimeout(() => {
    if (!python.killed) {
      console.log('Process timeout, killing Python script...');
      python.kill('SIGKILL'); // Force kill
      sendResponse(500, { error: 'Processing timeout - operation took too long' });
    }
  }, 600000); // 2 minutes timeout for rembg

  let base64Image = '';
  let errorOutput = '';

  // Handle Python process errors
  python.on('error', (error) => {
    clearTimeout(timeout);
    console.error(`Failed to start Python script: ${error}`);
    
    if (error.code === 'ENOENT') {
      if (process.platform === 'win32' && pythonCmd === 'python') {
        console.log('Retrying with "py" command...');
        retryWithPyCommand();
        return;
      }
      sendResponse(500, { 
        error: 'Python not found. Please ensure Python is installed and added to PATH.' 
      });
    } else {
      sendResponse(500, { error: 'Failed to start background removal process' });
    }
  });

  // Function to retry with 'py' command on Windows
  const retryWithPyCommand = () => {
    const pythonRetry = spawn('py', [path.join(__dirname, 'python', 'rm_bg.py'), bgColor]);
    
    pythonRetry.on('error', (retryError) => {
      console.error(`Failed with py command: ${retryError}`);
      sendResponse(500, { 
        error: 'Python not found. Please install Python and ensure it\'s in PATH.' 
      });
    });

    setupPythonHandlers(pythonRetry);
  };

  // Function to set up Python process handlers
  const setupPythonHandlers = (pythonProcess) => {
    // Send image data to Python script
    try {
      pythonProcess.stdin.write(imageBuffer);
      pythonProcess.stdin.end();
    } catch (writeError) {
      console.error(`Failed to write to Python stdin: ${writeError}`);
      sendResponse(500, { error: 'Failed to send image data to processor' });
      return;
    }

    // Collect stdout (base64 image)
    pythonProcess.stdout.on('data', (data) => {
      base64Image += data.toString();
    });

    // Collect stderr (error messages and logs)
    pythonProcess.stderr.on('data', (data) => {
      const errorMsg = data.toString();
      console.log(`Python log: ${errorMsg.trim()}`);
      errorOutput += errorMsg;
    });

    // Handle script completion
    pythonProcess.on('close', (code) => {
      clearTimeout(timeout);
      console.log(`Python process closed with code: ${code}`);
      
      if (code !== 0 && code !== null) {
        console.error(`Python script failed with code ${code}`);
        console.error(`Error output: ${errorOutput}`);
        
        // Provide specific error messages
        if (errorOutput.includes('rembg not installed') || errorOutput.includes('No module named')) {
          sendResponse(500, { 
            error: 'rembg library not installed. Please install with: pip install rembg[cpu]' 
          });
        } else if (errorOutput.includes('Failed to load input image')) {
          sendResponse(400, { 
            error: 'Invalid image format. Please upload a valid image file.' 
          });
        } else if (errorOutput.includes('onnxruntime')) {
          sendResponse(500, { 
            error: 'Missing onnxruntime. Please install with: pip install onnxruntime' 
          });
        } else {
          sendResponse(500, { 
            error: 'Background removal failed. Check server logs for details.' 
          });
        }
        return;
      }

      // Handle case where process was killed (code null)
      if (code === null) {
        console.error('Python process was killed or crashed');
        sendResponse(500, { 
          error: 'Background removal process was interrupted. This might be due to memory issues or model loading problems.' 
        });
        return;
      }

      try {
        const cleanBase64 = base64Image.trim();
        if (!cleanBase64) {
          throw new Error('No image data returned from Python script');
        }
        
        const imgBuffer = Buffer.from(cleanBase64, 'base64');
        console.log(`Successfully processed image, output size: ${imgBuffer.length} bytes`);
        sendResponse(200, imgBuffer);
        
      } catch (decodeError) {
        console.error(`Failed to decode base64 output: ${decodeError}`);
        console.error(`Base64 length: ${base64Image.length}, First 100 chars: ${base64Image.substring(0, 100)}`);
        sendResponse(500, { error: 'Failed to process image output' });
      }
    });

    // Handle process exit
    pythonProcess.on('exit', (code, signal) => {
      if (signal) {
        console.log(`Python process killed with signal: ${signal}`);
      }
    });
  };

  // Set up handlers for the initial Python process
  setupPythonHandlers(python);
});

// POST: Remove Background - Updated with 10 minute timeout and Render optimizations

app.post('/remove-background', upload.single('image'), async (req, res) => {
  let imageBuffer;
  
  // Check if image was uploaded as file or provided as URL
  if (req.file) {
    // File upload
    imageBuffer = req.file.buffer;
    console.log(`Processing uploaded file, size: ${imageBuffer.length} bytes`);
  } else if (req.body.image_url) {
    // URL provided
    try {
      console.log(`Downloading image from URL: ${req.body.image_url}`);
      const response = await axios.get(req.body.image_url, {
        responseType: 'arraybuffer',
        timeout: 10000, // 10 second timeout
        maxContentLength: 10 * 1024 * 1024, // 10MB max
      });
      
      imageBuffer = Buffer.from(response.data);
      console.log(`Downloaded image, size: ${imageBuffer.length} bytes`);
    } catch (downloadError) {
      console.error(`Failed to download image: ${downloadError.message}`);
      return res.status(400).json({ 
        error: 'Failed to download image from URL. Please check the URL is valid and accessible.' 
      });
    }
  } else {
    return res.status(400).json({ 
      error: 'No image provided. Send either a file upload or image_url in the request body.' 
    });
  }

  const bgColor = req.body.bg_color || '#ffffff';
  
  // Validate color format
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!colorRegex.test(bgColor)) {
    return res.status(400).json({ error: 'Invalid color format. Use hex format like #ffffff' });
  }

  console.log(`Processing background removal with color: ${bgColor}`);

  // Python command detection - improved for different environments
  let pythonCmd = 'python3'; // Default to python3
  if (process.platform === 'win32') {
    pythonCmd = 'python'; // Windows usually uses 'python'
  }
  
  // Flag to prevent multiple responses
  let responseHandled = false;
  
  const sendResponse = (statusCode, data) => {
    if (!responseHandled && !res.headersSent) {
      responseHandled = true;
      if (statusCode === 200) {
        res.set({
          'Content-Type': 'image/png',
          'Content-Length': data.length,
          'Cache-Control': 'no-cache'
        });
        res.send(data);
      } else {
        res.status(statusCode).json(data);
      }
    }
  };

  // Send progress updates to prevent Render from timing out
  const progressInterval = setInterval(() => {
    if (!responseHandled) {
      console.log('Background removal still processing...');
      // Keep the connection alive
      res.write(''); // Empty write to keep connection alive
    }
  }, 30000); // Every 30 seconds

  const python = spawn(pythonCmd, [path.join(__dirname, 'python', 'rm_bg.py'), bgColor], {
    // Optimize for cloud deployment
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { 
      ...process.env,
      PYTHONUNBUFFERED: '1', // Ensure immediate output
      OMP_NUM_THREADS: '1',   // Limit OpenMP threads for memory efficiency
      NUMBA_CACHE_DIR: '/tmp' // Use /tmp for Numba cache on Linux
    }
  });
  
  // INCREASED TIMEOUT TO 10 MINUTES (600000ms)
  const timeout = setTimeout(() => {
    clearInterval(progressInterval);
    if (!python.killed) {
      console.log('Process timeout after 10 minutes, killing Python script...');
      python.kill('SIGTERM'); // Try graceful termination first
      
      // Force kill after 5 seconds if graceful termination fails
      setTimeout(() => {
        if (!python.killed) {
          python.kill('SIGKILL');
        }
      }, 5000);
      
      sendResponse(500, { error: 'Processing timeout - operation took longer than 10 minutes' });
    }
  }, 600000); // 10 MINUTES TIMEOUT

  let base64Image = '';
  let errorOutput = '';

  // Handle Python process errors
  python.on('error', (error) => {
    clearTimeout(timeout);
    clearInterval(progressInterval);
    console.error(`Failed to start Python script: ${error}`);
    
    if (error.code === 'ENOENT') {
      if (process.platform === 'win32' && pythonCmd === 'python') {
        console.log('Retrying with "py" command...');
        retryWithPyCommand();
        return;
      }
      sendResponse(500, { 
        error: 'Python not found. Please ensure Python is installed and added to PATH.' 
      });
    } else {
      sendResponse(500, { error: 'Failed to start background removal process' });
    }
  });

  // Function to retry with 'py' command on Windows
  const retryWithPyCommand = () => {
    const pythonRetry = spawn('py', [path.join(__dirname, 'python', 'rm_bg.py'), bgColor], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { 
        ...process.env,
        PYTHONUNBUFFERED: '1',
        OMP_NUM_THREADS: '1',
        NUMBA_CACHE_DIR: '/tmp'
      }
    });
    
    pythonRetry.on('error', (retryError) => {
      clearInterval(progressInterval);
      console.error(`Failed with py command: ${retryError}`);
      sendResponse(500, { 
        error: 'Python not found. Please install Python and ensure it\'s in PATH.' 
      });
    });

    setupPythonHandlers(pythonRetry);
  };

  // Function to set up Python process handlers
  const setupPythonHandlers = (pythonProcess) => {
    // Send image data to Python script with error handling
    try {
      pythonProcess.stdin.write(imageBuffer);
      pythonProcess.stdin.end();
      console.log('Image data sent to Python script successfully');
    } catch (writeError) {
      clearTimeout(timeout);
      clearInterval(progressInterval);
      console.error(`Failed to write to Python stdin: ${writeError}`);
      sendResponse(500, { error: 'Failed to send image data to processor' });
      return;
    }

    // Collect stdout (base64 image) with progress logging
    pythonProcess.stdout.on('data', (data) => {
      const chunk = data.toString();
      base64Image += chunk;
      // Log progress without flooding console
      if (base64Image.length % 10000 === 0) {
        console.log(`Received ${base64Image.length} bytes of output...`);
      }
    });

    // Collect stderr (error messages and logs)
    pythonProcess.stderr.on('data', (data) => {
      const errorMsg = data.toString();
      console.log(`Python log: ${errorMsg.trim()}`);
      errorOutput += errorMsg;
    });

    // Handle script completion
    pythonProcess.on('close', (code) => {
      clearTimeout(timeout);
      clearInterval(progressInterval);
      console.log(`Python process closed with code: ${code}`);
      
      if (code !== 0 && code !== null) {
        console.error(`Python script failed with code ${code}`);
        console.error(`Error output: ${errorOutput}`);
        
        // Provide specific error messages
        if (errorOutput.includes('rembg not installed') || errorOutput.includes('No module named')) {
          sendResponse(500, { 
            error: 'rembg library not installed. Please install with: pip install rembg[cpu]' 
          });
        } else if (errorOutput.includes('Failed to load input image')) {
          sendResponse(400, { 
            error: 'Invalid image format. Please upload a valid image file.' 
          });
        } else if (errorOutput.includes('onnxruntime')) {
          sendResponse(500, { 
            error: 'Missing onnxruntime. Please install with: pip install onnxruntime' 
          });
        } else if (errorOutput.includes('CUDA') || errorOutput.includes('GPU')) {
          sendResponse(500, { 
            error: 'GPU/CUDA error. Running in CPU mode. This may take longer.' 
          });
        } else if (errorOutput.includes('Memory') || errorOutput.includes('memory')) {
          sendResponse(500, { 
            error: 'Insufficient memory. Try with a smaller image or restart the service.' 
          });
        } else {
          sendResponse(500, { 
            error: 'Background removal failed. Check server logs for details.',
            details: errorOutput.substring(0, 200) // First 200 chars of error
          });
        }
        return;
      }

      // Handle case where process was killed (code null)
      if (code === null) {
        console.error('Python process was killed or crashed');
        sendResponse(500, { 
          error: 'Background removal process was interrupted. This might be due to memory issues or model loading problems.' 
        });
        return;
      }

      try {
        const cleanBase64 = base64Image.trim();
        if (!cleanBase64) {
          throw new Error('No image data returned from Python script');
        }
        
        // Validate base64 format
        if (!cleanBase64.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
          throw new Error('Invalid base64 format received');
        }
        
        const imgBuffer = Buffer.from(cleanBase64, 'base64');
        console.log(`Successfully processed image, output size: ${imgBuffer.length} bytes`);
        
        // Validate that we got a reasonable image size
        if (imgBuffer.length < 100) {
          throw new Error('Output image too small, likely corrupted');
        }
        
        sendResponse(200, imgBuffer);
        
      } catch (decodeError) {
        console.error(`Failed to decode base64 output: ${decodeError}`);
        console.error(`Base64 length: ${base64Image.length}, First 100 chars: ${base64Image.substring(0, 100)}`);
        sendResponse(500, { 
          error: 'Failed to process image output',
          details: decodeError.message
        });
      }
    });

    // Handle process exit
    pythonProcess.on('exit', (code, signal) => {
      if (signal) {
        console.log(`Python process killed with signal: ${signal}`);
      }
    });

    // Handle disconnect (important for cloud platforms)
    pythonProcess.on('disconnect', () => {
      console.log('Python process disconnected');
      clearTimeout(timeout);
      clearInterval(progressInterval);
    });
  };

  // Set up handlers for the initial Python process
  setupPythonHandlers(python);

  // Handle client disconnect
  req.on('close', () => {
    console.log('Client disconnected, cleaning up...');
    clearTimeout(timeout);
    clearInterval(progressInterval);
    if (!python.killed) {
      python.kill();
    }
  });
});

// Health check endpoint
app.get('/health/rembg', (req, res) => {
  let pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
  
  const checkPython = (cmd) => {
    const python = spawn(cmd, ['-c', 'import rembg, onnxruntime; print("All dependencies available")']);
    
    let output = '';
    let errorOutput = '';
    
    python.stdout.on('data', (data) => output += data.toString());
    python.stderr.on('data', (data) => errorOutput += data.toString());
    
    python.on('close', (code) => {
      if (code === 0) {
        res.json({ 
          status: 'healthy', 
          rembg: 'available', 
          python_cmd: cmd,
          output: output.trim()
        });
      } else {
        if (process.platform === 'win32' && cmd === 'python') {
          checkPython('py');
        } else {
          res.status(500).json({ 
            status: 'unhealthy', 
            error: errorOutput || 'Dependencies not available',
            python_cmd: cmd
          });
        }
      }
    });
    
    python.on('error', (error) => {
      if (error.code === 'ENOENT') {
        if (process.platform === 'win32' && cmd === 'python') {
          checkPython('py');
        } else {
          res.status(500).json({ status: 'unhealthy', error: 'Python not available' });
        }
      } else {
        res.status(500).json({ status: 'unhealthy', error: error.message });
      }
    });
  };
  
  checkPython(pythonCmd);
});

/*app.post('/remove-background', upload.single('image'), (req, res) => {
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
});*/

// // POST: Generate Product Copy



/*app.post('/generate-copy', (req, res) => {
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
});*/

app.post('/generate-copy', (req, res) => {
  console.log('=== Generate Copy Request Started ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  const scriptPath = path.join(__dirname, 'python', 'generate_copy.py');
  console.log('Python script path:', scriptPath);
  
  // Check if the script file exists
  const fs = require('fs');
  if (!fs.existsSync(scriptPath)) {
    console.error('Python script not found at:', scriptPath);
    return res.status(500).json({
      error: 'Python script not found',
      details: `Script path: ${scriptPath}`,
      fallback: getFallbackData(req.body)
    });
  }
  
  const python = spawn('python', [scriptPath]);
  
  let output = '';
  let errorOutput = '';
  let hasResponded = false;
  
  // Set a timeout to prevent hanging requests
  const timeout = setTimeout(() => {
    if (!hasResponded) {
      hasResponded = true;
      console.error('Python script timeout after 30 seconds');
      python.kill();
      res.status(500).json({
        error: 'Script execution timeout',
        details: 'Python script took too long to respond',
        fallback: getFallbackData(req.body)
      });
    }
  }, 30000); // 30 second timeout
  
  python.stdout.on('data', (data) => {
    const chunk = data.toString();
    console.log('Python stdout chunk:', chunk);
    output += chunk;
  });
  
  python.stderr.on('data', (data) => {
    const chunk = data.toString();
    console.error('Python stderr chunk:', chunk);
    errorOutput += chunk;
  });
  
  python.on('error', (error) => {
    console.error('Python process error:', error);
    clearTimeout(timeout);
    if (!hasResponded) {
      hasResponded = true;
      res.status(500).json({
        error: 'Failed to start Python process',
        details: error.message,
        fallback: getFallbackData(req.body)
      });
    }
  });
  
  python.on('close', (code) => {
    clearTimeout(timeout);
    if (hasResponded) return;
    hasResponded = true;
    
    console.log('Python process closed with code:', code);
    console.log('Full output:', output);
    console.log('Full error output:', errorOutput);
    
    // If there's an error or non-zero exit code
    if (code !== 0 || errorOutput.trim()) {
      console.error('Python script failed with code:', code);
      console.error('Error output:', errorOutput);
      
      // Try to parse partial output first
      if (output.trim()) {
        try {
          const partialResult = JSON.parse(output.trim());
          console.log('Successfully parsed partial result:', partialResult);
          if (partialResult.title || partialResult.description) {
            return res.json(partialResult);
          }
        } catch (parseError) {
          console.error('Failed to parse partial output:', parseError);
        }
      }
      
      // Return error with fallback
      return res.status(500).json({
        error: 'Python script execution failed',
        details: errorOutput || `Process exited with code ${code}`,
        pythonCode: code,
        fallback: getFallbackData(req.body)
      });
    }
    
    // Try to parse the output
    if (!output.trim()) {
      console.error('No output from Python script');
      return res.status(500).json({
        error: 'No output from Python script',
        details: 'Script executed but produced no output',
        fallback: getFallbackData(req.body)
      });
    }
    
    try {
      console.log('Attempting to parse JSON output...');
      const result = JSON.parse(output.trim());
      console.log('Successfully parsed result:', result);
      
      // Validate required fields
      const requiredFields = ['title', 'tagline', 'description', 'keywords', 'features', 'hashtags'];
      const missingFields = requiredFields.filter((field) => !result[field]);
      
      if (missingFields.length > 0) {
        console.log('Missing fields detected:', missingFields);
        missingFields.forEach((field) => {
          switch (field) {
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
      
      console.log('Final result being sent:', result);
      res.json(result);
      
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw output that failed to parse:', JSON.stringify(output));
      
      const fallback = getFallbackData(req.body);
      fallback.error = 'Generated copy with fallback data due to parsing error';
      fallback.parseError = parseError.message;
      fallback.rawOutput = output.substring(0, 500); // First 500 chars for debugging
      
      res.json(fallback);
    }
  });
  
  // Write input to Python script
  try {
    const inputData = JSON.stringify(req.body);
    console.log('Writing to Python stdin:', inputData);
    python.stdin.write(inputData);
    python.stdin.end();
  } catch (writeError) {
    console.error('Error writing to Python stdin:', writeError);
    clearTimeout(timeout);
    if (!hasResponded) {
      hasResponded = true;
      res.status(500).json({
        error: 'Failed to send data to Python script',
        details: writeError.message,
        fallback: getFallbackData(req.body)
      });
    }
  }
});

// Helper function to generate fallback data
function getFallbackData(requestBody) {
  return {
    title: `${requestBody.brand || ''} ${requestBody.productType || 'Product'}`.trim(),
    tagline: 'Premium Quality Product',
    description: 'High-quality product with excellent features and great value for money.',
    keywords: 'quality, premium, durable, stylish, comfortable',
    features: '• High-quality materials\n• Great value for money\n• Reliable performance\n• Stylish design',
    hashtags: '#quality #premium #style #fashion #trendy #lifestyle'
  };
}

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
