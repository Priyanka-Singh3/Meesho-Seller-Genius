import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import meeshoLogo from '../../assets/meesho-logo.png';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import starsIcon from '../../assets/stars.png';
import { Popover } from '@headlessui/react';
import InstagramPreview from '../../components/social-media/InstagramPreview';
import CollagePreview from '../../components/social-media/CollagePreview';
import CustomPromptPopover from '../../components/social-media/CustomPromptPopover';
import { safeText, splitTextAndTags, getCollageOptions } from '../../utils/socialMediaHelpers';
import ImageUploader from '../../components/social-media/ImageUploader';
import CollageLayoutSelector from '../../components/social-media/CollageLayoutSelector';
import TextAreaWithAI from '../../components/social-media/TextAreaWithAI';
import LanguageSelector from '../../components/social-media/LanguageSelector';
import FormActions from '../../components/social-media/FormActions';
// Remove: import Modal from '../../components/social-media/CustomPromptPopover';

// const API_URL = 'http://meesho-seller-genius.onrender.com/api/social-media/generate';

const API_URL = 'http://localhost:5050/api/social-media/generate';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'bn', name: 'Bengali' },
  { code: 'mr', name: 'Marathi' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'gu', name: 'Gujarati' },
];

const DEFAULT_LANGUAGE = 'en';

// Add this style for spin animation
const spinStyle = {
  animation: 'spin 1s linear infinite',
};

