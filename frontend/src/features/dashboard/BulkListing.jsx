import React, { useState, useRef } from 'react';
import axios from 'axios'
import {
  ChevronLeft, ChevronRight, Upload, Eye, Palette, Wand2, Save, Edit2, Check, X, Undo2
} from 'lucide-react';

const colorPresets = [
  '#ffffff', '#f3f4f6', '#e5e7eb', '#d1d5db',
  '#000000', '#1f2937', '#374151', '#4b5563',
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'
];

export default function CSVProductUploadForm() {
  const [csvData, setCsvData] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedBgColor, setSelectedBgColor] = useState('#ffffff');
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [copyProgress, setCopyProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [imageColumn, setImageColumn] = useState('');
  const [editingColors, setEditingColors] = useState({});
  const [individualProcessing, setIndividualProcessing] = useState({});
  const [popupContent, setPopupContent] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


  const fileInputRef = useRef(null);

  // CSV Handling and auto-detect image column
  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n').filter((line) => line.trim() !== "");
        const headers = lines[0].split(',').map((h) => h.trim());
        const possibleImageColumns = headers.filter(
          (h) =>
            h.toLowerCase().includes('image') ||
            h.toLowerCase().includes('photo') ||
            h.toLowerCase().includes('picture') ||
            h.toLowerCase().includes('url')
        );
        if (possibleImageColumns.length > 0) {
          setImageColumn(possibleImageColumns[0]);
        }
        const data = lines.slice(1).map((line, index) => {
          const values = line.split(',').map((v) => v.trim());
          const row = { id: index + 1 };
          headers.forEach((header, i) => {
            row[header] = values[i] || '';
          });
          row.originalImageUrl = row[possibleImageColumns[0]] || '';
          row.backgroundColor = '#ffffff';
          row.processed = false;
          row.copyGenerated = false;
          return row;
        });
        setCsvData(data);
        setCurrentPage(1);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid CSV file');
    }
  };

  // Actual background processing: posts the image to backend and gets the processed image
// Replace your processImageBackground function with this version that handles large files properly:

