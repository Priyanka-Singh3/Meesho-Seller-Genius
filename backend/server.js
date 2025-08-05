const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
// const upload = multer();
require('dotenv').config();

const HF_API_KEY = process.env.HF_API_KEY;
const REMOVEBG_API_KEY=  process.env.REMOVEBG_API_KEY;

const app = express();

// CORS configuration - Allow all origins
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://meesho1-one.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));




//app.use(cors(corsOptions));
// app.use(express.json());

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

// Configure multer with memory management
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    fieldSize: 1024 * 1024,     // 1MB max field size
  },
  fileFilter: (req, file, cb) => {
    console.log(`[${Date.now()}] Receiving file: ${file.originalname}, size: ${file.size || 'unknown'}`);
    cb(null, true);
  }
});

// Add CORS debugging
app.use((req, res, next) => {
  console.log(`[${Date.now()}] ${req.method} ${req.url}`);
  console.log(`[${Date.now()}] Headers:`, req.headers);
  next();
});

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
// app.post('/remove-background', upload.single('image'), async (req, res) => {
//   let imageBuffer;

//   // Check if image was uploaded as file or provided as URL
//   if (req.file) {
//     // File upload
//     imageBuffer = req.file.buffer;
//     console.log(`Processing uploaded file, size: ${imageBuffer.length} bytes`);
//   } else if (req.body.image_url) {
//     // URL provided
//     try {
//       console.log(`Downloading image from URL: ${req.body.image_url}`);
//       const response = await axios.get(req.body.image_url, {
//         responseType: 'arraybuffer',
//         timeout: 10000, // 10 second timeout
//         maxContentLength: 10 * 1024 * 1024, // 10MB max
//       });

//       imageBuffer = Buffer.from(response.data);
//       console.log(`Downloaded image, size: ${imageBuffer.length} bytes`);
//     } catch (downloadError) {
//       console.error(`Failed to download image: ${downloadError.message}`);
//       return res.status(400).json({
//         error: 'Failed to download image from URL. Please check the URL is valid and accessible.'
//       });
//     }
//   } else {
//     return res.status(400).json({
//       error: 'No image provided. Send either a file upload or image_url in the request body.'
//     });
//   }

//   const bgColor = req.body.bg_color || '#ffffff';

//   // Validate color format
//   const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
//   if (!colorRegex.test(bgColor)) {
//     return res.status(400).json({ error: 'Invalid color format. Use hex format like #ffffff' });
//   }

//   // Check if Remove.bg API key is configured
//   if (!process.env.REMOVEBG_API_KEY) {
//     console.warn('REMOVEBG_API_KEY not found in environment variables');
//     // Don't return error immediately - let Python script handle it with better error message
//   }

//   console.log(`Processing background removal with Remove.bg API, color: ${bgColor}`);

//   // Python command detection
//   let pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

//   // Flag to prevent multiple responses
//   let responseHandled = false;

//   const sendResponse = (statusCode, data) => {
//     if (!responseHandled && !res.headersSent) {
//       responseHandled = true;
//       clearTimeout(timeout); // Clear timeout when sending response
      
//       if (statusCode === 200) {
//         res.set({
//           'Content-Type': 'image/jpeg',
//           'Content-Length': data.length,
//           'Cache-Control': 'no-cache'
//         });
//         res.send(data);
//       } else {
//         res.status(statusCode).json(data);
//       }
      
//       console.log(`Response sent with status: ${statusCode}`);
//     } else {
//       console.log(`Attempted to send response but already handled or headers sent (status: ${statusCode})`);
//     }
//   };

//   // Utility function to safely kill a process
//   const safeKillProcess = (process, signal = 'SIGTERM') => {
//     try {
//       if (process && !process.killed) {
//         console.log(`Sending ${signal} to Python process (PID: ${process.pid})`);
//         process.kill(signal);
//         return true;
//       }
//     } catch (error) {
//       console.error(`Error sending ${signal} to process:`, error);
//     }
//     return false;
//   };

//   // Function to retry with 'py' command on Windows
//   const retryWithPyCommand = () => {
//     if (responseHandled) return; // Don't retry if we already responded
    
//     const pythonRetry = spawn('py', [path.join(__dirname, 'python', 'rm_bg.py'), bgColor], {
//       stdio: ['pipe', 'pipe', 'pipe'],
//       env: {
//         ...process.env,
//         PYTHONUNBUFFERED: '1',
//       }
//     });

//     pythonRetry.on('error', (retryError) => {
//       console.error(`Failed with py command: ${retryError}`);
//       sendResponse(500, {
//         error: 'Python not found. Please install Python and ensure it\'s in PATH.'
//       });
//     });

//     setupPythonHandlers(pythonRetry);
//   };

//   // Function to set up Python process handlers
//   const setupPythonHandlers = (pythonProcess) => {
//     let base64Image = '';
//     let errorOutput = '';
//     let processKilled = false;
//     let stdinClosed = false;

