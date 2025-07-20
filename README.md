# Meesho Seller Genius

An AI-powered seller platform inspired by Meesho, built as a group project. Empowers local sellers to generate, refine, and translate product content, manage bulk listings, and optimize pricing with a modern, user-friendly interface.

---

## 🚀 Features

- **AI-Powered Content Generation**
  - Generate, refine, and translate product descriptions and social media captions in multiple languages using Llama-3 (Groq).
  - Custom AI prompts: Sellers can instruct the AI to rewrite or adjust content as they wish.
  - Inline AI refinement and real-time post preview.

- **Bulk Product Listing**
  - Upload and manage multiple products at once for efficient catalog management.

- **Dynamic Pricing**
  - AI-driven price suggestions based on demand, region, and festival data.
  - Visual tools for adjusting and applying price changes.





- **Multi-Language & Local Seller Support**
  - Translate content into Hindi, Tamil, Telugu, Bengali, Marathi, Kannada, Malayalam, Punjabi, Gujarati, and more.
  - All features designed to be effective for local sellers and regional markets.

- **Modern UI/UX**
  - Responsive design with React and Tailwind CSS.
  - Side-by-side form and post preview.
  - Dynamic language dropdown, inline popovers for custom AI prompts, and beautiful feedback animations.

- **Image Uploads**
  - Upload product images for use in listings and social media posts.

- **Authentication**
  - Secure user authentication with Firebase.

- **Other Highlights**
  - Real-time post preview with all hashtags always visible, regardless of language.
  - Sellers can add, edit, and refine hashtags at any time.
  - Group project with modular code, GitHub collaboration, and rapid feature iteration.

---

## 🏷️ Hashtag Handling

- **All hashtags you add in the product description or caption input will always appear in the post preview, regardless of the selected language.**
- When you translate or refine content using AI, only the main text is translated or rewritten—your hashtags remain as you entered them.
- You can add, edit, or remove hashtags at any time, and the preview will update instantly to reflect your changes.
- This ensures sellers have full control over their tags for better reach and discoverability on social media.

**Example:**  
If you enter:  
`Dazzle in style with our new saree! #Fashion #Saree #NewArrival #EthnicWear`  
and translate to Hindi, the preview will show:  
`(Hindi translation of main text) #Fashion #Saree #NewArrival #EthnicWear`

---

## 📸 Screenshots

### Login / Signup
<img width="1276" height="714" alt="image" src="https://github.com/user-attachments/assets/9c2e8fee-72fa-4a09-a5db-bdf9834c7a73" />

<img width="1263" height="712" alt="image" src="https://github.com/user-attachments/assets/2554ae4d-3f9c-43d4-85b8-83a2eb66db04" />


### Dashboard
<img width="1278" height="716" alt="image" src="https://github.com/user-attachments/assets/6d7348be-b582-4730-8e8b-12a461471ef8" />

### Social Media Post Generator

<img width="1279" height="706" alt="image" src="https://github.com/user-attachments/assets/f95e6c95-9e58-4268-b39d-65806a26a739" />

#### Enhance the caption and description

<img width="1257" height="743" alt="image" src="https://github.com/user-attachments/assets/cf51cc2a-75f8-4773-8472-f4ae64b2039a" />


#### Can select languages for your post


<img width="1151" height="455" alt="image" src="https://github.com/user-attachments/assets/999b17dc-0884-44b0-be53-715eba741608" />





### Bulk Listing



### Dynamic Pricing
    <img width="916" height="486" alt="image" src="https://github.com/user-attachments/assets/d2f5103c-a6e6-47fe-90da-e25827a98b46" />
    <img width="341" height="457" alt="image" src="https://github.com/user-attachments/assets/5ebb2fef-417f-4cfd-8362-09630b29c498" />
    <img width="407" height="285" alt="image" src="https://github.com/user-attachments/assets/a9a66be3-bf7f-4cce-bfbb-d3c0e0bec86a" />
    <img width="398" height="283" alt="image" src="https://github.com/user-attachments/assets/29fcd416-2365-4856-80aa-3d0a56025070" />
    

---

## 🛠️ Getting Started

### 1. Clone the Repository

```sh
git clone https://github.com/priyanka-singh3/Meesho-Seller-Genius.git
cd Meesho-Seller-Genius
```

### 2. Install Dependencies

#### Backend
```sh
cd backend
npm install
```

#### Frontend
```sh
cd ../frontend
npm install
```

### 3. Set Up Environment Variables

#### Backend (`backend/.env`)
```
GROQ_API_KEY=your_groq_api_key_here
FIREBASE_API_KEY=your_firebase_api_key_here
# Add any other required keys
```

#### Frontend (`frontend/.env`)
```
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key_here
# Add any other required keys
```

### 4. Run the Application

#### Start Backend
```sh
cd backend
npm start
```

#### Start Frontend
```sh
cd ../frontend
npm start
```

The app will be available at `https://meesho-seller-genius.onrender.com` (backend) and `http://localhost:5173` (frontend, or as per your Vite config).

---

## 🤖 AI Model Integration