const processImageBackground = async (imageUrl, bgColor) => {
  console.log('🔍 ULTIMATE DEBUG - Finding exact disconnect cause');
  
  try {
    const imageResponse = await fetch(imageUrl);
    const originalBlob = await imageResponse.blob();
    
    const formData = new FormData();
    formData.append('image', originalBlob, 'image.jpg');
    formData.append('bg_color', bgColor);

    console.log('🚀 Starting XMLHttpRequest with COMPLETE event monitoring...');
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const startTime = Date.now();
      let uploadCompleted = false;
      let disconnectReason = 'unknown';
      
      // Monitor EVERY possible disconnect source
      const logEvent = (event, details = '') => {
        const elapsed = Date.now() - startTime;
        console.log(`[${elapsed}ms] 📊 ${event} ${details}`);
      };
      
      // 1. Monitor readyState changes for anomalies
      xhr.onreadystatechange = () => {
        const states = ['UNSENT', 'OPENED', 'HEADERS_RECEIVED', 'LOADING', 'DONE'];
        logEvent('READYSTATE', `${xhr.readyState} (${states[xhr.readyState]}) Status: ${xhr.status}`);
        
        // Check for premature state changes
        if (xhr.readyState === 4 && xhr.status === 0 && !uploadCompleted) {
          disconnectReason = 'Premature readyState 4 with status 0 - Network error or CORS issue';
          logEvent('💥 DISCONNECT DETECTED', disconnectReason);
        }
      };
      
      // 2. Upload event monitoring
      xhr.upload.onloadstart = () => logEvent('UPLOAD_START');
      xhr.upload.onprogress = (e) => {
        logEvent('UPLOAD_PROGRESS', `${e.loaded}/${e.total} (${((e.loaded/e.total)*100).toFixed(1)}%)`);
      };
      xhr.upload.onload = () => {
        uploadCompleted = true;
        logEvent('✅ UPLOAD_COMPLETE', 'Upload finished successfully');
      };
      xhr.upload.onloadend = () => logEvent('UPLOAD_END');
      xhr.upload.onabort = () => {
        disconnectReason = 'Upload was aborted by browser or user';
        logEvent('💥 UPLOAD_ABORT', disconnectReason);
      };
      xhr.upload.onerror = (e) => {
        disconnectReason = `Upload error: ${e.type} - ${e.message || 'Unknown upload error'}`;
        logEvent('💥 UPLOAD_ERROR', disconnectReason);
      };
      xhr.upload.ontimeout = () => {
        disconnectReason = 'Upload timeout';
        logEvent('💥 UPLOAD_TIMEOUT', disconnectReason);
      };
      
      // 3. Download/Response monitoring
      xhr.onloadstart = () => logEvent('RESPONSE_START');
      xhr.onprogress = (e) => {
        if (e.lengthComputable) {
          logEvent('RESPONSE_PROGRESS', `${e.loaded}/${e.total} (${((e.loaded/e.total)*100).toFixed(1)}%)`);
        } else {
          logEvent('RESPONSE_PROGRESS', `${e.loaded} bytes (unknown total)`);
        }
      };
      xhr.onload = () => {
        logEvent('✅ RESPONSE_COMPLETE', `Status: ${xhr.status}, Response size: ${xhr.response?.byteLength || 'unknown'}`);
        
        if (xhr.status === 200) {
          const blob = new Blob([xhr.response], { type: 'image/jpeg' });
          resolve(URL.createObjectURL(blob));
        } else {
          disconnectReason = `HTTP error: ${xhr.status} - ${xhr.statusText}`;
          logEvent('💥 HTTP_ERROR', disconnectReason);
          reject(new Error(disconnectReason));
        }
      };
      xhr.onloadend = () => logEvent('RESPONSE_END');
      
      // 4. Error event monitoring
      xhr.onabort = () => {
        disconnectReason = 'Request was aborted';
        logEvent('💥 REQUEST_ABORT', disconnectReason);
        reject(new Error(disconnectReason));
      };
      xhr.onerror = (e) => {
        disconnectReason = `Network error: ${e.type} - readyState: ${xhr.readyState}, status: ${xhr.status}`;
        logEvent('💥 NETWORK_ERROR', disconnectReason);
        
        // Additional error diagnosis
        if (xhr.status === 0) {
          if (xhr.readyState === 4) {
            disconnectReason += ' - CORS error or server unreachable';
          } else {
            disconnectReason += ' - Connection dropped during request';
          }
        }
        
        reject(new Error(disconnectReason));
      };
      xhr.ontimeout = () => {
        disconnectReason = `Timeout after ${xhr.timeout}ms`;
        logEvent('💥 TIMEOUT', disconnectReason);
        reject(new Error(disconnectReason));
      };
      
      // 5. Monitor browser events that could cause disconnection
      const beforeUnloadHandler = () => {
        logEvent('⚠️ BROWSER_BEFOREUNLOAD', 'User navigating away or closing tab');
      };
      
      const visibilityChangeHandler = () => {
        if (document.hidden) {
          logEvent('⚠️ PAGE_HIDDEN', 'Tab became hidden - browser may throttle');
        } else {
          logEvent('ℹ️ PAGE_VISIBLE', 'Tab became visible again');
        }
      };
      
      window.addEventListener('beforeunload', beforeUnloadHandler);
      document.addEventListener('visibilitychange', visibilityChangeHandler);
      
      // 6. Set up connection monitoring
      const connectionMonitor = setInterval(() => {
        if (!navigator.onLine) {
          disconnectReason = 'Internet connection lost';
          logEvent('💥 CONNECTION_LOST', disconnectReason);
          clearInterval(connectionMonitor);
          xhr.abort();
        }
      }, 1000);
      
      // 7. Configure and send request
      logEvent('CONFIG', 'Configuring XMLHttpRequest...');
      xhr.open('POST', `${API_BASE_URL}/remove-background`);
      xhr.responseType = 'arraybuffer';
      xhr.timeout = 180000; // 3 minutes
      
      // 8. Send with error catching
      logEvent('SEND', 'Calling xhr.send()...');
      try {
        xhr.send(formData);
        logEvent('SEND_SUCCESS', 'xhr.send() completed without throwing');
      } catch (sendError) {
        disconnectReason = `Send error: ${sendError.message}`;
        logEvent('💥 SEND_ERROR', disconnectReason);
        clearInterval(connectionMonitor);
        window.removeEventListener('beforeunload', beforeUnloadHandler);
        document.removeEventListener('visibilitychange', visibilityChangeHandler);
        reject(new Error(disconnectReason));
        return;
      }
      
      // 9. Cleanup timeout
      const cleanup = () => {
        clearInterval(connectionMonitor);
        window.removeEventListener('beforeunload', beforeUnloadHandler);
        document.removeEventListener('visibilitychange', visibilityChangeHandler);
      };
      
      // Override resolve/reject to include cleanup
      const originalResolve = resolve;
      const originalReject = reject;
      
      resolve = (value) => {
        cleanup();
        logEvent('🎉 FINAL_SUCCESS', 'Request completed successfully');
        originalResolve(value);
      };
      
      reject = (error) => {
        cleanup();
        logEvent('💥 FINAL_FAILURE', `Final disconnect reason: ${disconnectReason}`);
        originalReject(error);
      };
    });
    
  } catch (error) {
    console.error('💥 Outer catch:', error.message);
    throw error;
  }
};