//     // Handle stdin errors - suppress EOF errors when process is being killed
//     pythonProcess.stdin.on('error', (error) => {
//       if (!processKilled && error.code !== 'EOF' && error.code !== 'EPIPE') {
//         console.error('Python stdin error:', error);
//         sendResponse(500, { error: 'Failed to communicate with Python process' });
//       } else if (processKilled) {
//         console.log('Ignoring stdin error after process was killed:', error.code);
//       }
//     });

//     // Handle stdin close
//     pythonProcess.stdin.on('close', () => {
//       stdinClosed = true;
//       console.log('Python stdin closed');
//     });

//     // Send image data to Python script
//     const sendImageData = () => {
//       try {
//         if (processKilled || pythonProcess.killed) {
//           console.log('Process already killed, skipping image data send');
//           return;
//         }

//         if (!pythonProcess.stdin || !pythonProcess.stdin.writable) {
//           console.error('Python process stdin not writable');
//           sendResponse(500, { error: 'Failed to send image data to processor' });
//           return;
//         }

//         // Send data in chunks to avoid buffer issues
//         const chunkSize = 8192; // 8KB chunks
//         let offset = 0;

//         const sendChunk = () => {
//           if (processKilled || stdinClosed) {
//             console.log('Process killed or stdin closed during chunk send');
//             return;
//           }

//           if (offset >= imageBuffer.length) {
//             // All data sent, close stdin
//             try {
//               pythonProcess.stdin.end();
//               console.log('Image data sent to Python script successfully');
//             } catch (endError) {
//               if (!processKilled) {
//                 console.error('Error closing stdin:', endError);
//               }
//             }
//             return;
//           }

//           const chunk = imageBuffer.slice(offset, offset + chunkSize);
          
//           try {
//             const canContinue = pythonProcess.stdin.write(chunk);
//             offset += chunk.length;

//             if (canContinue) {
//               // Can write more immediately
//               setImmediate(sendChunk);
//             } else {
//               // Wait for drain event
//               pythonProcess.stdin.once('drain', sendChunk);
//             }
//           } catch (writeError) {
//             if (!processKilled && writeError.code !== 'EOF' && writeError.code !== 'EPIPE') {
//               console.error('Error writing chunk:', writeError);
//               sendResponse(500, { error: 'Failed to send image data to processor' });
//             }
//           }
//         };

//         sendChunk();

//       } catch (error) {
//         if (!processKilled) {
//           console.error(`Failed to start sending image data: ${error}`);
//           sendResponse(500, { error: 'Failed to send image data to processor' });
//         }
//       }
//     };

//     // Start sending image data
//     sendImageData();

//     // Collect stdout (base64 image)
//     pythonProcess.stdout.on('data', (data) => {
//       base64Image += data.toString();
//     });

//     // Collect stderr (error messages and logs)
//     pythonProcess.stderr.on('data', (data) => {
//       const errorMsg = data.toString();
//       console.log(`Python log: ${errorMsg.trim()}`);
//       errorOutput += errorMsg;
//     });

//     // Handle script completion
//     pythonProcess.on('close', (code) => {
//       processKilled = true;
//       clearTimeout(timeout);
//       console.log(`Python process closed with code: ${code}`);

//       if (code !== 0 && code !== null) {
//         console.error(`Python script failed with code ${code}`);
//         console.error(`Error output: ${errorOutput}`);

//         // Provide specific error messages for API-related issues
//         if (errorOutput.includes('Remove.bg API key not configured') || errorOutput.includes('API key not configured')) {
//           sendResponse(500, {
//             error: 'Remove.bg API key not configured. Please contact administrator to set up the API key.'
//           });
//         } else if (errorOutput.includes('API request failed')) {
//           sendResponse(500, {
//             error: 'Remove.bg API request failed. Please check your API key and try again.'
//           });
//         } else if (errorOutput.includes('API request timed out')) {
//           sendResponse(500, {
//             error: 'Remove.bg API request timed out. Please try again.'
//           });
//         } else if (errorOutput.includes('Remove.bg API error')) {
//           // Extract specific API error message
//           const apiErrorMatch = errorOutput.match(/Remove\.bg API error: ([^\n]+)/);
//           const apiError = apiErrorMatch ? apiErrorMatch[1] : 'Unknown API error';
//           sendResponse(400, {
//             error: `Remove.bg API error: ${apiError}`
//           });
//         } else if (errorOutput.includes('Failed to load input image')) {
//           sendResponse(400, {
//             error: 'Invalid image format. Please upload a valid image file.'
//           });
//         } else if (errorOutput.includes('requests')) {
//           sendResponse(500, {
//             error: 'Python requests library not installed. Please install with: pip install requests'
//           });
//         } else {
//           sendResponse(500, {
//             error: 'Background removal failed. Check server logs for details.'
//           });
//         }
//         return;
//       }

//       // Handle case where process was killed (code null)
//       if (code === null) {
//         console.error('Python process was killed or crashed');
//         sendResponse(500, {
//           error: 'Background removal process was interrupted.'
//         });
//         return;
//       }

//       try {
//         const cleanBase64 = base64Image.trim();
//         if (!cleanBase64) {
//           throw new Error('No image data returned from Python script');
//         }

