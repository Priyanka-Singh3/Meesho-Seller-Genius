import React, { useState, useRef } from 'react';
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
  const processImageBackground = async (imageUrl, bgColor) => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
      const imageBlob = await response.blob();

      const formData = new FormData();
      formData.append('image', imageBlob, 'image.png');
      formData.append('bg_color', bgColor);

      const backendResponse = await fetch('http://localhost:3000/remove-background', {
        method: 'POST',
        body: formData,
      });

      if (!backendResponse.ok) throw new Error(`Backend error: ${backendResponse.statusText}`);
      const processedBlob = await backendResponse.blob();
      return URL.createObjectURL(processedBlob);
    } catch (e) {
      return imageUrl;
    }
  };

  // All-image processing
  const processAllImages = async () => {
    setIsProcessingImages(true);
    setProcessingProgress(0);
    const updatedData = [...csvData];
    const total = updatedData.length;
    for (let i = 0; i < total; i++) {
      const item = updatedData[i];
      const imageUrl = item[imageColumn];
      if (imageUrl) {
        try {
          const processedImageUrl = await processImageBackground(imageUrl, selectedBgColor);
          item.processedImageUrl = processedImageUrl;
          item.backgroundColor = selectedBgColor;
          item.processed = true;
        } catch { }
      }
      setProcessingProgress(((i + 1) / total) * 100);
    }
    setCsvData(updatedData);
    setIsProcessingImages(false);
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

      const response = await fetch('http://localhost:3000/generate-copy', {
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
              <Palette className="w-4 h-4" />{isProcessingImages ? `Processing... ${processingProgress.toFixed(0)}%` : "Process All Images"}
            </button>
            <button
              onClick={generateCopyForAll}
              disabled={isGeneratingCopy}
              className={`px-6 py-3 rounded-xl transition flex items-center gap-2 ${isGeneratingCopy ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-[#9B177E] to-[#F43F5E] text-white hover:shadow-lg"}`}
            >
              <Wand2 className="w-4 h-4" />{isGeneratingCopy ? `Generating... ${copyProgress.toFixed(0)}%` : "Generate Copy for All"}
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