// Test with maximum monitoring
const runUltimateTest = async () => {
  console.clear();
  console.log('🚀 RUNNING ULTIMATE DISCONNECT DETECTION TEST\n');
  
  if (!csvData.length) {
    alert('Load CSV first!');
    return;
  }
  
  const itemWithImage = csvData.find(item => item[imageColumn]);
  if (!itemWithImage) {
    alert('No images found!');
    return;
  }
  
  console.log('🖼️ Testing with:', itemWithImage[imageColumn]);
  console.log('⏰ Starting at:', new Date().toISOString());
  
  try {
    const result = await processImageBackground(itemWithImage[imageColumn], '#ff0000');
    console.log('✅ SUCCESS - No disconnect detected!');
    alert('✅ SUCCESS! Check console for complete event timeline.');
    
    // Show result
    const img = document.createElement('img');
    img.src = result;
    img.style.maxWidth = '300px';
    img.style.border = '3px solid green';
    document.body.appendChild(img);
    
  } catch (error) {
    console.error('💥 ULTIMATE TEST FAILED:', error.message);
    console.log('\n📋 DISCONNECT ANALYSIS:');
    console.log('- Check the logs above for the exact event sequence');
    console.log('- Look for any events marked with 💥');
    console.log('- Note the timing between UPLOAD_COMPLETE and any errors');
    
    alert(`Test failed: ${error.message}\nCheck console for detailed analysis.`);
  }
};

const checkBrowserEnvironment = () => {
  console.log('🔍 BROWSER ENVIRONMENT CHECK:');
  console.log('- User Agent:', navigator.userAgent);
  console.log('- Browser online:', navigator.onLine);
  console.log('- XMLHttpRequest available:', typeof XMLHttpRequest !== 'undefined');
  console.log('- Fetch available:', typeof fetch !== 'undefined');
  console.log('- FormData available:', typeof FormData !== 'undefined');
  console.log('- Blob available:', typeof Blob !== 'undefined');
  console.log('- Current URL:', window.location.href);
  console.log('- API_BASE_URL:', API_BASE_URL);
  
  // Check for any JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('💥 GLOBAL JS ERROR:', event.error);
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('💥 UNHANDLED PROMISE REJECTION:', event.reason);
  });
};

// Run all diagnostics
const runFullDiagnostics = async () => {
  console.clear();
  console.log('🚀 RUNNING FULL DIAGNOSTICS...\n');
  
  checkBrowserEnvironment();
  await testDifferentApproaches();
  
  console.log('\n📋 DIAGNOSIS COMPLETE - Check the logs above for the exact failure point!');
};
// Alternative version with progress tracking using ReadableStream
const processImageBackgroundWithProgress = async (imageUrl, bgColor, onProgress) => {
  console.log('🔵 Starting background removal with progress tracking...');
  
  try {
    const imageResponse = await fetch(imageUrl);
    const originalBlob = await imageResponse.blob();
    
    const formData = new FormData();
    formData.append('image', originalBlob, 'image.jpg');
    formData.append('bg_color', bgColor);

    const controller = new AbortController();
    const startTime = Date.now();
    
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 120000);

    const response = await fetch(`${API_BASE_URL}/remove-background`, {
      method: 'POST',
      body: formData,
      //signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    // Track download progress if possible
    const contentLength = response.headers.get('content-length');
    if (contentLength && onProgress) {
      const total = parseInt(contentLength, 10);
      let loaded = 0;

      const reader = response.body.getReader();
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        
        const progress = (loaded / total) * 100;
        onProgress(progress);
        console.log(`📥 Download progress: ${progress.toFixed(1)}%`);
      }

      const blob = new Blob(chunks);
      return URL.createObjectURL(blob);
    } else {
      // Fallback to regular blob processing
      const resultBlob = await response.blob();
      return URL.createObjectURL(resultBlob);
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    return imageUrl;
  }
};

// Test function to verify the fix
const testImageUpload = async () => {
  console.log('🧪 Testing image upload with Fetch API...');
  
  if (csvData.length === 0) {
    alert('Please upload a CSV with images first');
    return;
  }
  
  const itemWithImage = csvData.find(item => item[imageColumn]);
  if (!itemWithImage) {
    alert('No images found in CSV');
    return;
  }
  
  console.log('🖼️ Testing with:', itemWithImage[imageColumn]);
  
  try {
    const result = await processImageBackground(itemWithImage[imageColumn], '#ff0000');
    
    if (result !== itemWithImage[imageColumn]) {
      console.log('✅ Upload test SUCCESS! No more early disconnects!');
      alert('✅ Upload test successful! The Chrome bug is fixed!');
      
      // Show the result image
      const img = document.createElement('img');
      img.src = result;
      img.style.maxWidth = '300px';
      img.style.border = '2px solid green';
      document.body.appendChild(img);
      
    } else {
      console.log('⚠️ Test returned original image (processing may have failed)');
      alert('Test completed but processing may have failed. Check console.');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    alert(`Test failed: ${error.message}`);
  }
};

// Helper function to compress images
const compressImage = (blob, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions (max 1920x1920)
      const maxSize = 1920;
      let { width, height } = img;
      
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(blob);
  });
};