//         const imgBuffer = Buffer.from(cleanBase64, 'base64');
//         console.log(`Successfully processed image with Remove.bg API, output size: ${imgBuffer.length} bytes`);
//         sendResponse(200, imgBuffer);

//       } catch (decodeError) {
//         console.error(`Failed to decode base64 output: ${decodeError}`);
//         console.error(`Base64 length: ${base64Image.length}, First 100 chars: ${base64Image.substring(0, 100)}`);
//         sendResponse(500, { error: 'Failed to process image output' });
//       }
//     });

//     // Handle process exit
//     pythonProcess.on('exit', (code, signal) => {
//       processKilled = true;
//       if (signal) {
//         console.log(`Python process killed with signal: ${signal}`);
//       }
//     });

//     // Handle process error
//     pythonProcess.on('error', (error) => {
//       processKilled = true;
//       console.error('Python process error in handler:', error);
//       if (!responseHandled) {
//         sendResponse(500, { error: 'Python process error occurred' });
//       }
//     });
//   };

//   // Spawn Python process with API script
//   const python = spawn(pythonCmd, [path.join(__dirname, 'python', 'rm_bg.py'), bgColor], {
//     stdio: ['pipe', 'pipe', 'pipe'],
//     env: {
//       ...process.env,
//       PYTHONUNBUFFERED: '1', // Ensure immediate output
//     }
//   });

//   // Improved timeout with better cleanup
//   const timeout = setTimeout(() => {
//     if (!responseHandled) {
//       console.log('Process timeout, cleaning up Python script...');
//       responseHandled = true;
      
//       if (safeKillProcess(python, 'SIGTERM')) {
//         // Give it a moment to terminate gracefully
//         setTimeout(() => {
//           safeKillProcess(python, 'SIGKILL');
//         }, 3000);
//       }

//       sendResponse(500, { error: 'Processing timeout - Remove.bg API call took too long' });
//     }
//   }, 120000); // 2 minutes timeout

//   // Handle Python process errors
//   python.on('error', (error) => {
//     clearTimeout(timeout);
//     console.error(`Failed to start Python script: ${error}`);

//     if (error.code === 'ENOENT') {
//       if (process.platform === 'win32' && pythonCmd === 'python') {
//         console.log('Retrying with "py" command...');
//         retryWithPyCommand();
//         return;
//       }
//       sendResponse(500, {
//         error: 'Python not found. Please ensure Python is installed and added to PATH.'
//       });
//     } else {
//       sendResponse(500, { error: 'Failed to start background removal process' });
//     }
//   });

//   // Set up handlers for the initial Python process
//   setupPythonHandlers(python);

//   // Handle client disconnect with better cleanup
//   req.on('close', () => {
//     console.log('Client disconnected, cleaning up...');
//     responseHandled = true; // Prevent any further responses
//     clearTimeout(timeout);
    
//     if (python && !python.killed) {
//       console.log('Gracefully terminating Python process due to client disconnect...');
      
//       // Close stdin first to allow the process to finish gracefully
//       try {
//         if (python.stdin && !python.stdin.destroyed) {
//           python.stdin.destroy();
//         }
//       } catch (stdinError) {
//         console.log('Stdin already closed or destroyed');
//       }

//       // Give the process a moment to finish naturally
//       setTimeout(() => {
//         if (python && !python.killed) {
//           console.log('Sending SIGTERM to Python process...');
//           try {
//             python.kill('SIGTERM');
            
//             // Force kill if still running after 3 seconds
//             setTimeout(() => {
//               if (python && !python.killed) {
//                 console.log('Force killing Python process with SIGKILL...');
//                 python.kill('SIGKILL');
//               }
//             }, 3000);
//           } catch (killError) {
//             console.error('Error terminating Python process:', killError);
//           }
//         }
//       }, 1000);
//     }
//   });

//   // Handle request abort
//   req.on('aborted', () => {
//     console.log('Request aborted, cleaning up...');
//     responseHandled = true;
//     clearTimeout(timeout);
    
//     if (python && !python.killed) {
//       try {
//         if (python.stdin && !python.stdin.destroyed) {
//           python.stdin.destroy();
//         }
//         python.kill('SIGTERM');
//       } catch (killError) {
//         console.error('Error killing Python process on abort:', killError);
//       }
//     }
//   });
// });