- This project uses [Groq](https://groq.com/) to access the Llama-3 model for all AI features.
- You need a valid `GROQ_API_KEY` to use the AI endpoints.
- All AI requests are made via the backend, so your key is never exposed to the frontend.

---

## 🧑‍💻 How to Use

1. **Sign up or log in** (Firebase authentication).
2. **Create or upload products** using the bulk listing tool.
3. **Generate and refine product descriptions and captions** using the AI tools.
4. **Translate content** into any supported language.
5. **Preview your post** in real time, with all hashtags always visible.
6. **Apply dynamic pricing** suggestions to optimize your catalog.
7. **Share or export your content** as needed.

---

## 👥 Team & Contributions

This project was built as a group project.  
Contributions, issues, and feature requests are welcome!

---

## 📚 Open Source Libraries & Tools Used

This project leverages the following open-source libraries and tools across the backend, frontend, and AI/ML components:

---

### 🖥️ Backend (Node.js / Express)

- **[Express](https://expressjs.com/)** (v5.1.0, MIT License)  
  Web server framework for handling HTTP requests and routing.

- **[CORS](https://www.npmjs.com/package/cors)** (v2.8.5, MIT License)  
  Middleware to enable Cross-Origin Resource Sharing.

- **[dotenv](https://www.npmjs.com/package/dotenv)** (v16.6.1, MIT License)  
  Loads environment variables from `.env` files.

- **[Axios](https://axios-http.com/)** (v1.10.0, MIT License)  
  Promise-based HTTP client for making API requests.

- **[Multer](https://github.com/expressjs/multer)** (v1.4.5-lts.1, MIT License)  
  Handles `multipart/form-data` for file uploads (used in-memory only).

- **[Cloudinary](https://cloudinary.com/)** (v1.41.3, MIT License)  
  Upload and store images directly to Cloudinary cloud storage.

- **[Streamifier](https://www.npmjs.com/package/streamifier)** (v0.1.1, MIT License)  
  Converts buffers into readable streams (used for uploading to Cloudinary).

- **[OpenAI Node](https://github.com/openai/openai-node)** (v5.9.2, MIT License) *(optional)*  
  SDK for interacting with OpenAI APIs.

- **[Path](https://nodejs.org/api/path.html)** (v0.12.7, MIT License)  
  Node.js module for handling file and directory paths.

- **[Sharp](https://sharp.pixelplumbing.com/)** (v0.34.3, Apache-2.0 License) *(optional)*  
  High-performance image processing and resizing.

---

### 💻 Frontend (React)

- **[React](https://reactjs.org/)** (v18.x, MIT License)  
  Declarative JavaScript library for building user interfaces.

- **[React DOM](https://reactjs.org/docs/react-dom.html)** (v18.x, MIT License)  
  Handles rendering of React components in the DOM.

- **[React Toastify](https://fkhadra.github.io/react-toastify/)** (v9.x, MIT License)  
  Simple and customizable toast notifications.

- **[@headlessui/react](https://headlessui.com/react)** (v1.x, MIT License)  
  Unstyled, accessible UI components for React.

- **[Vite](https://vitejs.dev/)** (v4.x, MIT License)  
  Fast and modern build tool for frontend development.

> ℹ️ *Note: Additional libraries (e.g., for charting, animations, or mapping) may be used in feature-specific files. Please refer to your `package.json` for a full list of dependencies.*

---

### 🧠 Python Libraries (AI/ML & Image Processing)

- **[transformers](https://huggingface.co/docs/transformers)** (>=4.30.0, Apache-2.0 License)  
  Access to state-of-the-art NLP models from HuggingFace.

- **[torch](https://pytorch.org/)** (>=2.0.0, BSD-3-Clause License)  
  Core deep learning library for model inference.

- **[torchvision](https://pytorch.org/vision/stable/index.html)** (>=0.15.0, BSD-3-Clause License)  
  Utilities for computer vision and image datasets.

- **[Pillow](https://python-pillow.org/)** (>=9.0.0, HPND License)  
  Python Imaging Library for basic image processing.

- **[scikit-image](https://scikit-image.org/)** (>=0.20.0, BSD-3-Clause License)  
  Advanced image processing utilities built on NumPy and SciPy.

- **[huggingface-hub](https://huggingface.co/docs/huggingface_hub)** (>=0.16.0, Apache-2.0 License)  
  Interface for downloading and uploading models to HuggingFace.

- **[numpy](https://numpy.org/)** (>=1.21.0, BSD-3-Clause License)  
  Fundamental package for numerical computation.

- **[requests](https://docs.python-requests.org/en/latest/)** (>=2.25.0, Apache-2.0 License)  
  Simplified HTTP requests for APIs.

- **[tqdm](https://tqdm.github.io/)** (>=4.64.0, MPL-2.0 License)  
  Command-line progress bars for loops and tasks.

- **[accelerate](https://huggingface.co/docs/accelerate/index)** (>=0.20.0, Apache-2.0 License)  
  Performance-optimized tools for training and inference on any device.

- **[google-generativeai](https://pypi.org/project/google-generativeai/)** (==0.4.1, Apache-2.0 License)  
  Google’s Python client for accessing Generative AI APIs.

---

All libraries are used as direct dependencies and **have not been modified**.  
For full details, refer to each library’s official documentation and licensing terms.



[MIT](LICENSE)