// Test function specifically for large images
const testLargeImageUpload = async () => {
  console.log('🧪 Testing large image upload...');
  
  if (csvData.length === 0) {
    alert('Please upload a CSV with images first');
    return;
  }
  
  const itemWithImage = csvData.find(item => item[imageColumn]);
  if (!itemWithImage) {
    alert('No images found in CSV');
    return;
  }
  
  console.log('🖼️ Testing with:', itemWithImage[imageColumn]);
  
  try {
    const result = await processImageBackground(itemWithImage[imageColumn], '#ff0000');
    
    if (result !== itemWithImage[imageColumn]) {
      console.log('✅ Large image test SUCCESS!');
      alert('Large image test successful! Check console for details.');
    } else {
      console.log('⚠️ Large image test returned original (likely failed)');
      alert('Test completed but may have failed. Check console.');
    }
  } catch (error) {
    console.error('❌ Large image test failed:', error);
    alert(`Test failed: ${error.message}`);
  }
};

 const testBackendConnection = async () => {
    console.log('🧪 Manual backend connection test...');
    console.log('🧪 API_BASE_URL:', API_BASE_URL);
    
    try {
      // Test 1: Simple GET to a basic endpoint
      console.log('Test 1: Testing basic connectivity...');
      const response1 = await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
        mode: 'cors'
      });
      console.log('✅ Basic GET result:', response1.status, response1.statusText);
      
      // Test 2: OPTIONS (CORS preflight)
      console.log('Test 2: Testing CORS with OPTIONS...');
      const response2 = await fetch(`${API_BASE_URL}/remove-background`, { 
        method: 'OPTIONS',
        mode: 'cors'
      });
      console.log('✅ OPTIONS result:', response2.status, response2.statusText);
      console.log('✅ CORS headers:', Object.fromEntries(response2.headers.entries()));
      
      // Test 3: POST with minimal data
      console.log('Test 3: Testing POST with minimal data...');
      const formData = new FormData();
      formData.append('bg_color', '#ffffff');
      
      const response3 = await fetch(`${API_BASE_URL}/remove-background`, { 
        method: 'POST',
        body: formData,
        mode: 'cors'
      });
      console.log('✅ POST result:', response3.status, response3.statusText);
      const text3 = await response3.text();
      console.log('✅ POST response:', text3.substring(0, 200));
      
      console.log('🎉 All connection tests completed successfully');
      alert('Connection tests completed! Check console for details.');
      
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        cause: error.cause
      });
      alert(`Connection test failed: ${error.message}`);
    }
  };