app.get('/health', (req, res) => {
  console.log(`[${Date.now()}] GET /health`);
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Replace your /remove-background route with this SIMPLE version
// app.post('/remove-background', upload.single('image'), async (req, res) => {
//   let imageBuffer;

//   // Handle image input
//   if (req.file) {
//     imageBuffer = req.file.buffer;
//     console.log(`Processing uploaded file, size: ${imageBuffer.length} bytes`);
//   } else if (req.body.image_url) {
//     try {
//       console.log(`Downloading image from URL: ${req.body.image_url}`);
//       const response = await axios.get(req.body.image_url, {
//         responseType: 'arraybuffer',
//         timeout: 10000,
//         maxContentLength: 10 * 1024 * 1024,
//       });
//       imageBuffer = Buffer.from(response.data);
//       console.log(`Downloaded image, size: ${imageBuffer.length} bytes`);
//     } catch (downloadError) {
//       console.error(`Failed to download image: ${downloadError.message}`);
//       return res.status(400).json({
//         error: 'Failed to download image from URL. Please check the URL is valid and accessible.'
//       });
//     }
//   } else {
//     return res.status(400).json({
//       error: 'No image provided. Send either a file upload or image_url in the request body.'
//     });
//   }

//   const bgColor = req.body.bg_color || '#ffffff';
//   const requestId = Date.now();

//   // Validate color format
//   const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
//   if (!colorRegex.test(bgColor)) {
//     return res.status(400).json({ error: 'Invalid color format. Use hex format like #ffffff' });
//   }

//   // Check API key
//   if (!process.env.REMOVEBG_API_KEY) {
//     return res.status(500).json({
//       error: 'Remove.bg API key not configured. Please contact administrator to set up the API key.'
//     });
//   }

//   console.log(`[${requestId}] Processing background removal with Remove.bg API, color: ${bgColor}`);

//   let pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
//   let responseHandled = false;

//   // Simple response handler - NO streaming, NO heartbeats
//   const sendFinalResponse = (statusCode, data, logMessage = '') => {
//     if (responseHandled || res.headersSent) {
//       console.log(`[${requestId}] Response already sent, ignoring: ${logMessage}`);
//       return;
//     }
    
//     responseHandled = true;
    
//     try {
//       if (statusCode === 200) {
//         // Send image directly
//         res.set({
//           'Content-Type': 'image/jpeg',
//           'Content-Length': data.length,
//           'Cache-Control': 'no-cache'
//         });
//         res.send(data);
//         console.log(`[${requestId}] SUCCESS: Image sent, size: ${data.length} bytes`);
//       } else {
//         // Send error
//         res.status(statusCode).json(data);
//         console.log(`[${requestId}] ERROR: ${statusCode} - ${logMessage}`);
//       }
//     } catch (sendError) {
//       console.error(`[${requestId}] Failed to send response:`, sendError);
//     }
//   };

//   // Track client connection
//   let clientConnected = true;
//   let disconnectTime = null;
  
//   // Enhanced client disconnection logging with reasons
//   req.on('close', () => {
//     const socket = req.socket || req.connection;
//     let reason = 'Connection closed normally';
    
//     if (req.aborted) {
//       reason = 'Request aborted by client';
//     } else if (socket && socket.destroyed) {
//       reason = 'Socket destroyed';
//     } else if (socket && (!socket.readable || !socket.writable)) {
//       reason = `Socket not readable/writable (readable: ${socket.readable}, writable: ${socket.writable})`;
//     }
    
//     disconnectTime = Date.now();
//     const timeSinceStart = disconnectTime - requestId;
//     console.log(`[${requestId}] Client disconnected - Reason: ${reason} - After: ${timeSinceStart}ms`);
//     clientConnected = false;
//   });

//   req.on('aborted', () => {
//     disconnectTime = Date.now();
//     const timeSinceStart = disconnectTime - requestId;
//     console.log(`[${requestId}] Client disconnected - Reason: Request was aborted by client - After: ${timeSinceStart}ms`);
//     clientConnected = false;
//   });

//   req.on('error', (err) => {
//     disconnectTime = Date.now();
//     const timeSinceStart = disconnectTime - requestId;
//     console.log(`[${requestId}] Client disconnected - Reason: Request error - ${err.message} - After: ${timeSinceStart}ms`);
//     clientConnected = false;
//   });

//   // Spawn Python process
//   const python = spawn(pythonCmd, [path.join(__dirname, 'python', 'rm_bg.py'), bgColor], {
//     stdio: ['pipe', 'pipe', 'pipe'],
//     env: {
//       ...process.env,
//       PYTHONUNBUFFERED: '1',
//     }
//   });

//   let base64Output = '';
//   let errorOutput = '';
//   let processStarted = false;

//   // Handle Python process startup error
//   python.on('error', (error) => {
//     console.error(`[${requestId}] Failed to start Python:`, error);
    
//     if (error.code === 'ENOENT') {
//       sendFinalResponse(500, { error: 'Python not found. Please ensure Python is installed.' }, 'python not found');
//     } else {
//       sendFinalResponse(500, { error: 'Failed to start background removal process' }, 'startup error');
//     }
//   });

//   // Send image data to Python
//   python.stdin.on('error', (error) => {
//     if (error.code !== 'EOF' && error.code !== 'EPIPE') {
//       console.error(`[${requestId}] Stdin error:`, error);
//       if (!responseHandled) {
//         sendFinalResponse(500, { error: 'Failed to send image data' }, 'stdin error');
//       }
//     }
//   });

//   try {
//     python.stdin.write(imageBuffer);
//     python.stdin.end();
//     processStarted = true;
//     console.log(`[${requestId}] Image data sent to Python (${imageBuffer.length} bytes)`);
//   } catch (writeError) {
//     console.error(`[${requestId}] Failed to write to Python stdin:`, writeError);
//     sendFinalResponse(500, { error: 'Failed to send image data' }, 'write error');
//     return;
//   }

//   // Collect Python output
//   python.stdout.on('data', (data) => {
//     base64Output += data.toString();
//   });

//   python.stderr.on('data', (data) => {
//     const logMsg = data.toString().trim();
//     if (logMsg) {
//       console.log(`[${requestId}] Python: ${logMsg}`);
//       errorOutput += data.toString();
//     }
//   });

//   // Handle Python process completion
//   python.on('close', (code) => {
//     console.log(`[${requestId}] Python process finished with code: ${code}`);

//     // Check if client disconnected and when
//     if (!clientConnected) {
//       const timeSinceDisconnect = disconnectTime ? Date.now() - disconnectTime : 0;
//       console.log(`[${requestId}] Client disconnected ${timeSinceDisconnect}ms ago, but process completed successfully`);
      
//       // If client disconnected very early (less than 5 seconds), it might be a premature timeout
//       // Log this as a potential issue that should be investigated
//       if (disconnectTime && (disconnectTime - requestId) < 5000) {
//         console.warn(`[${requestId}] WARNING: Client disconnected very early (${disconnectTime - requestId}ms after start). Possible premature timeout!`);
//       }
      
//       console.log(`[${requestId}] Not sending response due to client disconnection`);
//       return;
//     }

//     if (code !== 0) {
//       console.error(`[${requestId}] Python failed with code ${code}`);
//       console.error(`[${requestId}] Error output:`, errorOutput);

//       // Parse specific errors
//       if (errorOutput.includes('Remove.bg API key not configured')) {
//         sendFinalResponse(500, { error: 'Remove.bg API key not configured' }, 'no API key');
//       } else if (errorOutput.includes('Remove.bg API error')) {
//         const match = errorOutput.match(/Remove\.bg API error: ([^\n]+)/);
//         const apiError = match ? match[1] : 'API request failed';
//         sendFinalResponse(400, { error: `Remove.bg API error: ${apiError}` }, 'API error');
//       } else if (errorOutput.includes('Invalid image format')) {
//         sendFinalResponse(400, { error: 'Invalid image format' }, 'invalid image');
//       } else {
//         sendFinalResponse(500, { error: 'Background removal failed' }, 'processing failed');
//       }
//       return;
//     }

//     // Success - process base64 output
//     try {
//       const cleanBase64 = base64Output.trim();
//       if (!cleanBase64) {
//         throw new Error('No output received');
//       }

//       const imageBuffer = Buffer.from(cleanBase64, 'base64');
//       console.log(`[${requestId}] Decoded image: ${imageBuffer.length} bytes`);
      
//       sendFinalResponse(200, imageBuffer, 'success');

//     } catch (decodeError) {
//       console.error(`[${requestId}] Failed to decode output:`, decodeError);
//       console.error(`[${requestId}] Base64 length: ${base64Output.length}`);
//       sendFinalResponse(500, { error: 'Failed to process image output' }, 'decode error');
//     }
//   });

//   // Set timeout for the entire process
//   const timeoutHandle = setTimeout(() => {
//     if (!responseHandled) {
//       console.log(`[${requestId}] Process timeout`);
      
//       try {
//         python.kill('SIGTERM');
//         setTimeout(() => python.kill('SIGKILL'), 3000);
//       } catch (killError) {
//         console.error(`[${requestId}] Error killing process:`, killError);
//       }
      
//       sendFinalResponse(500, { error: 'Processing timeout' }, 'timeout');
//     }
//   }, 120000); // 2 minutes

//   // Clear timeout when process completes
//   python.on('close', () => {
//     clearTimeout(timeoutHandle);
//   });
// });

// app.post('/remove-background', upload.single('image'), async (req, res) => {
//   // Add 100ms delay at the start of the API call
//   await new Promise((r) => setTimeout(r, 100));
  
//   let imageBuffer;

//   // Handle image input
//   if (req.file) {
//     imageBuffer = req.file.buffer;
//     console.log(`Processing uploaded file, size: ${imageBuffer.length} bytes`);
//   } else if (req.body.image_url) {
//     try {
//       console.log(`Downloading image from URL: ${req.body.image_url}`);
//       const response = await axios.get(req.body.image_url, {
//         responseType: 'arraybuffer',
//         timeout: 10000,
//         maxContentLength: 10 * 1024 * 1024,
//       });
//       imageBuffer = Buffer.from(response.data);
//       console.log(`Downloaded image, size: ${imageBuffer.length} bytes`);
//     } catch (downloadError) {
//       console.error(`Failed to download image: ${downloadError.message}`);
//       return res.status(400).json({
//         error: 'Failed to download image from URL. Please check the URL is valid and accessible.'
//       });
//     }
//   } else {
//     return res.status(400).json({
//       error: 'No image provided. Send either a file upload or image_url in the request body.'
//     });
//   }

//   const bgColor = req.body.bg_color || '#ffffff';
//   const requestId = Date.now();

//   // Validate color format
//   const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
//   if (!colorRegex.test(bgColor)) {
//     return res.status(400).json({ error: 'Invalid color format. Use hex format like #ffffff' });
//   }

//   // Check API key
//   if (!process.env.REMOVEBG_API_KEY) {
//     return res.status(500).json({
//       error: 'Remove.bg API key not configured. Please contact administrator to set up the API key.'
//     });
//   }

//   console.log(`[${requestId}] Processing background removal with Remove.bg API, color: ${bgColor}`);

//   let pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
//   let responseHandled = false;

//   // Simple response handler - NO streaming, NO heartbeats
//   const sendFinalResponse = (statusCode, data, logMessage = '') => {
//     if (responseHandled || res.headersSent) {
//       console.log(`[${requestId}] Response already sent, ignoring: ${logMessage}`);
//       return;
//     }
    
//     responseHandled = true;
    
//     try {
//       if (statusCode === 200) {
//         // Send image directly
//         res.set({
//           'Content-Type': 'image/jpeg',
//           'Content-Length': data.length,
//           'Cache-Control': 'no-cache'
//         });
//         res.send(data);
//         console.log(`[${requestId}] SUCCESS: Image sent, size: ${data.length} bytes`);
//       } else {
//         // Send error
//         res.status(statusCode).json(data);
//         console.log(`[${requestId}] ERROR: ${statusCode} - ${logMessage}`);
//       }
//     } catch (sendError) {
//       console.error(`[${requestId}] Failed to send response:`, sendError);
//     }
//   };

//   // Track client connection
//   let clientConnected = true;
//   let disconnectTime = null;
  
//   // Enhanced client disconnection logging with reasons
//   req.on('close', () => {
//     const socket = req.socket || req.connection;
//     let reason = 'Connection closed normally';
    
//     if (req.aborted) {
//       reason = 'Request aborted by client';
//     } else if (socket && socket.destroyed) {
//       reason = 'Socket destroyed';
//     } else if (socket && (!socket.readable || !socket.writable)) {
//       reason = `Socket not readable/writable (readable: ${socket.readable}, writable: ${socket.writable})`;
//     }
    
//     disconnectTime = Date.now();
//     const timeSinceStart = disconnectTime - requestId;
//     console.log(`[${requestId}] Client disconnected - Reason: ${reason} - After: ${timeSinceStart}ms`);
//     clientConnected = false;
//   });

//   req.on('aborted', () => {
//     disconnectTime = Date.now();
//     const timeSinceStart = disconnectTime - requestId;
//     console.log(`[${requestId}] Client disconnected - Reason: Request was aborted by client - After: ${timeSinceStart}ms`);
//     clientConnected = false;
//   });

//   req.on('error', (err) => {
//     disconnectTime = Date.now();
//     const timeSinceStart = disconnectTime - requestId;
//     console.log(`[${requestId}] Client disconnected - Reason: Request error - ${err.message} - After: ${timeSinceStart}ms`);
//     clientConnected = false;
//   });

//   // Spawn Python process
//   const python = spawn(pythonCmd, [path.join(__dirname, 'python', 'rm_bg.py'), bgColor], {
//     stdio: ['pipe', 'pipe', 'pipe'],
//     env: {
//       ...process.env,
//       PYTHONUNBUFFERED: '1',
//     }
//   });

//   let base64Output = '';
//   let errorOutput = '';
//   let processStarted = false;

//   // Handle Python process startup error
//   python.on('error', (error) => {
//     console.error(`[${requestId}] Failed to start Python:`, error);
    
//     if (error.code === 'ENOENT') {
//       sendFinalResponse(500, { error: 'Python not found. Please ensure Python is installed.' }, 'python not found');
//     } else {
//       sendFinalResponse(500, { error: 'Failed to start background removal process' }, 'startup error');
//     }
//   });

//   // Send image data to Python
//   python.stdin.on('error', (error) => {
//     if (error.code !== 'EOF' && error.code !== 'EPIPE') {
//       console.error(`[${requestId}] Stdin error:`, error);
//       if (!responseHandled) {
//         sendFinalResponse(500, { error: 'Failed to send image data' }, 'stdin error');
//       }
//     }
//   });

//   try {
//     python.stdin.write(imageBuffer);
//     python.stdin.end();
//     processStarted = true;
//     console.log(`[${requestId}] Image data sent to Python (${imageBuffer.length} bytes)`);
//   } catch (writeError) {
//     console.error(`[${requestId}] Failed to write to Python stdin:`, writeError);
//     sendFinalResponse(500, { error: 'Failed to send image data' }, 'write error');
//     return;
//   }

//   // Collect Python output
//   python.stdout.on('data', (data) => {
//     base64Output += data.toString();
//   });

//   python.stderr.on('data', (data) => {
//     const logMsg = data.toString().trim();
//     if (logMsg) {
//       console.log(`[${requestId}] Python: ${logMsg}`);
//       errorOutput += data.toString();
//     }
//   });

//   // Handle Python process completion
//   python.on('close', (code) => {
//     console.log(`[${requestId}] Python process finished with code: ${code}`);

//     // Check if client disconnected and when
//     if (!clientConnected) {
//       const timeSinceDisconnect = disconnectTime ? Date.now() - disconnectTime : 0;
//       console.log(`[${requestId}] Client disconnected ${timeSinceDisconnect}ms ago, but process completed successfully`);
      
//       // If client disconnected very early (less than 5 seconds), it might be a premature timeout
//       // Log this as a potential issue that should be investigated
//       if (disconnectTime && (disconnectTime - requestId) < 5000) {
//         console.warn(`[${requestId}] WARNING: Client disconnected very early (${disconnectTime - requestId}ms after start). Possible premature timeout!`);
//       }
      
//       console.log(`[${requestId}] Not sending response due to client disconnection`);
//       return;
//     }

//     if (code !== 0) {
//       console.error(`[${requestId}] Python failed with code ${code}`);
//       console.error(`[${requestId}] Error output:`, errorOutput);

//       // Parse specific errors
//       if (errorOutput.includes('Remove.bg API key not configured')) {
//         sendFinalResponse(500, { error: 'Remove.bg API key not configured' }, 'no API key');
//       } else if (errorOutput.includes('Remove.bg API error')) {
//         const match = errorOutput.match(/Remove\.bg API error: ([^\n]+)/);
//         const apiError = match ? match[1] : 'API request failed';
//         sendFinalResponse(400, { error: `Remove.bg API error: ${apiError}` }, 'API error');
//       } else if (errorOutput.includes('Invalid image format')) {
//         sendFinalResponse(400, { error: 'Invalid image format' }, 'invalid image');
//       } else {
//         sendFinalResponse(500, { error: 'Background removal failed' }, 'processing failed');
//       }
//       return;
//     }

//     // Success - process base64 output
//     try {
//       const cleanBase64 = base64Output.trim();
//       if (!cleanBase64) {
//         throw new Error('No output received');
//       }

//       const imageBuffer = Buffer.from(cleanBase64, 'base64');
//       console.log(`[${requestId}] Decoded image: ${imageBuffer.length} bytes`);
      
//       sendFinalResponse(200, imageBuffer, 'success');

//     } catch (decodeError) {
//       console.error(`[${requestId}] Failed to decode output:`, decodeError);
//       console.error(`[${requestId}] Base64 length: ${base64Output.length}`);
//       sendFinalResponse(500, { error: 'Failed to process image output' }, 'decode error');
//     }
//   });

//   // Set timeout for the entire process
//   const timeoutHandle = setTimeout(() => {
//     if (!responseHandled) {
//       console.log(`[${requestId}] Process timeout`);
      
//       try {
//         python.kill('SIGTERM');
//         setTimeout(() => python.kill('SIGKILL'), 3000);
//       } catch (killError) {
//         console.error(`[${requestId}] Error killing process:`, killError);
//       }
      
//       sendFinalResponse(500, { error: 'Processing timeout' }, 'timeout');
//     }
//   }, 120000); // 2 minutes

//   // Clear timeout when process completes
//   python.on('close', () => {
//     clearTimeout(timeoutHandle);
//   });
// });

app.post("/remove-background", upload.single("image"), async (req, res) => {
  const requestId = () => new Date().now();
  let clientConnected = true;
  let disconnectTime = null;

  // "end" event is triggered when all the data from the request body has been received.
  req.on("end", () => {
    console.log(`[${new Date().toISOString()}] ✓ request body fully received`);
  });

  req.on("aborted", () => {
    disconnectTime = Date.now();
    const timeSinceStart = disconnectTime - requestId();
    console.log(
      `[${requestId()}] Client disconnected - Reason: Request was aborted by client - After: ${timeSinceStart}ms`
    );
    clientConnected = false;
  });

  req.on("error", (err) => {
    disconnectTime = Date.now();
    const timeSinceStart = disconnectTime - requestId();
    console.log(
      `[${requestId()}] Client disconnected - Reason: Request error - ${
        err.message
      } - After: ${timeSinceStart}ms`
    );
    clientConnected = false;
  });
  let imageBuffer;

  if (req.file) {
    imageBuffer = req.file.buffer;
  } else if (req.body.image_url) {
    try {
      const response = await axios.get(req.body.image_url, {
        responseType: "arraybuffer",
        timeout: 10000,
        maxContentLength: 10 * 1024 * 1024,
      });
      imageBuffer = Buffer.from(response.data);
      console.log(imageBuffer);
    } catch (downloadError) {
      return res.status(400).json({
        error:
          "Failed to download image from URL. Please check the URL is valid and accessible.",
      });
    }
  } else {
    return res.status(400).json({
      error:
        "No image provided. Send either a file upload or image_url in the request body.",
    });
  }

  const bgColor = req.body.bg_color || "#ffffff";

  // Validate color format
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!colorRegex.test(bgColor)) {
    return res
      .status(400)
      .json({ error: "Invalid color format. Use hex format like #ffffff" });
  }

  // Check API key

  if (!process.env.REMOVEBG_API_KEY) {
    return res.status(500).json({
      error:
        "Remove.bg API key not configured. Please contact administrator to set up the API key.",
    });
  }

  let pythonCmd = process.platform === "win32" ? "python" : "python3";

  // Wrap the Python process in an awaitable Promise for better lifecycle management
  const pythonProcess = () =>
    new Promise((resolve, reject) => {
      const python = spawn(
        pythonCmd,
        [path.join(__dirname, "python", "rm_bg.py"), bgColor],
        {
          //This tells Node.js how to handle the input/output of the Python process.
          //"pipe" means Node will connect to the child's stdin, stdout, and stderr so you can:
          stdio: ["pipe", "pipe", "pipe"],
          env: {
            ...process.env,
            PYTHONUNBUFFERED: "1",
          },
        }
      );

      let base64Output = "";
      let errorOutput = "";

      // Collect output
      python.stdout.on("data", (data) => {
        base64Output += data.toString();
      });

      python.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      // Handle process errors
      python.on("error", (error) => {
        reject(error);
      });

      // Handle stdin errors
      python.stdin.on("error", (error) => {
        if (error.code !== "EOF" && error.code !== "EPIPE") {
          reject(error);
        }
      });

      // Handle process close
      python.on("close", (code) => {
        resolve({ code, base64Output, errorOutput });
      });

      // Send image data to Python
      try {
        python.stdin.write(imageBuffer);
        python.stdin.end();
      } catch (writeError) {
        reject(writeError);
      }

      // Kill Python process if client disconnects before response is sent
      // const disconnectionListener = () => {
      //   python.kill("SIGTERM");
      //   setTimeout(() => python.kill("SIGKILL"), 3000);
      // };
      // req.on("close", disconnectionListener);
      // req.on("aborted", disconnectionListener);
      // req.on("error", disconnectionListener);

      // // Cleanup listeners when process closes
      // python.on("close", () => {
      //   req.removeListener("close", disconnectionListener);
      //   req.removeListener("aborted", disconnectionListener);
      //   req.removeListener("error", disconnectionListener);
      // });
    });

  try {
    console.log("starting the python process.");
    const { code, base64Output, errorOutput } = await pythonProcess();
    console.log(
      "DONE WITH THE python process.",
      code,
      base64Output.length,
      errorOutput
    );

    if (code !== 0) {
      // Parse specific errors from errorOutput
      if (errorOutput.includes("Remove.bg API key not configured")) {
        return res
          .status(500)
          .json({ error: "Remove.bg API key not configured" });
      } else if (errorOutput.includes("Remove.bg API error")) {
        const match = errorOutput.match(/Remove\.bg API error: ([^\n]+)/);
        const apiError = match ? match[1] : "API request failed";
        return res
          .status(400)
          .json({ error: `Remove.bg API error: ${apiError}` });
      } else if (errorOutput.includes("Invalid image format")) {
        return res.status(400).json({ error: "Invalid image format" });
      } else {
        return res.status(500).json({ error: "Background removal failed" });
      }
    }

    // Success - process base64 output
    const cleanBase64 = base64Output.trim();
    if (!cleanBase64) {
      throw new Error("No output received");
    }
    const processedImageBuffer = Buffer.from(cleanBase64, "base64");
    if (!clientConnected || res.writableEnded || res.socket.destroyed) {
      console.log(
        `[${new Date().toISOString()}] skipping res.send(): client gone`
      );
      return;
    }
    res.set({
      "Content-Type": "image/jpeg",
      "Content-Length": processedImageBuffer.length,
      "Cache-Control": "no-cache",
    });
    res.send(processedImageBuffer);
  } catch (error) {
    if (error.message === "Timeout") {
      return res.status(500).json({ error: "Processing timeout" });
    } else if (error.code === "ENOENT") {
      return res.status(500).json({
        error: "Python not found. Please ensure Python is installed.",
      });
    } else if (
      error.message.includes("Failed to send image data") ||
      error.message.includes("Failed to write to Python stdin")
    ) {
      return res.status(500).json({ error: "Failed to send image data" });
    } else if (error.message.includes("Failed to start Python")) {
      return res
        .status(500)
        .json({ error: "Failed to start background removal process" });
    } else if (error.message.includes("Failed to decode output")) {
      return res.status(500).json({ error: "Failed to process image output" });
    } else {
      return res
        .status(500)
        .json({ error: "An unexpected error occurred during processing" });
    }
  }
  console.log("COMPLETED THE python process.");
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

// POST: Generate Product Copy
app.post('/generate-copy', (req, res) => {
  console.log('=== Generate Copy Request Started ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));

  const scriptPath = path.join(__dirname, 'python', 'generate_copy.py');
  console.log('Python script path:', scriptPath);

  // Check if the script file exists
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

// POST: Upload Final Product
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

// GET: Fetch uploaded products (mock)
app.get('/products', (req, res) => {
  res.json({
    message: 'Products endpoint - would return list of uploaded products',
    note: 'This is a mock endpoint for testing purposes'
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});