const SocialMediaPost = () => {
  const [images, setImages] = useState([]); // array of File or url
  const [imagePreviews, setImagePreviews] = useState([]); // array of url
  const [collageLayout, setCollageLayout] = useState('auto'); // 'auto', 'side-by-side', 'grid', 'vertical'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [captions, setCaptions] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef();
  const [dragActive, setDragActive] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(DEFAULT_LANGUAGE);
  const [refiningDescription, setRefiningDescription] = useState(false);
  const [refiningInputDescription, setRefiningInputDescription] = useState(false);
  const [refiningInputCaption, setRefiningInputCaption] = useState(false);
  // State for custom prompt modals
  const [showCustomDescriptionPrompt, setShowCustomDescriptionPrompt] = useState(false);
  const [showCustomCaptionPrompt, setShowCustomCaptionPrompt] = useState(false);
  const customDescPromptRef = useRef(null);
  const customCaptionPromptRef = useRef(null);
  const [customPromptLoading, setCustomPromptLoading] = useState(false);
  const [showInstagramModal, setShowInstagramModal] = useState(false);
  const [instagramId, setInstagramId] = useState(localStorage.getItem('instagramId') || '');

  // Auto-hide error after 2 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Toast and Success Banner logic
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange({ target: { files: [e.dataTransfer.files[0]] } });
    }
  };

  // 2. Update handleImageChange to support multiple images (max 3)
  const handleImageChange = (e) => {
    let files = Array.from(e.target.files);
    // Combine with existing, but only keep the latest 3
    let combinedFiles = [...images, ...files].slice(-3);
    const newPreviews = combinedFiles.map(file => URL.createObjectURL(file));
    setImages(combinedFiles);
    setImagePreviews(newPreviews);
    // Clear file input value so user can select the same file again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Remove image by index
  const handleRemoveImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  // 3. Update handleReset to clear arrays
  const handleReset = () => {
    setImages([]);
    setImagePreviews([]);
    setTitle('');
    setDescription('');
    setCaptions(null);
    setError(null);
    setSuccess(false);
    setCollageLayout('auto');
    setSelectedLanguage(DEFAULT_LANGUAGE);
    setRefiningDescription(false); // Reset refining state
    setRefiningInputDescription(false); // Reset refining state
    setRefiningInputCaption(false); // Reset refining state
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setCaptions(null);
    setSuccess(false);
    try {
      const formData = new FormData();
      if (images.length > 0) {
        formData.append('image', images[0]);
      }
      // Always send the latest seller-refined input
      formData.append('title', title);
      formData.append('description', description);
      formData.append('language', selectedLanguage);
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to generate caption');
      }
      const data = await response.json();
      setCaptions(data);
      setSuccess(true);
      toast.success('Post preview generated successfully!');
    } catch (err) {
      setError(err.message || 'Something went wrong');
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Handler to refine description using backend
  const handleRefineDescription = async () => {
    if (!captions || !description) return;
    setRefiningDescription(true);
    try {
      const response = await fetch('http://localhost:5050/api/social-media/refine-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to refine description');
      const data = await response.json();
      setCaptions(prev => ({ ...prev, improvedDescription: data.refinedDescription }));
      toast.success('Description refined by AI!');
    } catch (err) {
      toast.error(err.message || 'Failed to refine description');
    } finally {
      setRefiningDescription(false);
    }
  };

  // 4. Update isFormValid
  const isFormValid = images.length > 0 && title.trim() && description.trim();

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handlePublish = () => {
    if (!instagramId) {
      setShowInstagramModal(true);
    } else {
      toast.info('Automated Instagram posting coming soon! For now, copy your caption and post manually.');
    }
  };

  // Add this useEffect to auto-trigger post generation on language change
  useEffect(() => {
    if (isFormValid) {
      handleSubmit();
    }
    // eslint-disable-next-line
  }, [selectedLanguage]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f8e6f8] to-[#f8f2fa]">
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss={false} draggable pauseOnHover={false} />
      <Navbar />
      {/* Move the page title above the <main> content area, centered */}
      <h1 className="text-4xl font-extrabold text-[#9B177E] mt-6 mb-4 tracking-tight text-center w-full" style={{ letterSpacing: '-1px' }}>Social Media Post</h1>
      <main className="flex-1 flex flex-col md:flex-row items-stretch justify-between py-4 px-4 relative gap-8">
        {/* FORM LAYOUT */}
        <form onSubmit={handleSubmit} className="bg-white shadow-md p-6 w-full max-w-lg flex flex-col gap-3 animate-fade-in border border-[#f3e0f5] min-h-[600px] overflow-auto" style={{ borderRadius: 0, boxShadow: '0 4px 24px 0 #f3e0f5' }}>
          <div className="flex-1 flex flex-col gap-4 w-full">
            <label className="font-semibold text-[#9B177E]">Product Images (up to 3)</label>
            <ImageUploader
              images={images}
              setImages={setImages}
              imagePreviews={imagePreviews}
              setImagePreviews={setImagePreviews}
              fileInputRef={fileInputRef}
              dragActive={dragActive}
              setDragActive={setDragActive}
              handleRemoveImage={handleRemoveImage}
            />
            <CollageLayoutSelector
              imagePreviews={imagePreviews}
              collageLayout={collageLayout}
              setCollageLayout={setCollageLayout}
            />
            <label className="font-semibold text-[#9B177E]">Product Caption</label>
            <TextAreaWithAI
              value={title}
              setValue={setTitle}
              placeholder="Product Caption"
              onAIRefine={async () => {
                if (!title || !description) return;
                setRefiningInputCaption(true);
                try {
                  const response = await fetch('http://localhost:5050/api/social-media/refine-caption', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ caption: title, description }),
                    credentials: 'include',
                  });
                  if (!response.ok) throw new Error('Failed to refine caption');
                  const data = await response.json();
                  setTitle(data.refinedCaption);
                  setTimeout(() => handleSubmit(), 0); // Auto-generate post
                } catch (err) {
                  toast.error(err.message || 'Failed to refine caption');
                } finally {
                  setRefiningInputCaption(false);
                }
              }}
              onCustomPrompt={async (customPrompt) => {
                setCustomPromptLoading(true);
                try {
                  const response = await fetch('http://localhost:5050/api/social-media/custom-ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: title, customPrompt }),
                    credentials: 'include',
                  });
                  if (!response.ok) throw new Error('Failed to run custom AI prompt');
                  const data = await response.json();
                  setTitle(data.result);
                  setShowCustomCaptionPrompt(false);
                  setTimeout(() => handleSubmit(), 0); // Auto-generate post
                } catch (err) {
                  toast.error(err.message || 'Failed to run custom AI prompt');
                } finally {
                  setCustomPromptLoading(false);
                }
              }}
              loading={refiningInputCaption}
              customPromptLoading={customPromptLoading}
              showCustomPrompt={showCustomCaptionPrompt}
              setShowCustomPrompt={setShowCustomCaptionPrompt}
              customPromptRef={customCaptionPromptRef}
              icon={<img src={starsIcon} alt="AI Refine" style={{ width: 22, height: 22, filter: 'drop-shadow(0 0 2px #9B177E)', ...(refiningInputCaption ? spinStyle : {}) }} className="inline-block" />}
              disabled={false}
            />
            <label className="font-semibold text-[#9B177E]">Product Description</label>
            <TextAreaWithAI
              value={description}
              setValue={setDescription}
              placeholder="Product Description"
              onAIRefine={async () => {
                if (!description) return;
                setRefiningInputDescription(true);
                try {
                  const response = await fetch('http://localhost:5050/api/social-media/refine-description', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ description }),
                    credentials: 'include',
                  });
                  if (!response.ok) throw new Error('Failed to refine description');
                  const data = await response.json();
                  setDescription(data.refinedDescription);
                  setCaptions(prev => prev ? { ...prev, improvedDescription: data.refinedDescription } : prev);
                  setTimeout(() => handleSubmit(), 0); // Auto-generate post
                } catch (err) {
                  toast.error(err.message || 'Failed to refine description');
                } finally {
                  setRefiningInputDescription(false);
                }
              }}
              onCustomPrompt={async (customPrompt) => {
                setCustomPromptLoading(true);
                try {
                  const response = await fetch('http://localhost:5050/api/social-media/custom-ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: description, customPrompt }),
                    credentials: 'include',
                  });
                  if (!response.ok) throw new Error('Failed to run custom AI prompt');
                  const data = await response.json();
                  setDescription(data.result);
                  setShowCustomDescriptionPrompt(false);
                  setTimeout(() => handleSubmit(), 0); // Auto-generate post
                } catch (err) {
                  toast.error(err.message || 'Failed to run custom AI prompt');
                } finally {
                  setCustomPromptLoading(false);
                }
              }}
              loading={refiningInputDescription}
              customPromptLoading={customPromptLoading}
              showCustomPrompt={showCustomDescriptionPrompt}
              setShowCustomPrompt={setShowCustomDescriptionPrompt}
              customPromptRef={customDescPromptRef}
              icon={<img src={starsIcon} alt="AI Refine" style={{ width: 22, height: 22, filter: 'drop-shadow(0 0 2px #9B177E)', ...(refiningInputDescription ? spinStyle : {}) }} className="inline-block" />}
              disabled={false}
            />
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={setSelectedLanguage}
              loading={loading}
            />
            <FormActions
              isFormValid={isFormValid}
              loading={loading}
              handleReset={handleReset}
            />
            <button
              className="w-full p-2 rounded-lg mt-2 bg-[#405DE6] text-white font-semibold text-lg shadow hover:bg-[#3045a3] transition"
              type="button"
              onClick={handlePublish}
            >
              Post on Instagram
            </button>
            {showInstagramModal && (
              <div
                style={{
                  position: 'fixed',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000
                }}
              >
                <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 300 }}>
                  <h2 className="text-xl font-bold mb-2">Enter your Instagram ID</h2>
                  <p className="mb-4">To publish, please enter your Instagram username. This will be saved for future use.</p>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-4 py-2 mt-2"
                    value={instagramId}
                    onChange={e => setInstagramId(e.target.value)}
                    placeholder="Enter your Instagram username"
                  />
                  <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => {
                        localStorage.setItem('instagramId', instagramId);
                        setShowInstagramModal(false);
                        toast.success('Instagram ID saved! Automated posting coming soon.');
                      }}
                      className="bg-[#405DE6] text-white px-4 py-2 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowInstagramModal(false)}
                      className="bg-gray-300 px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
        {/* Add this button below the form actions */}
        {/* Instagram Preview on the right, always rendered, spinner while loading */}
        <div className="w-full max-w-2xl min-h-[600px] overflow-auto flex items-center justify-end">
          {loading ? (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#9B177E] mb-4"></div>
              <span className="text-[#9B177E] font-semibold text-lg">Generating post...</span>
            </div>
          ) : captions ? (
            <InstagramPreview
              imageUrls={imagePreviews.length ? imagePreviews : [captions.imageUrl]}
              collageLayout={collageLayout}
              caption={(() => {
                const { tags: captionTags } = splitTextAndTags(title);
                if (selectedLanguage === 'en') return title;
                if (loading) return title;
                if (captions && captions.catchyCaptionTranslations && captions.catchyCaptionTranslations[selectedLanguage])
                  return `${captions.catchyCaptionTranslations[selectedLanguage]} ${captionTags}`.trim();
                if (captions && captions.catchyCaption)
                  return `${captions.catchyCaption} ${captionTags}`.trim();
                return title;
              })()}
              description={(() => {
                const { tags } = splitTextAndTags(description);
                if (selectedLanguage === 'en') return description;
                if (loading) return description;
                if (captions && captions.improvedDescriptionTranslations && captions.improvedDescriptionTranslations[selectedLanguage])
                  return `${captions.improvedDescriptionTranslations[selectedLanguage]} ${tags}`.trim();
                if (captions && captions.improvedDescription)
                  return `${captions.improvedDescription} ${tags}`.trim();
                return description;
              })()}
              productLink={captions.productLink}
            />
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default SocialMediaPost;