// Alternative: Test with XMLHttpRequest for comparison
const processImageBackgroundXHR = (imageUrl, bgColor) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(imageUrl);
      const imageBlob = await response.blob();
      
      const formData = new FormData();
      formData.append('image', imageBlob, 'image.png');
      formData.append('bg_color', bgColor);

      console.log('🔄 Using XMLHttpRequest instead of fetch...');
      
      const xhr = new XMLHttpRequest();
      
      xhr.onreadystatechange = () => {
        console.log('📡 XHR State changed:', xhr.readyState, xhr.status);
      };
      
      xhr.onload = () => {
        console.log('✅ XHR Load complete');
        if (xhr.status === 200) {
          const blob = new Blob([xhr.response], { type: 'image/jpeg' });
          resolve(URL.createObjectURL(blob));
        } else {
          reject(new Error(`XHR Error: ${xhr.status}`));
        }
      };
      
      xhr.onerror = (error) => {
        console.error('💥 XHR Error:', error);
        reject(error);
      };
      
      xhr.ontimeout = () => {
        console.error('⏰ XHR Timeout');
        reject(new Error('XHR Timeout'));
      };
      
      xhr.onabort = () => {
        console.error('🛑 XHR Aborted');
        reject(new Error('XHR Aborted'));
      };

      xhr.open('POST', `${API_BASE_URL}/remove-background`);
      xhr.responseType = 'arraybuffer';
      xhr.timeout = 300000; // 5 minutes
      xhr.send(formData);
      
    } catch (error) {
      reject(error);
    }
  });
};
// Test function to verify the process
const testBackgroundRemoval = async () => {
  console.log('🧪 Testing background removal...');
  
  // You can call this manually to test
  const testImageUrl = 'path/to/your/test/image.jpg';
  const result = await processImageBackground(testImageUrl, '#ff0000');
  
  console.log('🧪 Test result:', result);
};

  // // All-image processing
  // const processAllImages = async () => {
  //   setIsProcessingImages(true);
  //   setProcessingProgress(0);
  //   const updatedData = [...csvData];
  //   const total = updatedData.length;
  //   for (let i = 0; i < total; i++) {
  //     const item = updatedData[i];
  //     const imageUrl = item[imageColumn];
  //     if (imageUrl) {
  //       try {
  //         const processedImageUrl = await processImageBackground(imageUrl, selectedBgColor);
  //         item.processedImageUrl = processedImageUrl;
  //         item.backgroundColor = selectedBgColor;
  //         item.processed = true;
  //       } catch { }
  //     }
  //     setProcessingProgress(((i + 1) / total) * 100);
  //   }
  //   setCsvData(updatedData);
  //   setIsProcessingImages(false);
  // };

  const processAllImages = async () => {
    setIsProcessingImages(true);
    setProcessingProgress(0);
    const updatedData = [...csvData];

    const itemsWithImages = updatedData.filter(item => item[imageColumn]);
    const total = itemsWithImages.length;

    if (total === 0) {
      setIsProcessingImages(false);
      return;
    }

    let completed = 0;
    const batchSize = 5; // Process 5 images concurrently

    try {
      for (let i = 0; i < itemsWithImages.length; i += batchSize) {
        const batch = itemsWithImages.slice(i, i + batchSize);

        const batchPromises = batch.map(async (item) => {
          try {
            const processedImageUrl = await processImageBackground(item[imageColumn], selectedBgColor);
            item.processedImageUrl = processedImageUrl;
            item.backgroundColor = selectedBgColor;
            item.processed = true;

            return { success: true, item };
          } catch (error) {
            console.error(`Failed to process image for item ${item.id}:`, error);
            return { success: false, item, error };
          }
        });

        // Wait for the entire batch to complete
        const results = await Promise.allSettled(batchPromises);

        // Update progress after batch completion (safer for state updates)
        completed += results.length;
        setProcessingProgress((completed / total) * 100);

        // Update UI after each batch for better responsiveness
        setCsvData([...updatedData]);
      }
    } catch (error) {
      console.error('Batch processing error:', error);
    } finally {
      setIsProcessingImages(false);
    }
  };

  // Per-row image processing
  const processIndividualImage = async (itemId, bgColor) => {
    setIndividualProcessing((prev) => ({ ...prev, [itemId]: true }));
    const updatedData = [...csvData];
    const itemIndex = updatedData.findIndex((item) => item.id === itemId);
    if (itemIndex !== -1) {
      const item = updatedData[itemIndex];
      const imageUrl = item[imageColumn];
      if (imageUrl) {
        try {
          const processedImageUrl = await processImageBackground(imageUrl, bgColor);
          item.processedImageUrl = processedImageUrl;
          item.backgroundColor = bgColor;
          item.processed = true;
          setCsvData(updatedData);
        } catch { }
      }
    }
    setIndividualProcessing((prev) => ({ ...prev, [itemId]: false }));
  };

  const handleRevertToOriginal = (itemId) => {
    const updatedData = csvData.map((item) =>
      item.id === itemId
        ? { ...item, processedImageUrl: '', backgroundColor: '#ffffff', processed: false }
        : item
    );
    setCsvData(updatedData);
  };

  // Generate copy for all rows
  const generateCopyForAll = async () => {
    setIsGeneratingCopy(true);
    setCopyProgress(0);
    const updatedData = [...csvData];
    const total = csvData.length;

    for (let i = 0; i < total; i++) {
      const item = updatedData[i];
      try {
        console.log(`Generating copy for item ${i + 1}/${total}`);
        const generatedCopy = await generateProductCopy(item);
        item.generatedCopy = generatedCopy;
        item.copyGenerated = true;

        // Update the UI immediately for this item
        setCsvData([...updatedData]);

      } catch (error) {
        console.error(`Failed to generate copy for item ${i + 1}:`, error);
        // Continue with next item even if one fails
      }

      setCopyProgress(((i + 1) / total) * 100);
    }

    setCsvData(updatedData);
    setIsGeneratingCopy(false);
    console.log('Copy generation completed for all items');
  };

  const generateProductCopy = async (item) => {
    try {
      console.log('Generating copy for item:', item);

      // Prepare the data in the format expected by the backend
      const requestData = {
        csvRowData: item // Send the entire CSV row data
      };

      const response = await fetch(`${API_BASE_URL}/generate-copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const generatedCopy = await response.json();

      // Check if there was an error in the response
      if (generatedCopy.error) {
        console.warn('Copy generation warning:', generatedCopy.error);
        // Still return the copy even if there was an error, as it might have fallback data
      }

      // Validate the response has the required fields
      const requiredFields = ['title', 'tagline', 'description', 'keywords', 'features', 'hashtags'];
      const missingFields = requiredFields.filter(field => !generatedCopy[field]);

      if (missingFields.length > 0) {
        console.warn('Missing fields in generated copy:', missingFields);
        // Fill in any missing fields with defaults
        missingFields.forEach(field => {
          if (!generatedCopy[field]) {
            switch (field) {
              case 'title':
                generatedCopy[field] = getProductTitle(item);
                break;
              case 'tagline':
                generatedCopy[field] = getProductSubtitle(item);
                break;
              case 'description':
                generatedCopy[field] = `Premium quality ${getProductTitle(item)} with excellent features and great value.`;
                break;
              case 'keywords':
                generatedCopy[field] = Object.values(item).filter(val => val && typeof val === 'string').slice(0, 5).join(', ');
                break;
              case 'features':
                const features = Object.entries(item)
                  .filter(([key, val]) => val && !['id', 'backgroundColor', 'processed', 'copyGenerated', 'processedImageUrl', 'generatedCopy', 'originalImageUrl'].includes(key))
                  .slice(0, 4)
                  .map(([key, val]) => `• ${key}: ${val}`)
                  .join('\n');
                generatedCopy[field] = features || '• High-quality materials\n• Great value for money\n• Reliable performance\n• Stylish design';
                break;
              case 'hashtags':
                const hashtags = Object.entries(item)
                  .filter(([key, val]) => val && typeof val === 'string' && !['id', 'backgroundColor', 'processed', 'copyGenerated', 'processedImageUrl', 'generatedCopy', 'originalImageUrl'].includes(key))
                  .slice(0, 5)
                  .map(([key, val]) => `#${val.replace(/\s+/g, '').toLowerCase()}`)
                  .join(' ');
                generatedCopy[field] = hashtags || '#quality #premium #style #fashion #trendy';
                break;
            }
          }
        });
      }

      console.log('Generated copy successfully:', generatedCopy);
      return generatedCopy;

    } catch (error) {
      console.error('Error generating product copy:', error);

      // Return fallback copy in case of error
      return {
        title: getProductTitle(item),
        tagline: getProductSubtitle(item),
        description: `Premium quality ${getProductTitle(item)} with excellent features and great value for money.`,
        keywords: Object.values(item).filter(val => val && typeof val === 'string').slice(0, 5).join(', '),
        features: Object.entries(item)
          .filter(([key, val]) => val && !['id', 'backgroundColor', 'processed', 'copyGenerated', 'processedImageUrl', 'generatedCopy', 'originalImageUrl'].includes(key))
          .slice(0, 4)
          .map(([key, val]) => `• ${key}: ${val}`)
          .join('\n') || '• High-quality materials\n• Great value for money\n• Reliable performance\n• Stylish design',
        hashtags: Object.entries(item)
          .filter(([key, val]) => val && typeof val === 'string' && !['id', 'backgroundColor', 'processed', 'copyGenerated', 'processedImageUrl', 'generatedCopy', 'originalImageUrl'].includes(key))
          .slice(0, 5)
          .map(([key, val]) => `#${val.replace(/\s+/g, '').toLowerCase()}`)
          .join(' ') || '#quality #premium #style #fashion #trendy',
        error: error.message
      };
    }
  };

  // Simulate upload
  const uploadAllProducts = async () => {
    setIsUploading(true);
    setUploadProgress(0);
    const total = csvData.length;
    for (let i = 0; i < total; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUploadProgress(((i + 1) / total) * 100);
    }
    setIsUploading(false);
    alert('All products uploaded successfully!');
  };

  const getDisplayColumns = () => {
    if (csvData.length === 0) return [];
    const allColumns = Object.keys(csvData[0]).filter(
      (key) => !['backgroundColor', 'processed', 'copyGenerated', 'processedImageUrl', 'generatedCopy', 'originalImageUrl'].includes(key)
    );
    const copyColumns = csvData[0].copyGenerated
      ? ['title', 'tagline', 'description', 'keywords', 'features', 'hashtags']
      : [];
    return [...allColumns, ...copyColumns];
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = csvData.slice(startIndex, endIndex);

  const cellClass =
    "px-4 py-3 text-sm align-top whitespace-pre-line break-words min-w-[200px] max-w-[400px]";

  const getProductTitle = (item) => {
    if (item.generatedCopy?.title) return item.generatedCopy.title;
    const fields = Object.keys(item).filter(
      (key) =>
        !['id', 'backgroundColor', 'processed', 'copyGenerated', 'processedImageUrl', 'generatedCopy', imageColumn].includes(key)
    );
    const titleParts = fields.slice(0, 2).map((field) => item[field]).filter(Boolean);
    return titleParts.join(' ') || 'Product';
  };

  const getProductSubtitle = (item) => {
    if (item.generatedCopy?.tagline) return item.generatedCopy.tagline;
    const fields = Object.keys(item).filter(
      (key) =>
        !['id', 'backgroundColor', 'processed', 'copyGenerated', 'processedImageUrl', 'generatedCopy', imageColumn].includes(key)
    );
    const subtitleParts = fields.slice(2, 5).map((field) => item[field]).filter(Boolean);
    return subtitleParts.join(' • ') || 'Quality Product';
  };

  // Table color picker, popup modal for viewing fields
  const ColorPicker = ({ itemId, currentColor, onColorChange }) => (
    <div className="flex flex-wrap gap-1 mt-2">
      {colorPresets.map((color) => (
        <button
          key={color}
          onClick={() => onColorChange(itemId, color)}
          className={`w-6 h-6 rounded-full border-2 ${currentColor === color ? "border-purple-500" : "border-gray-300"}`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );

  const ImageWithColorControls = ({ item, size = "w-16 h-16" }) => (
    <div className="space-y-2">
      <div className={`${size} bg-gray-100 rounded-lg overflow-hidden relative group`}>
        {item.processedImageUrl || (imageColumn && item[imageColumn]) ? (
          <img
            src={item.processedImageUrl || item[imageColumn]}
            alt="Product"
            className="w-full h-full object-contain"
            style={{ backgroundColor: item.backgroundColor }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
        )}
        {imageColumn && item[imageColumn] && (
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => setEditingColors((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
              className="bg-white text-gray-800 p-1 rounded-full hover:bg-gray-100 transition"
              title="Edit background"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            {item.processed && (
              <button
                onClick={() => handleRevertToOriginal(item.id)}
                className="bg-white text-gray-800 p-1 rounded-full hover:bg-gray-100 transition border ml-1"
                title="Revert to original"
              >
                <Undo2 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
      {editingColors[item.id] && (
        <div className="bg-gray-50 p-2 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium">Background Color</span>
            <div className="flex gap-1">
              <button
                onClick={() => processIndividualImage(item.id, item.backgroundColor)}
                disabled={individualProcessing[item.id]}
                className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 disabled:bg-gray-400"
              >
                {individualProcessing[item.id] ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
              </button>
              <button
                onClick={() => setEditingColors((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
          <ColorPicker itemId={item.id} currentColor={item.backgroundColor} onColorChange={(id, c) => {
            const updatedData = csvData.map((itm) =>
              itm.id === id ? { ...itm, backgroundColor: c } : itm
            );
            setCsvData(updatedData);
          }} />
        </div>
      )}
    </div>
  );

  if (csvData.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F2FC] flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9B177E] to-[#F43F5E] mb-6">
            Upload Product CSV
          </h2>
          <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 mb-6">
            <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Drag and drop your CSV file here, or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-[#9B177E] to-[#F43F5E] text-white px-6 py-3 rounded-xl hover:shadow-lg transition"
            >
              Select CSV File
            </button>
          </div>
          <div className="text-sm text-gray-500"><p>Upload any CSV file with product data. Image columns will be auto-detected.</p></div>
        </div>
      </div>
    );
  }

  /*const TestButton = () => (
    <button
      onClick={testBackendConnection}
      className="px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition flex items-center gap-2"
    >
      🧪 Test Backend
    </button>
  );*/

  return (
    <div className="min-h-screen bg-[#F8F2FC] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9B177E] to-[#F43F5E]">BulkGenius</h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Total Products: {csvData.length}</span>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-500 text-white px-4 py-2 rounded-xl hover:bg-gray-600 transition flex items-center gap-2"
              >
                <Upload className="w-4 h-4" /> New CSV
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Global Background Color</label>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
                  style={{ backgroundColor: selectedBgColor }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                />
                <span className="text-sm text-gray-600">{selectedBgColor}</span>
              </div>
              {showColorPicker && (
                <div className="grid grid-cols-8 gap-1 mt-2">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedBgColor(color)}
                      className={`w-6 h-6 rounded-full border ${selectedBgColor === color ? "border-purple-500 border-2" : "border-gray-300"}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Items per page</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full border border-purple-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#9B177E]"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">View Mode</label>
              <button
                onClick={() => setPreviewMode((p) => !p)}
                className={`w-full px-4 py-2 rounded-xl transition flex items-center justify-center gap-2 ${previewMode ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              >
                <Eye className="w-4 h-4" />{previewMode ? "Table View" : "Preview Mode"}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={processAllImages}
              disabled={isProcessingImages || !imageColumn}
              className={`px-6 py-3 rounded-xl transition flex items-center gap-2 ${isProcessingImages || !imageColumn ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg"}`}
            >
              <Palette className="w-4 h-4" />{isProcessingImages ? `Processing... ` : "Process All Images"}
            </button>
            <button
              onClick={generateCopyForAll}
              disabled={isGeneratingCopy}
              className={`px-6 py-3 rounded-xl transition flex items-center gap-2 ${isGeneratingCopy ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-[#9B177E] to-[#F43F5E] text-white hover:shadow-lg"}`}
            >
              <Wand2 className="w-4 h-4" />{isGeneratingCopy ? `Generating... ` : "Generate Copy for All"}
            </button>
            <button
              onClick={uploadAllProducts}
              disabled={isUploading}
              className={`px-6 py-3 rounded-xl transition flex items-center gap-2 ${isUploading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg"}`}
            >
              <Save className="w-4 h-4" />{isUploading ? `Uploading... ${uploadProgress.toFixed(0)}%` : "Upload All Products"}
            </button>
           
          </div>
        </div>

        {/* Main Body */}
        <div className="bg-white rounded-2xl shadow-xl overflow-x-auto max-w-full">
          {previewMode ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
              {currentItems.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-2xl shadow flex flex-col items-center">
                  <div className="w-28 h-28 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    <img
                      src={item.processedImageUrl || item[imageColumn] || ""}
                      alt="Product"
                      className="object-contain w-full h-full"
                      style={{ backgroundColor: item.backgroundColor }}
                    />
                  </div>
                  <div className="font-semibold text-lg text-center mb-1">
                    {item.generatedCopy?.title || getProductTitle(item)}
                  </div>
                  <div className="text-sm text-gray-600 text-center mb-2 line-clamp-2">
                    {item.generatedCopy?.tagline || getProductSubtitle(item)}
                  </div>
                  <div className="flex gap-1 my-1">
                    {item.processed && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Processed</span>
                    )}
                    {item.copyGenerated && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Copy Generated</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  {getDisplayColumns().map((column) => (
                    <th
                      key={column}
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700 capitalize min-w-[200px] max-w-[400px]"
                    >
                      {column === imageColumn
                        ? "Image"
                        : column.replace(/([A-Z])/g, " $1").trim()}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 min-w-[140px] max-w-[180px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    {getDisplayColumns().map((column) => (
                      <td key={column} className={cellClass}>
                        {column === imageColumn ? (
                          <div className="flex items-center gap-2">
                            <ImageWithColorControls item={item} size="w-20 h-20" />
                            {item.processed && (
                              <button
                                onClick={() => handleRevertToOriginal(item.id)}
                                className="ml-1 px-2 py-1 rounded text-xs bg-gray-200 hover:bg-gray-300 flex items-center gap-1"
                              >
                                <Undo2 className="w-3 h-3" /> Revert
                              </button>
                            )}
                          </div>
                        ) : ["description", "title", "tagline", "keywords", "features", "hashtags"].includes(column) ? (
                          <div className="flex items-center">
                            <span className="text-gray-900 truncate max-w-[220px] inline-block align-middle">
                              {(item.generatedCopy?.[column] || item[column] || "-").slice(0, 40)}
                              {((item.generatedCopy?.[column] || item[column] || "").length > 40) && "..."}
                            </span>
                            <button
                              onClick={() => setPopupContent({
                                label: column.replace(/([A-Z])/g, " $1").trim(),
                                value: item.generatedCopy?.[column] || item[column] || "-"
                              })}
                              className="ml-2 px-2 py-1 rounded text-xs bg-purple-100 hover:bg-purple-200"
                              title="View full"
                            >
                              View
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-900">{item.generatedCopy?.[column] || item[column] || "-"}</span>
                        )}
                      </td>
                    ))}
                    <td className={cellClass}>
                      <div className="flex flex-col gap-1">
                        {item.processed && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full text-center">Processed</span>
                        )}
                        {item.copyGenerated && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full text-center">Copy Generated</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, csvData.length)} of {csvData.length} products
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(Math.ceil(csvData.length / itemsPerPage), 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-lg text-sm ${currentPage === pageNum ? "bg-purple-500 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === Math.ceil(csvData.length / itemsPerPage)}
                className={`p-2 rounded-lg ${currentPage === Math.ceil(csvData.length / itemsPerPage) ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"}`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleCSVUpload}
          className="hidden"
        />

        {/* Modal for viewing long content */}
        {popupContent && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <h3 className="font-bold mb-4">{popupContent.label}</h3>
              <div className="mb-4 whitespace-pre-line text-gray-900 break-words" style={{ maxHeight: '400px', overflowY: 'auto' }}>{popupContent.value}</div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(popupContent.value)}
                  className="bg-gray-200 px-3 py-1 rounded text-xs hover:bg-gray-300"
                >
                  Copy
                </button>
                <button
                  onClick={() => setPopupContent(null)}
                  className="bg-purple-500 text-white px-3 py-1 rounded text-xs hover:bg-purple-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
